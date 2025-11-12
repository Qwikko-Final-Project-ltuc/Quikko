import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { ArrowUpRight } from "lucide-react";
import { useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";

const ChatBotAdmin = ({ userId }) => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Welcome to Qwikko, How can I help you ?" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef();
  const messagesEndRef = useRef();

  const { mode } = useSelector((state) => state.theme);
  const isDark = mode === "dark";

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
      className={`flex flex-col h-full rounded-xl shadow-xl overflow-hidden transition-colors duration-300
        ${
          isDark
            ? "bg-[var(--bg)] text-[var(--text)]"
            : "bg-[var(--textbox)] text-[var(--text)]"
        }`}
    >
      <div
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3"
        style={{ backgroundColor: "var(--bg)" }}
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
                maxWidth: msg.sender === "user" ? "85%" : "90%",
                backgroundColor:
                  msg.sender === "user" ? "var(--button)" : "var(--hover)",
                color: msg.sender === "user" ? "#ffffff" : "var(--text)",
                borderRadius:
                  msg.sender === "user"
                    ? "20px 20px 5px 20px"
                    : "20px 20px 20px 5px",
                padding: msg.sender === "user" ? "10px 14px" : "8px 12px",
                marginBottom: "6px",
                fontSize: "14px",
              }}
            >
              <ReactMarkdown
                components={{
                  a: ({ node, ...props }) => (
                    <a
                      {...props}
                      style={{
                        color:
                          msg.sender === "user" ? "#ffffff" : "var(--primary)",
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
                          background:
                            msg.sender === "user"
                              ? "rgba(255,255,255,0.2)"
                              : "var(--textbox)",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontFamily:
                            "ui-monospace, SFMono-Regular, Menlo, monospace",
                          fontSize: "12px",
                        }}
                      />
                    ) : (
                      <pre
                        style={{
                          background:
                            msg.sender === "user"
                              ? "rgba(255,255,255,0.1)"
                              : "var(--textbox)",
                          padding: "8px",
                          borderRadius: "8px",
                          overflowX: "auto",
                          fontSize: "12px",
                          margin: "8px 0",
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
            className={`max-w-[80%] sm:max-w-[60%] p-2 sm:p-3 rounded-2xl animate-pulse self-start shadow-sm text-sm sm:text-base
        ${
          isDark
            ? "bg-[var(--hover)] text-[var(--text)]"
            : "bg-[var(--hover)] text-[var(--text)]"
        }`}
          >
            Thinking...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div
        className={`flex items-center gap-2 p-2 sm:p-3
        ${
          isDark
            ? "bg-[var(--bg)] border-[var(--border)]"
            : "bg-[var(--textbox)] border-[var(--border)]"
        }`}
        style={{
          borderTop: "none",
          boxShadow: "0 -4px 10px rgba(0,0,0,0.04)",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className={`flex-1 rounded-full px-3 sm:px-4 py-2 outline-none focus:ring-2 transition-all text-sm sm:text-base
        ${
          isDark
            ? "bg-[var(--bg)] text-[var(--text)]"
            : "bg-[var(--textbox)] text-[var(--text)]"
        }`}
          style={{
            boxShadow: "0 0 0 1px var(--border) inset",
          }}
          placeholder="Type your message..."
        />

        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className={`p-2 sm:p-3 rounded-full flex items-center justify-center transition-all shadow-md
        ${
          isDark
            ? "bg-[var(--button)] text-[var(--textbox)]"
            : "bg-[var(--button)] text-[var(--textbox)]"
        }`}
          style={{
            opacity: !input.trim() ? 0.5 : 1,
            cursor: !input.trim() ? "not-allowed" : "pointer",
          }}
        >
          <ArrowUpRight size={18} className="sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatBotAdmin;
