import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { ArrowUpRight } from "lucide-react";
import ReactMarkdown from "react-markdown";

const ChatBot = ({ userId }) => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: " How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false); // ✨ جديد
  const socketRef = useRef();
  const messagesEndRef = useRef();

  useEffect(() => {
    socketRef.current = io("http://localhost:3000");
    const token = localStorage.getItem("token");
    socketRef.current.emit("saveToken", { userId, token });

    socketRef.current.on("receiveMessage", ({ response }) => {
      setMessages((prev) => [...prev, { sender: "bot", text: response }]);
      setIsTyping(false); // لما يوصل الرد، نخفي المؤشر
    });

    return () => socketRef.current.disconnect();
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    setIsTyping(true); // ✨ بدأ AI يفكر

    socketRef.current.emit("sendMessage", {
      userId,
      role: "vendor",
      message: input,
      token: localStorage.getItem("token"),
    });

    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-xl overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-[75%] p-3 rounded-2xl shadow-sm break-words ${
              msg.sender === "user"
                ? "bg-black text-white self-end ml-auto rounded-br-none"
                : "bg-gray-200 text-gray-800 self-start rounded-bl-none"
            }`}
          >
            <ReactMarkdown>{msg.text}</ReactMarkdown>
          </div>
        ))}

        {/* typing indicator */}
        {isTyping && (
          <div className="max-w-[60%] p-2 bg-gray-100 text-gray-600 rounded-2xl animate-pulse self-start">
            Thinking...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 p-3 border-t bg-gray-50">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Type your message..."
        />
        <button
          onClick={handleSend}
          className={`bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full flex items-center justify-center transition-shadow shadow-md ${
            !input.trim() ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={!input.trim()}
        >
          <ArrowUpRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
