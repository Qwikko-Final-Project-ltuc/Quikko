// backend/src/modules/vendor/vendorValidators.js
const { body, param, validationResult } = require("express-validator");

// قديمك كما هو:
const updateOrderStatusValidator = [
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["pending", "shipped", "delivered", "cancelled"])
    .withMessage("Invalid status"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
];

// جديد:
const updateOrderItemStatusValidator = [
  param("orderId").isInt({ min: 1 }).toInt(),
  param("itemId").isInt({ min: 1 }).toInt(),
  body("action")
    .notEmpty()
    .withMessage("action is required")
    .isIn(["accept", "reject"])
    .withMessage("action must be 'accept' or 'reject'"),
  body("reason")
    .optional({ nullable: true })
    .isString()
    .withMessage("reason must be a string")
    .isLength({ max: 500 })
    .withMessage("reason too long"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
];

module.exports = {
  updateOrderStatusValidator,
  updateOrderItemStatusValidator,
};
