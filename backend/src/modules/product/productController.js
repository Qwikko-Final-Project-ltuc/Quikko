const productService = require("./productService");
const productModel = require("./productModel");
const db = require('../../config/db');

/**
 * @module ProductController
 * @desc Handles product-related operations including fetching, creating, updating, and deleting products.
 */

/**
 * Get a single product by its ID.
 *
 * @async
 * @function getProduct
 * @param {Object} req - Express request object.
 * @param {Object} req.params - Request parameters.
 * @param {string} req.params.id - Product ID to fetch.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>}
 *
 * @example
 * GET /api/products/1
 */
exports.getProduct = async (req, res) => {
  try {
    const product = await productModel.getProductById(req.params.id);
    if (!product) {
      return res.status(404).send("Product not found");
    }
    res.json(product);
  } catch (err) {
    console.error("Get product error:", err);
    res.status(500).send("Error fetching product");
  }
};

/**
 * Create a new product for a vendor.
 *
 * @async
 * @function createProduct
 * @param {Object} req - Express request object.
 * @param {Object} req.user - Authenticated user object from middleware.
 * @param {number} req.user.id - Vendor ID.
 * @param {Object} req.body - Product data including name, description, price, etc.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>}
 *
 * @example
 * POST /api/products
 * Body: { name: "Product A", price: 25.5, description: "A great product" }
 */
exports.createProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const vendorResult = await db.query('SELECT id FROM vendors WHERE user_id = $1', [userId]);
    if (vendorResult.rowCount === 0)
      return res.status(403).json({ message: 'User is not a vendor' });

    const vendorId = vendorResult.rows[0].id;

    const now = new Date();
    const productData = {
      ...req.body,
      vendor_id: vendorId,
      created_at: now,
      updated_at: now,
    };

    const product = await productModel.insertProduct(productData);

    res.status(201).json({ message: 'Product added successfully!', product });
  } catch (err) {
    console.error('Product creation error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



/**
 * Update an existing product.
 *
 * @async
 * @function updateProduct
 * @param {Object} req - Express request object.
 * @param {Object} req.params - Request parameters.
 * @param {string} req.params.id - Product ID to update.
 * @param {Object} req.user - Authenticated user object from middleware.
 * @param {number} req.user.id - Vendor ID.
 * @param {Object} req.body - Updated product data.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>}
 *
 * @example
 * PUT /api/products/1
 * Body: { name: "Updated Product", price: 30 }
 */
exports.updateProduct = async (req, res) => {
  try {
    const vendorResult = await db.query(
      'SELECT id FROM vendors WHERE user_id = $1',
      [req.user.id]
    );
    if (vendorResult.rowCount === 0) 
        return res.status(403).json({ message: 'User is not a vendor' });

    const vendorId = vendorResult.rows[0].id;

    const productCheck = await db.query(
      'SELECT * FROM products WHERE id = $1 AND vendor_id = $2',
      [req.params.id, vendorId]
    );
    if (productCheck.rowCount === 0) 
        return res.status(404).json({ message: 'Product not found or unauthorized' });

    const updatedProduct = await productService.updateProduct(
      req.params.id,
      vendorId,
      req.body,
      productCheck.rows[0] 
    );

    res.json({ message: 'Product updated successfully', data: updatedProduct });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ message: 'Error updating product' });
  }
};


/**
 * Delete a product.
 *
 * @async
 * @function deleteProduct
 * @param {Object} req - Express request object.
 * @param {Object} req.params - Request parameters.
 * @param {string} req.params.id - Product ID to delete.
 * @param {Object} req.user - Authenticated user object from middleware.
 * @param {number} req.user.id - Vendor ID.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>}
 *
 * @example
 * DELETE /api/products/1
 */
exports.deleteProduct = async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) 
      return res.status(400).json({ message: 'Invalid product ID' });

    const vendorResult = await db.query(
      'SELECT id FROM vendors WHERE user_id = $1',
      [req.user.id]
    );

    if (vendorResult.rowCount === 0)
      return res.status(403).json({ message: 'User is not a vendor' });

    const vendorId = vendorResult.rows[0].id;

    const productCheck = await db.query(
      'SELECT id FROM products WHERE id = $1 AND vendor_id = $2',
      [productId, vendorId]
    );

    if (productCheck.rowCount === 0)
      return res.status(404).json({ message: 'Product not found or unauthorized' });

    const deletedProduct = await productService.deleteProduct(productId, vendorId);

    res.json({
      message: 'Product soft-deleted successfully',
      product: deletedProduct
    });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ message: 'Error deleting product' });
  }
};



