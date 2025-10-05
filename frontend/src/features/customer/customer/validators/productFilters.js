/**
 * ==============================
 * Product Filters Utility
 * ==============================
 * يحتوي على دوال للفلاتر والبحث في صفحة المنتجات
 */

/**
 * Filter products by search term
 * @param {Array} products - Array of product objects
 * @param {string} search - Search string
 * @returns {Array} Filtered products
 */
export const filterBySearch = (products, search) => {
  if (!search) return products;
  return products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.store_name.toLowerCase().includes(search.toLowerCase())
  );
};

/**
 * Filter products by category ID
 * @param {Array} products - Array of product objects
 * @param {number} categoryId - Category ID
 * @returns {Array} Filtered products
 */
export const filterByCategory = (products, categoryId) => {
  if (!categoryId) return products;
  return products.filter(p => p.category_id === categoryId);
};
