// routes/orders.routes.js
const express = require("express");
const router = express.Router();
const DeliveryController = require("./deliveryController");
const { protect, authorizeRole }  = require("../../middleware/authMiddleware");

/**
 * @route   GET /profile
 * @desc    Get the authenticated delivery company's profile
 * @access  Private (requires auth)
 * @middleware protect - checks JWT token
 * @controller DeliveryController.getCompanyProfile
 */
router.get("/profile/", protect,authorizeRole('delivery'), DeliveryController.getCompanyProfile);

/**
 * @route   PUT /profile
 * @desc    Update the authenticated delivery company's profile
 * @access  Private (requires auth)
 * @middleware protect - checks JWT token
 * @controller DeliveryController.updateCompanyProfile
 */
router.patch(
  "/profile",
  protect,
  authorizeRole("delivery"),
  DeliveryController.updateCompanyProfile
);

/**
 * @route   PUT /orders/:id
 * @desc    Update the status of a specific order by order ID
 * @access  Private (requires auth)
 * @params  id - Order ID (URL param)
 * @middleware protect - checks JWT token
 * @controller DeliveryController.updateOrderStatus
 */
router.put("/orders/:id", protect,authorizeRole('delivery'), DeliveryController.updateOrderStatus);

/**
 * @route   GET /tracking/:orderId
 * @desc    Get tracking information for a specific order
 * @access  Private (requires auth)
 * @params  orderId - Order ID (URL param)
 * @middleware protect - checks JWT token
 * @controller DeliveryController.getTrackingInfo
 */
router.get(
  "/tracking/:orderId",
  protect,
  authorizeRole("delivery"),
  DeliveryController.getTrackingInfo
);

/**
 * @route   GET /orders
 * @desc    List all orders for the authenticated delivery company
 * @access  Private (requires auth)
 * @middleware protect - checks JWT token
 * @controller DeliveryController.listCompanyOrders
 */
router.get("/orders", protect,authorizeRole('delivery'), DeliveryController.listCompanyOrders);

/**
 * @route   GET /coverage
 * @desc    Get coverage areas for the authenticated delivery company
 * @access  Private (requires auth)
 * @middleware protect - checks JWT token
 * @controller DeliveryController.getCoverage
 */
router.get("/coverage", protect,authorizeRole('delivery'), DeliveryController.getCoverage);

/**
 * @route   POST /coverage
 * @desc    Add new coverage areas for the authenticated delivery company
 * @access  Private (requires auth)
 * @body    { areas: Array<string> } - List of areas to add
 * @middleware protect - checks JWT token
 * @controller DeliveryController.addCoverage
 */
router.post("/coverage", protect,authorizeRole('delivery'), DeliveryController.addCoverage);

/**
 * @route   PUT /coverage/:id
 * @desc    Update a specific coverage area for the authenticated delivery company
 * @access  Private (requires auth)
 * @params  id - Coverage ID (URL param)
 * @body    Object - Coverage update payload
 * @middleware protect - checks JWT token
 * @controller DeliveryController.updateCoverage
 */
router.put("/coverage/:id", protect,authorizeRole('delivery'), DeliveryController.updateCoverage);

/**
 * @route   DELETE /coverage/:id
 * @desc    Delete a specific coverage area for the authenticated delivery company
 * @access  Private (requires auth)
 * @params  id - Coverage ID (URL param)
 * @middleware protect - checks JWT token
 * @controller DeliveryController.deleteCoverage
 */
router.delete("/coverage/:id", protect,authorizeRole('delivery'), DeliveryController.deleteCoverage);

/**
 * @route GET /reports
 * @desc Get weekly report for authenticated delivery company
 * @access Private (role: delivery)
 */
router.get("/reports", protect, authorizeRole("delivery"),DeliveryController.getDeliveryReport);


router.put("/:id/paymentstatus", protect, authorizeRole("delivery"),DeliveryController.updatePaymentStatus);


module.exports = router;

/* =================== Swagger Documentation =================== */

/**
 * @swagger
 * tags:
 *   - name: Delivery
 *     description: Delivery company related endpoints
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
 *   /api/delivery/orders/{id}:
 *     put:
 *       summary: Update order status
 *       tags: [Delivery]
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *           description: Order ID
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [status, company_id]
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [pending, processing, out_for_delivery, delivered, cancelled]
 *                 company_id:
 *                   type: integer
 *       responses:
 *         200:
 *           description: Order status updated
 *         400:
 *           description: Invalid input
 *         403:
 *           description: Not authorized
 *         404:
 *           description: Order not found
 *
 *   /api/delivery/orders/{companyId}:
 *     get:
 *       summary: Get all orders for a delivery company
 *       tags: [Delivery]
 *       parameters:
 *         - in: path
 *           name: companyId
 *           required: true
 *           schema:
 *             type: integer
 *           description: Company ID
 *       responses:
 *         200:
 *           description: List of orders
 *         400:
 *           description: Invalid company ID
 *
 *   /api/delivery/tracking/{orderId}:
 *     get:
 *       summary: Get tracking info for an order
 *       tags: [Delivery]
 *       parameters:
 *         - in: path
 *           name: orderId
 *           required: true
 *           schema:
 *             type: integer
 *           description: Order ID
 *       responses:
 *         200:
 *           description: Tracking info returned
 *         404:
 *           description: Order not found
 *
 *   /api/delivery/coverage/{companyId}:
 *     get:
 *       summary: Get coverage areas for a delivery company
 *       tags: [Delivery]
 *       parameters:
 *         - in: path
 *           name: companyId
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Company coverage returned
 *         404:
 *           description: Company not found
 *     post:
 *       summary: Add or update coverage areas for a company
 *       tags: [Delivery]
 *       parameters:
 *         - in: path
 *           name: companyId
 *           required: true
 *           schema:
 *             type: integer
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [areas]
 *               properties:
 *                 areas:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: List of areas
 *       responses:
 *         200:
 *           description: Coverage areas updated
 *         400:
 *           description: Invalid input
 *
 *   /api/delivery/profile/{id}:
 *     get:
 *       summary: Get company profile
 *       tags: [Delivery]
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Company profile returned
 *         404:
 *           description: Company not found
 *     put:
 *       summary: Update company profile
 *       tags: [Delivery]
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 company_name:
 *                   type: string
 *                 coverage_areas:
 *                   type: array
 *                   items:
 *                     type: string
 *       responses:
 *         200:
 *           description: Company profile updated
 *         400:
 *           description: Invalid input
 *         404:
 *           description: Company not found
 */
