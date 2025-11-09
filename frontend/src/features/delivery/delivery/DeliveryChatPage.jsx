import React, { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import { chatApi, SOCKET_URL } from "./Api/chatAPI.JS";
import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaSearch } from "react-icons/fa";

/* ===================== Helpers (بدون تغيير المنطق) ===================== */
const toUtcISO = (v) => {
  if (!v) return new Date().toISOString();
  if (v instanceof Date) return new Date(v.getTime()).toISOString();
  if (typeof v === "number")
    return new Date(v < 2e12 ? v * 1000 : v).toISOString();
  if (typeof v === "string") {
    const s = v.trim();
    if (/^\d+$/.test(s))
      return new Date(
        Number(s) < 2e12 ? Number(s) * 1000 : Number(s)
      ).toISOString();
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(s))
      return new Date(s.replace(" ", "T") + "Z").toISOString();
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(s))
      return new Date(s + "Z").toISOString();
    return new Date(s).toISOString();
  }
  return new Date(v).toISOString();
};

const fmtLocal = (iso) => {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return "";
  }
};

const formatMessageTime = (iso) => {
  try {
    const date = new Date(iso);
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  } catch {
    return "";
  }
};

const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const safeText = (v) => {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
};

/* ===================== Component ===================== */
const DeliveryChatPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialVendorUserId = Number(location.state?.vendorUserId);
  const initialVendorName = location.state?.vendorName ?? null;

  const themeDark = useSelector((s) => s.deliveryTheme?.darkMode);
  const deliveryAuth = useSelector((s) => s.deliveryAuth);
  const authGeneral = useSelector((s) => s.auth);

  const myUserId = useMemo(() => {
    const candidates = [
      Number(deliveryAuth?.user?.id),
      Number(authGeneral?.user?.id),
      Number(localStorage.getItem("userId")),
      Number(localStorage.getItem("deliveryId")),
    ];
    const found = candidates.find((v) => Number.isFinite(v) && v > 0);
    return found || null;
  }, [deliveryAuth?.user?.id, authGeneral?.user?.id]);

  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [activeVendorId, setActiveVendorId] = useState(null);
  const [activeVendorName, setActiveVendorName] = useState("");
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const socketRef = useRef(null);
  const socketInitRef = useRef(false);
  const prevRoomRef = useRef(null);
  const messagesEndRef = useRef(null);
  const activeVendorIdRef = useRef(null);

  // حالة جديدة للتحكم بعرض الشات على الموبايل
  const [showChat, setShowChat] = useState(false);

  const upsertConversation = (list, item) => {
    const key = Number(item.vendorUserId);
    const i = list.findIndex((c) => Number(c.vendorUserId) === key);
    if (i === -1) {
      const next = [item, ...list];
      next.sort(
        (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
      );
      return next;
    }
    const merged = { ...list[i], ...item };
    const next = [merged, ...list.slice(0, i), ...list.slice(i + 1)];
    next.sort(
      (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
    );
    return next;
  };

  useEffect(() => {
    activeVendorIdRef.current = activeVendorId;
  }, [activeVendorId]);

  /* ========== Load conversations (منطِقك الأصلي) ========== */
  useEffect(() => {
    if (!myUserId) {
      setLoading(false);
      setAuthError("No delivery session");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const raw = await chatApi.getDeliveryConversations(myUserId);
        const rows = Array.isArray(raw)
          ? raw
          : raw?.conversations ?? raw?.data ?? [];
        const normalized = rows
          .map((r) => ({
            vendorUserId: Number(
              r.vendor_user_id ?? r.user_id ?? r.vendor_userId ?? r.id
            ),
            vendorId: r.vendor_id != null ? Number(r.vendor_id) : null,
            vendorName:
              r.vendor_name ??
              r.vendorName ??
              `Vendor #${Number(r.vendor_user_id) || ""}`,
            lastMessage: safeText(r.last_message ?? r.lastMessage ?? ""),
            unread: Number(r.unread_count ?? r.unread ?? 0) || 0,
            updatedAt: toUtcISO(r.last_at ?? r.updatedAt ?? r.updated_at),
          }))
          .filter((x) => Number.isFinite(x.vendorUserId) && x.vendorUserId > 0)
          .sort(
            (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
          );

        if (!cancelled) {
          setConversations(normalized);
          setLoading(false);

          const presetVendorUserId = initialVendorUserId;
          const presetVendorName = initialVendorName;
          if (Number.isFinite(presetVendorUserId) && presetVendorUserId > 0) {
            const draft = {
              vendorUserId: presetVendorUserId,
              vendorId: null,
              vendorName: presetVendorName || `Vendor #${presetVendorUserId}`,
              lastMessage: "",
              unread: 0,
              updatedAt: null,
            };
            setConversations((prev) => upsertConversation(prev, draft));
            handleSelectConversation(draft);
          } else if (normalized.length > 0) {
            handleSelectConversation(normalized[0]);
          }
        }
      } catch (err) {
        if (!cancelled) {
          const msg =
            err?.response?.status === 401 || err?.response?.status === 403
              ? "Unauthorized. Please log in again."
              : err?.response?.data?.message ||
                err?.message ||
                "Failed to fetch conversations";
          setAuthError(msg);
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [myUserId, initialVendorUserId, initialVendorName]);

  /* ========== Socket setup (منطِقك الأصلي) ========== */
  useEffect(() => {
    if (!myUserId) return;
    if (socketInitRef.current) return;
    socketInitRef.current = true;

    const token = localStorage.getItem("token") || "";
    const s = io(SOCKET_URL, { transports: ["websocket"], auth: { token } });
    socketRef.current = s;

    const rejoinIfNeeded = () => {
      const a = Number(myUserId);
      const b = Number(activeVendorIdRef.current);
      if (!Number.isFinite(a) || !Number.isFinite(b)) return;
      const key = [a, b].sort((x, y) => x - y).join(":");
      s.emit("joinChat", { room: key, user1: a, user2: b });
      prevRoomRef.current = key;
    };

    s.on("connect", rejoinIfNeeded);
    s.on("reconnect", rejoinIfNeeded);

    s.on("connect_error", (err) => {
      if (
        String(err?.message || "")
          .toLowerCase()
          .includes("invalid")
      ) {
        setAuthError("Socket auth failed. Please log in again.");
      }
    });

    const onReceive = (msg) => {
      const senderId = Number(msg.sender_id ?? msg.senderId);
      const receiverId = Number(msg.receiver_id ?? msg.receiverId);
      if (!senderId || !receiverId) return;
      if (![senderId, receiverId].includes(Number(myUserId))) return;
      const otherId = senderId === Number(myUserId) ? receiverId : senderId;

      if (Number(activeVendorIdRef.current) !== Number(otherId)) {
        setConversations((prev) => {
          const i = prev.findIndex(
            (c) => Number(c.vendorUserId) === Number(otherId)
          );
          if (i === -1) {
            const next = [
              {
                vendorUserId: Number(otherId),
                vendorId: null,
                vendorName: `Vendor #${otherId}`,
                lastMessage: safeText(msg.message),
                unread: 1,
                updatedAt: toUtcISO(msg.createdAt) || new Date().toISOString(),
              },
              ...prev,
            ];
            next.sort(
              (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
            );
            return next;
          }
          const updated = prev.map((c) =>
            Number(c.vendorUserId) === Number(otherId)
              ? {
                  ...c,
                  lastMessage: safeText(msg.message),
                  unread: Number(c.unread || 0) + 1,
                  updatedAt:
                    toUtcISO(msg.createdAt) || new Date().toISOString(),
                }
              : c
          );
          updated.sort(
            (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
          );
          return updated;
        });
        return;
      }

      setChat((prev) => {
        const exists = prev.some(
          (m) =>
            (msg.clientId && m.clientId === msg.clientId) ||
            (msg.id && m.id === msg.id)
        );
        if (exists) return prev;
        return [
          ...prev,
          {
            id: msg.id ?? Date.now(),
            clientId: msg.clientId ?? null,
            sender: senderId === Number(myUserId) ? "delivery" : "vendor",
            message: safeText(msg.message),
            createdAt: toUtcISO(msg.createdAt) || new Date().toISOString(),
            vendorUserId: Number(otherId),
          },
        ];
      });

      setConversations((prev) =>
        prev.map((c) =>
          Number(c.vendorUserId) === Number(otherId)
            ? {
                ...c,
                lastMessage: safeText(msg.message),
                updatedAt: toUtcISO(msg.createdAt) || new Date().toISOString(),
              }
            : c
        )
      );
    };

    s.on("receiveChat", onReceive);

    const onVisible = () => {
      if (document.visibilityState === "visible") rejoinIfNeeded();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      s.off("receiveChat", onReceive);
      s.off("connect");
      s.off("reconnect");
      s.off("connect_error");
      s.disconnect();
      socketRef.current = null;
      socketInitRef.current = false;
    };
  }, [myUserId]);

  const joinRoom = (otherUserId) => {
    if (!socketRef.current) return;
    const a = Number(myUserId);
    const b = Number(otherUserId);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return;
    const newKey = [a, b].sort((x, y) => x - y).join(":");
    if (prevRoomRef.current === newKey) return;
    if (prevRoomRef.current && prevRoomRef.current !== newKey) {
      socketRef.current.emit("leaveChat", { room: prevRoomRef.current });
    }
    socketRef.current.emit("joinChat", { room: newKey, user1: a, user2: b });
    prevRoomRef.current = newKey;
  };

  const loadMessages = async (vendorUserId, vendorName) => {
    const a = Number(myUserId);
    const b = Number(vendorUserId);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return;
    const [u1, u2] = [a, b].sort((x, y) => x - y);
    try {
      const raw = await chatApi.getMessages(u1, u2);
      const rows = Array.isArray(raw) ? raw : raw?.data ?? raw?.messages ?? [];
      const normalized = rows.map((m) => ({
        id: m.id,
        clientId: m.client_id ?? m.clientId ?? null,
        message: safeText(m.message),
        sender:
          Number(m.sender_id) === Number(myUserId) ? "delivery" : "vendor",
        createdAt: toUtcISO(m.created_at ?? m.createdAt),
        vendorUserId: b,
      }));
      setChat(normalized);
      setActiveVendorId(b);
      setActiveVendorName(vendorName ?? `Vendor #${b}`);
      joinRoom(b);
      try {
        await chatApi.markReadForVendorDelivery({ vendorId: b, deliveryId: a });
      } catch {}
      setConversations((prev) =>
        prev.map((c) =>
          Number(c.vendorUserId) === Number(b)
            ? { ...c, unread: 0, updatedAt: toUtcISO(new Date()) }
            : c
        )
      );

      // على الموبايل: اظهار صفحة الشات
      if (window.innerWidth < 768) {
        setShowChat(true);
      }
    } catch (err) {
      console.error("loadMessages error:", err);
    }
  };

  const handleSelectConversation = (c) => {
    loadMessages(c.vendorUserId, c.vendorName);
  };

  const sendMessage = async () => {
    if (!message.trim() || !activeVendorId || !myUserId) return;
    const msgText = message.trim();
    const clientId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now());

    const optimistic = {
      id: Date.now(),
      clientId,
      sender: "delivery",
      message: safeText(msgText),
      createdAt: toUtcISO(new Date()),
      vendorUserId: activeVendorId,
    };
    setChat((prev) => [...prev, optimistic]);
    setConversations((prev) =>
      prev.map((c) =>
        Number(c.vendorUserId) === Number(activeVendorId)
          ? {
              ...c,
              lastMessage: safeText(msgText),
              updatedAt: toUtcISO(new Date()),
            }
          : c
      )
    );
    setMessage("");

    try {
      await chatApi.sendMessage({
        sender_id: Number(myUserId),
        receiver_id: Number(activeVendorId),
        message: msgText,
        client_id: clientId,
      });
    } catch (err) {
      setChat((prev) => prev.filter((m) => m.clientId !== clientId));
      setMessage(msgText);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const headerTitle =
    activeVendorName ||
    (activeVendorId ? `Vendor #${activeVendorId}` : "Select a conversation");

  /* ========== UI Helpers للديزاين ========== */
  const filteredConversations = useMemo(() => {
    if (!searchTerm.trim()) return conversations;
    const term = searchTerm.trim().toLowerCase();
    return conversations.filter((c) =>
      (c.vendorName || "").toLowerCase().includes(term)
    );
  }, [searchTerm, conversations]);

  const groupedMessages = useMemo(() => {
    const groups = [];
    let lastDate = null;
    chat.forEach((msg) => {
      const msgDate = formatDate(msg.createdAt);
      if (msgDate !== lastDate) {
        groups.push({ type: "date", date: msgDate, id: msgDate });
        lastDate = msgDate;
      }
      groups.push({ ...msg, type: "message" });
    });
    return groups;
  }, [chat]);

  const closeChat = () => {
    setActiveVendorId(null);
    setActiveVendorName("");
    setChat([]);
    setShowChat(false);
  };

  const handleBackToConversations = () => {
    setShowChat(false);
  };

  // تحديد إذا كان الموبايل
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  /* ===================== UI (تصميم متجاوب) ===================== */
  return (
    <div className="flex flex-col bg-[var(--bg)]" style={{ height: "100vh" }}>
      {/* Scrollbar Styles */}
      <style>
        {`
.messages-scroll {
  scrollbar-width: thin;
  scrollbar-color: var(--bg) var(--bg);
}
.messages-scroll::-webkit-scrollbar {
  width: 8px;
}
.messages-scroll::-webkit-scrollbar-track {
  background: var(--bg);
}
.messages-scroll::-webkit-scrollbar-thumb {
  background-color: var(--bg);
  border-radius: 4px;
  border: 2px solid var(--bg);
}
`}
      </style>

      <div className="flex-1 flex max-w-7xl mx-auto w-full min-h-0 gap-2">
        {/* Sidebar - يظهر دائماً على الديسكتوب، على الموبايل يظهر فقط إذا showChat = false */}
        <aside
          className={`
          ${isMobile ? (showChat ? "hidden" : "w-full") : "w-80 flex"}
          flex-col min-h-0 border-r-3 
          ${themeDark ? "border-[var(--mid-dark)]" : "border-[var(--textbox)]"}
        `}
        >
          {/* Header للموبايل */}
          {isMobile && (
            <div className="p-4 border-b border-[var(--border)]">
              <h1 className="text-lg font-bold text-[var(--text)] text-center">
                Conversations
              </h1>
            </div>
          )}

          <div className="p-4 flex-shrink-0">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Contact..."
                className={`w-full pl-10 pr-4 py-2 rounded-full text-sm ${
                  themeDark
                    ? "bg-[var(--div)] text-[var(--text)]"
                    : "bg-[var(--textbox)] text-[var(--text)]"
                } placeholder-gray-400 focus:outline-none`}
              />
            </div>
            {authError && (
              <p className="text-xs text-red-600 mt-2">{authError}</p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 px-2 pb-4 messages-scroll">
            {loading ? (
              <div className="p-4 text-sm opacity-70 text-[var(--text)]">
                Loading…
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-sm opacity-70 text-[var(--text)]">
                No conversations yet.
              </div>
            ) : (
              filteredConversations.map((c) => (
                <div
                  key={c.vendorUserId}
                  onClick={() => handleSelectConversation(c)}
                  className={`cursor-pointer mb-2 rounded-xl p-3 transition-all ${
                    Number(activeVendorId) === Number(c.vendorUserId)
                      ? themeDark
                        ? "bg-[var(--light-gray)] border-l-4 border-[var(--button)]"
                        : "bg-gray-100 border-l-4 border-[var(--button)]"
                      : Number(c.unread) > 0
                      ? themeDark
                        ? "bg-[var(--div)]"
                        : "bg-[var(--textbox)]"
                      : themeDark
                      ? "bg-[var(--div)] hover:bg-[var(--hover)]"
                      : "bg-[var(--textbox)] hover:bg-[var(--div)]"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col min-w-0 flex-1">
                      <p className="font-semibold truncate text-[var(--text)] mb-1">
                        {c.vendorName}
                      </p>
                      <p className="text-sm truncate text-[var(--text)] opacity-80">
                        {c.lastMessage || "No messages yet"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0 ml-2">
                      <span className="text-xs text-[var(--text)] mb-1 opacity-70">
                        {formatMessageTime(c.updatedAt)}
                      </span>
                      {Number(c.unread) > 0 && (
                        <span className="bg-[var(--button)] text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                          {c.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Chat Area - على الموبايل يظهر فقط إذا showChat = true */}
        <main
          className={`
          ${isMobile ? (showChat ? "flex-1 flex" : "hidden") : "flex-1 flex"} 
          flex-col min-h-0 
          ${themeDark ? "border-[var(--div)]" : "border-[var(--textbox)]"} 
          rounded-lg
        `}
        >
          {activeVendorId ? (
            <>
              {/* Header */}
              <div
                className={`flex items-center px-4 py-3 flex-shrink-0 border-b-2 ${
                  themeDark ? "border-[var(--div)]" : "border-[var(--textbox)]"
                }`}
              >
                {/* زر الرجوع للموبايل فقط */}
                {isMobile && (
                  <button
                    onClick={handleBackToConversations}
                    className="mr-3 text-[var(--text)] p-2 rounded-lg hover:bg-[var(--div)] transition-colors"
                  >
                    <FaArrowLeft />
                  </button>
                )}

                <div className="flex-1">
                  <h2 className="font-bold text-[var(--text)] text-base">
                    {headerTitle}
                  </h2>
                  <p className="text-xs text-[var(--text)] opacity-70">
                    Online
                  </p>
                </div>

                <button
                  onClick={closeChat}
                  className="text-gray-400 hover:text-[var(--button)] text-xl p-2 rounded-lg hover:bg-[var(--div)] transition-colors"
                >
                  ×
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto min-h-0 px-4 py-3 space-y-3 messages-scroll">
                {groupedMessages.map((msg) =>
                  msg.type === "date" ? (
                    <div
                      key={msg.id}
                      className="text-center text-xs text-gray-400 my-2"
                    >
                      {msg.date}
                    </div>
                  ) : (
                    <div
                      key={msg.clientId || msg.id}
                      className={`flex ${
                        msg.sender === "delivery"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div className="max-w-[85%] xs:max-w-[80%]">
                        <div
                          className={`p-3 rounded-lg text-sm ${
                            msg.sender === "delivery"
                              ? "bg-[var(--button)] text-white rounded-br-none"
                              : `${
                                  themeDark
                                    ? "bg-[var(--div)] border-[var(--button)]"
                                    : "bg-[var(--textbox)] border-[var(--button)]"
                                } text-[var(--text)] rounded-bl-none`
                          }`}
                        >
                          {safeText(msg.message)}
                        </div>
                        <div
                          className={`text-xs mt-1 ${
                            msg.sender === "delivery"
                              ? "text-right text-[var(--text)] opacity-70"
                              : "text-left text-[var(--text)] opacity-70"
                          }`}
                        >
                          {formatMessageTime(msg.createdAt)}
                        </div>
                      </div>
                    </div>
                  )
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div
                className={`px-4 py-3 flex items-center gap-2 flex-shrink-0 border-t-2 ${
                  themeDark ? "border-[var(--div)]" : "border-[var(--textbox)]"
                }`}
              >
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message here..."
                  className={`flex-1 px-4 py-3 rounded-full border-2 text-sm ${
                    themeDark
                      ? "bg-[var(--bg)] border-[var(--div)] text-[var(--text)]"
                      : "bg-white text-[var(--text)] border-[var(--textbox)]"
                  } placeholder-gray-500 focus:outline-none`}
                />
                <button
                  onClick={sendMessage}
                  disabled={!message.trim()}
                  className={`p-3 rounded-full ${
                    message.trim()
                      ? "bg-[var(--button)] text-white hover:scale-105 transition-transform"
                      : "bg-gray-400 cursor-not-allowed text-white"
                  }`}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 min-h-0 p-4 text-center">
              {isMobile
                ? "Select a conversation to start chatting"
                : "Select a conversation from the list to start chatting"}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DeliveryChatPage;
