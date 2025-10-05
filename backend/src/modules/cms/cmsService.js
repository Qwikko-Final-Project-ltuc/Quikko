const CMSModel = require("./cmsModel");

/**
 * @module CMSService
 * @desc Business logic for CMS pages and banners. Handles retrieval, creation, update, and deletion
 *       of CMS records through the CMSModel.
 */

/**
 * @function listCMS
 * @desc Retrieves all CMS pages or banners from the database.
 *       Can optionally filter by status ('active' or 'inactive').
 *
 * @param {string} [status] - Optional status filter
 * @returns {Promise<Array<Object>>} Array of CMS objects
 *
 * @example
 * const cmsPages = await CMSService.listCMS('active');
 * console.log(cmsPages);
 */
exports.listCMS = async (type, title) => {
  return await CMSModel.getAllCMS(type, title);
};


exports.listCMSForAdmin = async () => {
  return await CMSModel.getAllCMSForAdmin();
};


/**
 * @function createCMS
 * @desc Creates a new CMS page or banner.
 *
 * @param {Object} data - CMS data
 * @param {string} data.title - Title of the CMS page/banner
 * @param {string} data.content - Content of the CMS page/banner
 * @param {string} data.type - Type of CMS content ('page' or 'banner')
 * @param {string} [data.image_url] - Optional image URL
 * @param {string} [data.status='active'] - Status ('active' or 'inactive')
 * @returns {Promise<Object>} The created CMS object
 *
 * @example
 * const newCMS = await CMSService.createCMS({
 *   title: 'Welcome Banner',
 *   content: 'Homepage banner',
 *   type: 'banner'
 * });
 */
exports.createCMS = async (data) => {
  return await CMSModel.insertCMS(data);
};

/**
 * @function modifyCMS
 * @desc Updates an existing CMS page or banner by ID.
 *
 * @param {number|string} id - ID of the CMS record to update
 * @param {Object} data - CMS data to update
 * @param {string} [data.title] - Updated title
 * @param {string} [data.content] - Updated content
 * @param {string} [data.type] - Updated type ('page' or 'banner')
 * @param {string} [data.image_url] - Updated image URL
 * @param {string} [data.status] - Updated status ('active' or 'inactive')
 * @returns {Promise<Object>} The updated CMS object
 * @throws {Error} Throws 'CMS record not found' if the record does not exist
 *
 * @example
 * try {
 *   const updatedCMS = await CMSService.modifyCMS(1, { title: 'New Title' });
 *   console.log(updatedCMS);
 * } catch (err) {
 *   console.error(err.message);
 * }
 */
exports.modifyCMS = async (id, data) => {
  const updated = await CMSModel.updateCMS(id, data);
  if (!updated) throw new Error("CMS record not found");
  return updated;
};

/**
 * @function removeCMS
 * @desc Deletes a CMS page or banner by ID.
 *
 * @param {number|string} id - ID of the CMS record to delete
 * @returns {Promise<void>}
 * @throws {Error} Throws 'CMS record not found' if the record does not exist
 *
 * @example
 * try {
 *   await CMSService.removeCMS(1);
 *   console.log('Deleted successfully');
 * } catch (err) {
 *   console.error(err.message);
 * }
 */
exports.removeCMS = async (id) => {
  const deleted = await CMSModel.deleteCMS(id);
  if (!deleted) throw new Error("CMS record not found");
};
