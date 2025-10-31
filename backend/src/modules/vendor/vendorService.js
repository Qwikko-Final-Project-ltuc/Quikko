const pool = require("../../config/db");
const { geocodeAddress } = require("../../utils/geocoding");
/**
 * ===============================
 * Vendor Service
 * ===============================
 * @module VendorService
 * @desc Business logic for vendor operations such as profile, orders, products, and reports.
 */

const vendorModel = require("./vendorModel");

/**
 * Fetch all vendors.
 *
 * @async
 * @function getAllVendors
 * @returns {Promise<Array<Object>>} Array of vendor records
 *
 * @throws {Error} Database query failure
 */
exports.getAllVendors = async () => {
  return await vendorModel.getAllVendors();
};

/**
 * Fetch vendor report by user ID.
 *
 * Includes total orders and total sales.
 *
 * @async
 * @function getVendorReport
 * @param {number} userId - ID of the user (from JWT)
 * @returns {Promise<Object>} Vendor report object
 *
 * @throws {Error} If vendor not found or DB query fails
 */
exports.getVendorReport = async (userId) => {
  const report = await vendorModel.getVendorReport(userId);
  if (!report) {
    throw new Error("Vendor not found or no orders yet");
  }
  return report;
};

/**
 * Get all orders for a vendor by user ID.
 *
 * - Finds vendor ID via user ID.
 * - Fetches orders linked to that vendor.
 *
 * @async
 * @function getVendorOrders
 * @param {number} userId - ID of the vendor's user
 * @returns {Promise<Array<Object>>} Array of orders
 *
 * @throws {Error} If vendor not found or DB query fails
 */
exports.getVendorOrders = async (userId) => {
  const vendor = await vendorModel.getVendorByUserId(userId);
  if (!vendor) {
    throw new Error("Vendor not found");
  }
  return await vendorModel.getVendorOrders(vendor.id);
};

/**
 * Update status of a specific order.
 *
 * @async
 * @function updateOrderStatus
 * @param {number} orderId - ID of the order
 * @param {string} status - New status (e.g., 'pending', 'shipped')
 * @returns {Promise<Object>} Updated order object
 *
 * @throws {Error} If DB update fails
 */
exports.updateOrderStatus = async (orderId, status) => {
  return await vendorModel.updateOrderStatus(orderId, status);
};

exports.getVendorProducts = async (userId) => {
  const vendor = await vendorModel.getVendorByUserId(userId);
  if (!vendor) throw new Error("Vendor not found");

  return await vendorModel.getVendorProducts(vendor.id);
};
/**
 * Get all products for a vendor by user ID.
 *
 * @async
 * @function getVendorProducts
 * @param {number} userId - Vendor's user ID
 * @returns {Promise<Array<Object>>} Array of product objects
 *
 * @throws {Error} If vendor not found or DB query fails
 */
exports.getVendorProducts = async (userId) => {
  const vendor = await vendorModel.getVendorByUserId(userId);
  if (!vendor) {
    throw new Error("Vendor not found");
  }
  return await vendorModel.getVendorProducts(vendor.id);
};

/**
 * Get vendor profile by user ID.
 *
 * @async
 * @function getProfile
 * @param {number} userId - Vendor's user ID
 * @returns {Promise<Object>} Vendor profile object
 *
 * @throws {Error} If DB query fails
 */
exports.getProfile = async (userId) => {
  return await vendorModel.getProfile(userId);
};

/**
 * Update vendor profile.
 *
 * @async
 * @function updateProfile
 * @param {number} userId - Vendor's user ID
 * @param {Object} profileData - Profile fields to update
 * @returns {Promise<Object>} Updated vendor profile
 *
 * @throws {Error} If DB update fails
 */
exports.updateProfile = async (userId, profileData) => {
  // إذا يوجد عنوان جديد أو تحديث
  if (profileData.address) {
    const coords = await geocodeAddress(profileData.address);
    if (coords) {
      profileData.latitude = coords.latitude;
      profileData.longitude = coords.longitude;
    } else {
      // ممكن تتركهم null أو ترمي خطأ إذا تريد التأكد من العنوان
      profileData.latitude = null;
      profileData.longitude = null;
    }
  }

  return await vendorModel.updateProfile(userId, profileData);
};



/**
 * Update vendor_status of a specific order item (per vendor).
 * Allowed values: 'accepted', 'rejected'.
 * If 'accepted' → decrease stock_quantity from products.
 */
exports.updateOrderItemStatus = async (itemId, status, userId) => {
  if (!["accepted", "rejected"].includes(status)) {
    throw new Error("Invalid status. Must be 'accepted' or 'rejected'.");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1) Get vendor_id for the logged-in user
    const vendorRes = await client.query(
      `SELECT id AS vendor_id FROM vendors WHERE user_id = $1`,
      [userId]
    );
    if (vendorRes.rows.length === 0) {
      await client.query("ROLLBACK");
      throw new Error("Vendor not found for this user");
    }
    const vendorId = vendorRes.rows[0].vendor_id;

    // 2) Get order_item + product (lock row FOR UPDATE)
    const itemQuery = `
      SELECT oi.*, p.vendor_id, p.stock_quantity, p.name AS product_name
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.id = $1 AND p.vendor_id = $2
      FOR UPDATE;
    `;
    const { rows } = await client.query(itemQuery, [itemId, vendorId]);
    const item = rows[0];
    if (!item) {
      await client.query("ROLLBACK");
      return null; // Not allowed to update this item
    }

    // 3) If accepted → decrease stock_quantity
    if (status === "accepted") {
      const newStock = item.stock_quantity - item.quantity;
      if (newStock < 0) {
        await client.query("ROLLBACK");
        throw new Error("Not enough stock for this product");
      }

      await client.query(
        `UPDATE products SET stock_quantity = $1, updated_at = NOW() WHERE id = $2`,
        [newStock, item.product_id]
      );
    }

    // 4) Update vendor_status in order_items
    const updateQuery = `
      UPDATE order_items
      SET vendor_status = $1
      WHERE id = $2
      RETURNING *;
    `;
    const { rows: updated } = await client.query(updateQuery, [status, itemId]);

    await client.query("COMMIT");
    return updated[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

exports.getVendorOrderItems = async (userId) => {
  const client = await pool.connect();
  try {
    // جلب vendor_id حسب user_id
    const vendorRes = await client.query(
      `SELECT id AS vendor_id FROM vendors WHERE user_id = $1`,
      [userId]
    );
    if (!vendorRes.rows.length) return [];
    const vendorId = vendorRes.rows[0].vendor_id;

    const itemsRes = await client.query(`
      SELECT oi.id AS order_item_id, oi.order_id, oi.product_id, oi.quantity,
             oi.vendor_status, p.name AS product_name
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE p.vendor_id = $1
      ORDER BY oi.id DESC
    `, [vendorId]);

    return itemsRes.rows;
  } finally {
    client.release();
  }
};
