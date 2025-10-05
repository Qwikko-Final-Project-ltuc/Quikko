const AdminModel = require('./adminModel');

/**
 * ===============================
 * Vendors Service
 * ===============================
 */

/**
 * @function listVendors
 * @desc Retrieve all vendors from the database.
 * @async
 * @returns {Promise<Array>} Array of vendor objects with properties:
 *  - vendor_id {number}
 *  - user_id {number}
 *  - store_name {string}
 *  - status {string}
 *  - commission_rate {number}
 *  - contact_email {string}
 *  - phone {string}
 *  - products {Array} - Array of product objects
 * @throws {Error} Throws an error if database query fails
 */
exports.listVendors = async () => {
  return await AdminModel.getAllVendors();
};

/**
 * @function approveVendor
 * @desc Approve a vendor by updating their status to 'approved'.
 * @async
 * @param {number} vendorId - ID of the vendor to approve
 * @returns {Promise<Object>} The updated vendor object
 * @throws {Error} Throws an error if vendor not found or database query fails
 */
exports.approveVendor = async (vendorId) => {
  const vendor = await AdminModel.getVendorById(vendorId);
  if (!vendor) throw new Error('Vendor not found');
  return await AdminModel.updateVendorStatus(vendorId, 'approved');
};

/**
 * @function rejectVendor
 * @desc Reject a vendor by updating their status to 'rejected'.
 * @async
 * @param {number} vendorId - ID of the vendor to reject
 * @returns {Promise<Object>} The updated vendor object
 * @throws {Error} Throws an error if vendor not found or database query fails
 */
exports.rejectVendor = async (vendorId) => {
  const vendor = await AdminModel.getVendorById(vendorId);
  if (!vendor) throw new Error('Vendor not found');
  return await AdminModel.updateVendorStatus(vendorId, 'rejected');
};

/**
 * ===============================
 * Delivery Companies Service
 * ===============================
 */

/**
 * @function listDeliveryCompanies
 * @desc Retrieve all delivery companies from the database.
 * @async
 * @returns {Promise<Array>} Array of delivery company objects with properties:
 *  - company_id {number}
 *  - user_id {number}
 *  - company_name {string}
 *  - coverage_areas {string}
 *  - status {string}
 *  - created_at {Date}
 *  - updated_at {Date}
 * @throws {Error} Throws an error if database query fails
 */
exports.listDeliveryCompanies = async () => {
  return await AdminModel.getAllDeliveryCompanies();
};

/**
 * @function approveDelivery
 * @desc Approve a delivery company by updating its status to 'approved'.
 * @async
 * @param {number} companyId - ID of the delivery company to approve
 * @returns {Promise<Object>} The updated delivery company object
 * @throws {Error} Throws an error if delivery company not found or database query fails
 */
exports.approveDelivery = async (companyId) => {
  const company = await AdminModel.getDeliveryCompanyById(companyId);
  if (!company) throw new Error('Delivery company not found');
  return await AdminModel.updateDeliveryStatus(companyId, 'approved');
};

/**
 * @function rejectDelivery
 * @desc Reject a delivery company by updating its status to 'rejected'.
 * @async
 * @param {number} companyId - ID of the delivery company to reject
 * @returns {Promise<Object>} The updated delivery company object
 * @throws {Error} Throws an error if delivery company not found or database query fails
 */
exports.rejectDelivery = async (companyId) => {
  const company = await AdminModel.getDeliveryCompanyById(companyId);
  if (!company) throw new Error('Delivery company not found');
  return await AdminModel.updateDeliveryStatus(companyId, 'rejected');
};

/**
 * ===============================
 * Orders Service
 * ===============================
 */

/**
 * @function listOrders
 * @desc Retrieve all orders from the database.
 * @async
 * @returns {Promise<Array>} Array of order objects with detailed customer, delivery, and product info
 * @throws {Error} Throws an error if database query fails
 */
exports.listOrders = async () => {
  return await AdminModel.getAllOrders();
};


exports.getProfile = async (userId) => {
  const user = await AdminModel.getAdminById(userId);
  if (!user) throw new Error("User not found");
  return user;
};