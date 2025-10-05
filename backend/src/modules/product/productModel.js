const db = require("../../config/db");

/**
 * @module ProductModel
 * @desc Handles database operations for products including fetching, inserting, updating, and deleting products.
 */

/**
 * Get a product by its ID.
 *
 * @async
 * @function getProductById
 * @param {number} id - The ID of the product to retrieve.
 * @returns {Promise<Object|null>} Returns the product object with vendor and category details or null if not found.
 *
 * @example
 * const product = await getProductById(1);
 */
exports.getProductById = async (id) => {
  const result = await db.query(
    `SELECT p.*, v.store_name, c.name AS category_name
    FROM products p
    LEFT JOIN vendors v ON p.vendor_id = v.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = $1
    `,
    [id]
  );
  return result.rows[0] || null;
};

/**
 * Insert a new product into the database.
 *
 * @async
 * @function insertProduct
 * @param {Object} productData - Product details.
 * @param {number} productData.vendor_id - Vendor ID who owns the product.
 * @param {string} productData.name - Name of the product.
 * @param {string} [productData.description] - Description of the product.
 * @param {number} productData.price - Price of the product.
 * @param {number} productData.stock_quantity - Stock quantity available.
 * @param {Array} [productData.images] - Array of image URLs.
 * @param {number} productData.category_id - Category ID of the product.
 * @param {Array} [productData.variants] - Array of product variants (e.g., sizes/colors).
 * @param {string} productData.created_at - Timestamp for creation.
 * @param {string} productData.updated_at - Timestamp for last update.
 * @returns {Promise<Object>} Returns the inserted product.
 *
 * @example
 * const newProduct = await insertProduct({ vendor_id: 1, name: "T-Shirt", price: 25.5, stock_quantity: 100, category_id: 2 });
 */
exports.insertProduct = async (productData) => {
  const {
    vendor_id,
    name,
    description,
    price,
    stock_quantity,
    images,
    category_id,
    variants,
    created_at,
    updated_at,
  } = productData;

  const query = `
    INSERT INTO products 
    (vendor_id, name, description, price, stock_quantity, images, category_id, variants, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *;
  `;

  const values = [
    vendor_id,
    name,
    description,
    price,
    stock_quantity,
    images ? JSON.stringify(images) : null,
    category_id,
    variants ? JSON.stringify(variants) : null,
    created_at,
    updated_at,
  ];

  const result = await db.query(query, values);
  return result.rows[0];
};

/**
 * Update an existing product.
 *
 * @async
 * @function updateProduct
 * @param {number} id - Product ID to update.
 * @param {number} vendor_id - Vendor ID for authorization.
 * @param {Object} productData - Updated product details.
 * @param {string} [productData.name] - Product name.
 * @param {string} [productData.description] - Product description.
 * @param {number} [productData.price] - Product price.
 * @param {number} [productData.stock_quantity] - Stock quantity.
 * @param {Array} [productData.images] - Array of image URLs.
 * @param {number} [productData.category_id] - Category ID.
 * @param {Array} [productData.variants] - Array of product variants.
 * @returns {Promise<Object|null>} Returns the updated product or null if not found.
 *
 * @example
 * const updatedProduct = await updateProduct(1, 1, { price: 30, stock_quantity: 50 });
 */
exports.updateProduct = async (id, vendor_id, productData) => {
  const {
    name,
    description,
    price,
    stock_quantity,
    images,
    category_id,
    variants,
  } = productData;

  const query = `
    UPDATE products
    SET name = $1,
        description = $2,
        price = $3,
        stock_quantity = $4,
        images = $5,
        category_id = $6,
        variants = $7,
        updated_at = NOW()
    WHERE id = $8 AND vendor_id = $9
    RETURNING *;
  `;

  const values = [
    name,
    description,
    price,
    stock_quantity,
    images ? JSON.stringify(images) : null,
    category_id,
    variants ? JSON.stringify(variants) : null,
    id,
    vendor_id,
  ];

  const result = await db.query(query, values);
  return result.rows[0] || null;
};

/**
 * Delete a product from the database.
 *
 * @async
 * @function deleteProduct
 * @param {number} id - Product ID to delete.
 * @param {number} vendor_id - Vendor ID for authorization.
 * @returns {Promise<void>}
 *
 * @throws {Error} If product not found or unauthorized
 *
 * @example
 * await deleteProduct(1, 1);
 */
exports.deleteProduct = async (id, vendor_id) => {

  const result = await db.query(
    `SELECT * FROM products WHERE id = $1 AND vendor_id = $2`,
    [id, vendor_id]
  );

  const deleteResult = await db.query(
    `DELETE FROM products WHERE id = $1 AND vendor_id = $2 RETURNING *;`,
    [id, vendor_id]
  );

  if (deleteResult.rowCount === 0) {
    throw new Error("Product not found or unauthorized");
  }
};

