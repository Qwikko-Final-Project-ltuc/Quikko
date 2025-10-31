const express = require('express');
const router = express.Router();
const productController = require('./productController');
const { createProductValidator } = require("./productValidators");
const { protect ,authorizeRole} = require("../../middleware/authMiddleware");

/**
 * ===============================
 * Product Routes
 * ===============================
 * @module ProductRoutes
 * @desc Routes for managing products including fetching, creating, updating, and deleting products.
 *       Protected routes require authentication (JWT token) and input validation where applicable.
 */

/**
 * @route GET /api/products/:id
 * @desc Retrieve a single product by its ID
 * @access Public
 * @param {string} id.path.required - Product ID
 * @returns {Object} 200 - Product details with vendor and category information
 * @returns {Object} 404 - Product not found
 * @returns {Object} 500 - Internal server error
 */
router.get('/:id', productController.getProduct);

/**
 * @route POST /api/products
 * @desc Create a new product
 * @access Protected (Vendor only)
 * @middleware protect - Validates JWT token
 * @middleware createProductValidator - Validates product input data
 * @param {Object} body.required - Product data (name, price, stock, category, etc.)
 * @returns {Object} 201 - Created product details
 * @returns {Object} 400 - Validation error
 * @returns {Object} 500 - Internal server error
 */
router.post("/", protect,authorizeRole('vendor'), createProductValidator, productController.createProduct);

/**
 * @route PUT /api/products/:id
 * @desc Update an existing product
 * @access Protected (Vendor only)
 * @middleware protect - Validates JWT token
 * @param {string} id.path.required - Product ID
 * @param {Object} body.required - Updated product data
 * @returns {Object} 200 - Updated product details
 * @returns {Object} 404 - Product not found
 * @returns {Object} 500 - Internal server error
 */
router.put("/:id", protect,authorizeRole('vendor'), productController.updateProduct);

/**
 * @route DELETE /api/products/:id
 * @desc Delete a product
 * @access Protected (Vendor only)
 * @middleware protect - Validates JWT token
 * @param {string} id.path.required - Product ID
 * @returns {Object} 200 - Success message
 * @returns {Object} 404 - Product not found
 * @returns {Object} 500 - Internal server error
 */
router.delete("/:id", protect,authorizeRole('vendor'), productController.deleteProduct);

// أي مستخدم مسجل يمكنه إضافة مراجعة إذا اشترى المنتج
router.post("/review", protect, productController.addReview);

// عرض التعليقات لأي شخص
router.get("/review/:product_id", productController.getProductReviews);

// الأدمن فقط يمكنه حذف تعليق
router.delete("/review/:review_id", protect, authorizeRole("admin"), productController.deleteReview);
router.post("/upload", protect, productController.uploadProductImages);

module.exports = router;



/* =================== Swagger Documentation =================== */

/**
 * @swagger
 * tags:
 *   - name: Products
 *     description: Product management endpoints
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
 *   /api/products/{id}:
 *     get:
 *       summary: Get product by ID
 *       tags: [Products]
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Product details
 *         404:
 *           description: Product not found
 *         500:
 *           description: Internal server error
 *
 *     put:
 *       summary: Update product by ID
 *       tags: [Products]
 *       security:
 *         - bearerAuth: []
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
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 price:
 *                   type: number
 *                 stock_quantity:
 *                   type: integer
 *                 images:
 *                   type: array
 *                   items:
 *                     type: string
 *                 category_id:
 *                   type: integer
 *                 variants:
 *                   type: array
 *                   items:
 *                     type: object
 *       responses:
 *         200:
 *           description: Product updated successfully
 *         404:
 *           description: Product not found
 *         500:
 *           description: Internal server error
 *
 *     delete:
 *       summary: Delete product by ID
 *       tags: [Products]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Product deleted successfully
 *         404:
 *           description: Product not found
 *         500:
 *           description: Internal server error
 *
 *   /api/products:
 *     post:
 *       summary: Add a new product
 *       tags: [Products]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - name
 *                 - price
 *               properties:
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 price:
 *                   type: number
 *                 stock_quantity:
 *                   type: integer
 *                 images:
 *                   type: array
 *                   items:
 *                     type: string
 *                 category_id:
 *                   type: integer
 *                 variants:
 *                   type: array
 *                   items:
 *                     type: object
 *       responses:
 *         201:
 *           description: Product added successfully
 *         400:
 *           description: Validation error
 *         500:
 *           description: Internal server error
 */