const express = require('express');
const router = express.Router();
const vendorController = require('./vendorController');
const { protect,authorizeRole } = require('../../middleware/authMiddleware');
const { updateOrderStatusValidator } = require('./vendorValidators');

/**
 * ===============================
 * Vendor Routes
 * ===============================
 * @module VendorRoutes
 * @desc Routes to manage vendors, their orders, products, and profile.
 */

/**
 * @route GET /stores
 * @desc Get all vendors
 * @access Public
 * @returns {Array<Object>} Array of vendor records
 */
router.get('/stores',protect, vendorController.getVendors);

/**
 * @route GET /reports/:vendorId
 * @desc Get report for a specific vendor by vendorId
 * @access Public
 * @param {string|number} vendorId - ID of the vendor
 * @returns {Object} Vendor report including total orders and total sales
 */
router.get("/reports/:vendorId",protect,authorizeRole('vendor'), vendorController.getVendorReport);

/**
 * @route GET /reports
 * @desc Get report for the currently logged-in vendor
 * @access Protected
 * @returns {Object} Vendor report including total orders and total sales
 */
router.get("/reports", protect,authorizeRole('vendor'), vendorController.getVendorReport);

/**
 * @route GET /orders
 * @desc Get all orders for the logged-in vendor
 * @access Protected
 * @returns {Array<Object>} Array of orders with items and product details
 */
router.get('/orders', protect,authorizeRole('vendor'), vendorController.getOrders);

/**
 * @route PUT /orders/:id
 * @desc Update the status of an order for the logged-in vendor
 * @access Protected
 * @param {string|number} id - Order ID
 * @body {string} status - New status for the order
 * @returns {Object} Updated order record
 */
router.put('/orders/:id', protect,authorizeRole('vendor'), updateOrderStatusValidator, vendorController.updateOrderStatus);

/**
 * @route GET /products
 * @desc Get all products of the logged-in vendor
 * @access Protected
 * @returns {Array<Object>} Array of product records
 */
router.get("/products", protect,authorizeRole('vendor'), vendorController.getProducts);

/**
 * @route GET /profile
 * @desc Get profile of the logged-in vendor
 * @access Protected
 * @returns {Object} Vendor profile
 */
router.get("/profile", protect,authorizeRole('vendor'), vendorController.getProfile);

/**
 * @route PUT /profile
 * @desc Update profile of the logged-in vendor
 * @access Protected
 * @body {Object} profileData - Vendor profile fields to update
 * @returns {Object} Updated vendor profile
 */
router.put("/profile", protect,authorizeRole('vendor'), vendorController.updateProfile);

module.exports = router;




/* =================== Swagger Documentation =================== */

/**
 * @swagger
 * tags:
 *   - name: Vendors
 *     description: Vendor management endpoints
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
 *   /api/vendor/stores:
 *     get:
 *       summary: List all vendors
 *       tags: [Vendors]
 *       responses:
 *         200:
 *           description: Array of vendors
 *
 *   /api/vendor/reports/{vendorId}:
 *     get:
 *       summary: Get vendor report
 *       tags: [Vendors]
 *       parameters:
 *         - name: vendorId
 *           in: path
 *           required: true
 *           schema:
 *             type: integer
 *           description: Vendor ID
 *       responses:
 *         200:
 *           description: Vendor report
 *
 *   /api/vendor/orders:
 *     get:
 *       summary: Get all orders for the vendor
 *       tags: [Vendors]
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         200:
 *           description: Array of orders
 *
 *   /api/vendor/orders/{id}:
 *     put:
 *       summary: Update order status
 *       tags: [Vendors]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - name: id
 *           in: path
 *           required: true
 *           schema:
 *             type: integer
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - status
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [pending, shipped, delivered, cancelled]
 *       responses:
 *         200:
 *           description: Updated order
 *         400:
 *           description: Validation error
 *
 *   /api/vendor/products:
 *     get:
 *       summary: Get all products for the vendor
 *       tags: [Vendors]
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         200:
 *           description: Array of products
 *
 *   /api/vendor/profile:
 *     get:
 *       summary: Get vendor profile
 *       tags: [Vendors]
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         200:
 *           description: Vendor profile
 *
 *     put:
 *       summary: Update vendor profile
 *       tags: [Vendors]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 store_name:
 *                   type: string
 *                 store_slug:
 *                   type: string
 *                 store_logo:
 *                   type: string
 *                 store_banner:
 *                   type: string
 *                 description:
 *                   type: string
 *                 status:
 *                   type: string
 *                 contact_email:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 address:
 *                   type: string
 *                 social_links:
 *                   type: object
 *       responses:
 *         200:
 *           description: Updated vendor profile
 */