const pool = require("../../config/db");
const axios = require("axios");
const { geocodeAddress } = require("../../utils/geocoding");
const { calculateDistanceKm } = require("../../utils/distance");
require("dotenv").config();

/**
 * @module DeliveryModel
 * @desc Handles direct database operations for delivery companies and orders.
 *       Responsible for executing queries without applying business logic.
 */

/**
 * Get delivery company profile by user ID
 * @async
 * @param {number} userId - Authenticated user's ID
 * @returns {Promise<Object|null>} Company profile or null if not found
 */
exports.getProfileByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT 
       dc.id AS company_id, 
       dc.user_id, 
       dc.company_name, 
       dc.coverage_areas, 
       dc.status, 
       dc.created_at AS company_created_at, 
       dc.updated_at AS company_updated_at,
       u.name AS user_name,
       u.email AS user_email,
       u.phone AS user_phone,
       u.role AS user_role,
       u.created_at AS user_created_at
     FROM delivery_companies dc
     JOIN users u ON u.id = dc.user_id
     WHERE dc.user_id = $1`,
    [userId]
  );
  return result.rows[0];
};

/**
 * Update delivery company profile by user ID
 /**
 * @async
 * @param {number} userId - User ID
 * @param {Object} data - Data to update
 * @param {string} [data.company_name] - New company name
 * @param {Array<string>} [data.coverage_areas] - Updated coverage areas
 * @param {string} [data.user_name] - Updated user name
 * @param {string} [data.user_phone] - Updated user phone
 * @returns {Promise<Object|null>} Updated profile (company + user info) or null
 */
// exports.updateProfileByUserId = async (userId, data) => {
//   const { company_name, coverage_areas, user_name, user_phone } = data; // 🔴 شيل user_email
//   const result = await pool.query(
//     `WITH updated_company AS (
//        UPDATE delivery_companies
//        SET company_name = COALESCE($1, company_name),
//            coverage_areas = COALESCE($2, coverage_areas),
//            updated_at = NOW()
//        WHERE user_id = $5
//        RETURNING *
//      ),
//      updated_user AS (
//        UPDATE users
//        SET name  = COALESCE($3, name),
//            phone = COALESCE($4, phone),
//            updated_at = NOW()
//        WHERE id = $5
//        RETURNING *
//      )
//      SELECT
//        c.id AS company_id, c.company_name, c.coverage_areas, c.status,
//        u.name AS user_name, u.email AS user_email, u.phone AS user_phone
//      FROM updated_company c
//      JOIN updated_user u ON u.id = c.user_id`,
//     [company_name, coverage_areas, user_name, user_phone, userId]
//   );
//   return result.rows[0];
// };
exports.updateProfileByUserId = async (userId, data) => {
  const { company_name, coverage_areas, user_name, user_phone } = data;

  const result = await pool.query(
    `WITH updated_company AS (
       UPDATE delivery_companies
       SET company_name    = COALESCE($1, company_name),
           coverage_areas = COALESCE($2, coverage_areas),
           updated_at     = NOW()
       WHERE user_id = $5
       RETURNING *
     ),
     updated_user AS (
       UPDATE users
       SET name  = COALESCE($3, name),
           phone = COALESCE($4, phone),
           updated_at = NOW()
       WHERE id = $5
       RETURNING *
     )
     SELECT 
       c.id AS company_id, c.company_name, c.coverage_areas, c.status,
       u.name AS user_name, u.email AS user_email, u.phone AS user_phone
     FROM updated_company c
     JOIN updated_user u ON u.id = c.user_id`,
    [company_name, coverage_areas, user_name, user_phone, userId]
  );

  return result.rows[0];
};

/**
 * Get order with delivery company info
 * @async
 * @param {number} orderId - Order ID
 * @returns {Promise<Object|null>} Order joined with company info or null
 */

exports.getOrderWithCompany = async function (orderId) {
  const orderRes = await pool.query(
    `SELECT
        o.id AS order_id,
        o.status,
        o.payment_status,
        o.shipping_address,
        o.delivery_company_id,
        o.total_amount,
        o.created_at,
        u.id AS customer_user_id,
        u.name AS customer_name,
        u.email AS customer_email,
        u.phone AS customer_phone,
        dc.id AS company_id,
        dc.company_name AS company_name
     FROM orders o
     JOIN users u ON o.customer_id = u.id
     LEFT JOIN delivery_companies dc ON o.delivery_company_id = dc.id
     WHERE o.id = $1`,
    [orderId]
  );

  const order = orderRes.rows[0];
  if (!order) return null;

  let deliveryUserId = null;
  if (order.delivery_company_id) {
    const res = await pool.query(
      "SELECT user_id FROM delivery_companies WHERE id = $1",
      [order.delivery_company_id]
    );
    deliveryUserId = res.rows[0]?.user_id || null;
  }

  order.delivery_user_id = deliveryUserId;

  // Parse shipping address
  let shippingAddress = null;
  try {
    shippingAddress = JSON.parse(order.shipping_address);
  } catch (err) {
    console.error("Failed to parse shipping address:", err);
  }

  if (
    shippingAddress &&
    (!shippingAddress.latitude || !shippingAddress.longitude)
  ) {
    const geo = await geocodeAddress(shippingAddress.address_line1 || "");
    if (geo) {
      shippingAddress.latitude = geo.latitude;
      shippingAddress.longitude = geo.longitude;
    }
  }

  // جلب المنتجات المرتبطة بالطلب مع الصور وبيانات الفندور
  const itemsRes = await pool.query(
    `SELECT
        oi.id AS order_item_id,
        p.id AS product_id,
        p.name AS product_name,
        p.description AS product_description,
        oi.quantity,
        oi.price AS item_price,
        oi.variant,
        v.id AS vendor_id,
        v.latitude,
        v.longitude,
        v.store_name AS vendor_name,
        u.id AS vendor_user_id,
        u.email AS vendor_email,
        u.phone AS vendor_phone,
        COALESCE(json_agg(pi.image_url) FILTER (WHERE pi.id IS NOT NULL), '[]') AS images
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     JOIN vendors v ON p.vendor_id = v.id
     JOIN users u ON v.user_id = u.id
     LEFT JOIN product_images pi ON pi.product_id = p.id
     WHERE oi.order_id = $1
     GROUP BY oi.id, p.id, v.id, u.id`,
    [orderId]
  );


  order.items = itemsRes.rows;

  order.shipping_address = JSON.stringify(shippingAddress);

  if (itemsRes.rows.length > 0 && shippingAddress?.latitude) {
    const vendor = itemsRes.rows[0];
    const vendorCoords = {
      lat: Number(vendor.latitude),
      lng: Number(vendor.longitude),
    };
    const customerCoords = {
      lat: Number(shippingAddress.latitude),
      lng: Number(shippingAddress.longitude),
    };

    const distanceKm = calculateDistanceKm(
      vendorCoords.lat,
      vendorCoords.lng,
      customerCoords.lat,
      customerCoords.lng
    );

    order.distance_km = distanceKm;
    order.delivery_fee = distanceKm
      ? parseFloat((distanceKm * 0.25).toFixed(2))
      : null;
  }

  return order;
};

/**
 * Update order status
 * @async
 * @param {number} orderId - Order ID
 * @param {string} status - New order status
 * @returns {Promise<Object|null>} Updated order or null
 */
exports.updateStatus = async (orderId, status) => {
  const result = await pool.query(
    `UPDATE orders
     SET status = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING *`,
    [status, orderId]
  );
  return result.rows[0];
};

/**
 * Get order by ID
 * @async
 * @param {number} orderId - Order ID
 * @returns {Promise<Object|null>} Order or null
 */
exports.getOrderById = async (orderId) => {
  const result = await pool.query(`SELECT * FROM orders WHERE id = $1`, [
    orderId,
  ]);
  return result.rows[0];
};

/**
 * Get company by user ID
 * @async
 * @param {number} userId - User ID
 * @returns {Promise<Object|null>} Company info or null
 */
exports.getCompanyByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT id AS company_id, user_id, company_name
     FROM delivery_companies
     WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0];
};

/**
 * Get company ID by user ID
 * @async
 * @param {number} userId - User ID
 * @returns {Promise<number|null>} Company ID or null
 */
exports.getCompany = async (userId) => {
  const result = await pool.query(
    `SELECT id AS company_id FROM delivery_companies WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0]?.company_id || null;
};

/**
 * Get all orders for a company
 * @async
 * @param {number} companyId - Company ID
 * @returns {Promise<Array>} List of orders
 */
// يرجّع صفحة من الطلبات بدون أي "pending"
exports.getOrdersByCompanyId = async (companyId, limit = 20, offset = 0) => {
  const sql = `
    WITH page AS (
      SELECT
        o.id, o.customer_id, o.total_amount, o.status, o.payment_status,
        o.shipping_address, o.created_at, o.updated_at
      FROM orders o
      WHERE o.delivery_company_id = $1
        AND o.status <> 'pending'                 -- ✅ استثناء pending
      ORDER BY o.created_at DESC
      LIMIT $2 OFFSET $3
    )
    SELECT
      p.*,
      -- لو بدك حقل all_accepted يضل موجود
      NOT EXISTS (
        SELECT 1 FROM order_items oi
        WHERE oi.order_id = p.id
          AND oi.vendor_status <> 'accepted'
      ) AS all_accepted
    FROM page p
    ORDER BY p.created_at DESC;
  `;
  const { rows } = await pool.query(sql, [companyId, limit, offset]);
  return rows;
};

exports.getOrdersCountByCompanyId = async (companyId) => {
  const { rows } = await pool.query(
    `
    SELECT COUNT(*)::int AS cnt
    FROM orders o
    WHERE o.delivery_company_id = $1
      AND o.status <> 'pending'                   -- ✅ نفس الفلتر
    `,
    [companyId]
  );
  return rows[0]?.cnt || 0;
};

/**
 * Get delivery company by user ID
 * @param {number} userId
 */
exports.getCoverageById = async (userId) => {
  const result = await pool.query(
    `SELECT dc.id AS company_id,
            dc.company_name,
            dcl.id AS coverage_id,
            dcl.city,
            dcl.latitude,
            dcl.longitude
     FROM delivery_companies dc
     LEFT JOIN delivery_coverage_locations dcl
       ON dcl.delivery_company_id = dc.id
     WHERE dc.user_id = $1`,
    [userId]
  );
  return result.rows;
};

/**
 * Add / merge coverage areas
 * @param {number} userId
 * @param {Array<string>} mergedAreas
 */
// exports.addCoverage = async (userId, mergedAreas) => {
//   try {
//     const enrichedAreas = [];

//     for (const areaName of mergedAreas) {
//       const geo = await geocodeAddress(areaName);
//       if (geo) {
//         enrichedAreas.push({
//           name: areaName,
//           latitude: geo.latitude,
//           longitude: geo.longitude,
//         });
//       } else {
//         enrichedAreas.push({ name: areaName });
//       }
//     }

//     const result = await pool.query(
//       `UPDATE delivery_companies
//        SET coverage_areas = $1,
//            updated_at = NOW()
//        WHERE user_id = $2
//        RETURNING id AS company_id, user_id, company_name, coverage_areas, status, created_at, updated_at`,
//       [enrichedAreas, userId]
//     );

//     return result.rows[0];
//   } catch (err) {
//     console.error("addCoverage error:", err.message);
//     throw err;
//   }
// };

// deliveryModel.js
exports.addCoverage = async (userId, cities) => {
  const companyRes = await pool.query(
    `SELECT id FROM delivery_companies WHERE user_id=$1`,
    [userId]
  );
  if (!companyRes.rows[0]) throw new Error("Company not found");
  const companyId = companyRes.rows[0].id;

  // (اختياري لكن أنظف): نشتغل داخل ترانزاكشن
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const insertedRows = [];

    for (const rawCity of cities) {
      // 🔹 توحيد وتهذيب الاسم (تصحيح إملائي بسيط + Title Case)
      let city = String(rawCity || "").trim();
      if (!city) continue;

      // (اختياري) تصحيح شائع: Jaresh -> Jerash
      if (city.toLowerCase() === "jaresh") city = "Jerash";

      // Geocode
      const geo = await geocodeAddress(city); // لازم ترجع { latitude, longitude } أو null
      const latitude = geo?.latitude ?? null;
      const longitude = geo?.longitude ?? null;

      // إدخال مع منع التكرار على (delivery_company_id, city)
      const res = await client.query(
        `INSERT INTO delivery_coverage_locations
           (delivery_company_id, city, latitude, longitude)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (delivery_company_id, city) DO NOTHING
         RETURNING *`,
        [companyId, city, latitude, longitude]
      );

      if (res.rows[0]) insertedRows.push(res.rows[0]);
    }

    // ✅ تحديث عمود coverage_areas في جدول الشركات من جدول التغطيات
    await client.query(
      `UPDATE delivery_companies
       SET coverage_areas = (
         SELECT ARRAY(
           SELECT DISTINCT city
           FROM delivery_coverage_locations
           WHERE delivery_company_id = $1
           ORDER BY city
         )
       ),
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [companyId]
    );

    await client.query("COMMIT");

    // (اختياري) ارجاع الصفوف المدخلة الآن
    return insertedRows;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Update company coverage completely
 * @param {number} id
 * @param {number} user_id
 * @param {Object} data
 */
// exports.updateCoverage = async (id, user_id, data) => {
//   const company = await pool.query(
//     `SELECT * FROM delivery_companies WHERE id=$1 AND user_id=$2`,
//     [id, user_id]
//   );
//   if (!company.rows[0]) return null;

//   const updatedCompanyName = data.company_name || company.rows[0].company_name;
//   const updatedCoverage = data.coverage_areas || company.rows[0].coverage_areas;

//   let latitude = company.rows[0].latitude;
//   let longitude = company.rows[0].longitude;

//   if (data.company_name || data.coverage_areas?.length) {
//     const areaToGeocode = data.coverage_areas?.[0] || updatedCoverage?.[0];
//     const geo = await geocodeAddress(areaToGeocode);
//     if (geo) {
//       latitude = geo.latitude;
//       longitude = geo.longitude;
//     }
//   }

//   const result = await pool.query(
//     `UPDATE delivery_companies
//      SET company_name = $1,
//          coverage_areas = $2,
//          latitude = $3,
//          longitude = $4,
//          updated_at = NOW()
//      WHERE id = $5 AND user_id = $6
//      RETURNING *`,
//     [updatedCompanyName, updatedCoverage, latitude, longitude, id, user_id]
//   );

//   return result.rows[0];
// };

exports.updateCoverage = async (userId, data) => {
  if (data.company_name) {
    await pool.query(
      `UPDATE delivery_companies SET company_name=$1, updated_at=NOW()
       WHERE user_id=$2`,
      [data.company_name, userId]
    );
  }

  if (data.new_cities?.length) {
    await exports.addCoverage(userId, data.new_cities);
  }

  if (data.delete_cities?.length) {
    await exports.deleteCoverageAreas(userId, data.delete_cities);
  }

  return exports.getCoverageById(userId);
};

/**
 * Delete specific coverage areas (not the entire row)
 * @param {number} userId
 * @param {Array<string>} areasToRemove
 */
// exports.deleteCoverageAreas = async (userId, areasToRemove) => {
//   const company = await exports.getCoverageById(userId);
//   if (!company) return null;

//   const currentAreas = company.coverage_areas || [];
//   const newAreas = currentAreas.filter(
//     (area) => !areasToRemove.includes(area.name)
//   );

//   const result = await pool.query(
//     `UPDATE delivery_companies
//      SET coverage_areas = $1, updated_at = NOW()
//      WHERE user_id = $2
//      RETURNING *`,
//     [newAreas, userId]
//   );

//   return result.rows[0];
// };

exports.deleteCoverageAreas = async (userId, citiesToRemove) => {
  // تأكيد مصفوفة نصوص نظيفة
  const list = Array.isArray(citiesToRemove)
    ? citiesToRemove.map((c) => String(c || "").trim()).filter(Boolean)
    : [];

  if (list.length === 0) return null;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1) احصل على الشركة من user_id
    const { rows: companyRows } = await client.query(
      `SELECT id, coverage_areas
         FROM delivery_companies
        WHERE user_id = $1`,
      [userId]
    );
    if (companyRows.length === 0) {
      await client.query("ROLLBACK");
      return null;
    }
    const companyId = companyRows[0].id;

    // 2) احذف من جدول مواقع التغطية
    const { rows: deletedRows } = await client.query(
      `DELETE FROM delivery_coverage_locations
        WHERE delivery_company_id = $1
          AND city = ANY($2::text[])
        RETURNING city`,
      [companyId, list]
    );

    // 3) حدّث ملخص المدن في جدول الشركات (مصدره الجدول التفصيلي)
    await client.query(
      `UPDATE delivery_companies
          SET coverage_areas = (
                SELECT ARRAY(
                  SELECT DISTINCT city
                    FROM delivery_coverage_locations
                   WHERE delivery_company_id = $1
                   ORDER BY city
                )
              ),
              updated_at = NOW()
        WHERE id = $1`,
      [companyId]
    );

    await client.query("COMMIT");

    return {
      company_id: companyId,
      deleted_cities: deletedRows.map((r) => r.city),
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};
/**
 * Get weekly report for a delivery company
 * @async
 * @param {number} deliveryCompanyId - The delivery company ID
 * @param {number} [days=7] - Number of days to include in the report
 * @returns {Promise<Object>} Weekly report including totals, payment status, order status, top customers and top vendors
 */

exports.getWeeklyReport = async (deliveryCompanyId, days = 7) => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (days - 1));

  const startTs = start.toISOString();
  const endPlus = new Date(end);
  endPlus.setDate(endPlus.getDate() + 1);
  const endTsExclusive = endPlus.toISOString();

  const totalQuery = `
  SELECT COUNT(*)::int AS total_orders,
         COALESCE(SUM(total_amount)::numeric, 0) AS total_amount
  FROM orders
  WHERE delivery_company_id = $1
    AND created_at >= $2
    AND created_at < $3
    AND status <> 'pending'           -- ✅ استثناء الطلبات البيندينغ
`;

  const totalRes = await pool.query(totalQuery, [
    deliveryCompanyId,
    startTs,
    endTsExclusive,
  ]);
const paymentQuery = `
  SELECT payment_status, COUNT(*)::int AS count
  FROM orders
  WHERE delivery_company_id = $1
    AND created_at >= $2
    AND created_at < $3
    AND status <> 'pending'           -- ✅ استثناء طلبات الـ Order البندنق
  GROUP BY payment_status
`;

  const paymentRes = await pool.query(paymentQuery, [
    deliveryCompanyId,
    startTs,
    endTsExclusive,
  ]);

  const statusQuery = `
    SELECT status, COUNT(*)::int AS count
    FROM orders
    WHERE delivery_company_id = $1
      AND created_at >= $2
      AND created_at < $3
    GROUP BY status
  `;
  const statusRes = await pool.query(statusQuery, [
    deliveryCompanyId,
    startTs,
    endTsExclusive,
  ]);

  const topCustomersQuery = `
    SELECT o.customer_id,
           u.email AS customer_email,
           COUNT(*)::int AS orders_count,
           COALESCE(SUM(o.total_amount)::numeric,0) AS total_amount
    FROM orders o
    LEFT JOIN users u ON u.id = o.customer_id
    WHERE o.delivery_company_id = $1
      AND o.created_at >= $2
      AND o.created_at < $3
    GROUP BY o.customer_id, u.email
    ORDER BY orders_count DESC, total_amount DESC
    LIMIT 5
  `;
  const topCustomersRes = await pool.query(topCustomersQuery, [
    deliveryCompanyId,
    startTs,
    endTsExclusive,
  ]);

  const topVendorsQuery = `
    SELECT v.id AS vendor_id,
           v.store_name,
           COUNT(DISTINCT oi.order_id)::int AS orders_count,
           COALESCE(SUM(oi.quantity * oi.price)::numeric,0) AS revenue
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    JOIN products p ON p.id = oi.product_id
    JOIN vendors v ON v.id = p.vendor_id
    WHERE o.delivery_company_id = $1
      AND o.created_at >= $2
      AND o.created_at < $3
    GROUP BY v.id, v.store_name
    ORDER BY orders_count DESC, revenue DESC
    LIMIT 5
  `;
  const topVendorsRes = await pool.query(topVendorsQuery, [
    deliveryCompanyId,
    startTs,
    endTsExclusive,
  ]);

  const pendingQuery = `
    SELECT COUNT(*)::int AS pending_count
    FROM orders
    WHERE delivery_company_id = $1
      AND status = 'pending'
      AND created_at >= $2
      AND created_at < $3
  `;
  const pendingRes = await pool.query(pendingQuery, [
    deliveryCompanyId,
    startTs,
    endTsExclusive,
  ]);

  // 7️⃣ الطلبات اليومية (للرسم البياني) - مع الأيام الفارغة
  const dailyOrdersQuery = `
  WITH days AS (
    SELECT generate_series($2::date, ($3::date - interval '1 day'), interval '1 day')::date AS order_date
  )
  SELECT 
    d.order_date,
    COALESCE(COUNT(o.id), 0) AS orders_count,
    COALESCE(SUM(o.total_amount), 0) AS total_amount
  FROM days d
  LEFT JOIN orders o 
    ON DATE(o.created_at) = d.order_date 
    AND o.delivery_company_id = $1
  GROUP BY d.order_date
  ORDER BY d.order_date ASC
`;

  const dailyOrdersRes = await pool.query(dailyOrdersQuery, [
    deliveryCompanyId,
    startTs,
    endTsExclusive,
  ]);

  const STATUSES = [
    "pending",
    "processing",
    "out_for_delivery",
    "delivered",
    "cancelled",
  ];

  const totals = totalRes.rows[0] || { total_orders: 0, total_amount: "0" };
  const payment_status = paymentRes.rows.reduce((acc, r) => {
    acc[r.payment_status] = r.count;
    return acc;
  }, {});
  const statuses = statusRes.rows.reduce((acc, r) => {
    acc[r.status] = r.count;
    return acc;
  }, {});
  for (const s of STATUSES) {
    if (!statuses[s]) statuses[s] = 0;
  }

  return {
    period: {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    },
    totals,
    payment_status,
    statuses,
    top_customers: topCustomersRes.rows,
    top_vendors: topVendorsRes.rows,
    pending_count: pendingRes.rows[0]?.pending_count || 0,

    // 📊 البيانات الجديدة للرسم البياني
    daily_orders: dailyOrdersRes.rows,
  };
};
/**
 * Get all items for a specific order
 * @async
 * @function
 * @param {number} orderId - The ID of the order to retrieve items for
 * @returns {Promise<Array<Object>>} A list of order items
 * @property {number} return[].id - The unique ID of the order item
 * @property {number} return[].order_id - The order ID this item belongs to
 * @property {number} return[].product_id - The ID of the product
 * @property {number} return[].quantity - The quantity of the product in this order
 * @property {string} return[].price - The price of this product in the order
 * @property {Object} return[].variant - Any variant information (e.g., size, color)
 * @property {string} return[].vendor_status - The vendor's status for this item (e.g., 'accepted', 'rejected')
 */
exports.getOrderItems = async (orderId) => {
  const result = await pool.query(
    `SELECT * FROM order_items WHERE order_id = $1`,
    [orderId]
  );
  return result.rows;
};

/**
 * Check and update accepted orders for a delivery company
 * @async
 * @param {number} companyId - The delivery company's ID
 * @returns {Promise<void>} - Resolves when all eligible orders are updated
 * @description
 * - Fetches all orders with status = 'pending' for the given company.
 * - Checks each order's items:
 *   - If all `order_items.vendor_status` are 'accepted', the order's status is updated to 'accepted'.
 * - Orders without items are skipped.
 */
exports.checkAndUpdateAcceptedOrdersForCompany = async (companyId) => {
  const pendingOrders = await pool.query(
    `SELECT id FROM orders WHERE delivery_company_id = $1 AND status = 'pending'`,
    [companyId]
  );

  for (const order of pendingOrders.rows) {
    const items = await pool.query(
      `SELECT vendor_status FROM order_items WHERE order_id = $1`,
      [order.id]
    );

    if (items.rows.length === 0) continue;

    const allAccepted = items.rows.every(
      (item) => item.vendor_status === "accepted"
    );

    if (allAccepted) {
      await pool.query(
        `UPDATE orders SET status = 'accepted', updated_at = NOW() WHERE id = $1`,
        [order.id]
      );
    }
  }
};

/**
 * Update payment status for a specific order
 * @async
 * @param {number} orderId
 * @param {"PAID"|"UNPAID"} paymentStatus
 * @returns {Promise<Object|null>}
 */
exports.updatePaymentStatus = async (orderId, paymentStatus) => {
  const result = await pool.query(
    `UPDATE orders
     SET payment_status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [paymentStatus, orderId]
  );
  return result.rows[0] || null;
};

exports.getCustomerCoordinates = async (customerAddressId) => {
  const result = await pool.query(
    `SELECT id, address_line1, city, latitude, longitude FROM addresses WHERE id = $1`,
    [customerAddressId]
  );

  const row = result.rows[0];
  if (!row) return null;

  let { id, address_line1, city, latitude, longitude } = row;

  if (!latitude || !longitude) {
    const geo = await geocodeAddress(address_line1, city);
    if (geo) {
      latitude = geo.latitude;
      longitude = geo.longitude;

      await pool.query(
        `UPDATE addresses SET latitude = $1, longitude = $2 WHERE id = $3`,
        [latitude, longitude, id]
      );
      console.log(`Coordinates added for address ID ${id}`);
    }
  }

  return { id, label: address_line1, city, latitude, longitude };
};

exports.getVendorCoordinates = async (vendorId) => {
  const result = await pool.query(
    `SELECT id, store_name, latitude, longitude, address FROM vendors WHERE id = $1`,
    [vendorId]
  );

  const row = result.rows[0];
  if (!row) return null;

  let { id, store_name, latitude, longitude, address } = row;

  if (!latitude || !longitude) {
    const geo = await geocodeAddress(address || store_name);
    if (geo) {
      latitude = geo.latitude;
      longitude = geo.longitude;

      await pool.query(
        `UPDATE vendors SET latitude = $1, longitude = $2 WHERE id = $3`,
        [latitude, longitude, id]
      );
      console.log(
        `✅ Updated vendor ${store_name} with coords: ${latitude}, ${longitude}`
      );
    } else {
      console.warn(`⚠️ No coordinates found for vendor: ${store_name}`);
    }
  }

  return { id, label: store_name, address, latitude, longitude };
};

/**
 * Get distances from delivery company to multiple addresses
 * @param {number} userId - الشركة
 * @param {Array<Object>} addresses - كل العناوين المطلوبة [{latitude, longitude, label}]
 * @returns {Promise<Array>} - [{city, distance_in_meters, duration_in_seconds, address}]
 */
exports.getDistancesToAddresses = async (userId, addresses) => {
  // 1. جلب جميع مناطق تغطية الشركة
  const coverage = await exports.getCoverageById(userId);
  if (!coverage || !coverage.length)
    throw new Error("No coverage locations found");

  const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  const results = [];

  // 2. تجهيز origins (التغطيات) و destinations (عناوين العملاء)
  const origins = coverage
    .filter((loc) => loc.latitude && loc.longitude)
    .map((loc) => `${loc.latitude},${loc.longitude}`)
    .join("|");

  const destinations = addresses
    .filter((addr) => addr.latitude && addr.longitude)
    .map((addr) => `${addr.latitude},${addr.longitude}`)
    .join("|");

  try {
    // 3. إرسال طلب واحد فقط إلى Google Distance Matrix API
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${origins}&destinations=${destinations}&key=${GOOGLE_MAPS_API_KEY}`;
    const res = await axios.get(url);

    const rows = res.data.rows; // صفوف النتائج (كل صف = origin)
    if (!rows || !rows.length)
      throw new Error("Invalid response from Google Maps API");

    // 4. لكل وجهة (destination) نحسب أقرب نقطة تغطية
    for (let destIdx = 0; destIdx < addresses.length; destIdx++) {
      let closest = null;

      for (let originIdx = 0; originIdx < coverage.length; originIdx++) {
        const element = rows[originIdx].elements[destIdx];
        if (element.status === "OK") {
          const dist = element.distance.value; // بالمتر
          const duration = element.duration.value; // بالثواني

          if (!closest || dist < closest.distance) {
            closest = {
              city: coverage[originIdx].city,
              distance: dist,
              duration,
              address: addresses[destIdx].label,
            };
          }
        }
      }

      if (closest) results.push(closest);
    }
  } catch (err) {
    console.error("Google Maps Distance Matrix request failed:", err.message);
  }

  // 5. ترتيب النتائج حسب المسافة الأقصر
  results.sort((a, b) => a.distance - b.distance);

  return results;
};

/**
 * Get optimized distances for all order items + customer address
 * @param {number} userId - الشركة
 * @param {Array<Object>} orderItems - كل المنتجات مع الإحداثيات [{latitude, longitude, label}]
 * @param {Object} customerAddress - عنوان الزبون {latitude, longitude, label}
 * @returns {Promise<Array>} - [{city, distance_in_meters, duration_in_seconds, label}]
 */
exports.getOptimizedOrderDistances = async function (
  userId,
  orderItems,
  customerAddress
) {
  const coverage = await exports.getCoverageById(userId);
  if (!coverage || !coverage.length)
    throw new Error("No coverage locations found");

  const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  const axios = require("axios");

  // 🧩 1. نحضّر كل النقاط بالترتيب المبدئي
  const startPoint = {
    ...coverage[0],
    name: coverage[0].company_name,
  }; // نقطة انطلاق الشركة (أول تغطية)
  const vendors = orderItems.filter((v) => v.latitude && v.longitude);
  const customer = customerAddress;

  let points = [
    {
      name: startPoint.company_name,
      lat: startPoint.latitude,
      lng: startPoint.longitude,
    },
    ...vendors.map((v, i) => ({
      name: v.label || `Vendor ${i + 1}`,
      lat: v.latitude,
      lng: v.longitude,
    })),
    { name: "Customer", lat: customer.latitude, lng: customer.longitude },
  ];

  // 🧭 2. بناء مسار فعلي (يبدأ من الشركة، ويمر على كل Vendor، وينتهي بالزبون)
  const route = [];
  let totalDistance = 0;
  let totalDuration = 0;

  for (let i = 0; i < points.length - 1; i++) {
    const origin = `${points[i].lat},${points[i].lng}`;
    const destination = `${points[i + 1].lat},${points[i + 1].lng}`;

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${origin}&destinations=${destination}&key=${GOOGLE_MAPS_API_KEY}`;
    const res = await axios.get(url);

    const data = res.data.rows[0].elements[0];
    if (data.status === "OK") {
      const distanceKm = data.distance.value / 1000;
      const durationMin = data.duration.value / 60;

      totalDistance += distanceKm;
      totalDuration += durationMin;

      route.push({
        from: points[i].name,
        to: points[i + 1].name,
        distance_km: distanceKm,
        duration_min: durationMin,
      });
    }
  }

  return {
    route,
    total_distance_km: totalDistance,
    total_duration_min: totalDuration,
  };
};
