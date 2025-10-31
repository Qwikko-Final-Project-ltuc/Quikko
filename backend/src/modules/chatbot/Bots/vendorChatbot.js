const chatService = require("../chatbotService");
const userSessions = require("../sessionStore");

exports.handleMessage = async (userId, role, message, token) => {
  if (!userSessions[userId]) userSessions[userId] = {};
  try {
    return await chatService.getAIResponse(userId, role, message, token);
  } catch (err) {
    console.error("Error in vendorBot:", err);
    return "⚠️ Sorry, something went wrong while handling your request.";
  }
};
