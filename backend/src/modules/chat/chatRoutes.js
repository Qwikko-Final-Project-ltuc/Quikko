const express = require('express');
const router = express.Router();
const chatController = require('./chatController');
const { protect } = require('../../middleware/authMiddleware');

/**
 * @module ChatRoutes
 * @desc Routes for chat functionality including fetching and sending messages.
 *       All routes are protected and require a valid JWT token.
 */

/**
 * @route   GET /api/chat
 * @desc    Retrieve chat messages between two users
 * @access  Private (requires JWT token)
 * @query   {string} user1 - ID of the first user
 * @query   {string} user2 - ID of the second user
 * @returns {Array<Object>} List of chat messages
 */
router.get('/', protect, chatController.getChatMessages);

/**
 * @route   POST /api/chat
 * @desc    Send a chat message from one user to another
 * @access  Private (requires JWT token)
 * @body    {string} sender_id - ID of the sender
 * @body    {string} receiver_id - ID of the receiver
 * @body    {string} message - The message content
 * @returns {Object} Created message
 */
router.post('/', protect, chatController.postChatMessage);
router.get('/conversations', protect, chatController.getConversations);

module.exports = router;

/* ================= Swagger Documentation =================

/**
 * @swagger
 * tags:
 *   - name: Chat
 *     description: Endpoints for user-to-user chat messaging
 */

/**
 * @swagger
 * /api/chat:
 *   get:
 *     summary: Retrieve chat messages between two users
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: user1
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the first user
 *       - in: query
 *         name: user2
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the second user
 *     responses:
 *       200:
 *         description: Array of chat messages
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 sender_id: "1"
 *                 receiver_id: "2"
 *                 message: "Hello!"
 *                 created_at: "2025-09-20T12:00:00Z"
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Send a chat message from one user to another
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             sender_id: "1"
 *             receiver_id: "2"
 *             message: "Hello!"
 *     responses:
 *       201:
 *         description: Message created successfully
 *         content:
 *           application/json:
 *             example:
 *               id: 3
 *               sender_id: "1"
 *               receiver_id: "2"
 *               message: "Hello!"
 *               created_at: "2025-09-20T12:05:00Z"
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       500:
 *         description: Internal server error
 */
