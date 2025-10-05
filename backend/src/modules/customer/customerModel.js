const pool = require("../../config/db");

/**
 * ============================
 * Customer Model - User Module
 * ============================
 */

/**
 * Find user by ID
 * @param {number} id - User ID
 * @returns {Promise<Object|null>} User object or null if not found
 */
exports.findById = async (id) => {
  const result = await pool.query("SELECT * FROM users WHERE id=$1", [id]);
  return result.rows[0];
};

/**
 * Update user profile by ID
 * @param {number} id - User ID
 * @param {string} name - User name
 * @param {string} phone - User phone
 * @param {string} address - User address
 * @returns {Promise<Object>} Updated user object
 */
exports.updateById = async (id, name, phone, address) => {
  const result = await pool.query(
    `UPDATE users SET name=$1, phone=$2, address=$3, updated_at=NOW() WHERE id=$4 RETURNING *`,
    [name, phone, address, id]
  );
  return result.rows[0];
};

/**
 * Get store details by store ID including products
 * @param {number} storeId - Store ID
 * @returns {Promise<Object|null>} Store object with products array
 */
exports.getStoreById = async function (storeId) {
  const result = await pool.query(
    `SELECT 
       v.id AS store_id,
       v.store_name,
       v.store_slug,
       v.store_logo,
       v.store_banner,
       v.description,
       v.contact_email,
       v.phone,
       v.social_links,
       v.rating,
       v.created_at,
       v.updated_at,
       json_agg(
         json_build_object(
           'product_id', p.id,
           'name', p.name,
           'description', p.description,
           'price', p.price,
           'stock_quantity', p.stock_quantity,
           'images', p.images,
           'variants', p.variants
         )
       ) AS products
     FROM vendors v
     LEFT JOIN products p ON p.vendor_id = v.id
     WHERE v.id = $1
     GROUP BY v.id`,
    [storeId]
  );
  return result.rows[0];
};

/**
 * Place order from cart (Cash on Delivery)
 * @param {number} userId - Customer ID
 * @param {number} cartId - Cart ID
 * @param {Object} addressData - Address details {address_line1, address_line2, city, state, postal_code, country}
 * @returns {Promise<Object>} Created order object
 */
exports.placeOrderFromCart = async function ({
  userId,
  cartId,
  address,
  paymentMethod,
  paymentData,
}) {
  try {
    // 1. Fetch cart items
    const cartItemsResult = await pool.query(
      `SELECT ci.product_id, ci.quantity, ci.variant, p.price
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       JOIN carts c ON ci.cart_id = c.id
       WHERE ci.cart_id = $1 AND c.user_id = $2`,
      [cartId, userId]
    );

    if (cartItemsResult.rows.length === 0) {
      throw new Error("Cart is empty or not found");
    }

    // 2. Insert address
    const addressResult = await pool.query(
      `INSERT INTO addresses (user_id, address_line1, address_line2, city, state, postal_code, country)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        userId,
        address.address_line1,
        address.address_line2 || "",
        address.city,
        address.state || "",
        address.postal_code || "",
        address.country || "Jordan",
      ]
    );
    const savedAddress = addressResult.rows[0];

    // 3. Find delivery company
    const deliveryResult = await pool.query(
      `SELECT id 
       FROM delivery_companies
       WHERE LOWER($1) = ANY(ARRAY(SELECT LOWER(unnest(coverage_areas))))
         AND status = 'approved'
       ORDER BY created_at ASC
       LIMIT 1`,
      [savedAddress.city]
    );

    if (deliveryResult.rows.length === 0) {
      throw new Error(`No delivery company covers ${savedAddress.city}`);
    }

    const deliveryCompanyId = deliveryResult.rows[0].id;

    // 4. Calculate total
    let total_amount = 0;
    for (let item of cartItemsResult.rows) {
      total_amount += item.price * item.quantity;
    }

    // 5. Insert order
    const payment_status = paymentMethod === "cod" ? "pending" : "paid";

    const orderResult = await pool.query(
      `INSERT INTO orders (customer_id, delivery_company_id, status, shipping_address, total_amount, payment_status, created_at, updated_at)
       VALUES ($1, $2, 'pending', $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        userId,
        deliveryCompanyId,
        JSON.stringify(savedAddress),
        total_amount,
        payment_status,
      ]
    );
    const order = orderResult.rows[0];

    // 6. Insert order items
    for (let item of cartItemsResult.rows) {
      await pool.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price, variant)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          order.id,
          item.product_id,
          item.quantity,
          item.price,
          JSON.stringify(item.variant || {}),
        ]
      );
    }

    // 7. سجل الدفع إذا الدفع أونلاين
    if (paymentMethod !== "cod") {
      await pool.query(
        `INSERT INTO payments (order_id, user_id, payment_method, status, transaction_id, card_last4, card_brand, expiry_month, expiry_year, amount, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)`,
        [
          order.id,
          userId,
          paymentMethod,
          "paid",
          paymentData.transactionId || null,
          paymentData.card_last4 || null,
          paymentData.card_brand || null,
          paymentData.expiry_month || null,
          paymentData.expiry_year || null,
          total_amount,
        ]
      );
    }

    // 8. Return order + payments
    const orderWithPaymentsResult = await pool.query(
      `SELECT 
     o.*,
     COALESCE(
       json_agg(
         json_build_object(
           'id', p.id,
           'payment_method', p.payment_method,
           'amount', p.amount,
           'status', p.status,
           'transaction_id', p.transaction_id,
           'card_last4', p.card_last4,
           'card_brand', p.card_brand,
           'expiry_month', p.expiry_month,
           'expiry_year', p.expiry_year,
           'created_at', p.created_at
         )
       ) FILTER (WHERE p.id IS NOT NULL),
       '[]'
     ) AS payments
   FROM orders o
   LEFT JOIN payments p ON p.order_id = o.id
   WHERE o.id = $1
   GROUP BY o.id`,
      [order.id]
    );

    return orderWithPaymentsResult.rows[0];
  } catch (err) {
    throw err;
  }
};

/**
 * Get order details for a specific customer
 * @param {number} customerId
 * @param {number} orderId
 * @returns {Promise<Object|null>} Order object with items
 */
exports.getOrderById = async function (customerId, orderId) {
  const result = await pool.query(
    `SELECT 
      o.id AS order_id,
      o.total_amount,
      o.payment_status,
      o.shipping_address,
      o.created_at,
      o.updated_at,
      -- العناصر
      json_agg(
        json_build_object(
          'order_item_id', oi.id,
          'product_id', p.id,
          'product_name', p.name,
          'quantity', oi.quantity,
          'price', oi.price,
          'variant', oi.variant
        )
      ) AS items,
      -- الدفعات المرتبطة بالأوردر
      (
        SELECT json_agg(
          json_build_object(
            'payment_id', pay.id,
            'payment_method', pay.payment_method,
            'amount', pay.amount,
            'status', pay.status,
            'transaction_id', pay.transaction_id,
            'card_last4', pay.card_last4,
            'card_brand', pay.card_brand,
            'expiry_month', pay.expiry_month,
            'expiry_year', pay.expiry_year,
            'paypal_email', pay.paypal_email,
            'paypal_name', pay.paypal_name,
            'created_at', pay.created_at
          )
        )
        FROM payments pay
        WHERE pay.order_id = o.id
      ) AS payments
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products p ON p.id = oi.product_id
    WHERE o.id = $1 AND o.customer_id = $2
    GROUP BY o.id`,
    [orderId, customerId]
  );

  return result.rows[0];
};

/**
 * Track order status for a customer
 * @param {number} orderId
 * @param {number} customerId
 * @returns {Promise<Object|null>} Order status object
 */
exports.trackOrder = async function (orderId, customerId) {
  const result = await pool.query(
    `SELECT 
      o.id AS order_id,
      o.status,
      o.updated_at
    FROM orders o
    WHERE o.id = $1 AND o.customer_id = $2`,
    [orderId, customerId]
  );

  return result.rows[0];
};

/**
 * ============================
 * Customer Module - Carts
 * ============================
 */

/**
 * Get all carts
 * @returns {Promise<Array>} Array of cart objects
 */
exports.getAllCarts = async () => {
  const result = await pool.query(`
  SELECT c.id, c.user_id, c.created_at, c.updated_at, c.guest_token,
         COALESCE(
           json_agg(
             json_build_object(
               'id', ci.id,
               'cart_id', ci.cart_id,
               'quantity', ci.quantity,
               'variant', ci.variant,
               'price', p.price,
               'name', p.name
             )
           ) FILTER (WHERE ci.id IS NOT NULL), '[]'
         ) AS items
  FROM carts c
  LEFT JOIN cart_items ci ON ci.cart_id = c.id
  LEFT JOIN products p ON ci.product_id = p.id
  GROUP BY c.id
  ORDER BY c.created_at DESC
`);

  return result.rows;
};

/**
 * Get a cart by ID with items
 * @param {number} id - Cart ID
 * @returns {Promise<Object|null>} Cart object with items array or null
 */
exports.getCartById = async (id) => {
  const cartRes = await pool.query("SELECT * FROM carts WHERE id = $1", [id]);
  if (cartRes.rows.length === 0) return null;

  const itemsRes = await pool.query(
    `
    SELECT 
      ci.id, 
      ci.cart_id, 
      ci.quantity, 
      ci.variant, 
      p.price, 
      p.name,
      v.store_name AS vendor_name,
      COALESCE(
        (
          SELECT json_agg(pi.image_url::text ORDER BY pi.id)
          FROM product_images pi
          WHERE pi.product_id = p.id
        )::jsonb,
        '[]'::jsonb
      ) AS images
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    JOIN vendors v ON p.vendor_id = v.id
    WHERE ci.cart_id = $1
  `,
    [id]
  );

  return { ...cartRes.rows[0], items: itemsRes.rows };
};

/**
 * Create a new cart for a user
 * @param {number} userId
 * @returns {Promise<Object>} Created cart object
 */
exports.createCart = async (userId) => {
  const result = await pool.query(
    "INSERT INTO carts (user_id) VALUES ($1) RETURNING *",
    [userId]
  );
  return result.rows[0];
};

/**
 * Update cart owner
 * @param {number} id - Cart ID
 * @param {number} userId - New user ID
 * @returns {Promise<Object>} Updated cart object
 */
exports.updateCart = async (id, userId) => {
  const result = await pool.query(
    "UPDATE carts SET user_id = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
    [userId, id]
  );
  return result.rows[0];
};

/**
 * Delete a cart and its items
 * @param {number} id - Cart ID
 * @returns {Promise<Object|null>} Deleted cart object or null
 */
exports.deleteCart = async (id) => {
  await pool.query("DELETE FROM cart_items WHERE cart_id = $1", [id]);
  const result = await pool.query(
    "DELETE FROM carts WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
};

/**
 * ============================
 * Customer Module - Cart Items
 * ============================
 */
/**
 * Get a specific cart item by ID
 * @param {number} id - Cart item ID
 * @returns {Promise<Object|null>} Cart item object or null
 */
exports.getItemById = async (id) => {
  const result = await pool.query("SELECT * FROM cart_items WHERE id = $1", [
    id,
  ]);
  return result.rows[0] || null;
};

/**
 * Add item to cart
 * @param {number} cartId
 * @param {number} productId
 * @param {number} quantity
 * @param {Object} variant
 * @returns {Promise<Object>} Created cart item
 */
exports.addItem = async (cartId, productId, quantity, variant) => {
  try {
    // 1️⃣ تحقق إذا المنتج موجود بالفعل بالكارت بنفس الـ variant
    const existingItemResult = await pool.query(
      `SELECT id, quantity FROM cart_items 
       WHERE cart_id=$1 AND product_id=$2 AND variant=$3`,
      [cartId, productId, variant]
    );

    const existingItem = existingItemResult.rows[0];
    const existingQty = existingItem?.quantity || 0;

    // 2️⃣ جلب كمية المنتج في الستوك من المنتجات
    const productResult = await pool.query(
      `SELECT stock_quantity FROM products WHERE id=$1`,
      [productId]
    );

    if (!productResult.rows[0]) {
      throw new Error("Product not found");
    }

    const stockQty = productResult.rows[0].stock_quantity;

    // 3️⃣ تحقق من أن الكمية الجديدة لا تتجاوز الستوك
    if (existingQty + quantity > stockQty) {
      throw new Error(
        `Cannot add ${quantity} items. Only ${
          stockQty - existingQty
        } left in stock.`
      );
    }

    // 4️⃣ إذا موجود مسبقاً بالكارت، حدث الكمية
    if (existingItem) {
      const updatedItem = await pool.query(
        `UPDATE cart_items 
         SET quantity = quantity + $1
         WHERE id = $2
         RETURNING *`,
        [quantity, existingItem.id]
      );
      return updatedItem.rows[0];
    } else {
      // 5️⃣ إذا غير موجود، أضف جديد
      const addedItem = await pool.query(
        `INSERT INTO cart_items (cart_id, product_id, quantity, variant)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [cartId, productId, quantity, variant]
      );
      return addedItem.rows[0];
    }
  } catch (err) {
    console.error("Error in addItem:", err.message);
    throw err; // نعيد الخطأ للكنترولر
  }
};

/**
 * Update item in cart
 * @param {number} id - Item ID
 * @param {number} quantity
 * @param {Object} variant
 * @returns {Promise<Object>} Updated item
 */
exports.updateItem = async (id, quantity, variant) => {
  const result = await pool.query(
    `UPDATE cart_items 
     SET quantity = $1, variant = $2, updated_at = NOW() 
     WHERE id = $3 RETURNING *`,
    [quantity, variant, id]
  );
  return result.rows[0];
};

/**
 * Delete item from cart
 * @param {number} id - Item ID
 * @returns {Promise<Object|null>} Deleted item or null
 */
exports.deleteItem = async (id) => {
  const result = await pool.query(
    "DELETE FROM cart_items WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
};
/**
 * @module CartService
 * @description Service layer functions for managing shopping carts
 * in the database, supporting both authenticated users and guest users.
 */

/**
 * Fetch all carts belonging to a specific authenticated user.
 *
 * @async
 * @function getAllCartsByUser
 * @param {number} userId - The ID of the authenticated user.
 * @returns {Promise<Object[]>} A promise that resolves to an array of cart objects.
 * @throws {Error} If the database query fails.
 */
exports.getAllCartsByUser = async (userId) => {
  const result = await pool.query(
    `
    SELECT 
      c.id, 
      c.user_id, 
      c.created_at, 
      c.updated_at, 
      c.guest_token,
      COALESCE(
        json_agg(
          json_build_object(
            'id', ci.id,
            'cart_id', ci.cart_id,
            'quantity', ci.quantity,
            'variant', ci.variant,
            'price', p.price,
            'name', p.name
          )
        ) FILTER (WHERE ci.id IS NOT NULL),
        '[]'
      ) AS items
    FROM carts c
    LEFT JOIN cart_items ci ON ci.cart_id = c.id
    LEFT JOIN products p ON ci.product_id = p.id
    WHERE c.user_id = $1
    GROUP BY c.id
    ORDER BY c.created_at DESC
    `,
    [userId]
  );

  return result.rows;
};

/**
 * Fetch all carts belonging to a guest (non-authenticated user).
 *
 * @async
 * @function getAllCartsByGuest
 * @param {string} guestToken - The unique token identifying the guest.
 * @returns {Promise<Object[]>} A promise that resolves to an array of cart objects.
 * @throws {Error} If the database query fails.
 */
exports.getAllCartsByGuest = async (guestToken) => {
  const result = await pool.query(
    `
    SELECT 
      c.id, 
      c.user_id, 
      c.created_at, 
      c.updated_at, 
      c.guest_token,
      COALESCE(
        json_agg(
          json_build_object(
            'id', ci.id,
            'cart_id', ci.cart_id,
            'quantity', ci.quantity,
            'variant', ci.variant,
            'price', p.price,
            'name', p.name
          )
        ) FILTER (WHERE ci.id IS NOT NULL),
        '[]'
      ) AS items
    FROM carts c
    LEFT JOIN cart_items ci ON ci.cart_id = c.id
    LEFT JOIN products p ON ci.product_id = p.id
    WHERE c.guest_token = $1
    GROUP BY c.id
    ORDER BY c.created_at DESC
    `,
    [guestToken]
  );

  return result.rows;
};

/**
 * Create a new cart for an authenticated user.
 *
 * @async
 * @function createCartForUser
 * @param {number} userId - The ID of the authenticated user.
 * @returns {Promise<Object>} A promise that resolves to the newly created cart object.
 * @throws {Error} If the database query fails.
 */
exports.createCartForUser = async (userId) => {
  if (!userId || typeof userId !== "number") {
    throw new Error("Invalid userId for cart creation");
  }
  const result = await pool.query(
    "INSERT INTO carts (user_id, guest_token) VALUES ($1, NULL) RETURNING *",
    [userId]
  );
  return result.rows[0];
};
/**
 * Create a new cart for a guest (non-authenticated user).
 *
 * @async
 * @function createCartForGuest
 * @param {string} guestToken - The unique token identifying the guest.
 * @returns {Promise<Object>} A promise that resolves to the newly created cart object.
 * @throws {Error} If the database query fails.
 */
exports.createCartForGuest = async (guestToken) => {
  if (!guestToken) {
    throw new Error("Guest token is required for guest cart");
  }
  const result = await pool.query(
    "INSERT INTO carts (user_id, guest_token) VALUES (NULL, $1) RETURNING *",
    [guestToken]
  );
  return result.rows[0];
};

/**
 * ============================
 * Customer Module - Products
 * ============================
 */
// Get all data from products table
/**
 * @function getAllProducts
 * @desc Fetch all products with optional filters, pagination, and search
 * @param {Object} param0
 * @param {string} [param0.search] - Search term for product name or store name
 * @param {number} [param0.categoryId] - Filter by category ID
 * @param {number} [param0.page=1] - Page number
 * @param {number} [param0.limit=10] - Items per page
 * @returns {Promise<Array>} - Array of product objects with images
 */
exports.getAllProducts = async ({
  search,
  categoryId,
  page = 1,
  limit = 100,
}) => {
  try {
    const offset = (page - 1) * limit;
    const values = [limit, offset];
    let idx = 3;

    let filterQuery = "";
    if (search) {
      filterQuery += ` AND (p.name ILIKE $${idx} OR v.store_name ILIKE $${idx})`;
      values.push(`%${search}%`);
      idx++;
    }
    if (categoryId) {
      filterQuery += ` AND p.category_id = $${idx}`;
      values.push(categoryId);
      idx++;
    }

    const query = `
      SELECT 
        p.*,
        v.store_name AS vendor_name, -- هنا نضيف اسم الفندور
        COALESCE(
          (
            SELECT json_agg(pi.image_url::text ORDER BY pi.id)
            FROM product_images pi
            WHERE pi.product_id = p.id
          )::jsonb,
          '[]'::jsonb
        ) AS images
      FROM products p
      LEFT JOIN vendors v ON v.id = p.vendor_id
      WHERE 1=1
      ${filterQuery}
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const { rows } = await pool.query(query, values);
    return rows;
  } catch (err) {
    console.error("Error in getAllProducts:", err);
    throw err;
  }
};

/**
 * @function getCustomerOrders
 * @async
 * @desc Retrieve all orders for a specific customer, including order items with product details.
 * @param {number} customer_id - The ID of the customer whose orders are being fetched.
 * @returns {Promise<Array<Object>>} - Returns an array of order objects. Each order contains:
 *   - id {number} - Order ID
 *   - total_amount {number} - Total order amount
 *   - status {string} - Current order status (pending, processing, delivered, etc.)
 *   - payment_status {string} - Payment status (paid/unpaid)
 *   - shipping_address {string} - Shipping address of the order
 *   - created_at {string} - Timestamp of order creation
 *   - items {Array<Object>} - Array of items in the order, each containing:
 *       - product_id {number} - ID of the product
 *       - name {string} - Product name
 *       - price {number} - Price per unit
 *       - quantity {number} - Quantity ordered
 *
 * @example
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
exports.getCustomerOrders = async (customer_id) => {
  const result = await pool.query(
    `
    SELECT 
      o.id,
      o.total_amount,
      o.status,
      o.payment_status,
      o.shipping_address,
      o.created_at,
      COALESCE(
        json_agg(
          json_build_object(
            'product_id', p.id,
            'name', p.name,
            'price', p.price,
            'quantity', oi.quantity
          )
        ) FILTER (WHERE p.id IS NOT NULL), '[]'
      ) AS items,
      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id', pay.id,
              'payment_method', pay.payment_method,
              'amount', pay.amount,
              'status', pay.status,
              'transaction_id', pay.transaction_id,
              'card_last4', pay.card_last4,
              'card_brand', pay.card_brand,
              'expiry_month', pay.expiry_month,
              'expiry_year', pay.expiry_year
            )
          )
          FROM payments pay
          WHERE pay.order_id = o.id
        ),
        '[]'
      ) AS payments
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE o.customer_id = $1
    GROUP BY o.id
    ORDER BY o.created_at DESC
    `,
    [customer_id]
  );

  return result.rows;
};

exports.getVendorProducts = async (vendorId) => {
  const query = `
    SELECT *
    FROM products
    WHERE vendor_id = $1
    ORDER BY created_at DESC
  `;
  const { rows } = await pool.query(query, [vendorId]);
  return rows; // array من المنتجات
};

exports.Order = {
  updatePaymentStatus: async (id, payment_status) => {
    const result = await pool.query(
      `UPDATE orders
       SET payment_status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [payment_status, id]
    );
    return result.rows[0];
  },
};

/**
 * جلب كل المنتجات مع إمكانية ترتيب ديناميكي
 * @param {string} sortBy العمود أو النوع ('price_asc', 'price_desc', 'most_sold', أي عمود)
 */
exports.fetchProductsWithSorting = async (sortBy = "id ASC") => {
  if (sortBy === "most_sold") {
    const query = `
      SELECT p.*, COALESCE(SUM(oi.quantity), 0) AS total_sold
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      GROUP BY p.id
      ORDER BY total_sold DESC;
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  const validColumns = [
    "id",
    "price",
    "stock_quantity",
    "created_at",
    "updated_at",
  ];
  let orderClause = "id ASC";
  if (sortBy === "price_asc") orderClause = "price ASC";
  else if (sortBy === "price_desc") orderClause = "price DESC";
  else if (validColumns.includes(sortBy)) orderClause = `${sortBy} ASC`;

  const query = `SELECT * FROM products ORDER BY ${orderClause};`;
  const { rows } = await pool.query(query);
  return rows;
};

exports.paymentModel = {
  getUserPayments: async (userId) => {
    const query = `
    SELECT 
      p.*,
      o.total_amount AS order_total,
      o.status AS order_status
    FROM payments p
    LEFT JOIN orders o ON p.order_id = o.id
    WHERE p.user_id = $1
    ORDER BY p.created_at DESC
  `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  },

  createPayment: async (data) => {
    const {
      order_id,
      user_id,
      payment_method,
      amount,
      status = "pending",
      transaction_id,
      card_last4,
      card_brand,
      expiry_month,
      expiry_year,
    } = data;

    // ✅ تحقق إذا كان في سجل بنفس user_id + payment_method + transaction_id
    if (payment_method === "paypal" && transaction_id) {
      const checkQuery = `
      SELECT * FROM payments 
      WHERE user_id = $1 AND payment_method = $2 AND transaction_id = $3
      LIMIT 1
    `;
      const checkRes = await pool.query(checkQuery, [
        user_id,
        payment_method,
        transaction_id,
      ]);
      if (checkRes.rows.length > 0) {
        return checkRes.rows[0]; // رجع الموجود بدل الإضافة
      }
    }

    const query = `
    INSERT INTO payments (
      order_id, user_id, payment_method, amount, status, transaction_id,
      card_last4, card_brand, expiry_month, expiry_year
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *
  `;

    const values = [
      order_id,
      user_id,
      payment_method,
      amount,
      status,
      transaction_id,
      card_last4,
      card_brand,
      expiry_month,
      expiry_year,
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  deletePayment: async (userId, paymentId) => {
    const query = `
      DELETE FROM payments
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    const { rows } = await pool.query(query, [paymentId, userId]);
    return rows[0];
  },
};

exports.deleteProfile = async (req, res) => {
  const userId = req.user.id; // من middleware التوثيق
  try {
    await db.query("DELETE FROM users WHERE id = $1", [userId]);

    res
      .status(200)
      .json({ message: "User and all related data deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete user." });
  }
};

/**
 * ============================
 * Customer Model - WishList
 * ============================
 */

exports.getWishlistByUser = async (userId) => {
  const { rows } = await pool.query(
    `SELECT 
       w.id AS wishlist_id,
       p.id AS product_id,
       p.name, 
       p.price, 
       p.description,
       COALESCE(json_agg(pi.image_url) FILTER (WHERE pi.image_url IS NOT NULL), '[]') AS images
     FROM wishlist w
     JOIN products p ON w.product_id = p.id
     LEFT JOIN product_images pi ON pi.product_id = p.id
     WHERE w.user_id = $1
     GROUP BY w.id, p.id`,
    [userId]
  );
  return rows;
};

exports.addProductToWishlist = async (userId, productId) => {
  const exists = await pool.query(
    `SELECT * FROM wishlist WHERE user_id = $1 AND product_id = $2`,
    [userId, productId]
  );

  if (exists.rows.length > 0) {
    throw new Error("Product already in wishlist");
  }

  const { rows } = await pool.query(
    `INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2) RETURNING id AS wishlist_id, product_id`,
    [userId, productId]
  );

  return rows[0];
};

exports.removeProductFromWishlist = async (wishlistId) => {
  const { rowCount } = await pool.query(`DELETE FROM wishlist WHERE id = $1`, [
    wishlistId,
  ]);

  if (rowCount === 0) {
    throw new Error("Product not found in wishlist");
  }

  return { success: true };
};
