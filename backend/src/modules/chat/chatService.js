const ChatModel = require('./chatModel');
const pool = require("../../config/db");
const { saveToFirebase } = require('../../infrastructure/firebase');

/**
 * @module ChatService
 * @desc Handles business logic for chat messages, integrating database operations with Firebase real-time updates.
 */

/**
 * @function getMessages
 * @desc Retrieves all chat messages between two users.
 *
 * @param {string|number} user1 - ID of the first user
 * @param {string|number} user2 - ID of the second user
 * @returns {Promise<Array<Object>>} Array of chat message objects
 *
 * @example
 * const messages = await ChatService.getMessages(1, 2);
 * console.log(messages);
 */
exports.getMessages = async (user1, user2) => {
  return await ChatModel.getAllMessages(user1, user2);
};

/**
 * @function sendMessage
 * @desc Sends a new chat message from one user to another.
 *       Saves it in PostgreSQL and triggers a Firebase real-time update.
 *
 * @param {string|number} sender_id - ID of the sender
 * @param {string|number} receiver_id - ID of the receiver
 * @param {string} message - Message content
 * @returns {Promise<Object>} The newly created chat message object
 *
 * @example
 * const newMessage = await ChatService.sendMessage(1, 2, "Hello!");
 * console.log(newMessage);
 */
exports.sendMessage = async (sender_id, receiver_id, message) => {
  const chatMessage = await ChatModel.createMessage(sender_id, receiver_id, message);
  await saveToFirebase(chatMessage); // Trigger real-time update in Firebase
  return chatMessage;
};

// chatService.js
exports.getConversations = async (userId) => {
  const { rows } = await pool.query(
    `
    SELECT DISTINCT ON (
      LEAST(cm.sender_id, cm.receiver_id), GREATEST(cm.sender_id, cm.receiver_id)
    )
      cm.id,
      cm.sender_id,
      cm.receiver_id,
      cm.message,
      cm.created_at,
      u1.name AS sender_name,
      u2.name AS receiver_name
    FROM chat_messages cm
    JOIN users u1 ON cm.sender_id = u1.id
    JOIN users u2 ON cm.receiver_id = u2.id
    WHERE cm.sender_id = $1 OR cm.receiver_id = $1
    ORDER BY LEAST(cm.sender_id, cm.receiver_id), GREATEST(cm.sender_id, cm.receiver_id), cm.created_at DESC
    `,
    [userId]
  );
  return rows;
};

