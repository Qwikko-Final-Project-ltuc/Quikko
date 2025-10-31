const pool = require("../../config/db");
const {
  calculateDistanceKm,
  calculateTotalRouteDistance,
  orderVendorsByNearest,
  calculateTotalVendorsDistance,
} = require("../../utils/distance");
const axios = require("axios");
require("dotenv").config();
const { geocodeAddress } = require("../../utils/geocoding");

/**
 * ============================
 * Customer Model - User Module
 * ============================
 */

/**
 * Find user by ID
 * @param {number} id - User ID
 * @returns {Promise<Object|null>} User object or null if not found
 */
exports.findById = async (id) => {
  const result = await pool.query("SELECT * FROM users WHERE id=$1", [id]);
  return result.rows[0];
};

/**
 * Update user profile by ID
 * @param {number} id - User ID
 * @param {string} name - User name
 * @param {string} phone - User phone
 * @param {string} address - User address
 * @returns {Promise<Object>} Updated user object
 */
exports.updateById = async (id, name, phone, address) => {
  const result = await pool.query(
    `UPDATE users SET name=$1, phone=$2, address=$3, updated_at=NOW() WHERE id=$4 RETURNING *`,
    [name, phone, address, id]
  );
  return result.rows[0];
};

/**
 * Get store details by store ID including products
 * @param {number} storeId - Store ID
 * @returns {Promise<Object|null>} Store object with products array
 */
exports.getStoreById = async function (storeId) {
  const result = await pool.query(
    `SELECT 
      v.id AS store_id,
      v.store_name,
      v.user_id,
      v.store_slug,
      v.store_logo,
      v.store_banner,
      v.description,
      v.contact_email,
      v.phone,
      v.social_links,
      v.rating,
      v.created_at,
      v.updated_at,
      COALESCE(
        json_agg(
          jsonb_build_object(
            'product_id', p.id,
            'name', p.name,
            'description', p.description,
            'price', p.price,
            'stock_quantity', p.stock_quantity,
            'variants', p.variants,
            'images', (
              SELECT COALESCE(json_agg(pi.image_url ORDER BY pi.id), '[]'::json)
              FROM product_images pi
              WHERE pi.product_id = p.id
            )
          )
        ) FILTER (WHERE p.id IS NOT NULL),
        '[]'::json
      ) AS products
    FROM vendors v
    LEFT JOIN products p ON p.vendor_id = v.id
    WHERE v.id = $1
    GROUP BY v.id;`,
    [storeId]
  );

  return result.rows[0];
};

/**
 * Place order from cart (Cash on Delivery)
 * @param {number} userId - Customer ID
 * @param {number} cartId - Cart ID
 * @param {Object} addressData - Address details {address_line1, address_line2, city, state, postal_code, country}
 * @returns {Promise<Object>} Created order object
 */
exports.placeOrderFromCart = async function ({
  userId,
  cartId,
  address,
  addressId,
  paymentMethod,
  paymentData,
  coupon_code,
  use_loyalty_points = false // ✅ خيار استخدام النقاط كخصم
}) {
  try {
    // 1. Fetch cart items
    const cartItemsResult = await pool.query(
      `SELECT ci.product_id, ci.quantity, ci.variant, p.price, p.vendor_id
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       JOIN carts c ON ci.cart_id = c.id
       WHERE ci.cart_id = $1 AND c.user_id = $2`,
      [cartId, userId]
    );

    if (cartItemsResult.rows.length === 0) {
      throw new Error("Cart is empty or not found");
    }

    // 2. Get or Insert address
    let savedAddress;

    if (addressId) {
      const existingAddress = await pool.query(
        `SELECT * FROM addresses WHERE id = $1 AND user_id = $2`,
        [addressId, userId]
      );
      if (existingAddress.rows.length === 0) {
        throw new Error("Address not found");
      }
      savedAddress = existingAddress.rows[0];
    } else {
      if (!address.latitude || !address.longitude) {
        console.log("📍 Using geocodeAddress for:", address.address_line1);
        const geo = await geocodeAddress(
          `${address.address_line1}, ${address.city}`
        );
        if (geo) {
          address.latitude = geo.latitude;
          address.longitude = geo.longitude;
        } else {
          console.error("❌ Failed to geocode address:", address);
        }
      }

      const addressResult = await pool.query(
        `INSERT INTO addresses (user_id, address_line1, address_line2, city, state, postal_code, country, latitude, longitude)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
        [
          userId,
          address.address_line1,
          address.address_line2 || "",
          address.city,
          address.state || "",
          address.postal_code || "",
          address.country || "Jordan",
          address.latitude || null,
          address.longitude || null,
        ]
      );
      savedAddress = addressResult.rows[0];
    }

    // 3. Find delivery company (choose closest if multiple cover same area)
    const deliveryResult = await pool.query(
      `SELECT id, latitude, longitude 
   FROM delivery_companies
   WHERE EXISTS (
     SELECT 1
     FROM unnest(coverage_areas) AS area
     WHERE LOWER(area) = LOWER($1)
   )
   AND status = 'approved'`,
      [savedAddress.city]
    );

    if (deliveryResult.rows.length === 0) {
      const fallback = await pool.query(
        `SELECT id, latitude, longitude FROM delivery_companies WHERE status='approved' LIMIT 1`
      );
      if (fallback.rows.length === 0)
        throw new Error("No delivery companies available at all");
      deliveryResult.rows.push(fallback.rows[0]);
    }

    let closestCompany = deliveryResult.rows[0];
    let minDistance = null;
    let delivery_fee = 0.5;

    // Calculate distance using Google Distance Matrix API
    if (
      savedAddress.latitude &&
      savedAddress.longitude &&
      closestCompany.latitude &&
      closestCompany.longitude
    ) {
      try {
        const distanceUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${closestCompany.latitude},${closestCompany.longitude}&destinations=${savedAddress.latitude},${savedAddress.longitude}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
        const distanceResponse = await axios.get(distanceUrl);
        const element = distanceResponse.data.rows[0].elements[0];

        if (element.status === "OK") {
          minDistance = element.distance.value / 1000; // meters to km
          delivery_fee += minDistance * 0.5;
        } else {
          minDistance = calculateDistanceKm(
            savedAddress.latitude,
            savedAddress.longitude,
            closestCompany.latitude,
            closestCompany.longitude
          );
        }
      } catch {
        minDistance = calculateDistanceKm(
          savedAddress.latitude,
          savedAddress.longitude,
          closestCompany.latitude,
          closestCompany.longitude
        );
      }
      delivery_fee = parseFloat(delivery_fee.toFixed(2));
    }

    const deliveryCompanyId = closestCompany.id;

    // 4. Calculate total
    let total_amount = 0;
    for (let item of cartItemsResult.rows) {
      total_amount += item.price * item.quantity;
    }

    const total_with_shipping = total_amount + delivery_fee;

    // 4b. Apply coupon if provided
    let discount_amount = 0;
    let final_amount = total_amount;
    let discount_reason = "";

    if (coupon_code) {
      const { valid, message, discount_amount: disc, final_amount: final } =
        await validateCoupon(coupon_code, userId, cartItemsResult.rows);

      if (!valid) throw new Error(message);

      discount_amount = disc;
      final_amount = final;
      discount_reason = `Coupon (${coupon_code})`;
    }

    // 4c. ✅ Apply loyalty points as discount (if chosen)
    let points_used = 0;
    let discount_from_points = 0;
    if (use_loyalty_points) {
      const loyaltyData = await exports.getPointsByUser(userId);

      if (loyaltyData.points_balance >= 100) {
        // كل 100 نقطة = 10% خصم
        const discountPercent = Math.floor(loyaltyData.points_balance / 100) * 10;

        // تطبيق الخصم بحد أقصى 50%
        const appliedDiscount = Math.min(discountPercent, 50);

        discount_from_points = (total_amount * appliedDiscount) / 100;
        final_amount -= discount_from_points;

        // احسبي كم نقطة تم استخدامها فعلاً
        points_used = (appliedDiscount / 10) * 100;

        // خصم النقاط فعليًا من المستخدم
        await exports.redeemPoints(userId, points_used, `Used for ${appliedDiscount}% discount on order`);

        discount_reason = discount_reason ? `${discount_reason} + Loyalty Points` : "Loyalty Points";
      }
    }

    // 5. Insert order
    const payment_status = paymentMethod === "cod" ? "pending" : "paid";
    const orderResult = await pool.query(
      `INSERT INTO orders (
     customer_id,
     delivery_company_id,
     address_id,
     status,
     shipping_address,
     total_amount,
     discount_amount, final_amount, coupon_code,
     delivery_fee,
     total_with_shipping,
     payment_status,
     distance_km,
     created_at,
     updated_at
   )
   VALUES ($1, $2, $3, 'pending', $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
   RETURNING *`,
      [
        userId,
        deliveryCompanyId,
        savedAddress.id,
        JSON.stringify(savedAddress),
        total_amount,
        delivery_fee,
        total_with_shipping,
        discount_amount + discount_from_points,
        final_amount,
        coupon_code || null,
        payment_status,
        minDistance || null,
      ]
    );

    const order = orderResult.rows[0];

    // 6. Insert order items (calculate distance per vendor using route)
    const vendors = cartItemsResult.rows.map((item) => ({
      id: item.vendor_id,
      latitude: item.latitude,
      longitude: item.longitude,
      name: item.vendor_name,
    }));
    const uniqueVendors = Array.from(
      new Map(vendors.map((v) => [v.id, v])).values()
    );
    const orderedVendors = orderVendorsByNearest(closestCompany, uniqueVendors);

    const routePoints = [
      {
        lat: closestCompany.latitude,
        lng: closestCompany.longitude,
        label: closestCompany.company_name,
      },
      ...orderedVendors.map((v) => ({
        lat: v.latitude,
        lng: v.longitude,
        label: v.name,
      })),
      {
        lat: savedAddress.latitude,
        lng: savedAddress.longitude,
        label: "Customer",
      },
    ];

    let totalDistanceKm = 0;

    try {
      const waypoints = routePoints
        .slice(1, -1) // كل الـ vendors بين البداية والنهاية
        .map((p) => `${p.lat},${p.lng}`)
        .join("|");

      const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${
        routePoints[0].lat
      },${routePoints[0].lng}&destination=${
        routePoints[routePoints.length - 1].lat
      },${
        routePoints[routePoints.length - 1].lng
      }&waypoints=optimize:true|${waypoints}&key=${
        process.env.GOOGLE_MAPS_API_KEY
      }`;

      const directionsRes = await axios.get(directionsUrl);

      if (directionsRes.data.routes?.length > 0) {
        const legs = directionsRes.data.routes[0].legs;
        totalDistanceKm = legs.reduce(
          (sum, leg) => sum + leg.distance.value / 1000,
          0
        );
        totalDistanceKm = parseFloat(totalDistanceKm.toFixed(2));
      }
    } catch (err) {
      console.error("Google Directions API error:", err.message);
      totalDistanceKm = calculateTotalRouteDistance(routePoints);
    }

    // استخدام totalDistanceKm لحساب delivery_fee
    delivery_fee = parseFloat((totalDistanceKm * 0.5).toFixed(2));

    for (let item of cartItemsResult.rows) {
      await pool.query(
        `INSERT INTO order_items (order_id, product_id, vendor_id, quantity, price, variant, distance_km)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          order.id,
          item.product_id,
          item.vendor_id,
          item.quantity,
          item.price,
          JSON.stringify(item.variant || {}),
          totalDistanceKm, // نفس المسافة لكل vendor لأنها محسوبة بالمسار المتسلسل
        ]
      );
    }

    let totalVendorsDistance = 0;

    if (orderedVendors.length > 1) {
      totalVendorsDistance = calculateTotalVendorsDistance(orderedVendors);
    }

    if (totalVendorsDistance > 0) {
      const extraFee = parseFloat((totalVendorsDistance * 0.4).toFixed(2)); // 0.4 لكل كم
      await pool.query(
        `UPDATE orders 
     SET delivery_fee = delivery_fee + $1, 
         total_with_shipping = total_with_shipping + $1 
     WHERE id = $2`,
        [extraFee, order.id]
      );
    }

    // 7. سجل الدفع إذا الدفع أونلاين
    if (paymentMethod !== "cod" && paymentData) {
      await pool.query(
        `INSERT INTO payments (order_id, user_id, payment_method, status, transaction_id, card_last4, card_brand, expiry_month, expiry_year, amount, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)`,
        [
          order.id,
          userId,
          paymentMethod,
          "paid",
          paymentData.transactionId || null,
          paymentData.card_last4 || null,
          paymentData.card_brand || null,
          paymentData.expiry_month || null,
          paymentData.expiry_year || null,
          final_amount,
        ]
      );
    }

     // 8. سجل استخدام الكوبون
    if (coupon_code) {
      await pool.query(
        `INSERT INTO coupon_usages (coupon_code, user_id, order_id, used_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
        [coupon_code, userId, order.id]
      );

      await pool.query(
        `UPDATE coupons
         SET usage_limit = CASE 
           WHEN usage_limit IS NOT NULL THEN usage_limit - 1
           ELSE NULL
         END
         WHERE code = $1`,
        [coupon_code]
      );
    }

    // 9️⃣ ✅ Add loyalty points earned (2% of final_amount)
    const pointsEarned = Math.floor(final_amount * 0.02); // 2% من قيمة الطلب
    await exports.addPoints(userId, pointsEarned, `Earned from order #${order.id}`);

    // 8. Return order with items & payments
    const updatedOrder = await pool.query(
      `SELECT 
     o.id,
     o.customer_id,
     o.total_amount,
     o.distance_km,
     o.delivery_fee,
     o.total_with_shipping,
     o.status,
     o.payment_status,
     o.shipping_address,
     o.created_at,
     o.updated_at,
     COALESCE(
  json_agg(
    json_build_object(
      'product_id', oi.product_id,
      'vendor_id', oi.vendor_id,
      'quantity', oi.quantity,
      'price', oi.price,
      'variant', oi.variant,
      'distance_km', oi.distance_km,
      'name', pr.name,
      'vendor_latitude', v.latitude,
      'vendor_longitude', v.longitude
    )
  ) FILTER (WHERE oi.id IS NOT NULL),
  '[]'
) AS items,
     COALESCE(
       json_agg(
         json_build_object(
           'id', p.id,
           'payment_method', p.payment_method,
           'amount', p.amount,
           'status', p.status,
           'transaction_id', p.transaction_id,
           'card_last4', p.card_last4,
           'card_brand', p.card_brand,
           'expiry_month', p.expiry_month,
           'expiry_year', p.expiry_year,
           'created_at', p.created_at
         )
       ) FILTER (WHERE p.id IS NOT NULL),
       '[]'
     ) AS payments
   FROM orders o
   LEFT JOIN order_items oi ON oi.order_id = o.id
   LEFT JOIN products pr ON pr.id = oi.product_id
   LEFT JOIN payments p ON p.order_id = o.id
   LEFT JOIN vendors v ON v.id = oi.vendor_id
   WHERE o.id = $1
   GROUP BY o.id;`,
      [order.id]
    );

    const result = updatedOrder.rows[0];
    result.loyalty = {
      points_used,
      discount_from_points,
      points_earned: pointsEarned,
      message: `You earned ${pointsEarned} loyalty points!`
    };

    totalVendorsDistance = 0;

    return result;

    // 8. Return order + payments
    //     const orderWithPaymentsResult = await pool.query(
    //       `SELECT
    //   o.id,
    //   o.customer_id,
    //   o.total_amount,
    //   o.distance_km,
    //   o.delivery_fee,
    //   o.total_with_shipping,
    //   o.status,
    //   o.payment_status,
    //   o.shipping_address,
    //   o.created_at,
    //   o.updated_at,
    //   COALESCE(
    //     json_agg(
    //       json_build_object(
    //         'product_id', oi.product_id,
    //         'vendor_id', oi.vendor_id,
    //         'quantity', oi.quantity,
    //         'price', oi.price,
    //         'variant', oi.variant,
    //         'distance_km', oi.distance_km,
    //         'name', pr.name
    //       )
    //     ) FILTER (WHERE oi.id IS NOT NULL),
    //     '[]'
    //   ) AS items,
    //   COALESCE(
    //     json_agg(
    //       json_build_object(
    //         'id', p.id,
    //         'payment_method', p.payment_method,
    //         'amount', p.amount,
    //         'status', p.status,
    //         'transaction_id', p.transaction_id,
    //         'card_last4', p.card_last4,
    //         'card_brand', p.card_brand,
    //         'expiry_month', p.expiry_month,
    //         'expiry_year', p.expiry_year,
    //         'created_at', p.created_at
    //       )
    //     ) FILTER (WHERE p.id IS NOT NULL),
    //     '[]'
    //   ) AS payments
    // FROM orders o
    // LEFT JOIN order_items oi ON oi.order_id = o.id
    // LEFT JOIN products pr ON pr.id = oi.product_id
    // LEFT JOIN payments p ON p.order_id = o.id
    // WHERE o.id = $1
    // GROUP BY o.id;
    // `,
    //       [order.id]
    //     );

    //     global.totalVendorsDistance = 0;

    //     return orderWithPaymentsResult.rows[0];
  } catch (err) {
    console.error("placeOrderFromCart error:", err);
    throw err;
  }
};



/**
 * Get order details for a specific customer
 * @param {number} customerId
 * @param {number} orderId
 * @returns {Promise<Object|null>} Order object with items
 */
exports.getOrderById = async function (customerId, orderId) {
  const result = await pool.query(
    `SELECT 
      o.id AS order_id,
      o.total_amount,
      o.distance_km,
      o.delivery_fee,
      o.total_with_shipping,
      o.payment_status,
      o.shipping_address,
      o.created_at,
      o.updated_at,
      -- العناصر
      json_agg(
        json_build_object(
          'order_item_id', oi.id,
          'product_id', p.id,
          'product_name', p.name,
          'quantity', oi.quantity,
          'price', oi.price,
          'variant', oi.variant,
          'vendor_latitude', v.latitude,
          'vendor_longitude', v.longitude
        )
      ) AS items,
      -- الدفعات المرتبطة بالأوردر
      (
        SELECT json_agg(
          json_build_object(
            'payment_id', pay.id,
            'payment_method', pay.payment_method,
            'amount', pay.amount,
            'status', pay.status,
            'transaction_id', pay.transaction_id,
            'card_last4', pay.card_last4,
            'card_brand', pay.card_brand,
            'expiry_month', pay.expiry_month,
            'expiry_year', pay.expiry_year,
            'paypal_email', pay.paypal_email,
            'paypal_name', pay.paypal_name,
            'created_at', pay.created_at
          )
        )
        FROM payments pay
        WHERE pay.order_id = o.id
      ) AS payments
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products p ON p.id = oi.product_id
    JOIN vendors v ON v.id = oi.vendor_id
    WHERE o.id = $1 AND o.customer_id = $2
    GROUP BY o.id`,
    [orderId, customerId]
  );

  const order = result.rows[0];
  if (!order) return null;

  // حساب المسافة المتسلسلة لكل vendors → customer
  const items = order.items || [];
  const points = [];

  for (let item of items) {
    if (item.vendor_latitude && item.vendor_longitude) {
      points.push({ lat: item.vendor_latitude, lng: item.vendor_longitude });
    }
  }

  let customerCoords = null;
  try {
    const addressRes = await pool.query(
      `SELECT latitude, longitude FROM addresses WHERE id = $1`,
      [order.shipping_address?.id]
    );
    customerCoords = addressRes.rows[0];
    if (customerCoords)
      points.push({
        lat: customerCoords.latitude,
        lng: customerCoords.longitude,
      });
  } catch (err) {
    console.error("Error fetching customer address coords:", err.message);
  }

  if (points.length >= 2) {
    let totalDistance = null;
    try {
      const waypointsStr = points
        .slice(1, points.length - 1)
        .map((p) => `${p.lat},${p.lng}`)
        .join("|");
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${
        points[0].lat
      },${points[0].lng}&destination=${points[points.length - 1].lat},${
        points[points.length - 1].lng
      }${waypointsStr ? "&waypoints=" + waypointsStr : ""}&key=${
        process.env.GOOGLE_MAPS_API_KEY
      }`;
      const response = await axios.get(url);
      if (
        response.data.routes &&
        response.data.routes.length > 0 &&
        response.data.routes[0].legs
      ) {
        totalDistance = response.data.routes[0].legs.reduce(
          (sum, leg) => sum + leg.distance.value / 1000,
          0
        );
        totalDistance = parseFloat(totalDistance.toFixed(2));
      }
    } catch (err) {
      console.error(
        "Directions API error, fallback to straight distance:",
        err.message
      );
    }

    if (totalDistance === null) {
      totalDistance = calculateTotalRouteDistance(points);
    }

    order.distance_km = totalDistance;

    try {
      await pool.query(
        `UPDATE orders SET distance_km = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [totalDistance, order.id]
      );
    } catch (err) {
      console.error("Error updating order distance in DB:", err.message);
    }
  }

  return order;
};

/**
 * Track order status for a customer
 * @param {number} orderId
 * @param {number} customerId
 * @returns {Promise<Object|null>} Order status object
 */
exports.trackOrder = async function (orderId, customerId) {
  try {
    // 1️⃣ جلب الطلب
    const orderRes = await pool.query(
      `SELECT o.id AS order_id, o.status, o.updated_at, o.distance_km, o.address_id, o.shipping_address, o.delivery_company_id
       FROM orders o
       WHERE o.id = $1 AND o.customer_id = $2`,
      [orderId, customerId]
    );
    const order = orderRes.rows[0];
    if (!order) return null;

    // 2️⃣ جلب عنوان الزبون
    const addressRes = await pool.query(
      `SELECT latitude, longitude, address_line1 FROM addresses WHERE id = $1`,
      [order.address_id]
    );
    const customerCoords = addressRes.rows[0];
    if (!customerCoords) return null;

    // 3️⃣ جلب الـ vendors المرتبطين بالطلب
    const itemsRes = await pool.query(
      `SELECT oi.id AS order_item_id, p.id AS product_id, p.name AS product_name,
              v.id AS vendor_id, v.latitude, v.longitude, v.address AS vendor_address, v.store_name,
              u.name AS vendor_name
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       JOIN vendors v ON v.id = p.vendor_id
       JOIN users u ON v.user_id = u.id
       WHERE oi.order_id = $1`,
      [orderId]
    );

    let vendors = itemsRes.rows.map((v) => ({ ...v }));

    // 4️⃣ عبي الإحداثيات الناقصة لكل vendor
    for (let v of vendors) {
      if (!v.latitude || !v.longitude) {
        const geo = await geocodeAddress(v.vendor_address || v.vendor_name);
        if (geo) {
          v.latitude = geo.latitude;
          v.longitude = geo.longitude;
        }
      }
    }

    // 5️⃣ جلب بيانات شركة التوصيل
    let deliveryCompany = null;
    if (order.delivery_company_id) {
      const deliveryRes = await pool.query(
        `SELECT id, company_name, latitude, longitude
         FROM delivery_companies
         WHERE id = $1`,
        [order.delivery_company_id]
      );
      deliveryCompany = deliveryRes.rows[0];

      if (!deliveryCompany.latitude || !deliveryCompany.longitude) {
        const coverageRes = await pool.query(
          `SELECT latitude, longitude
           FROM delivery_coverage_locations
           WHERE delivery_company_id = $1
           ORDER BY (POINT(latitude, longitude) <-> POINT($2, $3)) ASC
           LIMIT 1`,
          [
            order.delivery_company_id,
            customerCoords.latitude,
            customerCoords.longitude,
          ]
        );
        const nearest = coverageRes.rows[0];
        if (nearest) {
          deliveryCompany.latitude = nearest.latitude;
          deliveryCompany.longitude = nearest.longitude;
        }
      }
    }

    // 6️⃣ تجهيز نقاط المسار
    const points = [];
    if (deliveryCompany) {
      points.push({
        lat: deliveryCompany.latitude,
        lng: deliveryCompany.longitude,
      });
    }
    points.push(...vendors.map((v) => ({ lat: v.latitude, lng: v.longitude })));
    points.push({
      lat: customerCoords.latitude,
      lng: customerCoords.longitude,
    });

    let totalDistance = null;
    let orderedVendors = vendors;

    if (points.length >= 2) {
      try {
        const waypointsStr = points
          .slice(1, points.length - 1)
          .map((p) => `${p.lat},${p.lng}`)
          .join("|");

        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${
          points[0].lat
        },${points[0].lng}&destination=${points[points.length - 1].lat},${
          points[points.length - 1].lng
        }&waypoints=optimize:true|${waypointsStr}&key=${
          process.env.GOOGLE_MAPS_API_KEY
        }`;

        const response = await axios.get(url);
        if (
          response.data.routes &&
          response.data.routes.length > 0 &&
          response.data.routes[0].legs
        ) {
          const route = response.data.routes[0];

          // 6️⃣1 ترتيب الـ vendors حسب Google
          if (route.waypoint_order && vendors.length > 1) {
            orderedVendors = route.waypoint_order.map((i) => vendors[i]);
          }

          // 6️⃣2 حساب المسافة الإجمالية
          totalDistance = route.legs.reduce(
            (sum, leg) => sum + leg.distance.value / 1000,
            0
          );
          totalDistance = parseFloat(totalDistance.toFixed(2));
        }
      } catch (err) {
        console.error(
          "Directions API error, fallback to straight distance:",
          err.message
        );
      }

      // fallback لو Directions API فشل
      if (totalDistance === null) {
        totalDistance = calculateTotalRouteDistance(points);
      }
    }

    // 7️⃣ إعادة البيانات
    return {
      order_id: order.order_id,
      status: order.status,
      updated_at: order.updated_at,
      distance_km: totalDistance,
      routePoints: [
        ...(deliveryCompany
          ? [
              {
                lat: deliveryCompany.latitude,
                lng: deliveryCompany.longitude,
                label: deliveryCompany.company_name,
              },
            ]
          : []),
        ...orderedVendors.map((v) => ({
          lat: v.latitude,
          lng: v.longitude,
          label: v.store_name,
        })),
        {
          lat: customerCoords.latitude,
          lng: customerCoords.longitude,
          label: "Customer",
        },
      ],
      shipping_address: order.shipping_address,
      customer_location: customerCoords,
      vendors: orderedVendors.map((v) => ({
        vendor_id: v.vendor_id,
        name: v.store_name,
        latitude: v.latitude,
        longitude: v.longitude,
      })),
    };
  } catch (err) {
    console.error("Error tracking order:", err);
    return null;
  }
};

/**
 * ============================
 * Customer Module - Carts
 * ============================
 */

/**
 * Get all carts
 * @returns {Promise<Array>} Array of cart objects
 */
exports.getAllCarts = async () => {
  const result = await pool.query(`
  SELECT c.id, c.user_id, c.created_at, c.updated_at, c.guest_token,
         COALESCE(
           json_agg(
             json_build_object(
               'id', ci.id,
               'cart_id', ci.cart_id,
               'quantity', ci.quantity,
               'variant', ci.variant,
               'price', p.price,
               'name', p.name
             )
           ) FILTER (WHERE ci.id IS NOT NULL), '[]'
         ) AS items
  FROM carts c
  LEFT JOIN cart_items ci ON ci.cart_id = c.id
  LEFT JOIN products p ON ci.product_id = p.id
  GROUP BY c.id
  ORDER BY c.created_at DESC
`);

  return result.rows;
};

/**
 * Get a cart by ID with items
 * @param {number} id - Cart ID
 * @returns {Promise<Object|null>} Cart object with items array or null
 */
exports.getCartById = async (id) => {
  const cartRes = await pool.query("SELECT * FROM carts WHERE id = $1", [id]);
  if (cartRes.rows.length === 0) return null;

  const itemsRes = await pool.query(
    `
    SELECT 
      ci.id, 
      ci.cart_id, 
      ci.quantity, 
      ci.variant, 
      p.price, 
      p.name,
      v.store_name AS vendor_name,
      COALESCE(
        (
          SELECT json_agg(pi.image_url::text ORDER BY pi.id)
          FROM product_images pi
          WHERE pi.product_id = p.id
        )::jsonb,
        '[]'::jsonb
      ) AS images
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    JOIN vendors v ON p.vendor_id = v.id
    WHERE ci.cart_id = $1
  `,
    [id]
  );

  return { ...cartRes.rows[0], items: itemsRes.rows };
};

/**
 * Create a new cart for a user
 * @param {number} userId
 * @returns {Promise<Object>} Created cart object
 */
exports.createCart = async (userId) => {
  const result = await pool.query(
    "INSERT INTO carts (user_id) VALUES ($1) RETURNING *",
    [userId]
  );
  return result.rows[0];
};

/**
 * Update cart owner
 * @param {number} id - Cart ID
 * @param {number} userId - New user ID
 * @returns {Promise<Object>} Updated cart object
 */
exports.updateCart = async (id, userId) => {
  const result = await pool.query(
    `UPDATE carts 
     SET user_id = $1, guest_token = NULL, updated_at = NOW() 
     WHERE id = $2 
     RETURNING *`,
    [userId, id]
  );
  return result.rows[0];
};

/**
 * Delete a cart and its items
 * @param {number} id - Cart ID
 * @returns {Promise<Object|null>} Deleted cart object or null
 */
exports.deleteCart = async (id) => {
  await pool.query("DELETE FROM cart_items WHERE cart_id = $1", [id]);
  const result = await pool.query(
    "DELETE FROM carts WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
};

/**
 * ============================
 * Customer Module - Cart Items
 * ============================
 */
/**
 * Get a specific cart item by ID
 * @param {number} id - Cart item ID
 * @returns {Promise<Object|null>} Cart item object or null
 */
exports.getItemById = async (id) => {
  const result = await pool.query("SELECT * FROM cart_items WHERE id = $1", [
    id,
  ]);
  return result.rows[0] || null;
};

/**
 * Add item to cart
 * @param {number} cartId
 * @param {number} productId
 * @param {number} quantity
 * @param {Object} variant
 * @returns {Promise<Object>} Created cart item
 */
exports.addItem = async (cartId, productId, quantity, variant) => {
  try {
    //  if the varient = null or = {} its the same product
    // until we add the varient feature
    const normalizedVariant = variant || {};

    //  make sure if the product exist in the cart in the same varient
    const existingItemResult = await pool.query(
      `SELECT id, quantity 
       FROM cart_items 
       WHERE cart_id=$1 
         AND product_id=$2 
         AND variant::jsonb = $3::jsonb`,
      [cartId, productId, normalizedVariant]
    );

    const existingItem = existingItemResult.rows[0];
    const existingQty = existingItem?.quantity || 0;

    // get product stock
    const productResult = await pool.query(
      `SELECT stock_quantity FROM products WHERE id=$1`,
      [productId]
    );

    if (!productResult.rows[0]) {
      throw new Error("Product not found");
    }

    const stockQty = productResult.rows[0].stock_quantity;

    // make sure the quantity <= stock
    if (existingQty + quantity > stockQty) {
      throw new Error(
        `Cannot add ${quantity} items. Only ${
          stockQty - existingQty
        } left in stock.`
      );
    }

    // if the product exist quantity+1
    if (existingItem) {
      const updatedItem = await pool.query(
        `UPDATE cart_items 
         SET quantity = quantity + $1
         WHERE id = $2
         RETURNING *`,
        [quantity, existingItem.id]
      );
      return updatedItem.rows[0];
    } else {
      // if not exist add it as new card
      const addedItem = await pool.query(
        `INSERT INTO cart_items (cart_id, product_id, quantity, variant)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [cartId, productId, quantity, normalizedVariant]
      );
      return addedItem.rows[0];
    }
  } catch (err) {
    console.error("Error in addItem:", err.message);
    throw err;
  }
};

/**
 * Update item in cart
 * @param {number} id - Item ID
 * @param {number} quantity
 * @param {Object} variant
 * @returns {Promise<Object>} Updated item
 */
exports.updateItem = async (id, quantity, variant) => {
  const result = await pool.query(
    `UPDATE cart_items 
     SET quantity = $1, variant = $2, updated_at = NOW() 
     WHERE id = $3 RETURNING *`,
    [quantity, variant, id]
  );
  return result.rows[0];
};

/**
 * Delete item from cart
 * @param {number} id - Item ID
 * @returns {Promise<Object|null>} Deleted item or null
 */
exports.deleteItem = async (id) => {
  const result = await pool.query(
    "DELETE FROM cart_items WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
};
/**
 * @module CartService
 * @description Service layer functions for managing shopping carts
 * in the database, supporting both authenticated users and guest users.
 */

/**
 * Fetch all carts belonging to a specific authenticated user.
 *
 * @async
 * @function getAllCartsByUser
 * @param {number} userId - The ID of the authenticated user.
 * @returns {Promise<Object[]>} A promise that resolves to an array of cart objects.
 * @throws {Error} If the database query fails.
 */
exports.getAllCartsByUser = async (userId) => {
  const result = await pool.query(
    `
    SELECT 
      c.id, 
      c.user_id, 
      c.created_at, 
      c.updated_at, 
      c.guest_token,
      COALESCE(
        json_agg(
          json_build_object(
            'id', ci.id,
            'cart_id', ci.cart_id,
            'quantity', ci.quantity,
            'variant', ci.variant,
            'price', p.price,
            'name', p.name
          )
        ) FILTER (WHERE ci.id IS NOT NULL),
        '[]'
      ) AS items
    FROM carts c
    LEFT JOIN cart_items ci ON ci.cart_id = c.id
    LEFT JOIN products p ON ci.product_id = p.id
    WHERE c.user_id = $1
    GROUP BY c.id
    ORDER BY c.created_at DESC
    `,
    [userId]
  );

  return result.rows;
};

/**
 * Fetch all carts belonging to a guest (non-authenticated user).
 *
 * @async
 * @function getAllCartsByGuest
 * @param {string} guestToken - The unique token identifying the guest.
 * @returns {Promise<Object[]>} A promise that resolves to an array of cart objects.
 * @throws {Error} If the database query fails.
 */
exports.getAllCartsByGuest = async (guestToken) => {
  const result = await pool.query(
    `
    SELECT 
      c.id, 
      c.user_id, 
      c.created_at, 
      c.updated_at, 
      c.guest_token,
      COALESCE(
        json_agg(
          json_build_object(
            'id', ci.id,
            'cart_id', ci.cart_id,
            'quantity', ci.quantity,
            'variant', ci.variant,
            'price', p.price,
            'name', p.name
          )
        ) FILTER (WHERE ci.id IS NOT NULL),
        '[]'
      ) AS items
    FROM carts c
    LEFT JOIN cart_items ci ON ci.cart_id = c.id
    LEFT JOIN products p ON ci.product_id = p.id
    WHERE c.guest_token = $1
    GROUP BY c.id
    ORDER BY c.created_at DESC
    `,
    [guestToken]
  );

  return result.rows;
};

/**
 * Create a new cart for an authenticated user.
 *
 * @async
 * @function createCartForUser
 * @param {number} userId - The ID of the authenticated user.
 * @returns {Promise<Object>} A promise that resolves to the newly created cart object.
 * @throws {Error} If the database query fails.
 */
exports.createCartForUser = async (userId) => {
  if (!userId || typeof userId !== "number") {
    throw new Error("Invalid userId for cart creation");
  }
  const result = await pool.query(
    "INSERT INTO carts (user_id, guest_token) VALUES ($1, NULL) RETURNING *",
    [userId]
  );
  return result.rows[0];
};
/**
 * Create a new cart for a guest (non-authenticated user).
 *
 * @async
 * @function createCartForGuest
 * @param {string} guestToken - The unique token identifying the guest.
 * @returns {Promise<Object>} A promise that resolves to the newly created cart object.
 * @throws {Error} If the database query fails.
 */
exports.createCartForGuest = async (guestToken) => {
  if (!guestToken) {
    throw new Error("Guest token is required for guest cart");
  }
  const result = await pool.query(
    "INSERT INTO carts (user_id, guest_token) VALUES (NULL, $1) RETURNING *",
    [guestToken]
  );
  return result.rows[0];
};

/**
 * ============================
 * Customer Module - Products
 * ============================
 */
// Get all data from products table
/**
 * @function getAllProducts
 * @desc Fetch all products with optional filters, pagination, and search
 * @param {Object} param0
 * @param {string} [param0.search] - Search term for product name or store name
 * @param {number} [param0.categoryId] - Filter by category ID
 * @param {number} [param0.page=1] - Page number
 * @param {number} [param0.limit=10] - Items per page
 * @returns {Promise<Array>} - Array of product objects with images
 */

exports.getAllProducts = async ({
  search,
  categoryId,
  page = 1,
  limit = 10,
}) => {
  try {
    const values = [];
    let idx = 1;

    // Base query
    let baseQuery = `
      SELECT 
        p.*,
        v.store_name AS vendor_name,
        COALESCE(
          (
            SELECT json_agg(pi.image_url::text ORDER BY pi.id)
            FROM product_images pi
            WHERE pi.product_id = p.id
          )::jsonb,
          '[]'::jsonb
        ) AS images
      FROM products p
      LEFT JOIN vendors v ON v.id = p.vendor_id
      WHERE (p.is_deleted = FALSE OR p.is_deleted IS NULL)
        AND v.status = 'approved'
    `;

    let countQuery = `
      SELECT COUNT(*) AS total
      FROM products p
      LEFT JOIN vendors v ON v.id = p.vendor_id
      WHERE (p.is_deleted = FALSE OR p.is_deleted IS NULL)
        AND v.status = 'approved'
    `;

    const countValues = [];
    let countIdx = 1;

    // 🔍 Search filter
    if (search) {
      baseQuery += ` AND (p.name ILIKE $${idx} OR v.store_name ILIKE $${idx})`;
      countQuery += ` AND (p.name ILIKE $${countIdx} OR v.store_name ILIKE $${countIdx})`;
      values.push(`%${search}%`);
      countValues.push(`%${search}%`);
      idx++;
      countIdx++;
    }

    //  Category filter مع دعم الـ nested children
    if (categoryId && categoryId.length) {
      //recursive CTE لجلب كل الـ child categories
      const categoryCTE = `
        WITH RECURSIVE all_categories AS (
          SELECT id FROM categories WHERE id = ANY($1::int[])
          UNION ALL
          SELECT c.id FROM categories c
          INNER JOIN all_categories ac ON c.parent_id = ac.id
        )
        SELECT id FROM all_categories
      `;
      const categoryResult = await pool.query(categoryCTE, [
        categoryId.map(Number),
      ]);

      const allCategoryIds = categoryResult.rows.map((r) => r.id);

      baseQuery += ` AND p.category_id = ANY($${idx}::int[])`;
      countQuery += ` AND p.category_id = ANY($${countIdx}::int[])`;
      values.push(allCategoryIds);
      countValues.push(allCategoryIds);
      idx++;
      countIdx++;
    }

    // ⚡ Pagination
    baseQuery += ` ORDER BY p.created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
    values.push(limit, (page - 1) * limit);

    const { rows } = await pool.query(baseQuery, values);
    const countResult = await pool.query(countQuery, countValues);
    const total = parseInt(countResult.rows[0].total, 10);

    return {
      items: rows,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (err) {
    console.error("Error in getAllProducts:", err);
    throw err;
  }
};

/**
 * @function getCustomerOrders
 * @async
 * @desc Retrieve all orders for a specific customer, including order items with product details.
 * @param {number} customer_id - The ID of the customer whose orders are being fetched.
 * @returns {Promise<Array<Object>>} - Returns an array of order objects. Each order contains:
 *   - id {number} - Order ID
 *   - total_amount {number} - Total order amount
 *   - status {string} - Current order status (pending, processing, delivered, etc.)
 *   - payment_status {string} - Payment status (paid/unpaid)
 *   - shipping_address {string} - Shipping address of the order
 *   - created_at {string} - Timestamp of order creation
 *   - items {Array<Object>} - Array of items in the order, each containing:
 *       - product_id {number} - ID of the product
 *       - name {string} - Product name
 *       - price {number} - Price per unit
 *       - quantity {number} - Quantity ordered
 *
 * @example
 * [
 *   {
 *     id: 1,
 *     total_amount: 150,
 *     status: "pending",
 *     payment_status: "unpaid",
 *     shipping_address: "Amman, Jordan",
 *     created_at: "2025-09-20T12:00:00Z",
 *     items: [
 *       { product_id: 10, name: "Product A", price: 50, quantity: 2 },
 *       { product_id: 12, name: "Product B", price: 25, quantity: 2 }
 *     ]
 *   }
 * ]
 */
exports.getCustomerOrders = async (customer_id) => {
  const result = await pool.query(
    `
    SELECT 
      o.id,
      o.total_amount,
      o.distance_km,
      o.delivery_fee,
      o.total_with_shipping,
      o.status,
      o.payment_status,
      o.shipping_address,
      o.created_at,
      COALESCE(
        json_agg(
          json_build_object(
            'product_id', p.id,
            'name', p.name,
            'price', p.price,
            'quantity', oi.quantity
          )
        ) FILTER (WHERE p.id IS NOT NULL), '[]'
      ) AS items,
      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id', pay.id,
              'payment_method', pay.payment_method,
              'amount', pay.amount,
              'status', pay.status,
              'transaction_id', pay.transaction_id,
              'card_last4', pay.card_last4,
              'card_brand', pay.card_brand,
              'expiry_month', pay.expiry_month,
              'expiry_year', pay.expiry_year
            )
          )
          FROM payments pay
          WHERE pay.order_id = o.id
        ),
        '[]'
      ) AS payments
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE o.customer_id = $1
    GROUP BY o.id
    ORDER BY o.created_at DESC
    `,
    [customer_id]
  );

  return result.rows;
};

exports.getVendorProducts = async (vendorId) => {
  const query = `
    SELECT *
    FROM products
    WHERE vendor_id = $1
    ORDER BY created_at DESC
  `;
  const { rows } = await pool.query(query, [vendorId]);
  return rows;
};

exports.Order = {
  updatePaymentStatus: async (id, payment_status) => {
    const result = await pool.query(
      `UPDATE orders
       SET payment_status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [payment_status, id]
    );
    return result.rows[0];
  },
};

/**
 * get all product with optional dynamic sorting
 * @param {string} sortBy العمود أو النوع ('price_asc', 'price_desc', 'most_sold', أي عمود)
 */
exports.fetchProductsWithSorting = async (
  sortBy = "id ASC",
  page = 1,
  limit = 12
) => {
  let orderClause = "id ASC";

  if (sortBy === "price_asc") orderClause = "price ASC";
  else if (sortBy === "price_desc") orderClause = "price DESC";
  else if (sortBy === "most_sold")
    orderClause = `
    COALESCE(SUM(oi.quantity), 0) DESC
  `;

  const totalRes = await pool.query(
    "SELECT COUNT(*) FROM products WHERE is_deleted = false"
  );
  const totalItems = parseInt(totalRes.rows[0].count);
  const totalPages = Math.ceil(totalItems / limit);

  // OFFSET
  const offset = (page - 1) * limit;

  let query = "";
  if (sortBy === "most_sold") {
    query = `
      SELECT p.*, COALESCE(SUM(oi.quantity), 0) AS total_sold
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      WHERE p.is_deleted = false
      GROUP BY p.id
      ORDER BY total_sold DESC
      LIMIT $1 OFFSET $2;
    `;
  } else {
    query = `
      SELECT *
      FROM products
      WHERE is_deleted = false
      ORDER BY ${orderClause}
      LIMIT $1 OFFSET $2;
    `;
  }

  const { rows } = await pool.query(query, [limit, offset]);
  return { items: rows, totalItems, totalPages, currentPage: page };
};

exports.paymentModel = {
  getUserPayments: async (userId) => {
    const query = `
    SELECT 
      p.*,
      o.total_amount AS order_total,
      o.status AS order_status
    FROM payments p
    LEFT JOIN orders o ON p.order_id = o.id
    WHERE p.user_id = $1
    ORDER BY p.created_at DESC
  `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  },

  createPayment: async (data) => {
    const {
      order_id,
      user_id,
      payment_method,
      amount,
      status = "pending",
      transaction_id,
      card_last4,
      card_brand,
      expiry_month,
      expiry_year,
    } = data;

    //  تحقق إذا كان في سجل بنفس user_id + payment_method + transaction_id
    if (payment_method === "paypal" && transaction_id) {
      const checkQuery = `
      SELECT * FROM payments 
      WHERE user_id = $1 AND payment_method = $2 AND transaction_id = $3
      LIMIT 1
    `;
      const checkRes = await pool.query(checkQuery, [
        user_id,
        payment_method,
        transaction_id,
      ]);
      if (checkRes.rows.length > 0) {
        return checkRes.rows[0];
      }
    }

    const query = `
    INSERT INTO payments (
      order_id, user_id, payment_method, amount, status, transaction_id,
      card_last4, card_brand, expiry_month, expiry_year
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *
  `;

    const values = [
      order_id,
      user_id,
      payment_method,
      amount,
      status,
      transaction_id,
      card_last4,
      card_brand,
      expiry_month,
      expiry_year,
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  deletePayment: async (userId, paymentId) => {
    const query = `
      DELETE FROM payments
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    const { rows } = await pool.query(query, [paymentId, userId]);
    return rows[0];
  },
};

exports.deleteProfile = async (req, res) => {
  const userId = req.user.id;
  try {
    await db.query("DELETE FROM users WHERE id = $1", [userId]);

    res
      .status(200)
      .json({ message: "User and all related data deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete user." });
  }
};

/**
 * ============================
 * Customer Model - WishList
 * ============================
 */

exports.getWishlistByUser = async (userId) => {
  const { rows } = await pool.query(
    `SELECT 
       w.id AS wishlist_id,
       p.id AS product_id,
       p.name, 
       p.price, 
       p.description,
       COALESCE(json_agg(pi.image_url) FILTER (WHERE pi.image_url IS NOT NULL), '[]') AS images
     FROM wishlist w
     JOIN products p ON w.product_id = p.id
     LEFT JOIN product_images pi ON pi.product_id = p.id
     WHERE w.user_id = $1
     GROUP BY w.id, p.id`,
    [userId]
  );
  return rows;
};

exports.addProductToWishlist = async (userId, productId) => {
  const exists = await pool.query(
    `SELECT * FROM wishlist WHERE user_id = $1 AND product_id = $2`,
    [userId, productId]
  );

  if (exists.rows.length > 0) {
    throw new Error("Product already in wishlist");
  }

  const { rows } = await pool.query(
    `INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2) RETURNING id AS wishlist_id, product_id`,
    [userId, productId]
  );

  return rows[0];
};

exports.removeProductFromWishlist = async (wishlistId) => {
  const { rowCount } = await pool.query(`DELETE FROM wishlist WHERE id = $1`, [
    wishlistId,
  ]);

  if (rowCount === 0) {
    throw new Error("Product not found in wishlist");
  }

  return { success: true };
};

exports.getPointsByUser = async (userId) => {
  const result = await pool.query(
    'SELECT points_balance, points_history FROM loyalty_points WHERE user_id = $1',
    [userId]
  );

  if (result.rows.length === 0) return { points_balance: 0, points_history: [] };

  const row = result.rows[0];

  let history = row.points_history;

  // ✅ تأكدي أنه نص قبل استخدام JSON.parse
  if (typeof history === "string") {
    history = JSON.parse(history || "[]");
  }

  return { 
    points_balance: row.points_balance, 
    points_history: history
  };
};


exports.addPoints = async (userId, points, description) => {
  const data = await exports.getPointsByUser(userId);
  const newBalance = data.points_balance + points;
  const newHistory = [...data.points_history, { type: 'earn', points, description, date: new Date() }];

  await pool.query(
    `INSERT INTO loyalty_points (user_id, points_balance, points_history, created_at, updated_at)
     VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     ON CONFLICT (user_id) DO UPDATE
       SET points_balance = loyalty_points.points_balance + $2,
           points_history = loyalty_points.points_history || $3,
           updated_at = CURRENT_TIMESTAMP`,
    [userId, points, JSON.stringify(newHistory)]
  );
};

exports.redeemPoints = async (userId, points, description) => {
  const data = await exports.getPointsByUser(userId);

  if(points > data.points_balance) throw new Error("Insufficient points");

  const newBalance = data.points_balance - points;
  const newHistory = [...data.points_history, { type: 'redeem', points, description, date: new Date() }];

  await pool.query(
    `UPDATE loyalty_points
     SET points_balance = $1,
         points_history = $2,
         updated_at = CURRENT_TIMESTAMP
     WHERE user_id = $3`,
    [newBalance, JSON.stringify(newHistory), userId]
  );

  // 100 نقطة = 10% خصم
  const discountPercentage = Math.floor(points / 100) * 10;
  return discountPercentage;
};
