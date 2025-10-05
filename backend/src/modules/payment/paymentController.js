const paymentService = require("./paymentService");

/**
 * @module PaymentController
 * @desc Handles all payment-related operations including creation, execution, and cancellation of payments.
 */

/**
 * @function createPayment
 * @desc Initiates a new payment transaction with the specified amount.
 * @access Public
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {number} req.body.amount - The amount to be paid
 * @param {Object} res - Express response object
 * @returns {Object} 200 - Payment object returned from payment service
 * @returns {500} - Internal server error
 *
 * @example
 * POST /api/payment/create
 * Body: { "amount": 10.00 }
 * Response:
 * {
 *   "id": "PAYID-12345",
 *   "state": "created",
 *   "amount": 10.00,
 *   "currency": "USD",
 *   "links": [...]
 * }
 */
exports.createPayment = async (req, res) => {
  try {
    const { amount } = req.body;
    const payment = await paymentService.createPayment(amount);
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function executePayment
 * @desc Executes an existing payment after approval from the payer.
 * @access Public
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.paymentId - Payment ID received from payment creation
 * @param {string} req.query.PayerID - Payer ID returned from payment provider
 * @param {Object} res - Express response object
 * @returns {Object} 200 - Confirmation of payment execution
 * @returns {500} - Internal server error
 *
 * @example
 * GET /api/payment/execute?paymentId=PAYID-12345&PayerID=PAYERID-6789
 * Response:
 * {
 *   "status": "success",
 *   "payment": {
 *      "id": "PAYID-12345",
 *      "state": "approved",
 *      "amount": 1.00,
 *      "currency": "USD"
 *   }
 * }
 */
exports.executePayment = async (req, res) => {
  try {
    const { paymentId, PayerID } = req.query;
    const amount = 1.00; // Hardcoded for now, can be dynamic
    const payment = await paymentService.executePayment(paymentId, PayerID, amount);
    res.redirect(`http://localhost:5173/orders`);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function cancelPayment
 * @desc Handles payment cancellation.
 * @access Public
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {string} 200 - Message confirming cancellation
 *
 * @example
 * GET /api/payment/cancel
 * Response: "Payment canceled"
 */
exports.cancelPayment = (req, res) => {
  res.send("Payment canceled");
};

