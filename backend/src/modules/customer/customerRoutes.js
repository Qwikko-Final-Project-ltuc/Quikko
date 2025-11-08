const express = require("express");
const customerController = require("./customerController");
const { protect,authorizeRole,optionalProtect } = require("../../middleware/authMiddleware");
const { getAllProductsValidator } = require("./customerValidators");
const router = express.Router();
const identifyCustomer = require("../../middleware/identifyCustomer");
const guestToken = require("../../middleware/guestToken");
const customerModel = require("./customerModel");
const db = require("../../config/db");

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
router.get("/products",guestToken, customerController.getAllProducts);
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
//payment routes
router.get("/payment", protect, customerController.paymentController.getUserPayments);
router.post("/payment", protect, customerController.paymentController.createPayment);
router.delete("/payment/:id", protect, customerController.paymentController.deletePayment);
//reorder
router.post("/:orderId/reorder", protect, customerController.reorder);
//delete profile
router.delete("/profile",  protect, customerModel.deleteProfile);
//assign guest cart to user 
router.post("/assign-guest-to-user",  customerController.assignGuestToUser);

// wishList
router.get('/wishlist', protect, customerController.getWishlist);

router.post('/wishlist', protect, customerController.addWishlist);

router.delete('/wishlist/:id', protect, customerController.removeWishlist);


//guestToken
router.get("/get-guest-token", guestToken, (req, res) => {
  res.json({ message: "Guest token sent" });
});


router.post("/contactUs",customerController.sendContactMessage);
// Loyalty Points Routes
/**
 * @route GET /api/customer/loyalty
 * @desc Get loyalty points balance and history
 * @access Private (customer)
 */
router.get(
  "/loyalty",
  protect,
  authorizeRole('customer'),
  customerController.getLoyaltyPoints
);

/**
 * @route POST /api/customer/loyalty/add
 * @desc Add loyalty points after completing an order
 * @access Private (customer)
 */
router.post(
  "/loyalty/add",
  protect,
  authorizeRole('customer'),
  customerController.addLoyaltyPoints
);

/**
 * @route POST /api/customer/loyalty/redeem
 * @desc Redeem loyalty points for a discount
 * @access Private (customer)
 */
router.post(
  "/loyalty/redeem",
  protect,
  authorizeRole('customer'),
  customerController.redeemLoyaltyPoints
);



router.get("/most-popular", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
          p.id,
          p.name,
          p.price,
          COALESCE(SUM(oi.quantity), 0) AS total_sold,
          COALESCE(
            json_agg(pi.image_url) FILTER (WHERE pi.id IS NOT NULL),
            '[]'
          ) AS images
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      GROUP BY p.id
      HAVING COALESCE(SUM(oi.quantity), 0) > 0
      ORDER BY total_sold DESC
      LIMIT 10;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/newest", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
          p.id,
          p.name,
          p.price,
          COALESCE(
            json_agg(pi.image_url) FILTER (WHERE pi.id IS NOT NULL),
            '[]'
          ) AS images
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT 10;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/top-rated", async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        p.id,
        p.name,
        p.price,
        p.description,
        COALESCE(json_agg(pi.image_url) FILTER (WHERE pi.id IS NOT NULL), '[]') AS images,
        ROUND(AVG(r.rating), 2) AS avg_rating,
        COUNT(r.id) AS rating_count
      FROM products p
      LEFT JOIN product_reviews r ON r.product_id = p.id AND r.is_deleted = false
      LEFT JOIN product_images pi ON pi.product_id = p.id
      WHERE p.is_deleted = false
      GROUP BY p.id
      HAVING COUNT(r.id) > 0
      ORDER BY avg_rating DESC, rating_count DESC
      LIMIT 10
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch top-rated products" });
  }
});

const pool = require("../../config/db");

router.get('/delivery/requested-orders', protect, async (req, res) => {
  try {
    console.log('🔐 === START GET REQUESTED ORDERS ===');
    console.log('👤 req.user id:', req.user.id);

    // ابحث عن شركة التوصيل التابعة للمستخدم
    const companyResult = await pool.query(
      'SELECT id FROM delivery_companies WHERE user_id = $1',
      [req.user.id]
    );

    if (companyResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'User is not associated with any delivery company'
      });
    }

    const deliveryCompanyId = companyResult.rows[0].id;
    console.log('🏢 Found delivery company ID:', deliveryCompanyId);

    const orders = await customerModel.getRequestedOrdersForDelivery(deliveryCompanyId);
    console.log('📦 Raw orders found:', orders.length);

    // فقط الطلبات التي كل عناصرها vendor_status = 'accepted'
    const validOrders = orders.filter(order =>
      Array.isArray(order.all_vendor_statuses) &&
      order.all_vendor_statuses.every(status => status === 'accepted')
    );

    console.log('✅ Accepted-only orders:', validOrders.length);

    // إزالة الحقل المؤقت من النتيجة النهائية
    const finalOrders = validOrders.map(({ all_vendor_statuses, ...order }) => order);

    res.json({
      success: true,
      data: finalOrders
    });

  } catch (error) {
    console.error('❌ Get requested orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});


// في customerRoutes.js أو deliveryRoutes.js
router.post('/:orderId/accept', protect, async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log('✅ Accept order request - Order ID:', orderId);
    console.log('👤 req.user:', req.user);

    // البحث عن شركة التوصيل المرتبطة بالمستخدم
    const companyResult = await pool.query(
      'SELECT id FROM delivery_companies WHERE user_id = $1',
      [req.user.id]
    );
    
    console.log('🔍 Company search result:', companyResult.rows);
    
    if (companyResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'User is not associated with any delivery company'
      });
    }
    
    const deliveryCompanyId = companyResult.rows[0].id;
    console.log('🏢 Using delivery company ID:', deliveryCompanyId);

    // 1. تحديث حالة طلب التوصيل المقبول
    const updateResult = await pool.query(
      `UPDATE delivery_requests 
       SET status = 'accepted', accepted_at = CURRENT_TIMESTAMP 
       WHERE order_id = $1 AND delivery_company_id = $2 AND status = 'pending'`,
      [orderId, deliveryCompanyId]
    );

    console.log('📝 Delivery request update result:', updateResult.rowCount);

    if (updateResult.rowCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'Delivery request not found or already processed'
      });
    }

    // 2. رفض باقي طلبات التوصيل لهذا الطلب
    const rejectResult = await pool.query(
      `UPDATE delivery_requests 
       SET status = 'rejected' 
       WHERE order_id = $1 AND delivery_company_id != $2 AND status = 'pending'`,
      [orderId, deliveryCompanyId]
    );

    console.log('❌ Rejected other requests:', rejectResult.rowCount);

    // 3. تحديث حالة الطلب وتعيين شركة التوصيل
    const orderUpdateResult = await pool.query(
      `UPDATE orders 
       SET delivery_company_id = $1, status = 'accepted' 
       WHERE id = $2`,
      [deliveryCompanyId, orderId]
    );

    console.log('📦 Order update result:', orderUpdateResult.rowCount);

    res.json({
      success: true,
      message: 'Order accepted successfully'
    });

  } catch (error) {
    console.error('❌ Accept order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});


router.get('/delivery/accepted-orders', protect, async (req, res) => {
  try {
    console.log('🔐 Getting accepted orders...');
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    const companyResult = await pool.query(
      'SELECT id FROM delivery_companies WHERE user_id = $1',
      [req.user.id]
    );
    
    if (companyResult.rows.length === 0) {
      return res.json({
        success: true,
        data: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalItems: 0,
          hasNext: false,
          hasPrev: false
        }
      });
    }
    
    const deliveryCompanyId = companyResult.rows[0].id;

    const countResult = await pool.query(
      `SELECT COUNT(DISTINCT o.id) as total_count
       FROM orders o
       WHERE o.delivery_company_id = $1 
         AND o.status IN ('accepted', 'processing', 'out_for_delivery')`,
      [deliveryCompanyId]
    );

    const totalItems = parseInt(countResult.rows[0].total_count);
    const totalPages = Math.ceil(totalItems / limit);

    const orders = await pool.query(
      `SELECT 
        o.id,
        o.status as order_status,
        o.total_amount,
        o.final_amount,
        o.delivery_fee,
        o.total_with_shipping,
        o.created_at,
        a.address_line1, 
        a.city, 
        a.state,
        u.name as customer_name, 
        u.phone as customer_phone,
        COUNT(oi.id) as items_count,
        SUM(oi.quantity) as total_quantity
      FROM orders o
      JOIN addresses a ON o.address_id = a.id
      JOIN users u ON o.customer_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.delivery_company_id = $1 
        AND o.status IN ('accepted', 'processing', 'out_for_delivery')
      GROUP BY o.id, a.id, u.id
      ORDER BY 
        CASE o.status 
          WHEN 'out_for_delivery' THEN 1
          WHEN 'processing' THEN 2
          WHEN 'accepted' THEN 3
        END, o.created_at ASC
      LIMIT $2 OFFSET $3`,
      [deliveryCompanyId, limit, offset]
    );

    console.log('📦 Accepted orders found:', orders.rows.length);
    
    res.json({
      success: true,
      data: orders.rows,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: totalItems,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        limit: limit
      }
    });

  } catch (error) {
    console.error('❌ Get accepted orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.patch('/:orderId/status',  async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const deliveryCompanyId = req.user.delivery_company_id;

    const orderCheck = await pool.query(
      'SELECT id FROM orders WHERE id = $1 AND delivery_company_id = $2',
      [orderId, deliveryCompanyId]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    const order = await orderService.updateOrderStatus(orderId, status);
    
    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

router.post(
  "/calculate-delivery-preview",
  protect,
  authorizeRole('customer'),
  customerController.calculateDeliveryPreview
);

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