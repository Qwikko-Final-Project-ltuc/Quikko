// src/modules/coupons/CouponModel.js
const db = require("../../config/db");

const ALLOWED_UPDATE_FIELDS = ["code", "discount_value", "valid_from", "valid_to", "usage_limit"];

/**
 * إنشاء كوبون جديد
 */
exports.createCoupon = async (couponData) => {
  const {
    code,
    vendor_id,
    discount_type,
    discount_value,
    valid_from,
    valid_to,
    usage_limit,
    created_at,
    updated_at
  } = couponData;

  // ✅ التحقق من أن قيمة الخصم موجودة
  if (discount_value === undefined || discount_value === "" || isNaN(discount_value)) {
    throw new Error("Discount value is required and must be a number.");
  }

  const numericDiscountValue = Number(discount_value);
  const numericUsageLimit =
    usage_limit !== undefined && usage_limit !== "" ? Number(usage_limit) : null;

  const result = await db.query(
    `INSERT INTO coupons 
      (code, vendor_id, discount_type, discount_value, valid_from, valid_to, usage_limit, is_active, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8, $9)
     RETURNING *`,
    [
      code,
      vendor_id,
      discount_type,
      numericDiscountValue,
      valid_from,
      valid_to,
      numericUsageLimit,
      created_at,
      updated_at
    ]
  );

  return result.rows[0];
};



/**
 * جلب جميع كوبونات البائع
 */
exports.getVendorCoupons = async (vendorId) => {
  const result = await db.query("SELECT * FROM coupons WHERE vendor_id = $1 ORDER BY created_at DESC", [vendorId]);
  return result.rows;
};

/**
 * تعديل الكوبون (حقول محددة فقط)
 */
exports.updateCoupon = async (couponId, vendorId, updateData) => {
  const fields = [];
  const values = [];
  let idx = 1;

  ALLOWED_UPDATE_FIELDS.forEach(field => {
    if (updateData[field] !== undefined) {
      fields.push(`${field} = $${idx++}`);
      values.push(updateData[field]);
    }
  });

  if (fields.length === 0) return null;

  fields.push(`updated_at = NOW()`);
  values.push(couponId, vendorId);

  const query = `
    UPDATE coupons
    SET ${fields.join(", ")}
    WHERE id = $${idx++} AND vendor_id = $${idx}
    RETURNING *
  `;

  const result = await db.query(query, values);
  return result.rows[0];
};

/**
 * تفعيل / تعطيل الكوبون
 * يتحقق من valid_to إذا البائع حاول يفعّل كوبون منتهي
 */
exports.toggleCouponStatus = async (couponId, vendorId, isActive) => {
  const couponRes = await db.query("SELECT * FROM coupons WHERE id = $1 AND vendor_id = $2", [couponId, vendorId]);
  if (couponRes.rowCount === 0) return { error: "Coupon not found or unauthorized" };

  const coupon = couponRes.rows[0];

  if (isActive && new Date(coupon.valid_to) < new Date()) {
    return { error: "Cannot activate coupon: it has already expired. Please update valid_to." };
  }

  const result = await db.query(
    "UPDATE coupons SET is_active = $1, updated_at = NOW() WHERE id = $2 AND vendor_id = $3 RETURNING *",
    [isActive, couponId, vendorId]
  );

  return result.rows[0];
};

/**
 * ✅ Validate coupon and preview discount
 * @param {string} coupon_code - كود الكوبون
 * @param {number} userId - معرف المستخدم
 * @param {Array} cartItems - عناصر السلة [{product_id, quantity, price, vendor_id}]
 * @returns {Object} نتيجة التحقق: { valid: bool, message, discount_amount, total_amount, final_amount, applicable_vendor_id }
 */
exports.validateCoupon = async (coupon_code, userId, cartItems) => {
  // 1. جلب الكوبون
  const couponRes = await db.query(`SELECT * FROM coupons WHERE code = $1`, [coupon_code]);
  const coupon = couponRes.rows[0];

  if (!coupon) return { valid: false, message: "❌ Invalid coupon code" };

  const now = new Date();
  if (!coupon.is_active) return { valid: false, message: "❌ Coupon is not active" };
  if (coupon.valid_from && now < new Date(coupon.valid_from))
    return { valid: false, message: "❌ Coupon not yet valid" };
  if (coupon.valid_to && now > new Date(coupon.valid_to))
    return { valid: false, message: "❌ Coupon expired" };

  // 2. تحقق من حدود الاستخدام
  if (coupon.usage_limit !== null && coupon.usage_limit <= 0)
    return { valid: false, message: "❌ Coupon usage limit reached" };

  // 3. حساب المجموع الكلي للعناصر
  let total_amount = 0;
  for (let item of cartItems) {
    total_amount += item.price * item.quantity;
  }

  // 4. تحديد المنتجات القابلة للخصم
  let applicableItems = cartItems;
  if (coupon.vendor_id) {
    applicableItems = cartItems.filter((it) => it.vendor_id === coupon.vendor_id);
    if (applicableItems.length === 0)
      return { valid: false, message: "❌ Coupon applies only to specific vendor's products" };
  }

  let applicableTotal = 0;
  for (let item of applicableItems) {
    applicableTotal += item.price * item.quantity;
  }

  // 5. تحقق من الحد الأدنى للمشتريات
  if (coupon.min_purchase_amount && applicableTotal < Number(coupon.min_purchase_amount)) {
    return {
      valid: false,
      message: `❌ Minimum purchase amount required: ${coupon.min_purchase_amount}`,
    };
  }

  // 6. حساب قيمة الخصم
  let discount_amount = 0;
  if (coupon.discount_type === "percentage") {
    discount_amount = (applicableTotal * Number(coupon.discount_value)) / 100;
  } else {
    discount_amount = Number(coupon.discount_value);
  }

  if (discount_amount > applicableTotal) discount_amount = applicableTotal;

  const final_amount = Number((total_amount - discount_amount).toFixed(2));

  return {
    valid: true,
    message: "✅ Coupon applied successfully",
    discount_amount,
    total_amount,
    final_amount,
    applicable_vendor_id: coupon.vendor_id || null,
  };
};

