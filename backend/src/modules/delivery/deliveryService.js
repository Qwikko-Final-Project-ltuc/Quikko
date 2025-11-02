const DeliveryModel = require("./deliveryModel");
const axios = require("axios");
const {
  calculateDistanceKm,
  calculateTotalRouteDistance,
} = require("../../utils/distance");

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

exports.getDistanceFromGoogle = async (fromLat, fromLng, toLat, toLng) => {
  try {
    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${fromLat},${fromLng}&destinations=${toLat},${toLng}&key=${GOOGLE_MAPS_API_KEY}`;

    const response = await axios.get(url);
    const element = response.data.rows[0].elements[0];

    if (element.status === "OK") {
      const distanceKm = element.distance.value / 1000; // meters → km
      const durationMin = element.duration.value / 60; // seconds → minutes
      return { distanceKm, durationMin };
    } else {
      return { distanceKm: 0, durationMin: 0 };
    }
  } catch (err) {
    console.error("Google Maps distance error:", err.message);
    return { distanceKm: 0, durationMin: 0 };
  }
};

exports.calculateDeliveryFee = (distanceKm) => {
  const baseFee = 1;
  const perKmRate = 0.4;
  const fee = baseFee + distanceKm * perKmRate;
  return Math.round(fee * 100) / 100;
};

exports.getDistance = async (
  fromLat,
  fromLng,
  toLat,
  toLng,
  useGoogle = true
) => {
  if (useGoogle) {
    return await exports.getDistanceFromGoogle(fromLat, fromLng, toLat, toLng);
  } else {
    const distanceKm = calculateDistanceKm(fromLat, fromLng, toLat, toLng) || 0;
    const durationMin = Math.round((distanceKm / 40) * 60); // سرعة تقديرية 40 كم/س
    return { distanceKm, durationMin };
  }
};

exports.calculateTotalDistanceAndFee = async (
  userId,
  customerAddressId,
  vendorIds,
  useGoogle = true
) => {
  try {
    // 1. جلب نقاط تغطية الشركة
    const coverage = await DeliveryModel.getCoverageById(userId);

    if (!coverage || !coverage.length)
      throw new Error("No delivery coverage found");

    // 2. جلب عنوان الكستمر
    const customer = await DeliveryModel.getCustomerCoordinates(
      customerAddressId
    );

    if (!customer?.latitude || !customer?.longitude) {
      throw new Error("Customer address coordinates missing");
    }

    // 3. جلب بيانات كل المحلات
    const vendors = [];
    for (const vendorId of vendorIds) {
      const vendor = await DeliveryModel.getVendorCoordinates(vendorId);

      if (vendor?.latitude && vendor?.longitude) {
        vendors.push(vendor);
      }
    }
    if (!vendors.length) throw new Error("No valid vendors found");

    // 4. تحديد نقطة الانطلاق الأقرب (من بين تغطيات الشركة)
    let startingCoverage = null;
    let minDistance = Infinity;

    for (const cov of coverage) {
      const { distanceKm } = await exports.getDistance(
        cov.latitude,
        cov.longitude,
        vendors[0].latitude,
        vendors[0].longitude,
        useGoogle
      );

      if (distanceKm < minDistance) {
        minDistance = distanceKm;
        startingCoverage = cov;
      }
    }

    if (!startingCoverage)
      throw new Error("No valid starting coverage point found");

    let currentPoint = startingCoverage;

    // 5. بناء المسار: من الشركة → أقرب محل → ... → آخر محل
    const route = [];
    const remainingVendors = [...vendors];

    while (remainingVendors.length > 0) {
      const distances = await Promise.all(
        remainingVendors.map(async (vendor) => {
          const { distanceKm, durationMin } = await exports.getDistance(
            currentPoint.latitude,
            currentPoint.longitude,
            vendor.latitude,
            vendor.longitude,
            useGoogle
          );
          return { vendor, distanceKm, durationMin };
        })
      );

      // اختيار أقرب محل من النقطة الحالية
      const nearest = distances.reduce((a, b) =>
        a.distanceKm < b.distanceKm ? a : b
      );

      const fee = exports.calculateDeliveryFee(nearest.distanceKm);

      route.push({
        from: currentPoint.company_name || currentPoint.label || currentPoint.city || "Delivery Start",
        from_lat: currentPoint.latitude,
        from_lng: currentPoint.longitude,
        to: nearest.vendor.store_name || nearest.vendor.label,
        to_lat: nearest.vendor.latitude,
        to_lng: nearest.vendor.longitude,
        vendor_id: nearest.vendor.id,
        distance_km: parseFloat(nearest.distanceKm.toFixed(2)),
        duration_min: Math.round(nearest.durationMin),
        delivery_fee: fee,
      });

      // تحديث الموقع الحالي
      currentPoint = nearest.vendor;

      // إزالة هذا المحل من القائمة
      const idx = remainingVendors.findIndex((v) => v.id === nearest.vendor.id);
      remainingVendors.splice(idx, 1);
    }

    // 6. أخيرًا: من آخر محل إلى الزبون
    const { distanceKm: backDistance, durationMin: backDuration } =
      await exports.getDistance(
        currentPoint.latitude,
        currentPoint.longitude,
        customer.latitude,
        customer.longitude,
        useGoogle
      );

    const backFee = exports.calculateDeliveryFee(backDistance);

    route.push({
      from: currentPoint.store_name || currentPoint.label,
      from_lat: currentPoint.latitude,
      from_lng: currentPoint.longitude,
      to: customer.name || "Customer",
      to_lat: customer.latitude,
      to_lng: customer.longitude,
      vendor_id: null,
      distance_km: parseFloat(backDistance.toFixed(2)),
      duration_min: Math.round(backDuration),
      delivery_fee: backFee,
    });

    // 7️⃣ حساب المسافة الكلية والرسوم الكلية
    const totalDistance = route.reduce((acc, r) => acc + r.distance_km, 0);
    const totalFee = route.reduce((acc, r) => acc + r.delivery_fee, 0);

    console.log("Total distance:", totalDistance);
    console.log("Total delivery fee:", totalFee);

    // 8. الإخراج النهائي
    return {
      delivery_start: {
        label: startingCoverage.city || "Delivery Company",
        latitude: startingCoverage.latitude,
        longitude: startingCoverage.longitude,
      },
      customer: {
        id: customer.id,
        label: customer.name || customer.label,
        latitude: customer.latitude,
        longitude: customer.longitude,
      },
      route,
      total_distance_km: parseFloat(totalDistance.toFixed(2)),
      total_delivery_fee: Math.round(totalFee * 100) / 100,
    };
  } catch (err) {
    console.error("Error calculating optimized delivery route:", err.message);
    return {
      delivery_start: null,
      route: [],
      total_distance_km: 0,
      total_delivery_fee: 0,
    };
  }
};
