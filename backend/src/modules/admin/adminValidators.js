const { body, param, query, validationResult } = require('express-validator');

/**
 * @module AdminValidator
 * @desc Middleware functions to validate Admin routes (params, body, query)
 */

/**
 * @function validate
 * @desc Middleware to check validation results from express-validator.
 *       Returns 400 with errors if any validation fails.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * @function validateVendorId
 * @desc Validates `vendorId` param in request.
 * 
 * @returns {Array} Array of express-validator middlewares
 * @example
 * router.put('/vendors/:vendorId/approve', validateVendorId(), validate, adminController.approveVendor);
 */
exports.validateVendorId = () => [
  param('vendorId')
    .exists().withMessage('vendorId param is required')
    .isInt({ gt: 0 }).withMessage('vendorId must be a positive integer')
];

/**
 * @function validateDeliveryId
 * @desc Validates `deliveryId` param in request.
 * 
 * @returns {Array} Array of express-validator middlewares
 * @example
 * router.put('/deliveries/:deliveryId/reject', validateDeliveryId(), validate, adminController.rejectDelivery);
 */
exports.validateDeliveryId = () => [
  param('deliveryId')
    .exists().withMessage('deliveryId param is required')
    .isInt({ gt: 0 }).withMessage('deliveryId must be a positive integer')
];

/**
 * @function validateNotificationBody
 * @desc Validates body of notification request
 *       Requires either userId or role, plus title and message.
 * 
 * @returns {Array} Array of express-validator middlewares
 * @example
 * router.post('/notifications', validateNotificationBody(), validate, notificationController.sendNotification);
 */
exports.validateNotificationBody = () => [
  body('userId').optional().isInt({ gt: 0 }).withMessage('userId must be a positive integer'),
  body('role').optional().isString().withMessage('role must be a string'),
  body('title').exists().withMessage('title is required').isString(),
  body('message').exists().withMessage('message is required').isString(),
  body('type').optional().isString(),
  body().custom((body) => {
    if (!body.userId && !body.role) {
      throw new Error('Either userId or role must be provided');
    }
    return true;
  })
];

/**
 * @function validateQueryStatus
 * @desc Validates a `status` query param for orders or deliveries.
 * 
 * @param {Array<string>} allowedStatuses - List of allowed status strings
 * @returns {Array} Array of express-validator middlewares
 * @example
 * router.get('/orders', validateQueryStatus(['pending', 'completed']), validate, adminController.getOrders);
 */
exports.validateQueryStatus = (allowedStatuses = []) => [
  query('status')
    .optional()
    .isString()
    .custom((value) => {
      if (allowedStatuses.length > 0 && !allowedStatuses.includes(value)) {
        throw new Error(`Invalid status, allowed: ${allowedStatuses.join(', ')}`);
      }
      return true;
    })
];
