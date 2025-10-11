const pool = require("../../config/db");

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
      u.name AS vendor_name,
      u.email AS vendor_email,
      u.phone AS vendor_phone
   FROM order_items oi
   JOIN products p ON p.id = oi.product_id
   JOIN vendors v ON p.vendor_id = v.id
   JOIN users u ON v.user_id = u.id
   WHERE oi.order_id = $1`,
  [orderId]
);

order.items = itemsRes.rows;

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
  const result = await pool.query(`SELECT * FROM orders WHERE id = $1`, [orderId]);
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
exports.getOrdersByCompanyId = async (companyId) => {
  const result = await pool.query(
    `SELECT id, customer_id, total_amount, status, payment_status, shipping_address, created_at, updated_at
     FROM orders
     WHERE delivery_company_id = $1
     ORDER BY created_at DESC`,
    [companyId]
  );
  return result.rows;
};


/**
 * Get delivery company by user ID
 * @param {number} userId
 */
exports.getCoverageById = async (userId) => {
  const result = await pool.query(
    `SELECT id, user_id, company_name, coverage_areas, status, created_at, updated_at
     FROM delivery_companies
     WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0];
};

/**
 * Add / merge coverage areas
 * @param {number} userId
 * @param {Array<string>} mergedAreas
 */
exports.addCoverage = async (userId, mergedAreas) => {
  const result = await pool.query(
    `UPDATE delivery_companies
     SET coverage_areas = $1,
         updated_at = NOW()
     WHERE user_id = $2
     RETURNING id AS company_id, user_id, company_name, coverage_areas, status, created_at, updated_at`,
    [mergedAreas, userId]
  );
  return result.rows[0];
};


/**
 * Update company coverage completely
 * @param {number} id
 * @param {number} user_id
 * @param {Object} data
 */
exports.updateCoverage = async (id, user_id, data) => {
  const company = await pool.query(
    `SELECT * FROM delivery_companies WHERE id=$1 AND user_id=$2`,
    [id, user_id]
  );

  if (!company.rows[0]) return null;

  const updatedCompanyName = data.company_name || company.rows[0].company_name;
  const updatedCoverage = data.coverage_areas || company.rows[0].coverage_areas;

  const result = await pool.query(
    `UPDATE delivery_companies
     SET company_name = $1,
         coverage_areas = $2,
         updated_at = NOW()
     WHERE id = $3 AND user_id = $4
     RETURNING *`,
    [updatedCompanyName, updatedCoverage, id, user_id]
  );

  return result.rows[0];
};

/**
 * Delete specific coverage areas (not the entire row)
 * @param {number} userId
 * @param {Array<string>} areasToRemove
 */
exports.deleteCoverageAreas = async (userId, areasToRemove) => {
  const company = await exports.getCoverageById(userId);
  if (!company) return null;

  const currentAreas = company.coverage_areas || [];
  const newAreas = currentAreas.filter(area => !areasToRemove.includes(area));

  const result = await pool.query(
    `UPDATE delivery_companies
     SET coverage_areas = $1, updated_at = NOW()
     WHERE user_id = $2
     RETURNING *`,
    [newAreas, userId]
  );

  return result.rows[0];
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
  `;
  const totalRes = await pool.query(totalQuery, [deliveryCompanyId, startTs, endTsExclusive]);

  const paymentQuery = `
    SELECT payment_status, COUNT(*)::int AS count
    FROM orders
    WHERE delivery_company_id = $1
      AND created_at >= $2
      AND created_at < $3
    GROUP BY payment_status
  `;
  const paymentRes = await pool.query(paymentQuery, [deliveryCompanyId, startTs, endTsExclusive]);

  const statusQuery = `
    SELECT status, COUNT(*)::int AS count
    FROM orders
    WHERE delivery_company_id = $1
      AND created_at >= $2
      AND created_at < $3
    GROUP BY status
  `;
  const statusRes = await pool.query(statusQuery, [deliveryCompanyId, startTs, endTsExclusive]);

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
  const topCustomersRes = await pool.query(topCustomersQuery, [deliveryCompanyId, startTs, endTsExclusive]);

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
  const topVendorsRes = await pool.query(topVendorsQuery, [deliveryCompanyId, startTs, endTsExclusive]);

  const pendingQuery = `
    SELECT COUNT(*)::int AS pending_count
    FROM orders
    WHERE delivery_company_id = $1
      AND status = 'pending'
      AND created_at >= $2
      AND created_at < $3
  `;
  const pendingRes = await pool.query(pendingQuery, [deliveryCompanyId, startTs, endTsExclusive]);

  const STATUSES = ['pending', 'processing', 'out_for_delivery', 'delivered', 'cancelled'];

  const totals = totalRes.rows[0] || { total_orders: 0, total_amount: '0' };
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










