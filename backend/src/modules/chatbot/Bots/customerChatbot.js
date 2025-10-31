// src/modules/chatbot/bots/customerBot.js
const chatService = require("../chatbotService");

exports.handleMessage = async (userId, role, message, token) => {
  try {
    return await chatService.getAIResponse(userId, "customer", message, token);
  } catch (err) {
    console.error("Error in customerBot:", err);
    return "⚠️ Sorry, something went wrong while handling your request.";
  }
};
