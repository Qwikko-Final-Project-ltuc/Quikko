import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { ArrowUpRight, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useSelector } from "react-redux";

const ChatBot = ({ userId, onClose }) => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Welcome To Qwikko, How can I help you?" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef();
  const messagesEndRef = useRef();
  const chatContainerRef = useRef();
  
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
    return theme === 'dark' ? 'var(--bg)' : 'var(--textbox)';
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

  // إغلاق الشات عند الضغط خارج النافذة
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatContainerRef.current && !chatContainerRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const backgroundColor = getBackgroundColor();
  const inputBackgroundColor = getInputBackgroundColor();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div 
        ref={chatContainerRef}
        className="flex flex-col h-[510px] w-[350px] rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm"
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
          className="p-3 border-b relative"
          style={{ 
            backgroundColor, 
            color: 'var(--text)',
            borderColor: 'var(--border)',
            backgroundImage: theme === 'dark' 
              ? 'linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(64, 62, 62, 0.36) 100%)' 
              : 'linear-gradient(135deg, rgba(225, 230, 210, 0.54) 0%, rgba(249, 249, 249, 0.44) 100%)'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div 
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: 'var(--button)' }}
                ></div>
                <div 
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{ backgroundColor: 'var(--button)', opacity: 0.4 }}
                ></div>
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">Customer Support</h3>
                <p className="opacity-80 text-xs font-medium">We're here to help you</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-red-500/20 transition-colors duration-200"
              style={{ color: 'var(--text)' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div 
          className="flex-1 overflow-y-auto p-3 space-y-3"
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
                  className={`max-w-[85%] p-3 rounded-xl shadow-sm break-words whitespace-pre-wrap transition-all duration-300 hover:shadow-md ${
                    isUser
                      ? "self-end ml-auto rounded-br-sm text-white"
                      : "self-start rounded-bl-sm text-[var(--text)]"
                  }`}
                  style={{ 
                    backgroundColor: messageBackgroundColor,
                    border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div className="leading-relaxed text-sm">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
                
                {/* الساعة خارج حدود الرسالة */}
                <div 
                  className={`absolute -bottom-4 text-[10px] opacity-60 font-medium transition-opacity duration-300 group-hover:opacity-80 ${
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
                className="max-w-[70%] p-3 rounded-xl self-start rounded-bl-sm transition-all duration-300"
                style={{ 
                  backgroundColor: theme === 'dark' ? 'var(--bg)' : 'var(--textbox)',
                  color: 'var(--text)',
                  border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div 
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ backgroundColor: 'var(--text)', opacity: 0.8 }}
                    ></div>
                    <div 
                      className="w-1.5 h-1.5 rounded-full animate-bounce" 
                      style={{ 
                        backgroundColor: 'var(--text)', 
                        opacity: 0.8,
                        animationDelay: "0.1s" 
                      }}
                    ></div>
                    <div 
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ 
                        backgroundColor: 'var(--text)', 
                        opacity: 0.8,
                        animationDelay: "0.2s" 
                      }}
                    ></div>
                  </div>
                  <span className="text-xs opacity-90 font-semibold">Thinking...</span>
                </div>
              </div>
              {/* الساعة للـ Typing Indicator */}
              <div 
                className="absolute -bottom-4 left-0 text-[10px] opacity-60 font-medium transition-opacity duration-300 group-hover:opacity-80 text-[var(--text)]/70"
              >
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div 
          className="p-3 border-t"
          style={{ 
            backgroundColor,
            borderColor: 'var(--border)',
            backgroundImage: theme === 'dark' 
              ? 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)' 
              : 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)'
          }}
        >
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 rounded-xl px-3 py-2 outline-none focus:ring-2 transition-all duration-300 font-medium text-sm shadow-lg"
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
              className={`p-2.5 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 ${
                !input.trim() ? "opacity-50 cursor-not-allowed grayscale" : "hover:-translate-y-0.5"
              }`}
              style={{ 
                backgroundColor: 'var(--button)',
                backdropFilter: 'blur(10px)'
              }}
              disabled={!input.trim()}
            >
              <ArrowUpRight size={18} className="text-white" />
            </button>
          </div>
          <div className="text-center mt-2">
            <span 
              className="text-[10px] font-medium opacity-60"
              style={{ color: 'var(--text)' }}
            >
              Press Enter to send • Quick responses
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;