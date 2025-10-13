/**
 * ===============================
 * Review Model
 * ===============================
 * @module ReviewModel
 * @desc Handles database operations for vendor reviews.
 */

const pool = require('../../config/db');

/**
 * Add a new review for a vendor.
 *
 * @async
 * @function addReview
 * @param {Object} params - Review parameters
 * @param {number} params.user_id - ID of the user submitting the review
 * @param {number} params.vendor_id - ID of the vendor being reviewed
 * @param {number} params.rating - Rating value given by the user
 * @returns {Promise<Object>} The newly created review object
 */
exports.addReview = async ({ user_id, vendor_id, rating }) => {
  const result = await pool.query(
    `INSERT INTO stars_review (user_id, vendor_id, rating, created_at, updated_at)
     VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`,
    [user_id, vendor_id, rating]
  );
  return result.rows[0];
};

/**
 * Get all reviews for a specific vendor.
 *
 * @async
 * @function getReviewsByVendor
 * @param {number} vendor_id - ID of the vendor
 * @returns {Promise<Array>} List of review objects
 */
exports.getReviewsByVendor = async (vendor_id) => {
  const result = await pool.query(
    `SELECT * FROM stars_review WHERE vendor_id = $1 ORDER BY created_at DESC`,
    [vendor_id]
  );
  return result.rows;
};

/**
 * Get the average rating for a specific vendor.
 *
 * @async
 * @function getAverageRating
 * @param {number} vendor_id - ID of the vendor
 * @returns {Promise<number>} Average rating, 0 if no reviews
 */
exports.getAverageRating = async (vendor_id) => {
  const result = await pool.query(
    `SELECT AVG(rating) AS average_rating FROM stars_review WHERE vendor_id = $1`,
    [vendor_id]
  );
  return parseFloat(result.rows[0].average_rating) || 0;
};
exports.getUserReview = async (user_id, vendor_id) => {
  const result = await pool.query(
    `SELECT * FROM stars_review WHERE user_id = $1 AND vendor_id = $2`,
    [user_id, vendor_id]
  );
  return result.rows[0];
};
exports.updateReview = async (user_id, vendor_id, rating) => {
  const result = await pool.query(
    `UPDATE stars_review 
     SET rating = $3, updated_at = NOW() 
     WHERE user_id = $1 AND vendor_id = $2 
     RETURNING *`,
    [user_id, vendor_id, rating]
  );
  return result.rows[0];
};


exports.getAllVendorsWithReviews = async () => {
  const result = await pool.query(`
    SELECT 
      v.id,
      v.user_id,
      v.store_name,
      v.store_slug,
      v.store_logo,
      v.store_banner,
      v.description,
      v.status,
      v.commission_rate,
      v.contact_email,
      v.phone,
      v.address,
      v.social_links,
      v.rating,
      v.created_at,
      v.updated_at,
      v.business_registration_number,
      v.license_type,
      v.working_hours,
      COALESCE(AVG(r.rating), 0) AS average_rating,
      COUNT(r.id) AS total_reviews
    FROM vendors v
    LEFT JOIN stars_review r ON v.id = r.vendor_id
    WHERE status = 'approved'
    GROUP BY 
      v.id, v.user_id, v.store_name, v.store_slug, v.store_logo, v.store_banner,
      v.description, v.status, v.commission_rate, v.contact_email, v.phone, v.address,
      v.social_links, v.rating, v.created_at, v.updated_at, v.business_registration_number, 
      v.license_type, v.working_hours
    ORDER BY v.created_at DESC
  `);
  return result.rows;
};
