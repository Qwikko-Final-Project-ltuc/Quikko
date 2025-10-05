const express = require("express");
const router = express.Router();
const paymentController = require("./paymentController");
const { protect }  = require("../../middleware/authMiddleware");

/**
 * @module PaymentRoutes
 * @desc Routes for handling payment operations including creating, executing, and canceling payments.
 */

/**
 * @route POST /api/payment/pay
 * @desc Initiate a new payment request.
 * @access Public (or Protected depending on auth middleware)
 * @body {Object} req.body
 * @body {number} req.body.amount - Amount to be paid
 * @returns {Object} JSON object with payment details
 *
 * @example
 * POST /api/payment/pay
 * {
 *   "amount": 50.00
 * }
 */
router.post("/pay",protect, paymentController.createPayment);

/**
 * @route GET /api/payment/success
 * @desc Execute a successful payment after payer confirmation.
 * @access Public (or Protected depending on auth middleware)
 * @query {string} paymentId - Payment ID returned by payment gateway
 * @query {string} PayerID - Payer ID returned by payment gateway
 * @returns {Object} JSON object with payment status and details
 *
 * @example
 * GET /api/payment/success?paymentId=PAY123&PayerID=PAYER123
 * Response:
 * {
 *   "status": "success",
 *   "payment": { ...paymentDetails }
 * }
 */
router.get("/success", paymentController.executePayment);

/**
 * @route GET /api/payment/cancel
 * @desc Handle payment cancellation by user or gateway.
 * @access Public
 * @returns {string} Simple text response confirming cancellation
 *
 * @example
 * GET /api/payment/cancel
 * Response: "Payment canceled"
 */
router.get("/cancel", paymentController.cancelPayment);

module.exports = router;



/* =================== Swagger Documentation =================== */

/**
 * @swagger
 * tags:
 *   - name: Payments
 *     description: Payment endpoints
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * security:
 *   - bearerAuth: []
 *
 * paths:
 *   /api/payment/pay:
 *     post:
 *       summary: Create a new payment
 *       tags: [Payments]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         description: Payment information
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 amount:
 *                   type: number
 *                   description: Amount to pay
 *       responses:
 *         200:
 *           description: Payment created successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   forwardLink:
 *                     type: string
 *         500:
 *           description: Internal server error
 *
 *   /api/payment/success:
 *     get:
 *       summary: Execute a PayPal payment after approval
 *       tags: [Payments]
 *       parameters:
 *         - name: paymentId
 *           in: query
 *           required: true
 *           schema:
 *             type: string
 *         - name: PayerID
 *           in: query
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         200:
 *           description: Payment executed successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: string
 *                   payment:
 *                     type: object
 *         500:
 *           description: Internal server error
 *
 *   /api/payment/cancel:
 *     get:
 *       summary: Cancel a payment
 *       tags: [Payments]
 *       responses:
 *         200:
 *           description: Payment canceled successfully
 *           content:
 *             text/plain:
 *               schema:
 *                 type: string
 *                 example: Payment canceled
 */