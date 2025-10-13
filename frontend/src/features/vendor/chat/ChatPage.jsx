import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { fetchConversations, fetchMessages, sendMessage } from "../VendorAPI2";
import { getUserIdFromToken } from "./auth";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";

dayjs.extend(relativeTime);
dayjs.extend(utc);

const ChatPage = () => {
  const { isDarkMode } = useOutletContext();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const currentUserId = getUserIdFromToken();

  useEffect(() => {
    const loadConversations = async () => {
      const data = await fetchConversations();
      setConversations(data);
    };
    loadConversations();
  }, []);

  const handleSelectUser = async (conversation) => {
    if (!conversation) return;

    const otherUserId =
      conversation.sender_id === currentUserId ? conversation.receiver_id : conversation.sender_id;
    const otherUserName =
      conversation.sender_id === currentUserId ? conversation.receiver_name : conversation.sender_name;

    setSelectedUser(otherUserId);
    setSelectedUserName(otherUserName);

    const msgs = await fetchMessages(otherUserId);
    setMessages(msgs);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    const msg = await sendMessage(selectedUser, newMessage);
    if (msg) {
      setMessages((prev) => [...prev, msg]);
      setNewMessage("");
    }
  };

  const sortedConversations = [...conversations].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  // ← ألوان الوضع الداكن / الفاتح
  const pageBg = isDarkMode ? "#242625" : "#f0f2f1";
  const divBg = isDarkMode ? "#666666" : "#ffffff";
  const textColor = isDarkMode ? "#ffffff" : "#242625";
  const buttonBg = "#307A59";
  const textboxBg = "#f9f9f9";
  const lineColor = isDarkMode ? "#f9f9f9" : "#ccc";

  return (
    <div className="flex h-screen" style={{ backgroundColor: pageBg, color: textColor }}>
      {/* العمود الأيسر - قائمة المحادثات */}
      <div
        className="w-1/3 border-r p-4 overflow-y-auto rounded-lg "
        style={{ backgroundColor: divBg, borderColor: lineColor }}
      >
        <h2 className="font-bold mb-4" style={{ color: textColor }}>
          Chats
        </h2>
        {sortedConversations.map((conv, idx) => {
          const isMine = conv.sender_id === currentUserId;
          const otherUserId = isMine ? conv.receiver_id : conv.sender_id;
          const otherUserName = isMine ? conv.receiver_name : conv.sender_name;

          return (
            <div
              key={conv.id || idx}
              onClick={() => handleSelectUser(conv)}
              className="p-4 cursor-pointer border-b flex justify-between items-center hover:bg-gray-100 transition"
              style={{ backgroundColor: divBg, color: textColor, borderColor: lineColor }}
            >
              <div className="flex flex-col">
                <span className="font-semibold">{otherUserName}</span>
                <span className="text-sm truncate max-w-[200px]">{conv.message}</span>
              </div>
              <div className="text-xs flex-shrink-0 ml-2">{dayjs(conv.created_at).fromNow()}</div>
            </div>
          );
        })}
      </div>

      {/* العمود الأيمن - المحادثة المفتوحة */}
      <div className="w-2/3 flex flex-col">
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b flex-shrink-0 rounded-lg"
          style={{ backgroundColor: divBg, color: textColor, borderColor: lineColor }}
        >
          <span className="font-semibold truncate">{selectedUserName || "Select a conversation"}</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 rounded-lg" style={{ backgroundColor: pageBg }}>
          {messages.length === 0 && selectedUser && (
            <div className="text-center mt-4">No messages yet. Start the conversation!</div>
          )}
          {messages.map((msg) => {
            const isMine = msg.sender_id === currentUserId;
            const time = dayjs(msg.created_at).fromNow();

            return (
              <div key={msg.id} className={`flex flex-col ${isMine ? "items-end" : "items-start"} px-2`}>
                <div
                  className="px-4 py-2 rounded-lg break-words max-w-[60%] border"
                  style={{
                    backgroundColor: isMine ? buttonBg : divBg,
                    color: isMine ? "#fff" : textColor,
                    borderColor: lineColor,
                  }}
                >
                  {msg.message}
                </div>
                <span className={`text-xs mt-1 ${isMine ? "text-right" : "text-left"}`} style={{ color: textColor }}>
                  {time}
                </span>
              </div>
            );
          })}
        </div>

        {/* Input */}
        {selectedUser ? (
          <div
            className="p-4 border-t flex items-center gap-2 flex-shrink-0 rounded-lg"
            style={{ backgroundColor: divBg, borderColor: lineColor }}
          >
            <input
              type="text"
              className="flex-1 rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
              style={{ borderColor: lineColor, backgroundColor: textboxBg, color: textColor }}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type a message..."
            />
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 rounded-lg hover:opacity-90 transition"
              style={{ backgroundColor: buttonBg, color: "#fff" }}
            >
              Send
            </button>
          </div>
        ) : (
          <div className="p-4 text-center" style={{ color: textColor }}>
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
