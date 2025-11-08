// src/modules/coupons/CouponController.js
const db = require("../../config/db");
const Coupon = require("./CouponModel");

/**
 * إنشاء كوبون جديد
 */
exports.createCoupon = async (req, res) => {
  try {
    const userId = req.user.id;

    // جلب vendor_id من جدول vendors
    const vendorResult = await db.query("SELECT id FROM vendors WHERE user_id = $1", [userId]);
    if (vendorResult.rowCount === 0) {
      return res.status(403).json({ message: "User is not a vendor" });
    }
    const vendorId = vendorResult.rows[0].id;
    console.log("🟢 Creating coupon for vendor:", vendorId);

    const now = new Date();
    const couponData = {
      ...req.body,
      vendor_id: vendorId,
      created_at: now,
      updated_at: now,
    };

    const coupon = await Coupon.createCoupon(couponData);

    res.status(201).json({ message: "Coupon created successfully!", coupon });
  } catch (err) {
    console.error("Coupon creation error:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

/**
 * جلب جميع كوبونات البائع
 */
exports.getVendorCoupons = async (req, res) => {
  try {
    const userId = req.user.id;
    const vendorResult = await db.query("SELECT id FROM vendors WHERE user_id = $1", [userId]);
    if (vendorResult.rowCount === 0) {
      return res.status(403).json({ message: "User is not a vendor" });
    }
    const vendorId = vendorResult.rows[0].id;

    const coupons = await Coupon.getVendorCoupons(vendorId);
    res.json(coupons);
  } catch (err) {
    console.error("Error fetching coupons:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

/**
 * تعديل الكوبون (حقول محددة فقط)
 */
exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const vendorResult = await db.query("SELECT id FROM vendors WHERE user_id = $1", [userId]);
    if (vendorResult.rowCount === 0) {
      return res.status(403).json({ message: "User is not a vendor" });
    }
    const vendorId = vendorResult.rows[0].id;

    const coupon = await Coupon.updateCoupon(id, vendorId, req.body);
    if (!coupon) return res.status(400).json({ message: "No valid fields to update or unauthorized" });

    res.json({ message: "Coupon updated successfully", coupon });
  } catch (err) {
    console.error("Error updating coupon:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

/**
 * تفعيل / تعطيل الكوبون
 */
exports.toggleCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    const userId = req.user.id;

    const vendorResult = await db.query("SELECT id FROM vendors WHERE user_id = $1", [userId]);
    if (vendorResult.rowCount === 0) {
      return res.status(403).json({ message: "User is not a vendor" });
    }
    const vendorId = vendorResult.rows[0].id;

    const result = await Coupon.toggleCouponStatus(id, vendorId, is_active);
    if (result?.error) return res.status(400).json({ message: result.error });

    res.json({ message: `Coupon ${is_active ? "activated" : "deactivated"} successfully.`, coupon: result });
  } catch (err) {
    console.error("Error toggling coupon status:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

// ✅ التحقق من الكوبون قبل عملية الشراء (Preview)
exports.validateCoupon = async (req, res) => {
  try {
    const { coupon_code, userId, cartItems } = req.body;

    console.log("📩 Received from frontend:", req.body);

    if (!coupon_code || !userId || !cartItems || cartItems.length === 0) {
      return res.status(400).json({ 
        valid: false, 
        message: "Missing required fields (coupon_code, userId, cartItems)" 
      });
    }

    const result = await Coupon.validateCoupon(coupon_code, userId, cartItems);

    if (!result.valid) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);

  } catch (err) {
    console.error("Error validating coupon:", err);
    return res.status(500).json({ 
      valid: false, 
      message: "Server error while validating coupon" 
    });
  }
};
