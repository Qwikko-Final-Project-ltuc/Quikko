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
const { validateCoupon } = require("../coupon/CouponModel");

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

exports.calculateDeliveryPreview = async function (
  cartId,
  userId,
  address,
  addressId
) {
  // 1️⃣ جلب عناصر الـ cart
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

  // 2️⃣ جلب أو إنشاء عنوان العميل
  let savedAddress;
  if (addressId) {
    const existingAddress = await pool.query(
      `SELECT * FROM addresses WHERE id = $1 AND user_id = $2`,
      [addressId, userId]
    );
    if (existingAddress.rows.length === 0) throw new Error("Address not found");
    savedAddress = existingAddress.rows[0];
  } else {
    if (!address.latitude || !address.longitude) {
      const geo = await geocodeAddress(
        `${address.address_line1}, ${address.city}`
      );
      if (geo) {
        address.latitude = geo.latitude;
        address.longitude = geo.longitude;
      }
    }
    const addressResult = await pool.query(
      `INSERT INTO addresses (user_id, address_line1, address_line2, city, state, postal_code, country, latitude, longitude)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
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

  // 3️⃣ جلب شركات التوصيل المتاحة
  let deliveryCompaniesResult = await pool.query(
    `SELECT id, latitude, longitude, company_name
      FROM delivery_companies
      WHERE EXISTS (
        SELECT 1 FROM unnest(coverage_areas) AS area WHERE LOWER(area) = LOWER($1)
      ) AND status = 'approved'`,
    [savedAddress.city]
  );

  let deliveryCompanies = deliveryCompaniesResult.rows;
  if (deliveryCompanies.length === 0) {
    const fallback = await pool.query(
      `SELECT id, latitude, longitude, company_name
        FROM delivery_companies WHERE status='approved' LIMIT 1`
    );
    if (fallback.rows.length === 0)
      throw new Error("No delivery companies available");
    deliveryCompanies = fallback.rows;
  }

  const deliveryCompany = deliveryCompanies[0];

  // 4️⃣ تجهيز كل النقاط للطريق: Delivery → Vendors → Customer
  const points = [];
  if (deliveryCompany.latitude && deliveryCompany.longitude) {
    points.push({
      lat: deliveryCompany.latitude,
      lng: deliveryCompany.longitude,
    });
  }

  // جلب إحداثيات كل vendors
  const vendorIds = [...new Set(cartItemsResult.rows.map((i) => i.vendor_id))];
  const vendorsQuery = await pool.query(
    `SELECT id, latitude, longitude, store_name FROM vendors WHERE id = ANY($1)`,
    [vendorIds]
  );
  const vendors = vendorsQuery.rows;

  vendors.forEach((v) => {
    if (v.latitude && v.longitude) {
      points.push({ lat: v.latitude, lng: v.longitude, label: v.store_name });
    }
  });

  // إضافة العميل في النهاية
  points.push({
    lat: savedAddress.latitude,
    lng: savedAddress.longitude,
    label: "Customer",
  });

  // 5️⃣ حساب المسافة الإجمالية
  let totalDistance = null;
  let delivery_fee = 0.5;

  if (points.length >= 2) {
    try {
      const origin = points[0];
      const destination = points[points.length - 1];
      const waypoints = points
        .slice(1, -1)
        .map((p) => `${p.lat},${p.lng}`)
        .join("|");

      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${
        origin.lat
      },${origin.lng}&destination=${destination.lat},${destination.lng}${
        waypoints ? `&waypoints=${waypoints}` : ""
      }&key=${process.env.GOOGLE_MAPS_API_KEY}`;

      const response = await axios.get(url);

      if (response.data.routes?.length > 0 && response.data.routes[0].legs) {
        totalDistance = response.data.routes[0].legs.reduce(
          (sum, leg) => sum + leg.distance.value / 1000,
          0
        );
      }
    } catch (err) {
      console.log(
        "Directions API failed, fallback to straight distance:",
        err.message
      );
    }

    // fallback: حساب المسافة المستقيمة بين النقاط
    if (totalDistance === null) {
      totalDistance = calculateTotalRouteDistance(points); // لازم تكون عندك دالة لحساب مجموع المسافات المستقيمة
    }
    delivery_fee = totalDistance * 0.2;
  }

  delivery_fee = parseFloat(delivery_fee.toFixed(2));

  // 6️⃣ حساب المجموع قبل أي خصومات
  let total_amount = 0;
  cartItemsResult.rows.forEach(
    (item) => (total_amount += item.price * item.quantity)
  );
  const total_with_shipping = parseFloat(
    (total_amount + delivery_fee).toFixed(2)
  );

  return {
    total_amount,
    delivery_fee,
    total_with_shipping,
    distance_km: parseFloat(totalDistance?.toFixed(2)) || 0,
    vendors,
    deliveryCompany,
    customer_location: savedAddress,
  };
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
  coupons,
  use_loyalty_points = false,
}) {
  const client = await pool.connect();
  let order = null;
  let points_used = 0;
  let discount_from_points = 0;
  let discount_amount_coupon = 0;
  let discount_amount_total = 0;

  try {
    await client.query("BEGIN");

    // 1️⃣ Fetch cart items
    
    use_loyalty_points = parseInt(use_loyalty_points) || 0;
    console.log(" Processing loyalty points (converted):", use_loyalty_points, "Type:", typeof use_loyalty_points);

    // 1️⃣ جلب عناصر السلة
    const cartItemsResult = await client.query(
      `SELECT ci.product_id, ci.quantity, ci.variant, p.price, p.vendor_id
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       JOIN carts c ON ci.cart_id = c.id
       WHERE ci.cart_id = $1 AND c.user_id = $2`,
      [cartId, userId]
    );
    if (!cartItemsResult.rows.length) throw new Error("Cart is empty or not found");

    // 2️⃣ التعامل مع العنوان
    let savedAddress;
    if (addressId) {
      const existingAddress = await client.query(
        `SELECT * FROM addresses WHERE id = $1 AND user_id = $2`,
        [addressId, userId]
      );
      if (!existingAddress.rows.length) throw new Error("Address not found");
      savedAddress = existingAddress.rows[0];
    } else {
      if (!address.latitude || !address.longitude) {
        const geo = await geocodeAddress(`${address.address_line1}, ${address.city}`);
        if (geo) {
          address.latitude = geo.latitude;
          address.longitude = geo.longitude;
        }
      }
      const addressResult = await client.query(
        `INSERT INTO addresses (user_id,address_line1,address_line2,city,state,postal_code,country,latitude,longitude)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [
          userId,
          address.address_line1,
          address.address_line2 || "",
          address.city,
          address.state || "",
          address.postal_code || "",
          address.country || "Jordan",
          address.latitude || null,
          address.longitude || null
        ]
      );
      savedAddress = addressResult.rows[0];
    }

    // 3️⃣ شركات التوصيل المتاحة
    let deliveryCompanies = (await client.query(
      `SELECT id, latitude, longitude, company_name
       FROM delivery_companies
       WHERE EXISTS (
         SELECT 1 FROM unnest(coverage_areas) AS area WHERE LOWER(area) = LOWER($1)
       ) AND status = 'approved'`,
      [savedAddress.city]
    )).rows;

    if (!deliveryCompanies.length) {
      const fallback = (await client.query(
        `SELECT id, latitude, longitude, company_name FROM delivery_companies WHERE status='approved' LIMIT 1`
      )).rows;
      if (!fallback.length) throw new Error("No delivery companies available");
      deliveryCompanies = fallback;
    }

    // 4️⃣ حساب رسوم التوصيل
    let delivery_fee = 0.5;
    let minDistance = null;
    if (
      savedAddress.latitude &&
      savedAddress.longitude &&
      deliveryCompanies[0].latitude &&
      deliveryCompanies[0].longitude
    ) {

      try {
        const distanceUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${deliveryCompanies[0].latitude},${deliveryCompanies[0].longitude}&destinations=${savedAddress.latitude},${savedAddress.longitude}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
        const distanceResponse = await axios.get(distanceUrl);
        const element = distanceResponse.data.rows[0].elements[0];
        if (element.status === "OK") {
          minDistance = element.distance.value / 1000; // km
          delivery_fee += minDistance * 0.2;
        } else {
          minDistance = calculateDistanceKm(
            savedAddress.latitude,
            savedAddress.longitude,
            deliveryCompanies[0].latitude,
            deliveryCompanies[0].longitude
          );
          delivery_fee += minDistance * 0.2;
        }
      } catch (error) {
        console.log(
          "Google Distance API failed, using straight distance:",
          error.message
        );
        minDistance = calculateDistanceKm(
          savedAddress.latitude,
          savedAddress.longitude,
          deliveryCompanies[0].latitude,
          deliveryCompanies[0].longitude
        );
        delivery_fee += minDistance * 0.2;
      }
    }
    delivery_fee = parseFloat(delivery_fee.toFixed(2));

    // 5️⃣ حساب المجموع الكلي
    let total_amount = 0;
    for (let item of cartItemsResult.rows) {
      total_amount += Number(item.price) * Number(item.quantity);
    }

    let total_with_shipping = total_amount + delivery_fee;
    let discount_amount = 0;
    let final_amount = total_amount;
    let applied_coupons = [];

    if (Array.isArray(coupons) && coupons.length > 0) {
      for (const c of coupons) {
        const vendor_id = Number(c.vendor_id);
        const coupon_code = c.coupon_code;
        if (!coupon_code) continue;

        const vendorItems = cartItemsResult.rows.filter(
          (i) => Number(i.vendor_id) === vendor_id
        );

        if (vendorItems.length === 0) {
          console.log(
            `No items from vendor ${vendor_id} for coupon ${coupon_code}`
          );
          continue;
        }

        const {
          valid,
          discount_amount: disc,
          message,
        } = await validateCoupon(coupon_code, userId, vendorItems);

        if (valid) {
          const discNum = Number(disc || 0);
          discount_amount += discNum;
          final_amount -= discNum;
          applied_coupons.push({
            vendor_id,
            coupon_code,
            discount_amount: discNum,
          });
          console.log(
            `Applied coupon ${coupon_code} for vendor ${vendor_id} -> discount ${discNum}`
          );
        } else {
          console.log(
            `Coupon ${coupon_code} invalid for vendor ${vendor_id}:`,
            message
          );
        }
      }
    } else {
      console.log("No coupons provided");    
    }

    // خصم نقاط الولاء
    console.log(" Processing loyalty points:", use_loyalty_points);
    if (use_loyalty_points && use_loyalty_points > 0) {
      const loyaltyData = await exports.getPointsByUser(userId);
      console.log("📊 Loyalty data from DB:", loyaltyData);
      
      const pointsToUse = Math.min(use_loyalty_points, loyaltyData.points_balance);
      console.log("📊 Points to use:", pointsToUse, "Available:", loyaltyData.points_balance);
      
      if (pointsToUse > 0) {
        const discountPercent = Math.min((pointsToUse / 100) * 10, 50);
        discount_from_points = parseFloat(((total_amount * discountPercent) / 100).toFixed(2));
        points_used = pointsToUse;
        final_amount -= discount_from_points;
        
        console.log("✅ Points discount applied:", {
          total_amount,
          pointsToUse,
          discountPercent: discountPercent + '%',
          discount_from_points,
          final_amount_before_shipping: final_amount
        });
      } else {
        console.log("❌ Not enough points for discount. Need 100, have:", pointsToUse);
      }
    }

    // إجمالي الخصم = كوبون + نقاط
    discount_amount_total = discount_amount_coupon + discount_from_points;

    // إضافة التوصيل
    final_amount += delivery_fee;

    // total_with_shipping
    const total_with_shipping = final_amount;

    console.log("🎯 Final amounts before order creation:", {
      total_amount,
      discount_amount_coupon,
      discount_from_points,
      discount_amount_total,
      delivery_fee,
      final_amount
    });

    // 6️⃣ إنشاء الأوردر
    const payment_status = paymentMethod === "cod" ? "pending" : "paid";
    const orderResult = await client.query(
      `INSERT INTO orders (
        customer_id, delivery_company_id, address_id, status, shipping_address,
        total_amount, discount_amount, final_amount, coupon_code, delivery_fee, 
        total_with_shipping, payment_status, distance_km, created_at, updated_at
      ) VALUES ($1,$2,$3,'requested',$4,$5,$6,$7,$8,$9,$10,$11,$12,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        userId,
        deliveryCompanies[0].id,
        savedAddress.id,
        JSON.stringify(savedAddress),
        total_amount,
        discount_amount_total,
        final_amount,
        coupon_code_to_save || coupon_code || null,
        delivery_fee,
        total_with_shipping,
        payment_status,
        minDistance || null,

      ]
    );

    order = orderResult.rows[0];

    // حفظ عناصر الطلب
    for (let item of cartItemsResult.rows) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, vendor_id, quantity, price, variant, distance_km, vendor_status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,'pending')`,
        [order.id, item.product_id, item.vendor_id, item.quantity, item.price, JSON.stringify(item.variant || {}), minDistance || 0]
      );
    }
    // طلبات التوصيل
    for (let company of deliveryCompanies) {
      await client.query(
        `INSERT INTO delivery_requests (order_id, delivery_company_id, status)
         VALUES ($1, $2, 'pending')`,
        [order.id, company.id]
      );
    }

    // تسجيل الدفع إذا ليس COD
    if (paymentMethod !== "cod" && paymentData) {
      await client.query(
        `INSERT INTO payments (order_id, user_id, payment_method, status, transaction_id, card_last4, card_brand, expiry_month, expiry_year, amount, created_at)
         VALUES ($1,$2,$3,'paid',$4,$5,$6,$7,$8,$9,CURRENT_TIMESTAMP)`,
        [
          order.id,
          userId,
          paymentMethod,
          paymentData.transactionId || null,
          paymentData.card_last4 || null,
          paymentData.card_brand || null,
          paymentData.expiry_month || null,
          paymentData.expiry_year || null,
          final_amount,
        ]
      );
    }

    await client.query("COMMIT");

  } catch (err) {
    await client.query("ROLLBACK");

    throw err;
  } finally {
    client.release();
  }

  // 7️⃣ Post-commit: نقاط الولاء
  try {
    console.log("🔍 Post-commit data:", {
      orderId: order?.id,
      use_loyalty_points,
      points_used,
      discount_amount_total
    });

    if (order && use_loyalty_points && points_used > 0) {
      // 🔥 التأكد من وجود نقاط كافية قبل الخصم
      const currentLoyaltyData = await exports.getPointsByUser(userId);
      console.log("📊 Current points balance before redemption:", currentLoyaltyData.points_balance);
      
      if (points_used > currentLoyaltyData.points_balance) {
        points_used = currentLoyaltyData.points_balance;
        console.log("⚠️ Adjusting points used to available balance:", points_used);
      }
      
      if (points_used > 0) {
        await exports.redeemPointsViaPool(userId, points_used, `Used ${points_used} points for order #${order.id}`);
        console.log("✅ Points redeemed successfully");
      }
    }

    // تسجيل النقاط المكتسبة
    if (order) {
      // 🔥 استخدام total_amount من order وليس من المتغير المحلي
      const pointsEarned = Math.floor((parseFloat(order.total_amount) - discount_amount_total) / 10);
      console.log("🎯 Calculating points earned:", {
        orderTotal: order.total_amount,
        discountTotal: discount_amount_total,
        pointsEarned
      });
      
      if (pointsEarned > 0) {
        await exports.addPointsViaPool(userId, pointsEarned, `Earned ${pointsEarned} points from order #${order.id}`);
        console.log("✅ Points earned added successfully");
      }
    }
  } catch (postErr) {
    console.warn("⚠️ Post-commit points failed:", postErr.message);
  }
  return order;
};


exports.acceptOrderByDeliveryCompany = async function (orderId, deliveryCompanyId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const updateResult = await client.query(
      `UPDATE delivery_requests 
       SET status = 'accepted', accepted_at = CURRENT_TIMESTAMP 
       WHERE order_id = $1 AND delivery_company_id = $2 AND status = 'pending'`,
      [orderId, deliveryCompanyId]
    );

    if (updateResult.rowCount === 0) {
      throw new Error("Delivery request not found or already processed");
    }

    await client.query(
      `UPDATE delivery_requests 
       SET status = 'rejected' 
       WHERE order_id = $1 AND delivery_company_id != $2 AND status = 'pending'`,
      [orderId, deliveryCompanyId]
    );

    await client.query(
      `UPDATE orders 
        SET delivery_company_id = $1, status = 'accepted'
        WHERE id = $2
        `,
      [deliveryCompanyId, orderId]
    );

    await client.query("COMMIT");
    return { success: true };
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("acceptOrderByDeliveryCompany error:", err);
    throw err;
  } finally {
    client.release();
  }
};

exports.updateOrderStatus = async function (orderId, status) {
  const validStatuses = [
    "requested",
    "accepted",
    "processing",
    "out_for_delivery",
    "delivered",
  ];

  if (!validStatuses.includes(status)) {
    throw new Error(
      `Invalid status. Must be one of: ${validStatuses.join(", ")}`
    );
  }

  const result = await pool.query(
    `UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
    [status, orderId]
  );

  if (result.rows.length === 0) {
    throw new Error("Order not found");
  }

  return result.rows[0];
};

exports.getRequestedOrdersForDelivery = async function (deliveryCompanyId) {
  console.log(
    "🔍 Executing getRequestedOrdersForDelivery with company ID:",
    deliveryCompanyId
  );

  try {
    const result = await pool.query(
      `SELECT 
      o.id,
      o.status AS order_status,
      o.total_amount,
      o.final_amount,
      o.delivery_fee,
      a.address_line1, 
      a.city, 
      a.state,
      u.name AS customer_name, 
      u.phone AS customer_phone,
      COUNT(oi.id) AS items_count,
      SUM(oi.quantity) AS total_quantity,
      ARRAY_AGG(DISTINCT LOWER(oi.vendor_status)) AS all_vendor_statuses,
      dr.status AS delivery_request_status
    FROM orders o
    JOIN delivery_requests dr ON o.id = dr.order_id
    JOIN addresses a ON o.address_id = a.id
    JOIN users u ON o.customer_id = u.id
    JOIN order_items oi ON o.id = oi.order_id
    WHERE dr.delivery_company_id = $1 
      AND dr.status = 'pending'
      AND o.status = 'requested'
    GROUP BY o.id, a.id, u.id, dr.status
    ORDER BY o.created_at DESC`,
      [deliveryCompanyId]
    );

    console.log(
      "📊 Orders with all items accepted by vendors:",
      result.rows.length
    );

    return result.rows;
  } catch (error) {
    console.error("❌ Error in getRequestedOrdersForDelivery:", error);
    throw error;
  }
};

/**
 * Get order details for a specific customer
 * @param {number} customerId
 * @param {number} orderId
 * @returns {Promise<Object|null>} Order object with items
 */
exports.getOrderById = async function (customerId, orderId) {
  try {
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
          'vendor_longitude', v.longitude,
          'store_name', v.store_name
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
          label: "Customer",
        });
    } catch (err) {
      console.error("Error fetching customer address coords:", err.message);
    }

    // delivery company
    let deliveryCompany = null;
    if (order.delivery_company_id) {
      const deliveryRes = await pool.query(
        `SELECT id, company_name, latitude, longitude
         FROM delivery_companies
         WHERE id = $1`,
        [order.delivery_company_id]
      );
      deliveryCompany = deliveryRes.rows[0];
      if (
        deliveryCompany &&
        deliveryCompany.latitude &&
        deliveryCompany.longitude
      ) {
        points.unshift({
          lat: deliveryCompany.latitude,
          lng: deliveryCompany.longitude,
          label: deliveryCompany.company_name,
        });
      }
    }

    // 3️⃣ نرتب vendors حسب المسار لو فيه أكثر من واحد
    let orderedVendors = items.map((i) => ({
      vendor_id: i.product_id,
      name: i.store_name,
      latitude: i.vendor_latitude,
      longitude: i.vendor_longitude,
    }));

    // 4️⃣ جمع routePoints
    const routePoints = [
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
        label: v.name,
      })),
      ...(customerCoords
        ? [
            {
              lat: customerCoords.latitude,
              lng: customerCoords.longitude,
              label: "Customer",
            },
          ]
        : []),
    ];

    // 5️⃣ أرجع كل البيانات مع delivery_fee و total_with_shipping من الـ DB مباشرةً
    return {
      order_id: order.order_id,
      status: order.status,
      updated_at: order.updated_at,
      delivery_fee: order.delivery_fee,
      total_with_shipping: order.total_with_shipping,
      distance_km: order.distance_km, // اختياري حسب الحاجة
      routePoints,
      shipping_address: order.shipping_address,
      customer_location: customerCoords,
      vendors: orderedVendors,
      payments: order.payments || [],
    };
  } catch (err) {
    console.error("Error in getOrderById:", err);
    return null;
  }
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

    // 4️⃣  الإحداثيات الناقصة لكل vendor
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
    let points = [];
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

    points = points.filter((p) => p.lat && p.lng);

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
        }${waypointsStr ? `&waypoints=${waypointsStr}` : ""}&key=${
          process.env.GOOGLE_MAPS_API_KEY
        }`;

        const response = await axios.get(url);

        if (response.data.routes?.length > 0 && response.data.routes[0].legs) {
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

    const routePoints = [
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
    ];

    // 7️⃣ إعادة البيانات
    return {
      order_id: order.order_id,
      status: order.status,
      updated_at: order.updated_at,
      distance_km: totalDistance,
      routePoints,
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
      p.vendor_id,
      v.store_name AS vendor_name,
      COALESCE(
    (
      SELECT json_agg(json_build_object('code', c.code, 'discount_value', c.discount_value))
      FROM coupons c
      WHERE c.vendor_id = v.id AND c.is_active = true
    ), '[]'
  ) AS coupons,
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
  limit = 15,
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
  limit = 15
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

exports.getPointsByUser = async function(userId) {
  try {
    const result = await pool.query(
      `SELECT points_balance 
       FROM loyalty_points 
       WHERE user_id = $1`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      // إذا لم يكن للمستخدم سجل، أنشئ واحداً جديداً
      await pool.query(
        `INSERT INTO loyalty_points (user_id, points_balance, points_history) 
         VALUES ($1, 0, '[]'::jsonb)`,
        [userId]
      );
      return { points_balance: 0 };
    }
    
    const points_balance = parseInt(result.rows[0].points_balance) || 0;
    console.log("📊 getPointsByUser result:", { userId, points_balance });
    
    return { points_balance };
  } catch (error) {
    console.error("❌ Error in getPointsByUser:", error);
    return { points_balance: 0 };
  }
};
exports.addPointsViaPool = async function(userId, points, description) {
  try {
    // تحديث الرصيد وإضافة للسجل التاريخي
    const result = await pool.query(
      `UPDATE loyalty_points 
       SET points_balance = points_balance + $1,
           points_history = points_history || $2::jsonb,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $3
       RETURNING *`,
      [
        points, 
        JSON.stringify([{
          type: 'earn',
          points: points,
          description: description,
          date: new Date().toISOString()
        }]),
        userId
      ]
    );
    
    console.log("✅ Points added:", { userId, points, description });
    return result.rows[0];
  } catch (error) {
    console.error("❌ Error in addPointsViaPool:", error);
    throw error;
  }
};

exports.redeemPointsViaPool = async function(userId, points, description) {
  try {
    // تحديث الرصيد وإضافة للسجل التاريخي
    const result = await pool.query(
      `UPDATE loyalty_points 
       SET points_balance = points_balance - $1,
           points_history = points_history || $2::jsonb,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $3
       RETURNING *`,
      [
        points, 
        JSON.stringify([{
          type: 'redeem',
          points: -points,
          description: description,
          date: new Date().toISOString()
        }]),
        userId
      ]
    );
    
    console.log("✅ Points redeemed:", { userId, points, description });
    return result.rows[0];
  } catch (error) {
    console.error("❌ Error in redeemPointsViaPool:", error);
    throw error;
  }
};