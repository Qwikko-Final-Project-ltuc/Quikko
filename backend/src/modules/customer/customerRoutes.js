const express = require("express");
const customerController = require("./customerController");
const { protect,authorizeRole,optionalProtect } = require("../../middleware/authMiddleware");
const { getAllProductsValidator } = require("./customerValidators");
const router = express.Router();
const identifyCustomer = require("../../middleware/identifyCustomer");
const guestToken = require("../../middleware/guestToken");
const customerModel = require("./customerModel");

/**
 * @route GET /api/customer/
 * @desc Get the authenticated customer's profile
 * @access Private
 */
router.get('/profile', protect,authorizeRole('customer'),  customerController.getProfile);

/**
 * @route PUT /api/customer/
 * @desc Update the authenticated customer's profile
 * @access Private
 */
router.put('/profile', protect,authorizeRole('customer'),  customerController.updateProfile);

/**
 * @route GET /api/customer/stores/:storeId
 * @desc Get details of a specific store by ID
 * @access Public
 * @param {number} storeId - Store ID
 */
router.get("/stores/:storeId",  customerController.fetchStoreDetails);

/**
 * @route POST /api/customer/checkout
 * @desc Place an order from the authenticated customer's cart (Cash on Delivery)
 * @access Private
 */
router.post("/checkout", protect,authorizeRole('customer'),  customerController.postOrderFromCart);

/**
 * @route GET /api/customer/orders/:orderId
 * @desc Get details of a specific order for the authenticated customer
 * @access Private
 * @param {number} orderId - Order ID
 */
router.get("/orders/:orderId", protect,authorizeRole('customer'), customerController.getOrderDetails);

/**
 * @route GET /api/customer/orders/:orderId/track
 * @desc Track the status of a specific order
 * @access Private
 * @param {number} orderId - Order ID
 */
router.get("/orders/:orderId/track", protect,authorizeRole('customer'),  customerController.trackOrder);

/**
 * @route GET /api/customer/cart
 * @desc Get all carts for the authenticated customer
 * @access Private
 */
router.get("/cart",optionalProtect,guestToken,identifyCustomer, customerController.getAllCarts); 

/**
 * @route GET /api/customer/cart/:id
 * @desc Get a specific cart by ID
 * @access Private
 * @param {number} id - Cart ID
 */
router.get("/cart/:id",optionalProtect,guestToken,identifyCustomer, customerController.getCartById);

/**
 * @route POST /api/customer/cart
 * @desc Create a new cart for the authenticated customer
 * @access Private
 */
router.post("/cart",optionalProtect,guestToken,identifyCustomer, customerController.createCart); 

/**
 * @route PUT /api/customer/cart/:id
 * @desc Update a specific cart by ID
 * @access Private
 * @param {number} id - Cart ID
 */
router.put("/cart/:id",optionalProtect,guestToken,identifyCustomer,  customerController.updateCart); 

/**
 * @route DELETE /api/customer/cart/:id
 * @desc Delete a specific cart by ID
 * @access Private
 * @param {number} id - Cart ID
 */
router.delete("/cart/:id",optionalProtect,guestToken,identifyCustomer,  customerController.deleteCart); 

/**
 * @route POST /api/customer/cart/items
 * @desc Add an item to a cart
 * @access Private
 * @body {number} cart_id
 * @body {number} product_id
 * @body {number} quantity
 * @body {string} [variant]
 */
router.post("/cart/items",optionalProtect,guestToken,identifyCustomer, customerController.addItem);

/**
 * @route PUT /api/customer/cart/items/:id
 * @desc Update an item in the cart
 * @access Private
 * @param {number} id - Item ID
 * @body {number} quantity
 * @body {string} [variant]
 */
router.put("/cart/items/:id",optionalProtect,guestToken,identifyCustomer,  customerController.updateItem); 

/**
 * @route DELETE /api/customer/cart/items/:id
 * @desc Delete an item from the cart
 * @access Private
 * @param {number} id - Item ID
 */
router.delete("/cart/items/:id",optionalProtect,guestToken,identifyCustomer,  customerController.deleteItem); 

/**
 * @route GET /api/customer/products
 * @desc Get all products with optional filters, pagination, and search
 * @access Public
 * @query {string} [search] - Search term
 * @query {number} [categoryId] - Category ID
 * @query {number} [page=1] - Page number
 * @query {number} [limit=10] - Items per page
 *///getAllProductsValidator,
router.get("/products", customerController.getAllProducts);
/**
 * @module OrdersRoutes
 * @desc Routes for customer order management. 
 *       All routes require authentication via JWT token.
 */

/**
 * @route GET /api/orders
 * @desc Retrieve all orders for the currently authenticated customer.
 * @access Protected (requires JWT token)
 * @middleware protect - Validates JWT and attaches user info to req.user
 * @returns {Array<Object>} 200 - Array of order objects. Each object contains:
 *   - id {number} - Order ID
 *   - total_amount {number} - Total amount for the order
 *   - status {string} - Order status (pending, processing, delivered, etc.)
 *   - payment_status {string} - Payment status (paid/unpaid)
 *   - shipping_address {string} - Shipping address
 *   - created_at {string} - Order creation timestamp
 *   - items {Array<Object>} - List of items in the order
 *       - product_id {number} - Product ID
 *       - name {string} - Product name
 *       - price {number} - Price per unit
 *       - quantity {number} - Quantity ordered
 * @returns {404} - No orders found for the customer
 * @returns {500} - Internal server error
 * 
 * @example
 * GET /api/orders
 * Response:
 * [
 *   {
 *     id: 1,
 *     total_amount: 150,
 *     status: "pending",
 *     payment_status: "unpaid",
 *     shipping_address: "Amman, Jordan",
 *     created_at: "2025-09-20T12:00:00Z",
 *     items: [
 *       { product_id: 10, name: "Product A", price: 50, quantity: 2 },
 *       { product_id: 12, name: "Product B", price: 25, quantity: 2 }
 *     ]
 *   }
 * ]
 */
router.get('/orders', protect, customerController.getOrders);
router.get("/stores/:id/products", customerController.getStoreProducts);
router.put("/:orderId/payment", customerController.updatePaymentStatus);
router.get('/sorted', customerController.getProductsWithSorting);
// Routes
router.get("/payment", protect, customerController.paymentController.getUserPayments);
router.post("/payment", protect, customerController.paymentController.createPayment);
router.delete("/payment/:id", protect, customerController.paymentController.deletePayment);
router.post("/:orderId/reorder", protect, customerController.reorder);
router.delete("/profile",  protect, customerModel.deleteProfile);

// wishList
router.get('/wishlist', protect, customerController.getWishlist);

router.post('/wishlist', protect, customerController.addWishlist);

router.delete('/wishlist/:id', protect, customerController.removeWishlist);

module.exports = router;


/* =================== Swagger Documentation =================== */

/**
 * @swagger
 * tags:
 *   - name: Orders
 *     description: Customer orders endpoints
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
 *   /api/orders:
 *     get:
 *       summary: Get all orders for the logged-in customer
 *       tags: [Orders]
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         200:
 *           description: List of customer orders returned
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     total_amount:
 *                       type: number
 *                     status:
 *                       type: string
 *                     payment_status:
 *                       type: string
 *                     shipping_address:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           product_id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           price:
 *                             type: number
 *                           quantity:
 *                             type: integer
 *         404:
 *           description: No orders found
 *         500:
 *           description: Internal server error
 */

module.exports = router;



/**
 * ===========================
 *      Swagger Docs
 * ===========================
 */

/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Customer related APIs
 */

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Get logged-in customer profile
 *     tags: [Customers]
 *     security:
 *       - customerAuth: []
 *     responses:
 *       200:
 *         description: Customer profile fetched successfully
 *       500:
 *         description: Error fetching profile
 *
 *   put:
 *     summary: Update customer profile
 *     tags: [Customers]
 *     security:
 *       - customerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 */

/**
 * @swagger
 * /api/customers/stores/{storeId}:
 *   get:
 *     summary: Get store details with its products
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Store details fetched
 *       404:
 *         description: Store not found
 */

/**
 * @swagger
 * /api/customers/checkout:
 *   post:
 *     summary: Place a new order (COD)
 *     tags: [Customers]
 *     security:
 *       - customerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *                     variant:
 *                       type: object
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order placed successfully
 */

/**
 * @swagger
 * /api/customers/orders/{orderId}:
 *   get:
 *     summary: Get order details
 *     tags: [Customers]
 *     security:
 *       - customerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order details
 */

/**
 * @swagger
 * /api/customers/orders/{orderId}/track:
 *   get:
 *     summary: Track order status
 *     tags: [Customers]
 *     security:
 *       - customerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order status
 */

/**
 * @swagger
 * /api/customers/cart:
 *   get:
 *     summary: Get all carts
 *     tags: [Customers]
 *     security:
 *       - customerAuth: []
 *   post:
 *     summary: Create a new cart
 *     tags: [Customers]
 *     security:
 *       - customerAuth: []
 */

/**
 * @swagger
 * /api/customers/cart/{id}:
 *   get:
 *     summary: Get one cart with items
 *     tags: [Customers]
 *     security:
 *       - customerAuth: []
 *   put:
 *     summary: Update a cart
 *     tags: [Customers]
 *     security:
 *       - customerAuth: []
 *   delete:
 *     summary: Delete a cart
 *     tags: [Customers]
 *     security:
 *       - customerAuth: []
 */

/**
 * @swagger
 * /api/customers/cart/items:
 *   post:
 *     summary: Add item to a cart
 *     tags: [Customers]
 *     security:
 *       - customerAuth: []
 */

/**
 * @swagger
 * /api/customers/cart/items/{id}:
 *   put:
 *     summary: Update an item in a cart
 *     tags: [Customers]
 *     security:
 *       - customerAuth: []
 *   delete:
 *     summary: Delete an item from a cart
 *     tags: [Customers]
 *     security:
 *       - customerAuth: []
 */

/**
 * @swagger
 * /api/customers/products:
 *   get:
 *     summary: Get all products (with filters and search)
 *     tags: [Customers]
 *     security:
 *       - customerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Products list
 */