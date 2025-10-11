const chatService = require('./chatService');

/**
 * @module ChatController
 * @desc Controller for handling chat-related operations including fetching and sending messages.
 */

/**
 * @function getChatMessages
 * @route GET /api/chat
 * @summary Retrieve chat messages between two users
 * @tags Chat
 * @param {string} user1.query.required - ID of the first user
 * @param {string} user2.query.required - ID of the second user
 * @returns {Object[]} 200 - Array of chat messages
 * @returns {number} 200[].id - Message ID
 * @returns {string} 200[].sender_id - Sender user ID
 * @returns {string} 200[].receiver_id - Receiver user ID
 * @returns {string} 200[].message - Message content
 * @returns {string} 200[].created_at - Message creation timestamp
 * @returns {string} 500 - Internal server error
 *
 * @example
 * // Request
 * GET /api/chat?user1=1&user2=2
 *
 * // Response
 * [
 *   { "id": 1, "sender_id": "1", "receiver_id": "2", "message": "Hello!", "created_at": "2025-09-20T12:00:00Z" },
 *   { "id": 2, "sender_id": "2", "receiver_id": "1", "message": "Hi!", "created_at": "2025-09-20T12:01:00Z" }
 * ]
 */
exports.getChatMessages = async (req, res) => {
  const currentUserId = parseInt(req.user?.id, 10);
  const user2Id = parseInt(req.query?.user2, 10);
  // تحقق من صحة القيم
  if (isNaN(currentUserId) || isNaN(user2Id)) {
    return res.status(400).json({ message: "Invalid user IDs" });
  }

  try {
    const messages = await chatService.getMessages(currentUserId, user2Id);
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};



/**
 * @function postChatMessage
 * @route POST /api/chat
 * @summary Send a new chat message from one user to another
 * @tags Chat
 * @param {string} sender_id.body.required - ID of the sending user
 * @param {string} receiver_id.body.required - ID of the receiving user
 * @param {string} message.body.required - Message content
 * @returns {Object} 201 - Created chat message object
 * @returns {number} 201.id - Message ID
 * @returns {string} 201.sender_id - Sender user ID
 * @returns {string} 201.receiver_id - Receiver user ID
 * @returns {string} 201.message - Message content
 * @returns {string} 201.created_at - Message creation timestamp
 * @returns {string} 500 - Internal server error
 *
 * @example
 * // Request
 * POST /api/chat
 * {
 *   "sender_id": "1",
 *   "receiver_id": "2",
 *   "message": "Hello!"
 * }
 *
 * // Response
 * {
 *   "id": 3,
 *   "sender_id": "1",
 *   "receiver_id": "2",
 *   "message": "Hello!",
 *   "created_at": "2025-09-20T12:05:00Z"
 * }
 */
exports.postChatMessage = async (req, res) => {
  const sender_id = req.user.id;    
  const { receiver_id, message } = req.body;

  try {
    const newMessage = await chatService.sendMessage(sender_id, receiver_id, message);
    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getConversations = async (req, res) => {
  const currentUserId = parseInt(req.user?.id, 10);

  if (isNaN(currentUserId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const conversations = await chatService.getConversations(currentUserId);
    res.json(conversations);
  } catch (err) {
    console.error("Error fetching conversations:", err);
    res.status(500).json({ message: "Server error" });
  }
};



