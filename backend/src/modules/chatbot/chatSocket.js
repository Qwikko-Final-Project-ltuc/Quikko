// src/modules/chatbot/chatSocket.js
const customerBot = require("./Bots/customerChatbot");
const vendorBot = require("./Bots/vendorChatbot");
const adminBot = require("./Bots/adminChatbot");
const deliveryBot = require("./Bots/deliveryChatbot");
const userSessions = require("./sessionStore");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("saveToken", ({ userId, token }) => {
      if (!userSessions[userId]) userSessions[userId] = {};
      userSessions[userId].token = token;
      console.log(`Token saved for user ${userId}`);
    });

    // إرسال واستقبال الرسائل
    socket.on("sendMessage", async ({ userId, role, message, token }) => {
      try {
        // Use token from frontend first, if not exist fallback to session
        const activeToken = token || userSessions[userId]?.token;
        let response = "";

        switch (role) {
          case "customer":
            response = await customerBot.handleMessage(
              userId,
              "customer",
              message,
              activeToken
            );
            break;
          case "vendor":
            response = await vendorBot.handleMessage(
              userId,
              "vendor",
              message,
              activeToken
            );
            break;
          case "delivery":
            response = await deliveryBot.handleMessage(
              userId,
              "delivery",
              message,
              activeToken
            );
            break;
          case "admin":
            response = await adminBot.handleMessage(
              userId,
              "admin",
              message,
              activeToken
            );
            break;
          default:
            response = "Unknown role. Please specify your role.";
        }

        socket.emit("receiveMessage", { role, message, response });
      } catch (err) {
        console.error("Error in chatSocket:", err);
        socket.emit("receiveMessage", {
          message,
          response: "⚠️ Sorry, something went wrong on the server.",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
