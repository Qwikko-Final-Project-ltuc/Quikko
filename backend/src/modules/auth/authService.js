const { admin } = require('../../infrastructure/firebase');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { insertUser, insertCustomer, insertVendor, insertDelivery } = require('./authModel');
const pool = require('../../config/db');
const generateSlug = require('../../utils/stringHelpers')
const JWT_SECRET = process.env.JWT_SECRET;
const nodemailer = require("nodemailer");

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
    await insertVendor({
      user_id: postgresUser.id,
      store_name: data.store_name,
      store_slug: data.store_slug || generateSlug(data.store_name),
      description: data.description || '',
      status: 'pending',
      contact_email: data.email,
      phone: data.phone || null,
      address: data.address || null,
    });
  } else if (role === 'delivery') {
    await insertDelivery({ user_id: postgresUser.id, company_name: data.company_name });
  }

  // 4️⃣ توليد رابط التحقق حسب الدور
  const redirectUrl = `https://qwikko.vercel.app/${role}/login`;
  const verificationLink = await admin.auth().generateEmailVerificationLink(firebaseUser.email, { url: redirectUrl });

  // 5️⃣ إرسال الإيميل
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Quikko Support" <${process.env.EMAIL_USER}>`,
    to: firebaseUser.email,
    subject: "Verify your Quikko account",
    html: `
      <p>Hi ${postgresUser.name},</p>
      <p>Welcome to Quikko as a ${role}!</p>
      <p>Please verify your email by clicking below:</p>
      <a href="${verificationLink}">Verify Email</a>
    `,
  });

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

  const firebaseUser = await admin.auth().getUserByEmail(email);
  if (!firebaseUser.emailVerified) {
    const err = new Error('Please verify your email before logging in.');
    err.code = 'EMAIL_NOT_VERIFIED';
    throw err;
  }


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






const { sendResetEmail } = require('../../utils/sendEmail');

exports.forgotPassword = async (email) => {
  const link = await admin.auth().generatePasswordResetLink(email, {
    url: `https://qwikko.vercel.app/customer/password-updated?email=${encodeURIComponent(email)}`,
  });

  await sendResetEmail(email, link);
  return link;
};



exports.resetPassword = async (email, newPassword) => {
  const user = await admin.auth().getUserByEmail(email);
  await admin.auth().updateUser(user.uid, { password: newPassword });

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await pool.query(`UPDATE users SET password_hash=$1, updated_at=NOW() WHERE email=$2`, [passwordHash, email]);
  return true;
};

exports.verifyEmail = async (oobCode) => {
  await admin.auth().applyActionCode(oobCode);
  return true;
};