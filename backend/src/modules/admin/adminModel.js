const pool = require('../../config/db');

/**
 * ===============================
 * Vendors
 * ===============================
 */

/**
 * @function getAllVendors
 * @desc Fetches all vendors along with their products, grouped by vendor.
 * @async
 * @returns {Promise<Array>} Array of vendor objects with the following structure:
 *  - vendor_id {number} - Unique ID of the vendor
 *  - user_id {number} - Associated user ID
 *  - store_name {string} - Vendor store name
 *  - status {string} - Current status (pending/approved/rejected)
 *  - commission_rate {number} - Commission rate
 *  - contact_email {string} - Vendor contact email
 *  - phone {string} - Vendor phone number
 *  - products {Array} - Array of product objects:
 *      - product_id {number} - Product ID
 *      - name {string} - Product name
 *      - price {number} - Product price
 *      - stock_quantity {number} - Stock quantity
 * @throws Will throw an error if database query fails
 */
exports.getAllVendors = async () => {
  const query = `
    SELECT 
      v.id AS vendor_id,
      v.user_id,
      v.store_name,
      v.store_logo,
      v.store_banner,
      v.status,
      v.commission_rate,
      COALESCE(ROUND(AVG(sr.rating)::numeric, 1), 0) AS rating,
      v.contact_email,
      v.phone,
      COALESCE(
        json_agg(
          json_build_object(
            'product_id', p.id,
            'name', p.name,
            'price', p.price,
            'stock_quantity', p.stock_quantity
          )
        ) FILTER (WHERE p.id IS NOT NULL), '[]'
      ) AS products
    FROM vendors v
    LEFT JOIN products p ON p.vendor_id = v.id
    LEFT JOIN stars_review sr ON sr.vendor_id = v.id
    GROUP BY v.id
    ORDER BY v.created_at DESC;
  `;
  const { rows } = await pool.query(query);
  return rows;
};

/**
 * @function getVendorById
 * @desc Fetches a single vendor by ID.
 * @async
 * @param {number} vendorId - ID of the vendor to fetch
 * @returns {Promise<Object|null>} Vendor object if found, otherwise null
 * @throws Will throw an error if database query fails
 */
exports.getVendorById = async (vendorId) => {
  const { rows } = await pool.query(
    'SELECT * FROM vendors WHERE id = $1',
    [vendorId]
  );
  return rows[0];
};

/**
 * @function updateVendorStatus
 * @desc Updates the status of a vendor.
 * @async
 * @param {number} vendorId - ID of the vendor
 * @param {string} status - New status value ('pending', 'approved', 'rejected')
 * @returns {Promise<Object|null>} Updated vendor object if successful, otherwise null
 * @throws Will throw an error if database query fails
 */
exports.updateVendorStatus = async (vendorId, status) => {
  const { rows } = await pool.query(
    `UPDATE vendors 
     SET status=$1, updated_at=NOW() 
     WHERE id=$2 
     RETURNING *`,
    [status, vendorId]
  );
  return rows[0];
};

/**
 * ===============================
 * Delivery Companies
 * ===============================
 */

/**
 * @function getAllDeliveryCompanies
 * @desc Fetches all delivery companies, ordered by creation date descending.
 * @async
 * @returns {Promise<Array>} Array of delivery company objects:
 *  - company_id {number} - Unique ID
 *  - user_id {number} - Associated user ID
 *  - company_name {string} - Company name
 *  - coverage_areas {string} - Areas covered
 *  - status {string} - Current status
 *  - created_at {Date} - Creation timestamp
 *  - updated_at {Date} - Last update timestamp
 * @throws Will throw an error if database query fails
 */
exports.getAllDeliveryCompanies = async () => {
  const { rows } = await pool.query(
    `SELECT id AS company_id, user_id, company_name, coverage_areas, status, created_at, updated_at
     FROM delivery_companies
     ORDER BY created_at DESC`
  );
  return rows;
};

/**
 * @function getDeliveryCompanyById
 * @desc Fetches a single delivery company by ID.
 * @async
 * @param {number} companyId - ID of the delivery company
 * @returns {Promise<Object|null>} Delivery company object if found, otherwise null
 * @throws Will throw an error if database query fails
 */
exports.getDeliveryCompanyById = async (companyId) => {
  const { rows } = await pool.query(
    'SELECT * FROM delivery_companies WHERE id=$1',
    [companyId]
  );
  return rows[0];
};

/**
 * @function updateDeliveryStatus
 * @desc Updates the status of a delivery company.
 * @async
 * @param {number} companyId - ID of the delivery company
 * @param {string} status - New status value ('pending', 'approved', 'rejected')
 * @returns {Promise<Object|null>} Updated company object if successful, otherwise null
 * @throws Will throw an error if database query fails
 */
exports.updateDeliveryStatus = async (companyId, status) => {
  const { rows } = await pool.query(
    `UPDATE delivery_companies
     SET status=$1, updated_at=NOW()
     WHERE id=$2
     RETURNING *`,
    [status, companyId]
  );
  return rows[0];
};

/**
 * ===============================
 * Orders
 * ===============================
 */

/**
 * @function getAllOrders
 * @desc Fetches all orders along with customer, delivery company, and order items details.
 * @async
 * @returns {Promise<Array>} Array of orders:
 *  - order_id {number} - Order ID
 *  - status {string} - Order status
 *  - total_amount {number} - Total amount
 *  - payment_status {string} - Payment status
 *  - created_at {Date} - Creation timestamp
 *  - customer {Object} - Customer info (id, name, email)
 *  - delivery_company {Object|null} - Delivery company info if assigned
 *  - items {Array} - Array of order items:
 *      - product_id {number} - Product ID
 *      - name {string} - Product name
 *      - vendor {Object} - Vendor info (id, name)
 *      - quantity {number} - Quantity ordered
 *      - price {number} - Product price
 *      - variant {string|null} - Variant info if applicable
 * @throws Will throw an error if database query fails
 */
exports.getAllOrders = async () => {
  const query = `
    SELECT 
      o.id AS order_id,
      o.status,
      o.total_amount,
      o.payment_status,
      o.created_at,
      json_build_object(
        'id', u.id,
        'name', u.name,
        'email', u.email
      ) AS customer,
      json_build_object(
        'id', dc.id,
        'company_name', dc.company_name,
        'user', json_build_object(
          'id', du.id,
          'name', du.name,
          'email', du.email
        )
      ) AS delivery_company,
      json_agg(
        json_build_object(
          'product_id', p.id,
          'name', p.name,
          'vendor', json_build_object(
            'id', v.id,
            'name', vu.name
          ),
          'quantity', oi.quantity,
          'price', oi.price,
          'variant', oi.variant
        )
      ) AS items
    FROM orders o
    JOIN users u ON u.id = o.customer_id
    LEFT JOIN delivery_companies dc ON dc.id = o.delivery_company_id
    LEFT JOIN users du ON du.id = dc.user_id
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products p ON p.id = oi.product_id
    JOIN vendors v ON v.id = p.vendor_id
    JOIN users vu ON vu.id = v.user_id
    GROUP BY o.id, u.id, dc.id, du.id;
  `;
  const { rows } = await pool.query(query);
  return rows;
};

exports.getAdminById = async (userId) => {
  const { rows } = await pool.query(
    `SELECT id, name, email, role, phone, address, created_at FROM users WHERE id=$1`,
    [userId]
  );
  return rows[0];
};
