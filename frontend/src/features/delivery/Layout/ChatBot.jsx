import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { ArrowUpRight } from "lucide-react";
import { useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";

const ChatBot = ({ userId }) => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef();
  const messagesEndRef = useRef();

  // موجود لو احتجتي تتفرعي لاحقًا
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

  return (
    <div
      className="flex flex-col h-full rounded-xl shadow-xl overflow-hidden transition-colors duration-300"
      style={{
        backgroundColor: "var(--div)",
        color: "var(--text)",
      }}
    >

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{ backgroundColor: "var(--div)" }}
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
              className="break-words shadow-sm"
              style={{
                maxWidth: msg.sender === "user" ? "85%" : "65%",
                backgroundColor:
                  msg.sender === "user" ? "var(--button)" : "var(--hover)",
                color: msg.sender === "user" ? "#ffffff" : "var(--text)",
                borderRadius:
                  msg.sender === "user"
                    ? "18px 18px 6px 18px"
                    : "18px 18px 18px 6px",
                padding: msg.sender === "user" ? "12px 16px" : "10px 14px",
                marginBottom: "8px",
                border: "none",
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
            className="max-w-[60%] p-2 rounded-2xl animate-pulse self-start shadow-sm"
            style={{
              backgroundColor: "var(--hover)",
              color: "var(--text)",
              border: "none",
            }}
          >
            Thinking...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className="flex items-center gap-2 p-3"
        style={{
          backgroundColor: "var(--div)",
          borderTop: "none",
          boxShadow: "0 -4px 10px rgba(0,0,0,0.04)",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 rounded-full px-4 py-2 outline-none focus:ring-2 transition-all"
          style={{
            backgroundColor: "var(--textbox)",
            color: "var(--text)",
            border: "none",
            boxShadow: "0 0 0 1px var(--border) inset",
          }}
          placeholder="Type your message..."
        />

        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="p-3 rounded-full flex items-center justify-center transition-all shadow-md"
          style={{
            backgroundColor: "var(--button)",
            color: "#ffffff",
            opacity: !input.trim() ? 0.5 : 1,
            cursor: !input.trim() ? "not-allowed" : "pointer",
            border: "none",
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
