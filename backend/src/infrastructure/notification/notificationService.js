const { admin } = require("../firebase");
const NotificationModel = require("./notificationModel");
const pool = require("../../config/db");

/**
 * ===============================
 * Notification Service
 * ===============================
 * @module NotificationService
 * @desc Handles sending notifications via FCM and storing them in the database.
 */

/**
 * Send a push notification to a single user and store it in DB
 * @async
 * @param {number} userId - ID of the user
 * @param {Object} payload - Notification details
 * @param {string} payload.title - Notification title
 * @param {string} payload.message - Notification body
 * @param {string} [payload.type="general"] - Notification type
 * @returns {Promise<Object>} Success status
 */
exports.sendNotificationToUser = async (userId, { title, message, type }) => {
  // Fetch user's FCM token
  const userRes = await pool.query(
    "SELECT fcm_token FROM users WHERE id = $1",
    [userId]
  );
  if (userRes.rows.length === 0) throw new Error("User not found");

  const token = userRes.rows[0].fcm_token;
  if (!token) throw new Error("User has no FCM token");

  // Send FCM notification
  await admin.messaging().send({
    token,
    notification: { title, body: message },
    data: { type: type || "general" },
  });

  // Save in DB
  await NotificationModel.insertNotification(userId, { title, message, type });
  return { success: true };
};

/**
 * Send a push notification to all users with a specific role
 * @async
 * @param {string} role - User role
 * @param {Object} payload - Notification details
 * @param {string} payload.title - Notification title
 * @param {string} payload.message - Notification body
 * @param {string} [payload.type="general"] - Notification type
 * @returns {Promise<Object>} Success status + count of users notified
 */
exports.sendNotificationToRole = async (role, { title, message, type }) => {
  const usersRes = await pool.query(
    "SELECT id, fcm_token FROM users WHERE role = $1",
    [role]
  );
  if (usersRes.rows.length === 0)
    throw new Error("No users found with that role");

  const tokens = usersRes.rows
    .filter((u) => u.fcm_token)
    .map((u) => u.fcm_token);
  if (tokens.length === 0) throw new Error("No users have FCM tokens");

  const payload = {
    tokens,
    notification: { title, body: message },
    data: { type: type || "general" },
  };

  const response = await admin.messaging().sendEachForMulticast(payload);

  response.responses.forEach((r, idx) => {
    if (!r.success) {
      console.warn(`Failed token: ${tokens[idx]} => ${r.error.code}`);
      if (r.error.code === "messaging/registration-token-not-registered") {
        const userId = usersRes.rows[idx].id;
        pool.query("UPDATE users SET fcm_token = NULL WHERE id = $1", [userId]);
      }
    }
  });

  for (const user of usersRes.rows) {
    await NotificationModel.insertNotification(user.id, {
      title,
      message,
      type,
    });
  }

  return { success: true, count: usersRes.rows.length };
};

/**
 * Retrieve all notifications for a specific user
 * @async
 * @param {number} userId - ID of the user
 * @returns {Promise<Array>} Array of notification objects
 */
exports.getUserNotifications = async (userId) => {
  return await NotificationModel.getNotificationsByUserId(userId);
};
