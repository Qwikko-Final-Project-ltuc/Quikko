// src/modules/chatbot/bots/deliveryBot.js
const chatService = require("../chatbotService");

exports.handleMessage = async (userId, role, message, token) => {
  try {
    // نرسل كل شيء للـ AI + Intent Handler
    return await chatService.getAIResponse(userId, "delivery", message, token);
  } catch (err) {
    console.error("Error in deliveryBot:", err);
    return "⚠️ Sorry, something went wrong while handling your request.";
  }
};
