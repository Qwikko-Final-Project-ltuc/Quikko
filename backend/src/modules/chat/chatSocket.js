// backend/src/modules/chat/chatSocket.js
const { roomKey } = require("./helper/chatrooms");

module.exports = function initChatSocket(io) {
  if (!io) {
    throw new Error("Socket.io instance is required for chat socket");
  }

  io.on("connection", (socket) => {
    console.log("🔌 User connected:", socket.id);

    socket.on("joinChat", ({ room, user1, user2 }) => {
      const key = room || roomKey(user1, user2);
      if (!key) return;
      socket.join(key);
      console.log("🟢", socket.id, "joined", key);
    });

    socket.on("leaveChat", ({ room, user1, user2 }) => {
      const key = room || roomKey(user1, user2);
      if (!key) return;
      socket.leave(key);
      console.log("🚪", socket.id, "left", key);
    });

    socket.on("disconnect", () => {
      console.log("❌", socket.id, "disconnected");
    });
  });
};
