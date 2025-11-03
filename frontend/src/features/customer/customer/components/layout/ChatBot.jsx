import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { ArrowUpRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useSelector } from "react-redux";

const ChatBot = ({ userId }) => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef();
  const messagesEndRef = useRef();
  
  // جلب الـ theme من الـ Redux store
  const theme = useSelector((state) => state.customerTheme.mode);

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

  // تحديد الألوان بناء على الـ theme
  const getBackgroundColor = () => {
    return theme === 'dark' ? 'var(--div)' : 'var(--bg)';
  };

  const getMessageBackgroundColor = (sender) => {
    if (sender === 'user') {
      return 'var(--button)';
    }
    return theme === 'dark' ? 'var(--bg)' : 'var(--div)';
  };

  const getInputBackgroundColor = () => {
    return theme === 'dark' ? 'var(--div)' : 'white';
  };

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    setIsTyping(true);

    socketRef.current.emit("sendMessage", {
      userId,
      role: "customer",
      message: input,
      token: localStorage.getItem("token"),
    });

    setInput("");
  };

  const backgroundColor = getBackgroundColor();
  const inputBackgroundColor = getInputBackgroundColor();

  return (
    <div 
      className="flex flex-col h-full rounded-xl shadow-xl overflow-hidden"
      style={{ backgroundColor, border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div 
        className="p-4 border-b"
        style={{ 
          backgroundColor, 
          color: 'var(--text)',
          borderColor: 'var(--border)'
        }}
      >
        <h3 className="text-lg font-semibold">Customer Support</h3>
        <p className="opacity-90 text-sm">We're here to help you</p>
      </div>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{ backgroundColor }}
      >
        {messages.map((msg, index) => {
          const messageBackgroundColor = getMessageBackgroundColor(msg.sender);
          const isUser = msg.sender === 'user';
          
          return (
            <div
              key={index}
              className={`max-w-[75%] p-3 rounded-2xl shadow-sm break-words whitespace-pre-wrap ${
                isUser
                  ? "self-end ml-auto rounded-br-none text-white"
                  : "self-start rounded-bl-none text-[var(--text)]"
              }`}
              style={{ 
                backgroundColor: messageBackgroundColor,
              }}
            >
              <div className="leading-relaxed">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          );
        })}
        
        {/* Typing indicator */}
        {isTyping && (
          <div 
            className="max-w-[60%] p-3 rounded-2xl self-start rounded-bl-none"
            style={{ 
              backgroundColor: theme === 'dark' ? 'var(--bg)' : 'var(--div)',
              color: 'var(--text)'
            }}
          >
            <div className="flex items-center gap-2">
              <div className="flex space-x-1">
                <div 
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{ backgroundColor: 'var(--text)', opacity: 0.8 }}
                ></div>
                <div 
                  className="w-2 h-2 rounded-full animate-bounce" 
                  style={{ 
                    backgroundColor: 'var(--text)', 
                    opacity: 0.8,
                    animationDelay: "0.1s" 
                  }}
                ></div>
                <div 
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{ 
                    backgroundColor: 'var(--text)', 
                    opacity: 0.8,
                    animationDelay: "0.2s" 
                  }}
                ></div>
              </div>
              <span className="text-sm opacity-90 font-medium">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div 
        className="flex items-center gap-2 p-3 border-t"
        style={{ 
          backgroundColor,
          borderColor: 'var(--border)'
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 rounded-full px-4 py-2 outline-none focus:ring-1 transition-all duration-200 font-medium"
          style={{
            border: '1px solid var(--border)',
            backgroundColor: inputBackgroundColor,
            color: 'var(--text)',
            focusRingColor: 'var(--button)',
            focusBorderColor: 'var(--button)'
          }}
          placeholder="Type your message..."
        />
        <button
          onClick={handleSend}
          className={`p-3 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
            !input.trim() ? "opacity-50 cursor-not-allowed" : ""
          }`}
          style={{ backgroundColor: 'var(--button)' }}
          disabled={!input.trim()}
        >
          <ArrowUpRight size={20} className="text-white" />
        </button>
      </div>
    </div>
  );
};

export default ChatBot;