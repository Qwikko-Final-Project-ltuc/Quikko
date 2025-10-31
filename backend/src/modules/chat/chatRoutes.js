const express = require("express");
const chatController = require("./chatController");
const { protect } = require("../../middleware/authMiddleware");

module.exports = (io) => {
  const router = express.Router();

  // ✅ كل الراوتات محمية بـ protect
  router.get(
    "/vendor/:vendorId/conversations",
    protect,
    chatController.getVendorConversations
  );

  router.get(
    "/customer/:customerId/conversations",
    protect,
    chatController.getCustomerConversations
  );

  router.post("/mark-read", protect, chatController.markRead);

  router.post("/", protect, chatController.postMessage(io));

  router.get("/:customerId/:vendorId", protect, chatController.getMessages);

  router.get(
    "/delivery/:deliveryId/conversations",
    protect,
    chatController.getDeliveryConversations
  );

  return router;
};

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
