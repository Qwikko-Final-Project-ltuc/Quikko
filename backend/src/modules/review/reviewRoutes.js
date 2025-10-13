/**
 * ===============================
 * Review Routes
 * ===============================
 * @module ReviewRoutes
 * @desc Routes for managing vendor reviews.
 */

const express = require('express');
const router = express.Router();
const reviewController = require('./reviewController');
const { protect, authorizeRole } = require('../../middleware/authMiddleware');

/**
 * @route POST /api/reviews
 * @desc Add a review for a vendor
 * @access Protected (customer only)
 */
router.post('/', protect, authorizeRole('customer'), reviewController.addReview);

/**
 * @route GET /api/reviews/vendor/:vendor_id
 * @desc Get all reviews for a vendor
 * @access Public
 */
router.get('/vendor/:vendor_id', reviewController.getVendorReviews);

/**
 * @route GET /api/reviews/vendor/:vendor_id/average
 * @desc Get average rating for a vendor
 * @access Public
 */
router.get('/vendor/:vendor_id/average', reviewController.getVendorAverageRating);
router.get('/vendor/:vendor_id/me',protect,authorizeRole('customer'),reviewController.getMyReview);
router.get('/reviews', reviewController.getVendorsWithReviews);

module.exports = router;

/* =================== Swagger Documentation =================== */

/**
 * @swagger
 * tags:
 *   - name: Reviews
 *     description: Vendor reviews endpoints
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * paths:
 *   /api/reviews:
 *     post:
 *       summary: Add a review for a vendor
 *       tags: [Reviews]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - vendor_id
 *                 - rating
 *               properties:
 *                 vendor_id:
 *                   type: integer
 *                 rating:
 *                   type: number
 *                   minimum: 1
 *                   maximum: 5
 *       responses:
 *         201:
 *           description: Review added successfully
 *
 *   /api/reviews/vendor/{vendor_id}:
 *     get:
 *       summary: Get all reviews for a vendor
 *       tags: [Reviews]
 *       parameters:
 *         - in: path
 *           name: vendor_id
 *           required: true
 *           schema:
 *             type: integer
 *           description: Vendor ID
 *       responses:
 *         200:
 *           description: List of reviews
 *
 *   /api/reviews/vendor/{vendor_id}/average:
 *     get:
 *       summary: Get average rating for a vendor
 *       tags: [Reviews]
 *       parameters:
 *         - in: path
 *           name: vendor_id
 *           required: true
 *           schema:
 *             type: integer
 *           description: Vendor ID
 *       responses:
 *         200:
 *           description: Average rating
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   vendor_id:
 *                     type: integer
 *                   average_rating:
 *                     type: number
 */
