const DeliveryModel = require('./deliveryModel');

/**
 * @module DeliveryService
 * @desc Business logic for delivery companies and orders.
 *       Handles data processing, validation, and merging logic.
 */

/**
 * Get delivery company profile
 * @async
 * @param {number} userId
 * @returns {Promise<Object|null>}
 */
exports.getCompanyProfile = async (userId) => {
  return await DeliveryModel.getProfileByUserId(userId);
};

/**
 * Update delivery company profile
 * @async
 * @param {number} userId
 * @param {Object} data
 * @returns {Promise<Object|null>}
 */
exports.updateCompanyProfile = async (userId, data) => {
  return await DeliveryModel.updateProfileByUserId(userId, data);
};

/**
 * Get order details with company info
 * @async
 * @param {number} orderId
 * @returns {Promise<Object|null>}
 */
exports.getOrderDetails = async (orderId) => {
  return await DeliveryModel.getOrderWithCompany(orderId);
};

/**
 * Update order status
 * @async
 * @param {number} orderId
 * @param {string} status
 * @returns {Promise<Object|null>}
 */
exports.updateOrderStatus = async (orderId, status) => {
  return await DeliveryModel.updateStatus(orderId, status);
};

/**
 * Add new coverage areas to a company
 * @async
 * @param {number} userId
 * @param {Array<string>} newAreas
 * @returns {Promise<Object|null>} Updated company info or null
 */
exports.addCoverageAreas = async (userId, newAreas) => {
  const company = await DeliveryModel.getCoverageById(userId);
  if (!company) return null;

  const currentAreas = company.coverage_areas || [];
  const mergedAreas = Array.from(new Set([...currentAreas, ...newAreas]));

  return await DeliveryModel.addCoverage(userId, mergedAreas);
};


/**
 * Update coverage area
 * @async
 * @param {number} id
 * @param {number} user_id
 * @param {Object} data
 * @returns {Promise<Object|null>}
 */
exports.updateCoverageArea = async (id, user_id, data) => {
  return await DeliveryModel.updateCoverage(id, user_id, data);
};

/**
 * Delete coverage area
 * @async
 * @param {number} id
 * @param {number} user_id
 * @returns {Promise<void>}
 */
exports.deleteCoverageArea = async (userId, areasToRemove) => {
  return await DeliveryModel.deleteCoverageAreas(userId, areasToRemove);
};

/**
 * Get coverage areas for company by userId
 * @async
 * @param {number} userId
 * @returns {Promise<Object|null>}
 */
exports.getCoverageAreas = async (userId) => {
  return await DeliveryModel.getCoverageById(userId);
};

/**
 * Get all orders for a delivery company
 * Automatically updates order status to "accepted" if all order items are accepted.
 * @async
 * @param {number} companyId - Company ID
 * @returns {Promise<Array<Object>>} List of orders with updated statuses
 */

exports.getCompanyOrders = async (companyId) => {
  const orders = await DeliveryModel.getOrdersByCompanyId(companyId);

  for (const order of orders) {
    const orderItems = await DeliveryModel.getOrderItems(order.id);

    const allAccepted = orderItems.every(
      (item) => item.vendor_status === "accepted"
    );

    // if (allAccepted && order.status !== "accepted") {
    //   const updatedOrder = await DeliveryModel.updateStatus(
    //     order.id,
    //     "accepted"
    //   );
    //   order.status = updatedOrder.status; // نحدث القيمة في الذاكرة قبل الإرسال
    //   order.updated_at = updatedOrder.updated_at;
    // }
  }

  return orders;
};


/**
 * Get weekly report via service layer
 * @async
 * @param {number} companyId - The delivery company ID
 * @param {number} [days=7] - Number of days to include in the report
 * @returns {Promise<Object>} Weekly report from the model
 */
exports.getWeeklyReport = async (companyId, days = 7) => {
  return await DeliveryModel.getWeeklyReport(companyId, days);
};

/**
 * Get all items for a specific order (Service layer)
 * @async
 * @function
 * @param {number} orderId - The ID of the order to retrieve items for
 * @returns {Promise<Array<Object>>} A list of order items
 * @see DeliveryModel.getOrderItems
 */
exports.getOrderItems = async (orderId) => {
  return await DeliveryModel.getOrderItems(orderId);
};

exports.checkAndUpdateAcceptedOrdersForCompany = async (orderId) => {
  return await DeliveryModel.checkAndUpdateAcceptedOrdersForCompany(orderId);
};

exports.updatePaymentStatus = async (orderId, paymentStatus) => {
  return await DeliveryModel.updatePaymentStatus(orderId, paymentStatus);
};


exports.getOrderById = async (orderId) => {
  return await DeliveryModel.getOrderById(orderId);
};


