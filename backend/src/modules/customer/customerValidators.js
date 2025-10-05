const { query } = require("express-validator");

/**
 * ================================
 * Customer Products Query Validator
 * ================================
 * Validates query parameters for fetching products in the customer page.
 * 
 * Supported query parameters:
 * - search: optional string to search products by name or description
 * - categoryId: optional positive integer to filter products by category
 * - page: optional positive integer for pagination (default = 1)
 * - limit: optional integer between 1 and 100 to limit items per page (default = 10)
 */
exports.getAllProductsValidator = [
  /**
   * Validate 'search' query parameter
   * @query {string} search - Optional search string
   */
  
  query("search")
    .optional()
    .isString()
    .withMessage("Search must be a string"),

  /**
   * Validate 'categoryId' query parameter
   * @query {number} categoryId - Optional positive integer
   */
  query("categoryId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Category ID must be a positive integer"),

  /**
   * Validate 'page' query parameter
   * @query {number} page - Optional page number (>= 1)
   */
  query("page")
    .optional()
    .isInt({ min: 1 })
    .toInt()
    .withMessage("Page must be >= 1"),

  /**
   * Validate 'limit' query parameter
   * @query {number} limit - Optional limit for number of items per page (1-100)
   */
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .toInt()
    .withMessage("Limit must be between 1 and 100"),
];
