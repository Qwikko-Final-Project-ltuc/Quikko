const customerService = require("./customerService");
const { validationResult } = require("express-validator");
const customerModel = require("./customerModel");

/**
 * @module CustomerController
 * @desc Controller handling customer-related endpoints including profile, store details,
 *       orders, carts, cart items, and products.
 */

/**
 * @function getProfile
 * @desc Fetch the profile of the authenticated customer.
 * @route GET /api/customer/profile
 * @access Private
 * @returns {Object} Customer profile
 */
exports.getProfile = async (req, res) => {
  try {
    const user_id = req.user.id;
    const profile = await customerModel.findById(user_id);
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching profile");
  }
};

/**
 * @function updateProfile
 * @desc Update the profile of the authenticated customer.
 * @route PUT /api/customer/profile
 * @access Private
 * @body {string} name - Customer name
 * @body {string} phone - Customer phone
 * @body {string} address - Customer address
 * @returns {Object} Updated profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { name, phone, address } = req.body;
    const updatedProfile = await customerModel.updateById(
      user_id,
      name,
      phone,
      address
    );
    res.json(updatedProfile);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating profile");
  }
};

/**
 * @function fetchStoreDetails
 * @desc Get details of a specific store by its ID.
 * @route GET /api/customer/store/:storeId
 * @access Public
 * @param {number} storeId - ID of the store
 * @returns {Object} Store details
 */
exports.fetchStoreDetails = async function (req, res) {
  try {
    const { storeId } = req.params;

    if (isNaN(storeId)) {
      return res.status(400).json({ error: "Invalid store ID" });
    }

    const store = await customerModel.getStoreById(storeId);

    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    res.json({
      message: "Store details fetched successfully",
      data: store,
    });
  } catch (err) {
    console.error("Error fetching store details:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @function postOrderFromCart
 * @desc Place an order from the customer's cart (Cash on Delivery).
 * @route POST /api/customer/orders
 * @access Private
 * @body {number} cart_id - Cart ID
 * @body {Object} address - Address object with address_line1 and city
 * @returns {Object} Order details
 */
exports.postOrderFromCart = async function (req, res) {
  try {
    const userId = req.user.id;
    const { cart_id, address, paymentMethod, paymentData } = req.body;

    if (!cart_id || typeof cart_id !== "number") {
      return res.status(400).json({ error: "cart_id must be a valid number" });
    }

    if (!address || !address.address_line1 || !address.city) {
      return res.status(400).json({
        error: "Address must include at least address_line1 and city",
      });
    }
    const normalizedPaymentData = {
      transactionId:
        paymentData.transactionId || paymentData.transaction_id || null,
      card_last4: paymentData.card_last4 || null,
      card_brand: paymentData.card_brand || null,
      expiry_month: paymentData.expiry_month || null,
      expiry_year: paymentData.expiry_year || null,
    };
    // ينفذ دالة الموديل لإنشاء الأوردر + تسجيل الدفع
    const order = await customerModel.placeOrderFromCart({
      userId,
      cartId: cart_id,
      address,
      paymentMethod, // "cod" أو "paypal"/"credit_card"
      paymentData: normalizedPaymentData,
    });
    console.log("checkout req.body:", req.body);

    res.status(201).json({
      message: `Order placed successfully (${paymentMethod.toUpperCase()})`,
      order,
    });
  } catch (err) {
    console.error("Error placing order from cart:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @function getOrderDetails
 * @desc Get details of a specific order for the authenticated customer.
 * @route GET /api/customer/orders/:orderId
 * @access Private
 * @param {number} orderId - Order ID
 * @returns {Object} Order details
 */
exports.getOrderDetails = async function (req, res) {
  try {
    const customerId = req.user.id;
    const { orderId } = req.params;

    if (isNaN(orderId)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }

    const order = await customerModel.getOrderById(customerId, orderId);

    if (!order) {
      return res
        .status(403)
        .json({ error: "You do not have access to this order" });
    }

    res.json({
      message: "Order details fetched successfully",
      data: order,
    });
  } catch (err) {
    console.error("Error fetching order details:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @function trackOrder
 * @desc Track status of a specific order.
 * @route GET /api/customer/orders/:orderId/track
 * @access Private
 * @param {number} orderId - Order ID
 * @returns {Object} Order status
 */
exports.trackOrder = async function (req, res) {
  try {
    const customerId = req.user.id;
    const orderId = req.params.orderId;

    const order = await customerModel.trackOrder(orderId, customerId);

    if (!order) {
      return res
        .status(404)
        .json({ error: "Order not found or not authorized" });
    }

    res.json({
      message: "Order status fetched successfully",
      data: order,
    });
  } catch (err) {
    console.error("Error tracking order:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @function getAllCarts
 * @desc Retrieve all carts for the authenticated customer.
 * @route GET /api/customer/carts
 * @access Private
 * @returns {Array} List of carts
 */
exports.getAllCarts = async (req, res) => {
  try {
    let carts;
    if (req.customerId && typeof req.customerId === "number") {
      carts = await customerService.getAllCartsByUser(req.customerId);
    } else if (req.guestToken) {
      carts = await customerService.getAllCartsByGuest(req.guestToken);
    } else {
      return res
        .status(400)
        .json({ message: "No valid customerId or guestToken" });
    }
    res.json(carts);
  } catch (err) {
    console.error("Error getting carts:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * @function getCartById
 * @desc Retrieve a specific cart by ID.
 * @route GET /api/customer/carts/:id
 * @access Private
 * @param {number} id - Cart ID
 * @returns {Object} Cart details
 */
exports.getCartById = async (req, res) => {
  try {
    const cart = await customerService.getCartById(req.params.id);
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // تحقق الملكية
    if (
      (req.customerId && cart.user_id !== req.customerId) ||
      (!req.customerId && cart.guest_token !== req.guestToken)
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(cart);
  } catch (err) {
    console.error("Error getting cart:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * @function createCart
 * @desc Create a new cart for the authenticated customer.
 * @route POST /api/customer/carts
 * @access Private
 * @returns {Object} Created cart
 */
exports.createCart = async (req, res) => {
  try {
    let cart;
    if (req.customerId && typeof req.customerId === "number") {
      cart = await customerService.createCartForUser(req.customerId);
    } else if (req.guestToken) {
      cart = await customerService.createCartForGuest(req.guestToken);
    } else {
      return res
        .status(400)
        .json({ message: "No valid customerId or guestToken" });
    }

    res.status(201).json(cart);
  } catch (err) {
    console.error("Error creating cart:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * @function updateCart
 * @desc Update a specific cart by ID.
 * @route PUT /api/customer/carts/:id
 * @access Private
 * @body {number} user_id - Customer ID
 * @returns {Object} Updated cart
 */
exports.updateCart = async (req, res) => {
  try {
    const cart = await customerService.getCartById(req.params.id); // أولاً تجيب الكارت
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // تحقق الملكية
    if (
      (req.customerId && cart.user_id !== req.customerId) ||
      (!req.customerId && cart.guest_token !== req.guestToken)
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updatedCart = await customerService.updateCart(
      req.params.id,
      req.customerId
    );
    res.json(updatedCart);
  } catch (err) {
    console.error("Error updating cart:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * @function deleteCart
 * @desc Delete a specific cart by ID.
 * @route DELETE /api/customer/carts/:id
 * @access Private
 * @returns {Object} Success message
 */
exports.deleteCart = async (req, res) => {
  try {
    const cart = await customerService.getCartById(req.params.id);
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    if (
      (req.customerId && cart.user_id !== req.customerId) ||
      (!req.customerId && cart.guest_token !== req.guestToken)
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await customerService.deleteCart(req.params.id);
    res.json({ message: "Cart deleted" });
  } catch (err) {
    console.error("Error deleting cart:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * @function addItem
 * @desc Add an item to a cart.
 * @route POST /api/customer/cart-items
 * @access Private
 * @body {number} cart_id
 * @body {number} product_id
 * @body {number} quantity
 * @body {string} [variant]
 * @returns {Object} Added item
 */
exports.addItem = async (req, res) => {
  try {
    const { cart_id, product_id, quantity, variant } = req.body;

    const cart = await customerService.getCartById(cart_id);
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // تحقق الملكية
    if (
      (req.customerId && cart.user_id !== req.customerId) ||
      (!req.customerId && cart.guest_token !== req.guestToken)
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const item = await customerService.addItem(
      cart_id,
      product_id,
      quantity,
      variant
    );
    res.status(201).json(item);
  } catch (err) {
    if (err.message.includes("Cannot add")) {
      return res.status(400).json({ message: err.message });
    }
    console.error("Error adding item:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * @function updateItem
 * @desc Update an item in the cart.
 * @route PUT /api/customer/cart-items/:id
 * @access Private
 * @body {number} quantity
 * @body {string} [variant]
 * @returns {Object} Updated item
 */
exports.updateItem = async (req, res) => {
  try {
    const { quantity, variant } = req.body;
    const item = await customerService.getItemById(req.params.id); // لازم تضيف getItemById في السيرفس
    if (!item) return res.status(404).json({ message: "Item not found" });

    const cart = await customerService.getCartById(item.cart_id);
    if (
      (req.customerId && cart.user_id !== req.customerId) ||
      (!req.customerId && cart.guest_token !== req.guestToken)
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updatedItem = await customerService.updateItem(
      req.params.id,
      quantity,
      variant
    );
    res.json(updatedItem);
  } catch (err) {
    console.error("Error updating item:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * @function deleteItem
 * @desc Delete an item from the cart.
 * @route DELETE /api/customer/cart-items/:id
 * @access Private
 * @returns {Object} Success message
 */
exports.deleteItem = async (req, res) => {
  try {
    const item = await customerService.getItemById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const cart = await customerService.getCartById(item.cart_id);
    if (
      (req.customerId && cart.user_id !== req.customerId) ||
      (!req.customerId && cart.guest_token !== req.guestToken)
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await customerService.deleteItem(req.params.id);
    res.json({ message: "Item deleted" });
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * @function getAllProducts
 * @desc Get all products with optional filters, pagination, and search.
 * @route GET /api/customer/products
 * @access Public
 * @query {string} [search] - Search term
 * @query {number} [categoryId] - Category ID
 * @query {number} [page=1] - Page number
 * @query {number} [limit=10] - Items per page
 * @returns {Object} Products list with pagination info
 */
exports.getAllProducts = async (req, res) => {
  try {
    const { search, categoryId, page = 1, limit = 100 } = req.query;

    const filters = {
      search: search || null,
      categoryId: categoryId ? parseInt(categoryId) : null,
      page: parseInt(page),
      limit: parseInt(limit),
    };

    const result = await customerService.getAllProducts(filters);
    return res.json(result);
  } catch (err) {
    console.error("Get products error:", err);
    res.status(500).json({ message: "Error getting products" });
  }
};

/**
 * @function getOrders
 * @async
 * @desc Fetch all orders for the authenticated customer.
 *       Requires a valid JWT token (user info available on req.user).
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object from auth middleware
 * @param {number} req.user.id - ID of the authenticated customer
 * @param {Object} res - Express response object
 * @returns {JSON} - Array of orders or an error message
 *
 * @example
 * // Response when orders exist
 * [
 *   {
 *     id: 1,
 *     customer_id: 5,
 *     total_amount: 150,
 *     status: "pending",
 *     payment_status: "unpaid",
 *     shipping_address: "Amman, Jordan",
 *     created_at: "2025-09-20T12:00:00Z",
 *     updated_at: "2025-09-20T12:00:00Z",
 *     items: [
 *       { product_id: 10, name: "Product A", quantity: 2, price: 50 }
 *     ]
 *   }
 * ]
 *
 * @example
 * // Response when no orders found
 * { message: "No orders found" }
 */
exports.getOrders = async (req, res) => {
  try {
    const customer_id = req.user.id;
    const orders = await customerModel.getCustomerOrders(customer_id);

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found" });
    }

    res.json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Error fetching orders" });
  }
};

exports.getStoreProducts = async (req, res) => {
  try {
    const storeId = req.params.id;
    const products = await customerModel.getVendorProducts(storeId);

    res.json({ success: true, data: products });
  } catch (err) {
    console.error("Error fetching store products:", err);
    res
      .status(500)
      .json({ success: false, message: "Error fetching products" });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;

    if (!payment_status) {
      return res.status(400).json({ message: "payment_status is required" });
    }

    const order = await customerModel.order.updatePaymentStatus(
      id,
      payment_status
    );
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProductsWithSorting = async (req, res) => {
  try {
    const { sort } = req.query; // price_asc, price_desc, most_sold, created_at, stock_quantity, ...

    const products = await customerService.getProductsWithSorting(sort);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.paymentController = {
  getUserPayments: async (req, res) => {
    try {
      const userId = req.user.id;
      const payments = await customerService.paymentService.getUserPayments(
        userId
      );
      res.json(payments);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  createPayment: async (req, res) => {
    try {
      const userId = req.user.id;
      const {
        order_id,
        payment_method,
        amount,
        status,
        transaction_id,
        card_last4,
        card_brand,
        expiry_month,
        expiry_year,
        paypal_email,
        paypal_name,
      } = req.body;

      const payment = await customerService.paymentService.createPayment({
        order_id,
        user_id: userId,
        payment_method,
        amount,
        status: status || (payment_method === "paypal" ? "paid" : "pending"),
        transaction_id: transaction_id || null,
        paypal_email: paypal_email || null,
        paypal_name: paypal_name || null,
        card_last4: card_last4 || null,
        card_brand: card_brand || null,
        expiry_month: expiry_month || null,
        expiry_year: expiry_year || null,
      });

      res.status(201).json(payment);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  deletePayment: async (req, res) => {
    try {
      const userId = req.user.id;
      const paymentId = parseInt(req.params.id);
      const deleted = await customerService.paymentService.deletePayment(
        userId,
        paymentId
      );
      res.json(deleted);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};

// customerController.js
exports.reorder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const userId = req.user.id; // بعد middleware auth
    const newCart = await customerService.createCartFromOrder(orderId, userId);
    res.json(newCart);
  } catch (err) {
    console.error("Reorder failed:", err);
    res.status(500).json({ error: err.message });
  }
};

// wishList
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const wishlist = await customerModel.getWishlistByUser(userId);
    res.json(wishlist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch wishlist" });
  }
};

exports.addWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId)
      return res.status(400).json({ message: "productId is required" });

    const newItem = await customerModel.addProductToWishlist(userId, productId);
    res.status(201).json(newItem);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: err.message || "Failed to add product to wishlist" });
  }
};

exports.removeWishlist = async (req, res) => {
  try {
    const { id } = req.params;
  console.log("Deleting wishlist id:", id);
  
    const result = await customerModel.removeProductFromWishlist(id);
    res.json({ message: "Product removed from wishlist", ...result });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({
        message: err.message || "Failed to remove product from wishlist",
      });
  }
};
