const { admin } = require('../../infrastructure/firebase');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { insertUser, insertCustomer, insertVendor, insertDelivery } = require('./authModel');
const pool = require('../../config/db');
const generateSlug = require('../../utils/stringHelpers')
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * @module AuthService
 * @desc Handles user registration, login, and authentication logic.
 */

/**
 * @function register
 * @desc Registers a new user (customer, vendor, delivery) in Firebase and Postgres.
 *       - Hashes password for Postgres storage.
 *       - Inserts role-specific records.
 *
 * @param {Object} data - User data
 * @param {string} data.name - Full name
 * @param {string} data.email - Email
 * @param {string} [data.password] - Password
 * @param {string} [data.phone] - Phone
 * @param {string} [data.address] - Customer address
 * @param {string} [data.store_name] - Vendor store name
 * @param {string} [data.description] - Vendor store description
 * @param {string} [data.company_name] - Delivery company name
 * @param {string} [data.firebaseToken] - Optional Firebase token
 * @param {string} role - User role ('customer', 'vendor', 'delivery')
 *
 * @returns {Promise<Object>} { postgresUser, firebaseUser }
 * @throws {Error} Throws error if registration fails
 */
exports.register = async (data, role) => {
  let firebaseUser;

  if (data.firebaseToken) {
    firebaseUser = await admin.auth().verifyIdToken(data.firebaseToken);
    data.email = firebaseUser.email || data.email;
    data.phone = firebaseUser.phone_number || data.phone;
  } else {
    firebaseUser = await admin.auth().createUser({
      email: data.email,
      password: data.password,
      phoneNumber: data.phone || undefined,
      displayName: data.name,
    });
  }

  const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : null;

  const postgresUser = await insertUser({
    name: data.name,
    email: data.email,
    phone: data.phone,
    password_hash: passwordHash,
    role,
    address: data.address || null,
  });

  if (role === 'customer') {
    await insertCustomer({ user_id: postgresUser.id });
  } else if (role === 'vendor') {
    console.log('store_name:', data.store_name);
    console.log('store_slug:', data.store_slug || generateSlug(data.store_name));

    await insertVendor({
  user_id: postgresUser.id,
  store_name: data.store_name,
  store_slug: data.store_slug || generateSlug(data.store_name),
  description: data.description || '',
  status: 'pending', // القيمة الافتراضية قبل الموافقة
  contact_email: data.email,
  phone: data.phone || null,
  address: data.address || null,
  social_links: null,
  commission_rate: 0.0,
});
  } else if (role === 'delivery') {
    await insertDelivery({ user_id: postgresUser.id, company_name: data.company_name });
  }

  return { postgresUser, firebaseUser };
};

/**
 * @function login
 * @desc Authenticates a user and returns JWT token.
 *       - Checks user role and status for vendors/delivery
 *
 * @param {Object} credentials
 * @param {string} credentials.email
 * @param {string} credentials.password
 * @returns {Promise<string>} JWT token
 * @throws {Error} Throws error with code:
 *   - USER_NOT_FOUND
 *   - INVALID_CREDENTIALS
 *   - NOT_FOUND_RECORD
 *   - NOT_APPROVED
 */
exports.login = async ({ email, password }) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
  const user = rows[0];

  if (!user) {
    const err = new Error('User not found');
    err.code = 'USER_NOT_FOUND';
    throw err;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    const err = new Error('Invalid credentials');
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }

  if (['vendor', 'delivery'].includes(user.role)) {
    const table = user.role === 'vendor' ? 'vendors' : 'delivery_companies';
    const { rows: statusRows } = await pool.query(`SELECT status FROM ${table} WHERE user_id=$1`, [user.id]);

    if (!statusRows[0]) {
      const err = new Error('Your vendor/delivery record not found.');
      err.code = 'NOT_FOUND_RECORD';
      throw err;
    }

    if (statusRows[0].status !== 'approved') {
      const err = new Error('Your account is not approved yet by admin.');
      err.code = 'NOT_APPROVED';
      throw err;
    }
  }

  // if (user.role !== 'admin') {
  //   const err = new Error('Not authorized. Admin only.');
  //   err.code = 'NOT_ADMIN';
  //   throw err;
  // }

  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
};
