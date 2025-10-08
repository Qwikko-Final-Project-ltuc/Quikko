const pool = require("../../config/db");

/**
 * ===============================
 * Vendor Model
 * ===============================
 * @module VendorModel
 * @desc Handles all direct database interactions related to vendors,
 *       including profile management, orders, products, and reports.
 */

/**
 * Get all vendors from the database.
 *
 * @async
 * @function getAllVendors
 * @returns {Promise<Array<Object>>} Array of vendor records
 * @throws {Error} Database query failure
 *
 * @example
 * const vendors = await getAllVendors();
 * console.log(vendors[0].store_name);
 */
exports.getAllVendors = async () => {
  const result = await pool.query("SELECT * FROM vendors WHERE status = 'approved'");
  return result.rows;
};


/**
 * Get vendor sales report including total orders & sales.
 *
 * @async
 * @function getVendorReport
 * @param {number|string} userId - The user ID associated with the vendor
 * @returns {Promise<Object|null>} Vendor report or null if not found
 *
 * @example
 * const report = await getVendorReport(10);
 * console.log(report.total_sales);
 */
exports.getVendorReport = async (userId) => {
  const query = `
    SELECT 
      v.id AS vendor_id,
      v.store_name,
      COUNT(DISTINCT o.id) AS total_orders,
      COALESCE(SUM(oi.quantity * oi.price), 0) AS total_sales
    FROM vendors v
    LEFT JOIN products p ON v.id = p.vendor_id
    LEFT JOIN order_items oi ON p.id = oi.product_id
    LEFT JOIN orders o ON oi.order_id = o.id
    WHERE v.user_id = $1
    GROUP BY v.id, v.store_name
    ORDER BY total_sales DESC;
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows[0];
};

/**
 * Get vendor ID using user ID.
 *
 * @async
 * @function getVendorIdByUserId
 * @param {number|string} userId
 * @returns {Promise<Object|null>} Vendor ID object or null
 */
exports.getVendorIdByUserId = async (userId) => {
  const query = `SELECT id FROM vendors WHERE id = $1`;
  const { rows } = await pool.query(query, [userId]);
  return rows[0];
};


exports.getVendorByUserId = async (userId) => {
  const query = `SELECT * FROM vendors WHERE user_id = $1`;
  const { rows } = await pool.query(query, [userId]);
  return rows[0]; 
};

exports.getVendorProducts = async (vendorId) => {
  const query = `
    SELECT 
      p.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', pi.id,
            'image_url', pi.image_url
          )
        ) FILTER (WHERE pi.id IS NOT NULL), 
        '[]'
      ) AS images
    FROM products p
    LEFT JOIN product_images pi ON p.id = pi.product_id
    WHERE p.vendor_id = $1
      AND (p.is_deleted = FALSE OR p.is_deleted IS NULL)
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `;

  const { rows } = await pool.query(query, [vendorId]);
  return rows;
};



/**
 * Get all orders for a specific vendor.
 *
 * @async
 * @function getVendorOrders
 * @param {number|string} vendorId
 * @returns {Promise<Array<Object>>} Array of orders with items & product details
 */
exports.getVendorOrders = async (vendorId) => {
  const query = `
    SELECT
      o.id AS order_id,
      o.status,
      o.total_amount,
      o.shipping_address,
      oi.id AS item_id,
      oi.quantity,
      oi.price,
      oi.vendor_status,
      p.name AS product_name,
      p.id AS product_id
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON p.id = oi.product_id
    WHERE p.vendor_id = $1
    ORDER BY o.created_at DESC
  `;
  const { rows } = await pool.query(query, [vendorId]);
  return rows;
};

/**
 * Update the status of an order.
 *
 * @async
 * @function updateOrderStatus
 * @param {number|string} orderId
 * @param {string} status - New status (e.g., 'pending', 'shipped')
 * @returns {Promise<Object>} Updated order record
 */
exports.updateOrderStatus = async (orderId, status) => {
  const query = `
    UPDATE orders
    SET status = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [status, orderId]);
  return rows[0];
};

/**
 * Get vendor profile by user ID.
 *
 * @async
 * @function getProfile
 * @param {number|string} userId
 * @returns {Promise<Object|null>} Vendor profile record
 */
exports.getProfile = async (userId) => {
  const query = `
    SELECT id, user_id, store_name, store_slug, store_logo, store_banner, 
           description, status, commission_rate, contact_email, phone, 
           address, social_links, rating, created_at, updated_at
    FROM vendors
    WHERE user_id = $1
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows[0];
};

/**
 * Update vendor profile.
 *
 * @async
 * @function updateProfile
 * @param {number|string} userId
 * @param {Object} profileData - Fields to update
 * @returns {Promise<Object>} Updated vendor profile record
 */
exports.updateProfile = async (userId, profileData) => {
  const allowedFields = ["store_name", "store_logo", "description", "address"];
  
  let setClause = [];
  let values = [];
  let idx = 1;

  allowedFields.forEach((field) => {
    if (profileData[field] !== undefined) {
      setClause.push(`${field} = $${idx++}`);
      values.push(profileData[field]);
    }
  });

  setClause.push(`updated_at = NOW()`);

  values.push(userId);

  const query = `
    UPDATE vendors
    SET ${setClause.join(", ")}
    WHERE user_id = $${idx}
    RETURNING *;
  `;

  const { rows } = await pool.query(query, values);
  return rows[0];
};

/**
 * Update vendor_status of a specific order item (per vendor).
 *
 * @async
 * @function updateOrderItemStatus
 * @param {number|string} itemId - Order item ID
 * @param {string} status - New status (e.g., 'pending', 'shipped')
 * @param {number|string} vendorId - The vendor who owns this product
 * @returns {Promise<Object>} Updated order item record
 */




