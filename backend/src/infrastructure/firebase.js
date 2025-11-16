const admin = require("firebase-admin");
// const serviceAccount = require("../../serviceAccountKey.json");
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);
/**
 * @module FirebaseConfig
 * @desc Initializes Firebase Admin SDK and provides helper functions for Firestore.
 * 
 * @example
 * const { admin, db, saveToFirebase } = require('../config/firebase');
 * await saveToFirebase({ sender_id: 1, receiver_id: 2, message: 'Hello!', read_status: false, created_at: new Date() });
 */

admin.initializeApp({
  /**
   * @property {Object} credential - Firebase service account credentials.
   */
  credential: admin.credential.cert(serviceAccount),

  /**
   * @property {string} databaseURL - Firebase Realtime Database URL.
   */
  databaseURL: "https://qwikko-b7ace.firebaseio.com"
});

/**
 * @constant
 * @type {FirebaseFirestore.Firestore}
 * @desc Firestore database instance for reading/writing documents.
 */
const db = admin.firestore();

/**
 * @function saveToFirebase
 * @desc Saves a chat message to Firestore under a structured path:
 *       chats/{chatId}/messages/{auto-generated-doc}.
 * 
 * @param {Object} message - The message object to save.
 * @param {number|string} message.sender_id - ID of the sender.
 * @param {number|string} message.receiver_id - ID of the receiver.
 * @param {string} message.message - Message content.
 * @param {boolean} message.read_status - Message read status.
 * @param {Date} message.created_at - Timestamp of message creation.
 * @returns {Promise<void>} Resolves when the message is successfully saved.
 * @throws Will throw an error if writing to Firestore fails.
 */
const saveToFirebase = async (message) => {
  const chatId = `chat_${message.sender_id}_${message.receiver_id}`;
  const docRef = db.collection('chats').doc(chatId).collection('messages').doc();
  await docRef.set({
    sender_id: message.sender_id,
    receiver_id: message.receiver_id,
    message: message.message,
    read_status: message.read_status,
    created_at: message.created_at
  });
};

// Export admin, db, and saveToFirebase helper
module.exports = { admin, db, saveToFirebase };
