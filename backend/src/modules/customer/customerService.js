const customerModel = require("./customerModel");
const db = require("../../config/db"); 

/**
 * =========================
 * Customer Service Layer
 * =========================
 * Handles business logic for customer-related operations such as carts and cart items.
 */
/**
 * ============================
 * Cart Services
 * ============================
 */

/**
 * Fetch all carts for a registered user.
 * @param {number} userId - The ID of the authenticated user.
 * @returns {Promise<Array>} Array of cart objects.
 */
exports.getAllCartsByUser = async (userId) => {
  return await customerModel.getAllCartsByUser(userId);
};

/**
 * Fetch all carts for a guest user.
 * @param {string} guestToken - Unique token identifying the guest.
 * @returns {Promise<Array>} Array of cart objects.
 */
exports.getAllCartsByGuest = async (guestToken) => {
  return await customerModel.getAllCartsByGuest(guestToken);
};

/**
 * Get a specific cart by ID
 * @param {number} id - Cart ID
 * @returns {Promise<Object|null>} Cart object or null
 */
exports.getCartById = async (id) => {
  return await customerModel.getCartById(id);
};
/**
 * Create a new cart for a registered user.
 * @param {number} userId - User ID.
 * @returns {Promise<Object>} Newly created cart object.
 */
exports.createCartForUser = async (userId) => {
  return await customerModel.createCartForUser(userId);
};

/**
 * Create a new cart for a guest user.
 * @param {string} guestToken - Unique guest token.
 * @returns {Promise<Object>} Newly created cart object.
 */
exports.createCartForGuest = async (guestToken) => {
  return await customerModel.createCartForGuest(guestToken);
};

/**
 * Update an existing cart owner.
 * @param {number} id - Cart ID.
 * @param {number} userId - New user ID.
 * @returns {Promise<Object|null>} Updated cart object or null if not found.
 */
exports.updateCart = async (id, userId) => {
  return await customerModel.updateCart(id, userId);
};

/**
 * Delete a cart and all its items.
 * @param {number} id - Cart ID.
 * @returns {Promise<Object|null>} Deleted cart object or null if not found.
 */
exports.deleteCart = async (id) => {
  return await customerModel.deleteCart(id);
};

/**
 * ============================
 * Cart Items Services
 * ============================
 */

/**
 * Get a specific cart item by ID via service
 * @param {number} id - Cart item ID
 * @returns {Promise<Object|null>} Cart item object or null
 */
exports.getItemById = async (id) => {
  return await customerModel.getItemById(id);
};
/**
 * Add an item to a cart.
 * @param {number} cartId - Cart ID.
 * @param {number} productId - Product ID.
 * @param {number} quantity - Quantity of the product.
 * @param {string} [variant] - Optional product variant.
 * @returns {Promise<Object>} Newly added cart item object.
 */
exports.addItem = async (cartId, productId, quantity, variant) => {
  return await customerModel.addItem(cartId, productId, quantity, variant);
};

/**
 * Update an item in a cart.
 * @param {number} id - Cart item ID.
 * @param {number} quantity - New quantity.
 * @param {string} [variant] - Optional new variant.
 * @returns {Promise<Object|null>} Updated item object or null if not found.
 */
exports.updateItem = async (id, quantity, variant) => {
  return await customerModel.updateItem(id, quantity, variant);
};

/**
 * Delete an item from a cart.
 * @param {number} id - Cart item ID.
 * @returns {Promise<Object|null>} Deleted item object or null if not found.
 */
exports.deleteItem = async (id) => {
  return await customerModel.deleteItem(id);
};


exports.getAllProducts = async (filters) => {
  const products = await customerModel.getAllProducts(filters);
  return products;
};


exports.getProductsWithSorting = async (sort) => {
  return await customerModel.fetchProductsWithSorting(sort);
};


exports.paymentService = {
  getUserPayments: async (userId) => {
    return await customerModel.paymentModel.getUserPayments(userId);
  },

  createPayment: async (userId, data) => {
    // نضيف user_id تلقائياً
    const paymentData = { ...data, user_id: userId };
    return await customerModel.paymentModel.createPayment(paymentData);
  },

  deletePayment: async (userId, paymentId) => {
    const deleted = await customerModel.paymentModel.deletePayment(userId, paymentId);
    if (!deleted) throw new Error("Payment not found or unauthorized");
    return deleted;
  },
};

exports.createCartFromOrder = async (orderId, userId) => {
  // 1. جلب الأوردر
  const orderRes = await db.query("SELECT * FROM orders WHERE id = $1", [orderId]);
  if (!orderRes.rows.length) throw new Error("Order not found");
  const order = orderRes.rows[0];

  // 2. إنشاء كارت جديد للمستخدم
  const cartRes = await db.query(
    "INSERT INTO carts(user_id) VALUES($1) RETURNING *",
    [userId]
  );
  const newCart = cartRes.rows[0];

  // 3. جلب العناصر من order_items
  const itemsRes = await db.query(
    "SELECT product_id, quantity, variant FROM order_items WHERE order_id = $1",
    [orderId]
  );

  // 4. إدخال العناصر في cart_items
  for (const item of itemsRes.rows) {
    await db.query(
      `INSERT INTO cart_items(cart_id, product_id, quantity, variant) 
       VALUES($1, $2, $3, $4)`,
      [newCart.id, item.product_id, item.quantity, item.variant]
    );
  }

  return newCart;
};
