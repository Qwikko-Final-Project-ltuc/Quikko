import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { ArrowUpRight } from "lucide-react";
import { useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";

const ChatBotAdmin = ({ userId }) => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef();
  const messagesEndRef = useRef();

  const isDarkMode = useSelector((state) => state.adminTheme?.darkMode); // إذا عندك dark mode خاص بالـ admin

  useEffect(() => {
    socketRef.current = io("http://localhost:3000");
    const token = localStorage.getItem("token");
    socketRef.current.emit("saveToken", { userId, token });

    socketRef.current.on("receiveMessage", ({ response }) => {
      setMessages((prev) => [...prev, { sender: "bot", text: response }]);
      setIsTyping(false);
    });

    return () => socketRef.current.disconnect();
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    setIsTyping(true);

    socketRef.current.emit("sendMessage", {
      userId,
      role: "admin", // ⚡ هنا الفرق عن نسخة الـ delivery
      message: input,
      token: localStorage.getItem("token"),
    });

    setInput("");
  };

  return (
    <div
      className="flex flex-col h-full rounded-xl shadow-xl overflow-hidden transition-colors duration-300"
      style={{
        backgroundColor: isDarkMode ? "#242625" : "#ffffff",
        color: isDarkMode ? "#ffffff" : "#242625",
      }}
    >
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className="flex w-full"
            style={{
              justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              className="break-words shadow-sm"
              style={{
                maxWidth: msg.sender === "user" ? "85%" : "65%",
                backgroundColor:
                  msg.sender === "user"
                    ? "#307A59"
                    : isDarkMode
                    ? "#666666"
                    : "#f9f9f9",
                color:
                  msg.sender === "user"
                    ? "#ffffff"
                    : isDarkMode
                    ? "#ffffff"
                    : "#242625",
                borderRadius:
                  msg.sender === "user"
                    ? "20px 20px 5px 20px"
                    : "20px 20px 20px 5px",
                padding: msg.sender === "user" ? "12px 16px" : "10px 14px",
                marginBottom: "8px",
              }}
            >
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          </div>
        ))}

        {isTyping && (
          <div
            className="max-w-[60%] p-2 rounded-2xl animate-pulse self-start"
            style={{
              backgroundColor: isDarkMode ? "#666666" : "#f9f9f9",
              color: isDarkMode ? "#ffffff" : "#555555",
            }}
          >
            Thinking...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div
        className="flex items-center gap-2 p-3 border-t transition-colors duration-300"
        style={{
          backgroundColor: isDarkMode ? "#666666" : "#f9f9f9",
          borderColor: isDarkMode ? "#f9f9f9" : "#e5e7eb",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 rounded-full px-4 py-2 outline-none focus:ring-2 transition-all"
          style={{
            backgroundColor: isDarkMode ? "#242625" : "#ffffff",
            color: isDarkMode ? "#ffffff" : "#242625",
            border: `1px solid ${isDarkMode ? "#f9f9f9" : "#ccc"}`,
            boxShadow: isDarkMode
              ? "0 0 0 1px #307A59 inset"
              : "0 0 0 1px #ccc inset",
          }}
          placeholder="Type your message..."
        />

        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="p-3 rounded-full flex items-center justify-center transition-all shadow-md"
          style={{
            backgroundColor: "#307A59",
            color: "#ffffff",
            opacity: !input.trim() ? 0.5 : 1,
            cursor: !input.trim() ? "not-allowed" : "pointer",
          }}
        >
          <ArrowUpRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatBotAdmin;
