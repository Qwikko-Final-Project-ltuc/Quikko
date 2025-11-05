import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { ArrowUpRight } from "lucide-react";
import ReactMarkdown from "react-markdown";

const ChatBot = ({ userId }) => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: " How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef();
  const messagesEndRef = useRef();

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
      role: "vendor",
      message: input,
      token: localStorage.getItem("token"),
    });

    setInput("");
  };

  return (
    <div
      className="flex flex-col h-full rounded-xl shadow-xl overflow-hidden"
      style={{ backgroundColor: "#ffffff", color: "#292e2c" }}
    >
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className="max-w-[75%] p-3 rounded-2xl shadow-sm break-words"
            style={{
              backgroundColor: msg.sender === "user" ? "#026a4b" : "#f5f6f5",
              color: msg.sender === "user" ? "#ffffff" : "#292e2c",
              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
              borderBottomRightRadius: msg.sender === "user" ? 0 : "1rem",
              borderBottomLeftRadius: msg.sender === "bot" ? 0 : "1rem",
            }}
          >
            <ReactMarkdown>{msg.text}</ReactMarkdown>
          </div>
        ))}

        {/* typing indicator */}
        {isTyping && (
          <div
            className="max-w-[60%] p-2 rounded-2xl animate-pulse"
            style={{
              backgroundColor: "#f5f6f5",
              color: "#292e2c",
              alignSelf: "flex-start",
            }}
          >
            Thinking...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className="flex items-center gap-2 p-3 border-t"
        style={{ backgroundColor: "#f5f6f5", borderColor: "#e0e0e0" }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 rounded-full px-4 py-2 outline-none"
          style={{
            border: "1px solid #ccc",
            backgroundColor: "#ffffff",
            color: "#292e2c",
          }}
          placeholder="Type your message..."
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="p-3 rounded-full flex items-center justify-center transition-shadow shadow-md"
          style={{
            backgroundColor: "#026a4b",
            color: "#ffffff",
            opacity: !input.trim() ? 0.5 : 1,
            cursor: !input.trim() ? "not-allowed" : "pointer",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#025438")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#026a4b")}
        >
          <ArrowUpRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatBot;

