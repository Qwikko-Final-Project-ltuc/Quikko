const pool = require('../../config/db');

/**
 * @module CMSModel
 * @desc Handles database operations for CMS pages and banners.
 *       This module interacts directly with PostgreSQL via `pool.query`.
 */

/**
 * @function getAllCMS
 * @desc Fetch all CMS records, optionally filtered by status.
 * @param {string} [status] - Optional status filter ('active' or 'inactive')
 * @returns {Promise<Object[]>} Array of CMS objects
 *
 * @example
 * const cmsPages = await CMSModel.getAllCMS('active');
 * console.log(cmsPages);
 */
exports.getAllCMS = async (type, title) => {
  const { rows } = await pool.query(
    `SELECT content, image_url FROM cms WHERE type=$1 AND status='active' AND title=$2`,
    [type, title]
  );

  const { rows } = await pool.query(`SELECT content, image_url FROM cms WHERE type=$1 AND status='active' AND title=$2`, [type,title]);
  return rows; 
};


// For admin: fetch all CMS records
exports.getAllCMSForAdmin = async () => {
  const { rows } = await pool.query(`SELECT * FROM cms ORDER BY created_at DESC`);
  return rows;
};


/**
 * @function insertCMS
 * @desc Inserts a new CMS record into the database.
 * @param {Object} data - CMS data
 * @param {string} data.title - Title of the CMS page/banner
 * @param {string} data.content - Content of the CMS page/banner
 * @param {string} data.type - Type of CMS ('page' or 'banner')
 * @param {string} [data.image_url] - Optional image URL
 * @param {string} [data.status='active'] - Status of the CMS record
 * @returns {Promise<Object>} The newly created CMS record
 *
 * @example
 * const newCMS = await CMSModel.insertCMS({
 *   title: "Homepage Banner",
 *   content: "Welcome message",
 *   type: "banner",
 *   image_url: "https://example.com/banner.png"
 * });
 * console.log(newCMS);
 */
exports.insertCMS = async (data) => {
  const { title, content, type, image_url } = data;

  await pool.query(
    `UPDATE cms 
       SET status = 'inactive', updated_at = NOW() 
       WHERE type = $1 AND status = 'active'`,
    [type]
  );

  const { rows } = await pool.query(
    `INSERT INTO cms (title, content, type, image_url, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, 'active', NOW(), NOW())
     RETURNING *`,
    [title, content, type, image_url]
  );
  return rows[0];
};

/**
 * @function updateCMS
 * @desc Updates an existing CMS record by ID.
 * @param {string|number} id - ID of the CMS record to update
 * @param {Object} data - Updated CMS data
 * @param {string} [data.title] - Updated title
 * @param {string} [data.content] - Updated content
 * @param {string} [data.type] - Updated type ('page' or 'banner')
 * @param {string} [data.image_url] - Updated image URL
 * @param {string} [data.status='active'] - Updated status
 * @returns {Promise<Object>} Updated CMS record
 *
 * @example
 * const updatedCMS = await CMSModel.updateCMS(1, { title: "Updated Banner" });
 * console.log(updatedCMS);
 */
exports.updateCMS = async (id, data) => {
  const { title, content, type, image_url, status } = data;
  const { rows } = await pool.query(
    `UPDATE cms
     SET title=$1, content=$2, type=$3, image_url=$4, status=$5, updated_at=NOW()
     WHERE id=$6
     RETURNING *`,
    [title, content, type, image_url, status || 'active', id]
  );
  return rows[0];
};

/**
 * @function deleteCMS
 * @desc Deletes a CMS record by ID.
 * @param {string|number} id - ID of the CMS record to delete
 * @returns {Promise<boolean>} True if deleted successfully, false otherwise
 *
 * @example
 * const deleted = await CMSModel.deleteCMS(1);
 * console.log(deleted); // true or false
 */
exports.deleteCMS = async (id) => {
  const { rowCount } = await pool.query('DELETE FROM cms WHERE id=$1', [id]);
  return rowCount > 0;
};
