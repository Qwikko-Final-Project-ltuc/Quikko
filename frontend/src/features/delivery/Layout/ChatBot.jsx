import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { ArrowUpRight } from "lucide-react";
import { useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";

const ChatBot = ({ userId }) => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Welcome to QWIKKO. How can I help you?" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef();
  const messagesEndRef = useRef();

  const isDarkMode = useSelector((state) => state.deliveryTheme.darkMode);

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
      role: "delivery",
      message: input,
      token: localStorage.getItem("token"),
    });

    setInput("");
  };

  // === ألوان بنفس ستايل المثال (ألوان فقط) ===
  const bgPanel = isDarkMode ? "var(--div)" : "var(--bg)";
  const panelGradient = isDarkMode
    ? "linear-gradient(rgba(255,255,255,0.02), rgba(255,255,255,0.02))"
    : "linear-gradient(rgba(255,255,255,0.8), rgba(255,255,255,0.8))";

  const sectionGradient = isDarkMode
    ? "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)"
    : "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)";

  const msgBg = (sender) =>
    sender === "user"
      ? "var(--button)"
      : isDarkMode
      ? "var(--bg)"
      : "var(--div)";

  const msgBorder = isDarkMode
    ? "1px solid rgba(255,255,255,0.1)"
    : "1px solid rgba(0,0,0,0.05)";

  const inputBg = isDarkMode ? "var(--div)" : "white";

  return (
    <div
      className="flex flex-col h-full rounded-xl shadow-xl overflow-hidden transition-colors duration-300"
      style={{
        backgroundColor: bgPanel,
        color: "var(--text)",
        border: "1px solid var(--border)",
        backgroundImage: panelGradient,
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{
          backgroundColor: bgPanel,
          backgroundImage: "none",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className="flex w-full"
            style={{
              justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              className="break-words shadow-sm transition-all duration-300 hover:shadow-md"
              style={{
                maxWidth: msg.sender === "user" ? "85%" : "65%",
                backgroundColor: msgBg(msg.sender),
                color: msg.sender === "user" ? "#ffffff" : "var(--text)",
                borderRadius:
                  msg.sender === "user"
                    ? "18px 18px 6px 18px"
                    : "18px 18px 18px 6px",
                padding: msg.sender === "user" ? "12px 16px" : "10px 14px",
                marginBottom: "8px",
                border: msgBorder, // نفس ستايل المثال
                backdropFilter: "blur(10px)",
              }}
            >
              <ReactMarkdown
                components={{
                  a: ({ node, ...props }) => (
                    <a
                      {...props}
                      style={{
                        color: "var(--primary)",
                        textDecoration: "underline",
                      }}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  ),
                  code: ({ inline, ...props }) =>
                    inline ? (
                      <code
                        {...props}
                        style={{
                          background: "var(--hover)",
                          padding: "2px 6px",
                          borderRadius: "6px",
                          fontFamily:
                            "ui-monospace, SFMono-Regular, Menlo, monospace",
                        }}
                      />
                    ) : (
                      <pre
                        style={{
                          background: "var(--hover)",
                          padding: "10px",
                          borderRadius: "10px",
                          overflowX: "auto",
                        }}
                      >
                        <code {...props} />
                      </pre>
                    ),
                }}
              >
                {msg.text}
              </ReactMarkdown>
            </div>
          </div>
        ))}

        {isTyping && (
          <div
            className="max-w-[60%] p-2 rounded-2xl self-start shadow-sm"
            style={{
              backgroundColor: isDarkMode ? "var(--bg)" : "var(--div)",
              color: "var(--text)",
              border: msgBorder,
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="flex space-x-1.5">
                <div
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{ backgroundColor: "var(--text)", opacity: 0.8 }}
                />
                <div
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{
                    backgroundColor: "var(--text)",
                    opacity: 0.8,
                    animationDelay: "0.1s",
                  }}
                />
                <div
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{
                    backgroundColor: "var(--text)",
                    opacity: 0.8,
                    animationDelay: "0.2s",
                  }}
                />
              </div>
              <span className="text-sm opacity-90 font-semibold">
                Thinking...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className="flex items-center gap-2 p-3 border-t"
        style={{
          backgroundColor: bgPanel,
          borderTop: "1px solid var(--border)",
          backgroundImage: sectionGradient,
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 rounded-full px-4 py-2 outline-none transition-all"
          style={{
            backgroundColor: inputBg,
            color: "var(--text)",
            border: "1px solid var(--border)",
            boxShadow: "none",
            backdropFilter: "blur(10px)",
          }}
          placeholder="Type your message..."
        />

        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className={`p-3 rounded-full flex items-center justify-center transition-all shadow-md ${
            !input.trim()
              ? "opacity-50 cursor-not-allowed grayscale"
              : "hover:shadow-lg"
          }`}
          style={{
            backgroundColor: "var(--button)",
            color: "#ffffff",
            border: "none",
            backdropFilter: "blur(10px)",
          }}
          title="Send"
          aria-label="Send message"
        >
          <ArrowUpRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
