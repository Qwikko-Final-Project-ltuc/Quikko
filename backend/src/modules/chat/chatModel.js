const pool = require('../../config/db');

/**
 * @module ChatModel
 * @desc Handles database operations for chat messages.
 */

 /**
  * @function getAllMessages
  * @async
  * @desc Retrieves all chat messages between two users.
  *
  * @param {string|number} user1 - ID of the first user
  * @param {string|number} user2 - ID of the second user
  * @returns {Promise<Array<Object>>} Array of chat message objects
  *
  * @example
  * const messages = await ChatModel.getAllMessages(1, 2);
  * console.log(messages);
  */
exports.getAllMessages = async (user1, user2) => {
  const { rows } = await pool.query(
    `SELECT * FROM chat_messages
     WHERE (sender_id=$1 AND receiver_id=$2)
        OR (sender_id=$2 AND receiver_id=$1)
     ORDER BY created_at ASC`,
    [user1, user2]
  );
  return rows;
};



/**
 * @function createMessage
 * @async
 * @desc Inserts a new chat message into the database.
 *
 * @param {string|number} sender_id - ID of the sender user
 * @param {string|number} receiver_id - ID of the receiver user
 * @param {string} message - Message text content
 * @returns {Promise<Object>} The newly created chat message object
 *
 * @example
 * const newMsg = await ChatModel.createMessage(1, 2, "Hello!");
 * console.log(newMsg);
 */
exports.createMessage = async (sender_id, receiver_id, message) => {
  const { rows } = await pool.query(
    `INSERT INTO chat_messages (sender_id, receiver_id, message)
     VALUES ($1, $2, $3) RETURNING *`,
    [sender_id, receiver_id, message]
  );
  return rows[0];
};
