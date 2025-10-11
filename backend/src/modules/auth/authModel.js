const pool = require('../../config/db');

/**
 * @module AuthModel
 * @desc Handles database queries for authentication and user registration.
 */

/**
 * @function insertUser
 * @desc Insert a new user into the `users` table.
 * @async
 * @param {Object} userData
 * @param {string} userData.name - Full name
 * @param {string} userData.email - Email
 * @param {string} [userData.phone] - Phone number
 * @param {string} [userData.password_hash] - Hashed password
 * @param {string} userData.role - Role ('customer', 'vendor', 'delivery')
 * @param {string} [userData.address] - Address (for customer)
 * @returns {Promise<Object>} Newly created user record
 */
exports.insertUser = async (userData) => {
  const { name, email, phone, password_hash, role, address } = userData;
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, phone, password_hash, role, address, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *`,
    [name, email, phone, password_hash, role, address]
  );
  return rows[0];
};

/**
 * @function insertCustomer
 * @desc Insert a new customer record linked to a user.
 * @async
 * @param {Object} data
 * @param {number} data.user_id - User ID
 * @returns {Promise<Object>} Newly created customer record
 */
exports.insertCustomer = async ({ user_id }) => {
  const { rows } = await pool.query(
    `INSERT INTO customers (user_id, created_at, updated_at)
     VALUES ($1, NOW(), NOW()) RETURNING *`,
    [user_id]
  );
  return rows[0];
};

/**
 * @function insertVendor
 * @desc Insert a new vendor record linked to a user.
 * @async
 * @param {Object} data
 * @param {number} data.user_id - User ID
 * @param {string} [data.store_name] - Vendor store name
 * @param {string} [data.description] - Store description
 * @returns {Promise<Object>} Newly created vendor record
 */
exports.insertVendor = async ({
  user_id,
  store_name,
  store_slug,
  description = '',
  status = 'pending',
  contact_email = null,
  phone = null,
  address = null,
  social_links = null,
  commission_rate = 0.0
}) => {
  const query = `
    INSERT INTO vendors (
      user_id,
      store_name,
      store_slug,
      description,
      status,
      contact_email,
      phone,
      address,
      social_links,
      commission_rate,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
    RETURNING *;
  `;

  const values = [
    user_id,
    store_name,
    store_slug,
    description,
    status,
    contact_email,
    phone,
    address,
    social_links,
    commission_rate
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
};


/**
 * @function insertDelivery
 * @desc Insert a new delivery company record linked to a user.
 * @async
 * @param {Object} data
 * @param {number} data.user_id - User ID
 * @param {string} [data.company_name] - Delivery company name
 * @returns {Promise<Object>} Newly created delivery company record
 */
exports.insertDelivery = async ({ user_id, company_name }) => {
  const { rows } = await pool.query(
    `INSERT INTO delivery_companies (user_id, company_name, status, created_at, updated_at)
     VALUES ($1, $2, 'pending', NOW(), NOW()) RETURNING *`,
    [user_id, company_name]
  );
  return rows[0];
};
exports.updatePassword = async (email, hashedPassword) => {
  const query = `
    UPDATE users
    SET password_hash = $1, updated_at = NOW()
    WHERE email = $2
  `;
  await pool.query(query, [hashedPassword, email]);
};