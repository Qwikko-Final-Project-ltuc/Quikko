const cmsService = require('./cmsService');

/**
 * @module CMSController
 * @desc Controller for handling CMS pages and banners.
 *       Uses CMSService for business logic and database operations.
 */

/**
 * @function getAllCMS
 * @desc Retrieves all CMS pages/banners, optionally filtered by status.
 * @route GET /api/cms
 * @access Admin (protected)
 * @query {string} [status] - Optional status filter ('active' or 'inactive')
 * @returns {Object[]} 200 - Array of CMS records
 * @returns {string} 500 - Internal server error
 *
 * @example
 * GET /api/cms?status=active
 * Response:
 * [
 *   { "id": 1, "title": "Homepage Banner", "type": "banner", "status": "active", "content": "Welcome!", "image_url": "https://example.com/banner.png" },
 *   { "id": 2, "title": "About Page", "type": "page", "status": "active", "content": "About us content", "image_url": null }
 * ]
 */
exports.getAllCMS = async (req, res) => {
  try {
    const { type, title } = req.query;
    const cms = await cmsService.listCMS(type, title);
    res.status(200).json(cms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getAllCMSForAdmin = async (req, res) => {
  try {
    const cms = await cmsService.listCMSForAdmin();
    res.status(200).json(cms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/**
 * @function createCMS
 * @desc Creates a new CMS page or banner.
 * @route POST /api/cms
 * @access Admin (protected)
 * @body {string} title - Title of the CMS page/banner
 * @body {string} content - Content of the CMS page/banner
 * @body {string} type - Type of CMS content ('page' or 'banner')
 * @body {string} [image_url] - Optional image URL
 * @body {string} [status='active'] - Status of the CMS content
 * @returns {Object} 201 - Created CMS object
 * @returns {string} 500 - Internal server error
 *
 * @example
 * POST /api/cms
 * {
 *   "title": "Homepage Banner",
 *   "content": "Welcome message",
 *   "type": "banner",
 *   "image_url": "https://example.com/banner.png"
 * }
 * Response:
 * {
 *   "id": 1,
 *   "title": "Homepage Banner",
 *   "content": "Welcome message",
 *   "type": "banner",
 *   "status": "active",
 *   "image_url": "https://example.com/banner.png"
 * }
 */
exports.createCMS = async (req, res) => {
  try {
    const newCMS = await cmsService.createCMS(req.body);
    res.status(201).json(newCMS);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function updateCMS
 * @desc Updates an existing CMS page or banner by ID.
 * @route PUT /api/cms/:id
 * @access Admin (protected)
 * @param {string|number} id - CMS record ID
 * @body {string} [title] - Updated title
 * @body {string} [content] - Updated content
 * @body {string} [type] - Updated type ('page' or 'banner')
 * @body {string} [image_url] - Updated image URL
 * @body {string} [status] - Updated status ('active' or 'inactive')
 * @returns {Object} 200 - Updated CMS object
 * @returns {string} 404 - CMS record not found
 * @returns {string} 500 - Internal server error
 *
 * @example
 * PUT /api/cms/1
 * {
 *   "title": "Updated Banner"
 * }
 * Response:
 * {
 *   "id": 1,
 *   "title": "Updated Banner",
 *   "content": "Welcome message",
 *   "type": "banner",
 *   "status": "active",
 *   "image_url": "https://example.com/banner.png"
 * }
 */
exports.updateCMS = async (req, res) => {
  try {
    const updated = await cmsService.modifyCMS(req.params.id, req.body);
    res.status(200).json(updated);
  } catch (err) {
    if (err.message === 'CMS record not found') {
      res.status(404).json({ error: err.message });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};

/**
 * @function deleteCMS
 * @desc Deletes a CMS page or banner by ID.
 * @route DELETE /api/cms/:id
 * @access Admin (protected)
 * @param {string|number} id - CMS record ID
 * @returns {Object} 200 - Success message
 * @returns {string} 404 - CMS record not found
 * @returns {string} 500 - Internal server error
 *
 * @example
 * DELETE /api/cms/1
 * Response:
 * { "message": "CMS record deleted successfully" }
 */
exports.deleteCMS = async (req, res) => {
  try {
    await cmsService.removeCMS(req.params.id);
    res.status(200).json({ message: 'CMS record deleted successfully' });
  } catch (err) {
    if (err.message === 'CMS record not found') {
      res.status(404).json({ error: err.message });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};
