const chatService = require("../chatbotService");

exports.handleMessage = async (userId, role, message, token) => {
  try {
    return await chatService.getAIResponse(userId, role, message, token);
  } catch (err) {
    console.error("Error in chatbot handler:", err);
    return "⚠️ Sorry, something went wrong while handling your request.";
  }
};
