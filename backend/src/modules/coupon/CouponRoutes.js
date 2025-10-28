// src/modules/coupons/CouponRoutes.js
const express = require("express");
const router = express.Router();
const couponController = require("./CouponController");
const { protect, authorizeRole } = require("../../middleware/authMiddleware");

/**
 * إنشاء كوبون
 * POST /coupons/create
 */
router.post("/create", protect, authorizeRole("vendor"), couponController.createCoupon);

/**
 * عرض جميع كوبونات البائع
 * GET /coupons
 */
router.get("/", protect, authorizeRole("vendor"), couponController.getVendorCoupons);

/**
 * تعديل كوبون (حقول محددة)
 * PUT /coupons/:id
 */
router.put("/:id", protect, authorizeRole("vendor"), couponController.updateCoupon);

/**
 * تفعيل / تعطيل الكوبون
 * PATCH /coupons/:id/status
 */
router.patch("/:id/status", protect, authorizeRole("vendor"), couponController.toggleCouponStatus);

router.post("/validate", protect, authorizeRole("customer"), couponController.validateCoupon);

module.exports = router;
