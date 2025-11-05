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
      className="flex flex-col h-full rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm"
      style={{ 
        backgroundColor, 
        border: '1px solid var(--border)',
        backgroundImage: theme === 'dark' 
          ? 'linear-gradient(rgba(255,255,255,0.02), rgba(255,255,255,0.02))' 
          : 'linear-gradient(rgba(255,255,255,0.8), rgba(255,255,255,0.8))'
      }}
    >
      {/* Header */}
      <div 
        className="p-5 border-b"
        style={{ 
          backgroundColor, 
          color: 'var(--text)',
          borderColor: 'var(--border)',
          backgroundImage: theme === 'dark' 
            ? 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)' 
            : 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)'
        }}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div 
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: 'var(--button)' }}
            ></div>
            <div 
              className="absolute inset-0 rounded-full animate-ping"
              style={{ backgroundColor: 'var(--button)', opacity: 0.4 }}
            ></div>
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight">Customer Support</h3>
            <p className="opacity-80 text-sm font-medium">We're here to help you</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto p-5 space-y-6 bg-gradient-to-b from-transparent to-transparent"
        style={{ backgroundColor }}
      >
        {messages.map((msg, index) => {
          const messageBackgroundColor = getMessageBackgroundColor(msg.sender);
          const isUser = msg.sender === 'user';
          
          return (
            <div
              key={index}
              className={`relative group ${isUser ? "ml-auto" : "mr-auto"}`}
            >
              {/* الرسالة */}
              <div
                className={`max-w-[80%] p-4 rounded-2xl shadow-sm break-words whitespace-pre-wrap transition-all duration-300 hover:shadow-md ${
                  isUser
                    ? "self-end ml-auto rounded-br-md text-white"
                    : "self-start rounded-bl-md text-[var(--text)]"
                }`}
                style={{ 
                  backgroundColor: messageBackgroundColor,
                  border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div className="leading-relaxed font-medium">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
              
              {/* الساعة خارج حدود الرسالة */}
              <div 
                className={`absolute -bottom-5 text-xs opacity-60 font-medium transition-opacity duration-300 group-hover:opacity-80 ${
                  isUser 
                    ? 'text-white/80 right-0 text-right' 
                    : 'text-[var(--text)]/70 left-0 text-left'
                }`}
              >
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          );
        })}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="relative group">
            <div 
              className="max-w-[60%] p-4 rounded-2xl self-start rounded-bl-md transition-all duration-300"
              style={{ 
                backgroundColor: theme === 'dark' ? 'var(--bg)' : 'var(--div)',
                color: 'var(--text)',
                border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className="flex items-center gap-3">
                <div className="flex space-x-1.5">
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
                <span className="text-sm opacity-90 font-semibold">Thinking...</span>
              </div>
            </div>
            {/* الساعة للـ Typing Indicator */}
            <div 
              className="absolute -bottom-5 left-0 text-xs opacity-60 font-medium transition-opacity duration-300 group-hover:opacity-80 text-[var(--text)]/70"
            >
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div 
        className="p-4 border-t"
        style={{ 
          backgroundColor,
          borderColor: 'var(--border)',
          backgroundImage: theme === 'dark' 
            ? 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)' 
            : 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)'
        }}
      >
        <div className="flex items-center gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 rounded-2xl px-5 py-3.5 outline-none focus:ring-2 transition-all duration-300 font-medium text-lg shadow-lg"
            style={{
              border: '1px solid var(--border)',
              backgroundColor: inputBackgroundColor,
              color: 'var(--text)',
              focusRingColor: 'var(--button)',
              focusBorderColor: 'var(--button)',
              backdropFilter: 'blur(10px)'
            }}
            placeholder="Type your message..."
          />
          <button
            onClick={handleSend}
            className={`p-4 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 ${
              !input.trim() ? "opacity-50 cursor-not-allowed grayscale" : "hover:-translate-y-1"
            }`}
            style={{ 
              backgroundColor: 'var(--button)',
              backdropFilter: 'blur(10px)'
            }}
            disabled={!input.trim()}
          >
            <ArrowUpRight size={22} className="text-white" />
          </button>
        </div>
        <div className="text-center mt-3">
          <span 
            className="text-xs font-medium opacity-60"
            style={{ color: 'var(--text)' }}
          >
            Press Enter to send • We respond within minutes
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;