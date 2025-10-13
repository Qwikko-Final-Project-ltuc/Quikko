const userModel = require('./userModel');

/**
 * ===============================
 * User Service
 * ===============================
 * @module UserService
 * @desc Handles business logic for users, customers, vendors, and delivery companies.
 */

/**
 * Create a new user
 * @async
 * @function createUser
 * @param {Object} userData - User information
 * @returns {Promise<Object>} Newly created user
 */
exports.createUser = async (userData) => {
  return userModel.insertUser(userData);
};

/**
 * Create a new customer linked to a user
 * @async
 * @function createCustomer
 * @param {number} user_id - ID of the user
 * @returns {Promise<Object>} Newly created customer
 */
exports.createCustomer = async (user_id) => {
  return userModel.insertCustomer({ user_id });
};

/**
 * Create a new vendor linked to a user
 * @async
 * @function createVendor
 * @param {number} user_id - ID of the user
 * @param {string} store_name - Store name
 * @param {string} [description] - Optional description
 * @returns {Promise<Object>} Newly created vendor
 */
exports.createVendor = async (user_id, store_name, description) => {
  return userModel.insertVendor({ user_id, store_name, description });
};

/**
 * Create a new delivery company linked to a user
 * @async
 * @function createDelivery
 * @param {number} user_id - ID of the user
 * @param {string} company_name - Company name
 * @returns {Promise<Object>} Newly created delivery company
 */
exports.createDelivery = async (user_id, company_name) => {
  return userModel.insertDelivery({ user_id, company_name });
};

/**
 * Update FCM token for a user
 * @async
 * @function updateUserFcmToken
 * @param {number} userId - ID of the user
 * @param {string} fcmToken - FCM token
 * @returns {Promise<Object>} Updated user record
 */
exports.updateUserFcmToken = async (userId, fcmToken) => {
  return userModel.updateFcmToken(userId, fcmToken);
};
