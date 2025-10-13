const { protectAdmin } = require('../admin/adminValidators');
const categoryService = require('./CategoryService');
/**
 * @module CategoryController
 * @desc Controller for managing categories in the system.
 */

/**
 * @function getCategories
 * @desc Retrieves all categories and returns them as JSON.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void} Sends JSON response with categories or error message
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = await categoryService.listCategories();
    res.json({ success: true, data: categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching categories' });
  }
};

/**
 * @function getCategory
 * @desc Retrieves a single category by ID.
 */
exports.getCategory = async (req, res) => {
  try {
    const category = await categoryService.getCategory(req.params.id);
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

/**
 * @function createCategory
 * @desc Creates a new category. Admin only.
 */
exports.createCategory = async (req, res) => {
    try {
      const category = await categoryService.createCategory(req.body);
      res.status(201).json({ success: true, message: 'Category created', data: category });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
;

/**
 * @function updateCategory
 * @desc Updates an existing category by ID. Admin only.
 */
exports.updateCategory = async (req, res) => {
    try {
      const updated = await categoryService.modifyCategory(req.params.id, req.body);
      res.json({ success: true, message: 'Category updated', data: updated });
    } catch (err) {
      res.status(404).json({ success: false, message: err.message });
    }
  }
;

/**
 * @function deleteCategory
 * @desc Deletes a category by ID. Admin only.
 */
exports.deleteCategory =   async (req, res) => {
    try {
      await categoryService.removeCategory(req.params.id);
      res.json({ success: true, message: 'Category deleted' });
    } catch (err) {
      res.status(404).json({ success: false, message: err.message });
    }
  }
;
