const notificationService = require("./notificationService");

/**
 * @route POST /notifications
 * @desc Send a notification to a single user (by userId) or a group of users (by role)
 * @access Protected (requires JWT token)
 * @body {number} [userId] - Target user ID (optional if role is provided)
 * @body {string} [role] - Target role (optional if userId is provided)
 * @body {string} title - Notification title (required)
 * @body {string} message - Notification body/message (required)
 * @body {string} [type="general"] - Notification type/category
 * @returns {object} success message
 * @throws {400} If neither userId nor role is provided, or title/message is missing
 * @throws {500} If sending notification fails
 */
exports.sendNotification = async (req, res) => {
  try {
    const { userId, role, title, message, type } = req.body;

    if ((!userId && !role) || !title || !message) {
      return res.status(400).json({
        error: "userId OR role is required, along with title and message",
      });
    }

    if (userId) {
      await notificationService.sendNotificationToUser(userId, { title, message, type });
    } else if (role) {
      await notificationService.sendNotificationToRole(role, { title, message, type });
    }

    res.json({ message: "Notification sent successfully" });
  } catch (err) {
    console.error("Error sending notification:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * @route GET /notifications
 * @desc Retrieve all notifications for the currently logged-in user
 * @access Protected (requires JWT token)
 * @query {number} [userId] - Optional query parameter (not used directly here, uses req.user.id)
 * @returns {Array} Array of notification objects
 * @throws {500} If fetching notifications fails
 */
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await notificationService.getUserNotifications(req.user.id);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
