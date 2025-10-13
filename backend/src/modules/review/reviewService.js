const reviewModel = require('./reviewModel');

/**
 * ===============================
 * Review Service
 * ===============================
 * @module ReviewService
 * @desc Handles business logic for vendor reviews.
 */

/**
 * Create a new review for a vendor.
 *
 * @async
 * @function createReview
 * @param {number} user_id - ID of the user submitting the review
 * @param {number} vendor_id - ID of the vendor being reviewed
 * @param {number} rating - Rating value given by the user
 * @returns {Promise<Object>} Newly created review object
 */

exports.createOrUpdateReview = async (user_id, vendor_id, rating) => {
  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  const existing = await reviewModel.getUserReview(user_id, vendor_id);

  if (existing) {
    return reviewModel.updateReview(user_id, vendor_id, rating);
  } else {
    return reviewModel.addReview({ user_id, vendor_id, rating });
  }
};



/**
 * Get all reviews for a vendor.
 *
 * @async
 * @function listVendorReviews
 * @param {number} vendor_id - Vendor ID
 * @returns {Promise<Array>} List of reviews
 */
exports.listVendorReviews = async (vendor_id) => {
  return reviewModel.getReviewsByVendor(vendor_id);
};

/**
 * Get average rating for a vendor.
 *
 * @async
 * @function getVendorAverageRating
 * @param {number} vendor_id - Vendor ID
 * @returns {Promise<number>} Average rating
 */
exports.getVendorAverageRating = async (vendor_id) => {
  return reviewModel.getAverageRating(vendor_id);
};
exports.getUserReviewForVendor = async (user_id, vendor_id) => {
  return reviewModel.getUserReview(user_id, vendor_id);
};

exports.listVendorsWithReviews = async () => {
  const vendors = await reviewModel.getAllVendorsWithReviews();
  return vendors;
};