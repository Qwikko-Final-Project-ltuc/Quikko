const { body, validationResult } = require("express-validator");

/**
 * @module cmsValidators
 * @desc Validation middleware for CMS pages/banners. Ensures required fields are present and valid.
 */

/**
 * @function validateCMS
 * @desc Express middleware array for validating CMS requests.
 *       Checks that required fields are present and have valid values.
 * @middleware
 * @param {string} title - Must not be empty. Title of the CMS page/banner.
 * @param {string} type - Must be either 'page' or 'banner'.
 * @param {string} [status] - Optional. If provided, must be 'active' or 'inactive'.
 * @returns {function} Calls next() if validation passes, otherwise responds with 400 and error details.
 * @example
 * router.post('/cms', validateCMS, cmsController.createCMS);
 */
exports.validateCMS = [
  body("title").notEmpty().withMessage("Title is required"),

  body("type")
    .isIn(["user", "customer", "vendor", "delivery"])
    .withMessage("Type must be one of: user, customer, vendor, delivery"),

  body("status")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("Status must be active or inactive"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
