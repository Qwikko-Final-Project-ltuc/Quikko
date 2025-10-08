const reviewService = require('./reviewService');

/**
 * ===============================
 * Review Controller
 * ===============================
 * @module ReviewController
 * @desc Handles HTTP requests for vendor reviews.
 */

/**
 * Add a review for a vendor.
 */
exports.addReview = async (req, res) => {
  try {
    const { vendor_id, rating } = req.body;
    const user_id = req.user.id;
    const review = await reviewService.createOrUpdateReview(user_id, vendor_id, rating);
    res.status(201).json(review);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};


/**
 * Get all reviews for a vendor.
 */
exports.getVendorReviews = async (req, res) => {
  try {
    const { vendor_id } = req.params;
    const reviews = await reviewService.listVendorReviews(vendor_id);
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching reviews');
  }
};

/**
 * Get average rating for a vendor.
 */
exports.getVendorAverageRating = async (req, res) => {
  try {
    const { vendor_id } = req.params;
    const avgRating = await reviewService.getVendorAverageRating(vendor_id);
    res.json({ vendor_id, average_rating: avgRating });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching average rating');
  }
};
exports.getMyReview = async (req, res) => {
  try {
    const { vendor_id } = req.params;
    const user_id = req.user.id; 
    const review = await reviewService.getUserReviewForVendor(user_id, vendor_id);
    res.json(review || { rating: 0 }); 
  } catch (err) {
    console.error("Error fetching user review:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


exports.getVendorsWithReviews = async (req, res) => {
  try {
    const vendors = await reviewService.listVendorsWithReviews();
    res.json(vendors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching vendors with reviews' });
  }
};
