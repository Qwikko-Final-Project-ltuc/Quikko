const productService = require("./productService");
const productModel = require("./productModel");
const db = require('../../config/db');
const multer = require("multer");
const path = require("path");

/**
 * @module ProductController
 * @desc Handles product-related operations including fetching, creating, updating, and deleting products.
 */
/**
 * ===============================
 * Image Upload
 * ===============================
 */

// إعداد التخزين
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/products/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// دالة رفع الصور
exports.uploadProductImages = (req, res) => {
  upload.array("images")(req, res, function (err) {
    if (err) {
      console.error("Upload error:", err);
      return res.status(500).json({ message: "Error uploading images" });
    }

    // الرابط الكامل بدل المسار النسبي
     const imagePaths = req.files.map(
      (file) => `http://localhost:3000/uploads/products/${file.filename}`
    );

    res.json({ imageUrls: imagePaths });
  });
};

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




/**
 * Add a review
 */
exports.addReview = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { product_id, rating, comment, sentiment } = req.body;

    // تحقق إن المستخدم اشترى المنتج
    const purchased = await productModel.hasPurchasedProduct(user_id, product_id);
   if (!purchased) {
      return res.status(403).json({ message: "You can only review products you purchased" });
    }

    const review = await productModel.addReview({ user_id, product_id, rating, comment, sentiment });
    res.status(201).json({ message: "Review added successfully", review });
  } catch (err) {
    console.error("Add review error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get reviews for a product
 */
exports.getProductReviews = async (req, res) => {
  try {
    const product_id = req.params.product_id;
    const reviews = await productModel.getProductReviews(product_id);
    res.json(reviews);
  } catch (err) {
    console.error("Get reviews error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Admin delete a review
 */
exports.deleteReview = async (req, res) => {
  try {
    const review_id = req.params.review_id;
    const deletedReview = await productModel.deleteReview(review_id);
    res.json({ message: "Review deleted successfully", review: deletedReview });
  } catch (err) {
    console.error("Delete review error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};