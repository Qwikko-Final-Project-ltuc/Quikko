const vendorService = require("./vendorService");

/**
 * ===============================
 * Vendor Controller
 * ===============================
 * @module VendorController
 * @desc Handles HTTP requests and responses for vendor operations,
 *       delegates business logic to the service layer.
 */

/**
 * Get all vendors.
 *
 * @route GET /vendors
 * @access Admin
 *
 * @returns {JSON} 200 - Array of vendor objects
 * @returns {JSON} 500 - Error message
 */
exports.getVendors = async (req, res) => {
  try {
    const vendors = await vendorService.getAllVendors();
    res.json({ success: true, data: vendors });
  } catch (err) {
    console.error("Get vendors error:", err);
    res.status(500).json({ success: false, message: "Error fetching vendors" });
  }
};

/**
 * Get vendor report for the logged-in vendor.
 *
 * @route GET /vendors/report
 * @access Vendor
 *
 * @returns {JSON} 200 - Vendor report (total orders & sales)
 * @returns {JSON} 404 - Vendor not found or no orders
 * @returns {JSON} 500 - Internal server error
 */
exports.getVendorReport = async (req, res) => {
  try {
    const userId = req.user.id; // from token
    const report = await vendorService.getVendorReport(userId);

    res.json({
      success: true,
      message: "Vendor report fetched successfully",
      data: report,
    });
  } catch (err) {
    console.error("Error fetching vendor report:", err);
    if (err.message.includes("not found")) {
      return res.status(404).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get all orders for the logged-in vendor.
 *
 * @route GET /vendors/orders
 * @access Vendor
 *
 * @returns {JSON} 200 - Array of orders with items
 * @returns {JSON} 404 - Vendor not found
 * @returns {JSON} 500 - Error fetching vendor orders
 */
exports.getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await vendorService.getVendorOrders(userId);

    res.json({ success: true, data: orders });
  } catch (err) {
    console.error("Get vendor orders error:", err);
    if (err.message.includes("Vendor not found")) {
      return res.status(404).json({ success: false, message: err.message });
    }
    res
      .status(500)
      .json({ success: false, message: "Error getting vendor orders" });
  }
};

/**
 * Update order status for a given order.
 *
 * @route PUT /vendors/orders/:id/status
 * @access Vendor
 *
 * @param {string} req.params.id - Order ID
 * @param {string} req.body.status - New order status (e.g., "shipped", "delivered")
 *
 * @returns {JSON} 200 - Updated order object
 * @returns {JSON} 500 - Error updating order status
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedOrder = await vendorService.updateOrderStatus(id, status);
    res.json({ success: true, data: updatedOrder });
  } catch (err) {
    console.error("Update order status error:", err);
    res
      .status(500)
      .json({ success: false, message: "Error updating order status" });
  }
};

/**
 * Get all products of the logged-in vendor.
 *
 * @route GET /vendors/products
 * @access Vendor
 *
 * @returns {JSON} 200 - Array of vendor products
 * @returns {JSON} 404 - Vendor not found
 * @returns {JSON} 500 - Error fetching vendor products
 */
exports.getProducts = async (req, res) => {
  try {
    const userId = req.user.id;
    const products = await vendorService.getVendorProducts(userId);

    res.json({ success: true, data: products });
  } catch (err) {
    console.error("Error fetching vendor products:", err);
    if (err.message.includes("Vendor not found")) {
      return res.status(404).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: "Error fetching products" });
  }
};

/**
 * Get vendor profile for the logged-in vendor.
 *
 * @route GET /vendors/profile
 * @access Vendor
 *
 * @returns {JSON} 200 - Vendor profile object
 * @returns {JSON} 500 - Error fetching vendor profile
 */
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await vendorService.getProfile(userId);

    res.json({ success: true, data: profile });
  } catch (err) {
    console.error("Get vendor profile error:", err);
    res
      .status(500)
      .json({ success: false, message: "Error fetching vendor profile" });
  }
};

/**
 * Update vendor profile for the logged-in vendor.
 *
 * @route PUT /vendors/profile
 * @access Vendor
 *
 * @param {Object} req.body - Vendor profile data
 *
 * @returns {JSON} 200 - Updated vendor profile
 * @returns {JSON} 500 - Error updating vendor profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const allowedFields = ['store_name', 'address', 'description', 'store_logo'];
    const profileData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) profileData[field] = req.body[field];
    });

    const updatedProfile = await vendorService.updateProfile(userId, profileData);

    res.json({ success: true, data: updatedProfile });
  } catch (err) {
    console.error("Update vendor profile error:", err);
    res.status(500).json({ success: false, message: "Error updating vendor profile" });
  }
};

/**
 * Update vendor_status for a specific order item.
 * Only 'accepted' or 'rejected'.
 */
exports.updateOrderItemStatus = async (req, res) => {
  try {
    const { id } = req.params; 
    const { status } = req.body;
    const userId = req.user.id;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either accepted or rejected",
      });
    }

    const updatedItem = await vendorService.updateOrderItemStatus(
      id,
      status,
      userId
    );

    if (!updatedItem) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to update this item",
      });
    }

    res.json({ success: true, data: updatedItem });
  } catch (err) {
    console.error("Update order item status error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Error updating order item status",
    });
  }
};


exports.getVendorOrderItems = async (req, res) => {
  try {
    const userId = req.user.id;
    const items = await vendorService.getVendorOrderItems(userId);
    res.json({ success: true, data: items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching order items' });
  }
};
