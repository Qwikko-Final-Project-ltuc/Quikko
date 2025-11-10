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
    `SELECT 
       p.*, 
       v.store_name AS vendor_name, 
       c.name AS category_name,
       COALESCE(
         (
           SELECT json_agg(pi.image_url::text ORDER BY pi.id)
           FROM product_images pi
           WHERE pi.product_id = p.id
         )::jsonb,
         '[]'::jsonb
       ) AS images
     FROM products p
     LEFT JOIN vendors v ON p.vendor_id = v.id
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.id = $1
       AND (p.is_deleted = FALSE OR p.is_deleted IS NULL)
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
 * @returns {Promise<Object>} Returns the inserted product.
 */
exports.insertProduct = async (productData) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

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

    const productResult = await client.query(
      `
      INSERT INTO products 
      (vendor_id, name, description, price, stock_quantity, category_id, variants, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
      `,
      [
        vendor_id,
        name,
        description,
        price,
        stock_quantity,
        category_id,
        variants ? JSON.stringify(variants) : null,
        created_at,
        updated_at,
      ]
    );

    const product = productResult.rows[0];

    await client.query(
    `INSERT INTO product_embedding_queue (product_id) VALUES ($1)`,
    [product.id]
  );

    if (images && images.length > 0) {
      const imageQuery = `
        INSERT INTO product_images (product_id, image_url)
        VALUES ${images.map((_, i) => `($1, $${i + 2})`).join(', ')};
      `;
      const imageValues = [product.id, ...images];
      await client.query(imageQuery, imageValues);
    }

    await client.query('COMMIT');
    
    const imageResult = await client.query(
      `SELECT image_url FROM product_images WHERE product_id = $1`,
      [product.id]
    );

    product.images = imageResult.rows.map((row) => row.image_url);
    return product;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
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
  const client = await db.connect();
  try {
    await client.query('BEGIN');

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
          category_id = $5,
          variants = $6,
          updated_at = NOW()
      WHERE id = $7 AND vendor_id = $8
      RETURNING *;
    `;
    const values = [
      name,
      description,
      price,
      stock_quantity,
      category_id,
      variants ? JSON.stringify(variants) : null,
      id,
      vendor_id,
    ];

    const result = await client.query(query, values);
    const updatedProduct = result.rows[0];

    if (images && Array.isArray(images)) {
      await client.query(`DELETE FROM product_images WHERE product_id = $1`, [id]);

      const imageQuery = `
        INSERT INTO product_images (product_id, image_url)
        VALUES ${images.map((_, i) => `($1, $${i + 2})`).join(', ')}
      `;
      const imageValues = [id, ...images];
      await client.query(imageQuery, imageValues);
    }

    await client.query('COMMIT');
    return updatedProduct;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
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
  // console.log('Soft deleting productId:', id, 'for vendorId:', vendor_id);

  const result = await db.query(
    `SELECT * FROM products WHERE id = $1 AND vendor_id = $2`,
    [id, vendor_id]
  );

  if (result.rowCount === 0) {
    throw new Error("Product not found or unauthorized");
  }

  const deleteResult = await db.query(
    `UPDATE products 
     SET is_deleted = TRUE
     WHERE id = $1 AND vendor_id = $2
     RETURNING *;`,
    [id, vendor_id]
  );
  // console.log('Soft delete result:', deleteResult.rows);

  if (deleteResult.rowCount === 0) {
    throw new Error("Product not found or unauthorized");
  }

  return deleteResult.rows[0];
};

exports.addReview = async ({ user_id, product_id, rating, comment, sentiment }) => {
  const result = await db.query(
    `INSERT INTO product_reviews (user_id, product_id, rating, comment, sentiment)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [user_id, product_id, rating, comment, sentiment ? JSON.stringify(sentiment) : null]
  );
  return result.rows[0];
};

exports.getProductReviews = async (product_id) => {
  const result = await db.query(
    `SELECT r.*, u.name AS user_name
     FROM product_reviews r
     JOIN users u ON r.user_id = u.id
     WHERE r.product_id = $1 AND (r.is_deleted = FALSE OR r.is_deleted IS NULL)
     ORDER BY r.created_at DESC`,
    [product_id]
  );
  return result.rows;
};

/**
 * Get average_rating and reviews_count from products table
 */
exports.getAverageRating = async (product_id) => {
  const result = await db.query(
    `SELECT average_rating, reviews_count
     FROM products
     WHERE id = $1`,
    [product_id]
  );
  return result.rows[0]; // undefined لو المنتج مش موجود
};

/**
 * Soft delete a review (admin only)
 */
exports.deleteReview = async (review_id) => {
  const result = await db.query(
    `UPDATE product_reviews
     SET is_deleted = TRUE
     WHERE id = $1
     RETURNING *`,
    [review_id]
  );
  return result.rows[0];
};

/**
 * Check if user purchased the product
 */
exports.hasPurchasedProduct = async (user_id, product_id) => {
  const result = await db.query(
    `SELECT 1 FROM orders o
     JOIN order_items oi ON o.id = oi.order_id
     WHERE o.customer_id = $1 AND oi.product_id = $2`,
    [user_id, product_id]
  );
  return result.rowCount > 0;
};

