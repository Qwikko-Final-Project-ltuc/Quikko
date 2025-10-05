const adminService = require('./adminService');

/**
 * ===============================
 * Vendors Controllers
 * ===============================
 */

/**
 * @function getVendors
 * @desc Fetch all vendors from the system.
 *       Returns a JSON object with success status and an array of vendors.
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {JSON} JSON response with:
 *  - success {boolean} - Operation status
 *  - data {Array} - List of vendor objects
 * @throws 500 if server or database error occurs
 */
exports.getVendors = async (req, res) => {
  try {
    const vendors = await adminService.listVendors();
    res.json({ success: true, data: vendors });
  } catch (err) {
    console.error('Error fetching vendors:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @function getPendingVendors
 * @desc Fetch all vendors with 'pending' status.
 *       Returns a JSON object with success status and array of pending vendors.
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {JSON} JSON response with:
 *  - success {boolean} - Operation status
 *  - data {Array} - List of pending vendor objects
 * @throws 500 if server or database error occurs
 */
exports.getPendingVendors = async (req, res) => {
  try {
    const vendors = await adminService.listVendors();
    const pendingVendors = vendors.filter(v => v.status === 'pending');
    res.json({ success: true, data: pendingVendors });
  } catch (err) {
    console.error('Error fetching pending vendors:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @function approveVendor
 * @desc Approve a vendor by vendorId.
 *       Returns a JSON object with approval message and vendor data.
 * @async
 * @param {Object} req - Express request object (req.params.vendorId)
 * @param {Object} res - Express response object
 * @returns {JSON} JSON response with:
 *  - message {string} - Success message
 *  - data {Object} - Approved vendor object
 * @throws 404 if vendor not found, 500 if server error
 */
exports.approveVendor = async (req, res) => {
  try {
    const vendor = await adminService.approveVendor(req.params.vendorId);
    res.json({ message: 'Vendor approved successfully', data: vendor });
  } catch (err) {
    console.error('Approve vendor error:', err);
    res.status(404).json({ success: false, message: err.message });
  }
};

/**
 * @function rejectVendor
 * @desc Reject a vendor by vendorId.
 *       Returns a JSON object with rejection message and vendor data.
 * @async
 * @param {Object} req - Express request object (req.params.vendorId)
 * @param {Object} res - Express response object
 * @returns {JSON} JSON response with:
 *  - message {string} - Success message
 *  - data {Object} - Rejected vendor object
 * @throws 404 if vendor not found, 500 if server error
 */
exports.rejectVendor = async (req, res) => {
  try {
    const vendor = await adminService.rejectVendor(req.params.vendorId);
    res.json({ message: 'Vendor rejected successfully', data: vendor });
  } catch (err) {
    console.error('Reject vendor error:', err);
    res.status(404).json({ success: false, message: err.message });
  }
};

/**
 * ===============================
 * Delivery Companies Controllers
 * ===============================
 */

/**
 * @function listAllCompanies
 * @desc Fetch all delivery companies.
 *       Returns a JSON object with success status and array of companies.
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {JSON} JSON response with:
 *  - success {boolean} - Operation status
 *  - data {Array} - List of delivery company objects
 * @throws 404 if no companies found, 500 if server error
 */
exports.listAllCompanies = async (req, res) => {
  try {
    const companies = await adminService.listDeliveryCompanies();
    if (!companies || companies.length === 0) {
      return res.status(404).json({ success: false, message: 'No delivery companies found' });
    }
    res.json({ success: true, data: companies });
  } catch (err) {
    console.error('Error fetching delivery companies:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @function getPendingDeliveries
 * @desc Fetch all delivery companies with 'pending' status.
 *       Returns a JSON object with success status and array of pending companies.
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {JSON} JSON response with:
 *  - success {boolean} - Operation status
 *  - data {Array} - List of pending delivery company objects
 * @throws 500 if server error occurs
 */
exports.getPendingDeliveries = async (req, res) => {
  try {
    const companies = await adminService.listDeliveryCompanies();
    const pendingCompanies = companies.filter(c => c.status === 'pending');
    res.json({ success: true, data: pendingCompanies });
  } catch (err) {
    console.error('Error fetching pending delivery companies:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @function approveDelivery
 * @desc Approve a delivery company by deliveryId.
 *       Returns a JSON object with approval message and company data.
 * @async
 * @param {Object} req - Express request object (req.params.deliveryId)
 * @param {Object} res - Express response object
 * @returns {JSON} JSON response with:
 *  - message {string} - Success message
 *  - data {Object} - Approved delivery company object
 * @throws 404 if company not found, 500 if server error
 */
exports.approveDelivery = async (req, res) => {
  try {
    const company = await adminService.approveDelivery(req.params.deliveryId);
    res.json({ message: 'Delivery company approved successfully', data: company });
  } catch (err) {
    console.error('Approve delivery error:', err);
    res.status(404).json({ success: false, message: err.message });
  }
};

/**
 * @function rejectDelivery
 * @desc Reject a delivery company by deliveryId.
 *       Returns a JSON object with rejection message and company data.
 * @async
 * @param {Object} req - Express request object (req.params.deliveryId)
 * @param {Object} res - Express response object
 * @returns {JSON} JSON response with:
 *  - message {string} - Success message
 *  - data {Object} - Rejected delivery company object
 * @throws 404 if company not found, 500 if server error
 */
exports.rejectDelivery = async (req, res) => {
  try {
    const company = await adminService.rejectDelivery(req.params.deliveryId);
    res.json({ message: 'Delivery company rejected successfully', data: company });
  } catch (err) {
    console.error('Reject delivery error:', err);
    res.status(404).json({ success: false, message: err.message });
  }
};

/**
 * ===============================
 * Orders Controllers
 * ===============================
 */

/**
 * @function getAllOrders
 * @desc Fetch all orders from the system.
 *       Returns a JSON object with success status and array of orders.
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {JSON} JSON response with:
 *  - success {boolean} - Operation status
 *  - data {Array} - List of order objects
 * @throws 500 if server error occurs
 */
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await adminService.listOrders();
    res.json({ success: true, data: orders });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id; 
    const user = await adminService.getProfile(userId);
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};