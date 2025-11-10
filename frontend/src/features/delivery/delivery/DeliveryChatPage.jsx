import React, { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import { chatApi, SOCKET_URL } from "./Api/chatAPI.JS";
import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaSearch, FaTimes } from "react-icons/fa";
import { Sparkles } from "lucide-react";

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

const safeText = (v) => {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
};

const formatMessageTime = (iso) => {
  try {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now - date;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSeconds < 60) {
      return "now";
    } else if (diffMinutes < 60) {
      return `${diffMinutes} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return "1 day ago";
    } else if (diffDays === 2) {
      return "2 days ago";
    } else if (diffDays === 3) {
      return "3 days ago";
    } else if (diffDays === 4) {
      return "4 days ago";
    } else if (diffDays === 5) {
      return "5 days ago";
    } else if (diffDays === 6) {
      return "6 days ago";
    } else if (diffDays === 7) {
      return "1 week ago";
    } else {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(date);
    }
  } catch {
    return "";
  }
};

const formatChatTime = (iso) => {
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
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
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
  const [mobileView, setMobileView] = useState('conversations'); // 'conversations' or 'chat'

  const socketRef = useRef(null);
  const socketInitRef = useRef(false);
  const prevRoomRef = useRef(null);
  const messagesEndRef = useRef(null);
  const activeVendorIdRef = useRef(null);

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

  /* ========== Load conversations ========== */
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

  /* ========== Socket setup ========== */
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

      setMobileView('chat');
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

  const closeChat = () => {
    setActiveVendorId(null);
    setActiveVendorName("");
    setChat([]);
    setMobileView('conversations');
  };

  const showConversations = () => {
    setMobileView('conversations');
  };

  const headerTitle = activeVendorName || (activeVendorId ? `Vendor #${activeVendorId}` : "Select a conversation");

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

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen ${themeDark ? 'bg-[var(--bg)]' : 'bg-white'} relative overflow-hidden`}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--button)]/2 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-[var(--primary)]/2 rounded-full blur-xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-[var(--button)] to-[var(--primary)] rounded-xl flex items-center justify-center mx-auto mb-4 animate-spin">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div className="absolute inset-0 w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[var(--button)] to-[var(--primary)] rounded-xl blur-sm opacity-15 animate-ping"></div>
            </div>
            <p className="text-[var(--text)] text-lg font-medium">
              Loading Chat...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (authError) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <p className="text-red-600 text-lg mb-2">Error Loading Chat</p>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{authError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-[var(--button)] hover:bg-[#015c40] text-white font-semibold px-6 py-2 rounded-xl transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No deliveryId state
  if (!myUserId) {
    return (
      <div className={`min-h-screen bg-[var(--bg)] flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-[var(--div)] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-[var(--text)] text-2xl">💬</span>
          </div>
          <p className={`text-[var(--text)] mb-4`}>Please log in to access chat</p>
          <button 
            onClick={() => window.location.href = '/delivery/login'}
            className="bg-[var(--button)] hover:bg-[#015c40] text-white font-semibold px-6 py-2 rounded-xl transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-[var(--bg)]" style={{ height: "calc(100vh - 105px)" }}>
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

        @media (max-width: 1024px) and (min-width: 768px) {
          .chat-container {
            height: calc(100vh - 280px) !important;
          }
        }

        @media (max-width: 767px) {
          .chat-container {
            height: calc(100vh - 200px) !important;
          }
          
          .sidebar-mobile {
            display: block;
          }
          
          .chat-mobile {
            display: block;
          }
          
          .sidebar-desktop {
            display: none;
          }
          
          .chat-desktop {
            display: none;
          }

          .mobile-conversations-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 100%;
          }

          .mobile-chat-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 100%;
          }

          .conversations-header {
            flex-shrink: 0;
            position: sticky;
            top: 0;
            background: var(--bg);
            z-index: 10;
            border-bottom: 2px solid;
            ${themeDark ? "border-color: var(--div);" : "border-color: var(--textbox);"}
          }

          .conversations-list {
            flex: 1;
            overflow-y: auto;
            min-height: 0;
          }

          .chat-header {
            flex-shrink: 0;
            position: sticky;
            top: 0;
            background: var(--bg);
            z-index: 10;
            border-bottom: 2px solid;
            ${themeDark ? "border-color: var(--div);" : "border-color: var(--textbox);"}
          }

          .messages-area {
            flex: 1;
            overflow-y: auto;
            min-height: 0;
            padding: 1rem;
          }

          .input-area {
            flex-shrink: 0;
            position: sticky;
            bottom: 0;
            background: var(--bg);
            z-index: 10;
            border-top: 2px solid;
            ${themeDark ? "border-color: var(--div);" : "border-color: var(--textbox);"}
          }

          .mobile-conversations-container,
          .mobile-chat-container {
            position: relative;
          }
        }

        @media (min-width: 768px) {
          .sidebar-mobile {
            display: none !important;
          }
          
          .chat-mobile {
            display: none !important;
          }
          
          .sidebar-desktop {
            display: flex !important;
          }
          
          .chat-desktop {
            display: flex !important;
          }
        }
        `}
      </style>

      <div className="flex-1 flex max-w-7xl mx-auto w-full min-h-0 gap-2 chat-container">
        <div className="flex w-full h-full bg-[var(--bg)] min-h-0">
          {/* Desktop Sidebar */}
          <aside
            className={`sidebar-desktop w-80 flex flex-col min-h-0 border-r-3 ${
              themeDark ? "border-[var(--mid-dark)]" : "border-[var(--textbox)]"
            }`}
          >
            <div className="p-4 flex-shrink-0">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Contact..."
                className={`w-full px-4 py-2 rounded-full text-sm ${
                  themeDark
                    ? "bg-[var(--div)] text-[var(--text)]"
                    : "bg-[var(--textbox)] text-[var(--text)]"
                } placeholder-gray-400 focus:outline-none`}
              />
            </div>
            <div className="flex-1 overflow-y-auto min-h-0 px-2 pb-4 messages-scroll">
              {filteredConversations.map((v) => (
                <div
                  key={v.vendorUserId}
                  onClick={() => handleSelectConversation(v)}
                  className={`cursor-pointer mb-2 rounded-xl p-3 transition-all ${
                    Number(activeVendorId) === Number(v.vendorUserId)
                      ? themeDark
                        ? "bg-[var(--hover)] border-r-4 border-[var(--button)]"
                        : "bg-gray-200 border-l-4 border-[var(--button)]"
                      : Number(v.unread) > 0
                      ? themeDark
                        ? "bg-[var(--div)]"
                        : "bg-[var(--textbox)]"
                      : themeDark
                      ? "bg-[var(--div)] hover:bg-[var(--hover)]"
                      : "bg-[var(--textbox)] hover:bg-[var(--div)]"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <p className="font-semibold truncate text-[var(--text)] mb-1">{v.vendorName}</p>
                      <p className="text-sm truncate text-[var(--text)]">{v.lastMessage || "No messages yet"}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-[var(--text)] mb-1">{formatMessageTime(v.updatedAt)}</span>
                      {Number(v.unread) > 0 && (
                        <span className="bg-[var(--button)] text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                          {v.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Mobile Sidebar */}
          {mobileView === 'conversations' && (
            <div className="sidebar-mobile mobile-conversations-container w-full">
              <div className="conversations-header p-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search Contact..."
                  className={`w-full px-4 py-2 rounded-full text-sm ${
                    themeDark
                      ? "bg-[var(--div)] text-[var(--text)]"
                      : "bg-[var(--textbox)] text-[var(--text)]"
                  } placeholder-gray-400 focus:outline-none`}
                />
              </div>
              
              <div className="conversations-list overflow-y-auto min-h-0 px-2 pb-4 messages-scroll">
                {filteredConversations.map((v) => (
                  <div
                    key={v.vendorUserId}
                    onClick={() => handleSelectConversation(v)}
                    className={`cursor-pointer mb-2 rounded-xl p-3 transition-all ${
                      Number(activeVendorId) === Number(v.vendorUserId)
                        ? themeDark
                          ? "bg-[var(--hover)] border-r-4 border-[var(--button)]"
                          : "bg-gray-200 border-l-4 border-[var(--button)]"
                        : Number(v.unread) > 0
                        ? themeDark
                          ? "bg-[var(--div)]"
                          : "bg-[var(--textbox)]"
                        : themeDark
                        ? "bg-[var(--div)] hover:bg-[var(--hover)]"
                        : "bg-[var(--textbox)] hover:bg-[var(--div)]"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <p className="font-semibold truncate text-[var(--text)] mb-1">{v.vendorName}</p>
                        <p className="text-sm truncate text-[var(--text)]">{v.lastMessage || "No messages yet"}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-[var(--text)] mb-1">{formatMessageTime(v.updatedAt)}</span>
                        {Number(v.unread) > 0 && (
                          <span className="bg-[var(--button)] text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                            {v.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Desktop Chat Area */}
          <main
            className={`chat-desktop flex-1 flex flex-col min-h-0 ${
              themeDark ? "border-[var(--div)]" : "border-[var(--textbox)]"
            } rounded-lg`}
          >
            {activeVendorId ? (
              <>
                <div className="w-full h-1"></div>
                <div
                  className={`flex items-center justify-between px-6 py-4 flex-shrink-0 border-b-2  ${
                    themeDark ? "border-[var(--light-gray)]" : "border-[var(--div)]"
                  }`}
                >
                  
                  <h2 className="font-bold text-[var(--text)] text-lg mt-2">{headerTitle}</h2>
                  <button 
                    onClick={closeChat} 
                    className={`
                      w-8 h-8 flex items-center justify-center rounded-full 
                      transition-all duration-200 hover:scale-110
                      ${themeDark 
                        ? "text-gray-300 hover:text-white hover:bg-gray-600" 
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                      }
                    `}
                  >
                    <FaTimes className="mt-1 flex-shrink-0" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0 px-6 py-4 space-y-3 messages-scroll">
                  {groupedMessages.map((msg) =>
                    msg.type === "date" ? (
                      <div key={msg.id} className="text-center text-xs text-gray-400 my-2">
                        {msg.date}
                      </div>
                    ) : (
                      <div key={msg.clientId || msg.id} className={`flex ${msg.sender === "delivery" ? "justify-end" : "justify-start"}`}>
                        <div className="max-w-[70%]">
                          <div
                            className={`p-3 rounded-lg text-sm ${
                              msg.sender === "delivery"
                                ? "bg-[var(--button)] text-white"
                                : `${
                                    themeDark ? "bg-[var(--div)] border-[var(--button)]" : "bg-[var(--textbox)] border-[var(--button)]"
                                  } text-[var(--text)]`
                            }`}
                          >
                            {msg.message}
                          </div>
                          <div
                            className={`text-xs mt-1 ${
                              msg.sender === "delivery" ? "text-right text-[var(--text)]" : "text-left text-[var(--text)]"
                            }`}
                          >
                            {formatChatTime(msg.createdAt)}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div
                  className={`px-6 py-4 flex items-center gap-3 flex-shrink-0 border-t-2 ${
                    themeDark ? "border-[var(--light-gray)]" : "border-[var(--div)]"
                  }`}
                >
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type a message here..."
                    className={`flex-1 px-4 py-2 rounded-full  border-2 ${
                      themeDark ? "bg-[var(--bg)] border-[var(--light-gray)] text-[var(--text)]" : "bg-white text-[var(--text)] border-[var(--div)]"
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
                    ➤
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 min-h-0">
                Select a conversation to start chatting
              </div>
            )}
          </main>

          {/* Mobile Chat Area */}
          {mobileView === 'chat' && activeVendorId && (
            <div className="chat-mobile mobile-chat-container w-full">
              <div
                className={`chat-header flex items-center justify-between px-4 py-3`}
              >
                <button 
                  onClick={showConversations}
                  className={`
                    w-8 h-8 flex items-center justify-center rounded-full 
                    transition-all duration-200
                    ${themeDark 
                      ? "text-gray-300 hover:text-white hover:bg-gray-600" 
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                    }
                  `}
                >
                  <FaArrowLeft className="mt-1 flex-shrink-0" />
                </button>
                <h2 className="font-bold text-[var(--text)] text-lg flex-1 text-center mr-8">{headerTitle}</h2>
              </div>

              <div className="messages-area overflow-y-auto min-h-0 px-4 py-3 space-y-3 messages-scroll">
                {groupedMessages.map((msg) =>
                  msg.type === "date" ? (
                    <div key={msg.id} className="text-center text-xs text-gray-400 my-2">
                      {msg.date}
                    </div>
                  ) : (
                    <div key={msg.clientId || msg.id} className={`flex ${msg.sender === "delivery" ? "justify-end" : "justify-start"}`}>
                      <div className="max-w-[80%]">
                        <div
                          className={`p-3 rounded-lg text-sm ${
                            msg.sender === "delivery"
                              ? "bg-[var(--button)] text-white"
                              : `${
                                  themeDark ? "bg-[var(--div)] border-[var(--button)]" : "bg-[var(--textbox)] border-[var(--button)]"
                                } text-[var(--text)]`
                          }`}
                        >
                          {msg.message}
                        </div>
                        <div
                          className={`text-xs mt-1 ${
                            msg.sender === "delivery" ? "text-right text-[var(--text)]" : "text-left text-[var(--text)]"
                          }`}
                        >
                          {formatChatTime(msg.createdAt)}
                        </div>
                      </div>
                    </div>
                  )
                )}
                <div ref={messagesEndRef} />
              </div>

              <div
                className={`input-area px-4 py-3 flex items-center gap-3 border-t-2 ${
                  themeDark ? "border-[var(--div)]" : "border-[var(--textbox)]"
                }`}
              >
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message here..."
                  className={`flex-1 px-4 py-2 rounded-full border-2 ${
                    themeDark ? "bg-[var(--bg)] border-[var(--div)] text-[var(--text)]" : "bg-white text-[var(--text)] border-[var(--textbox)]"
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
                  ➤
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryChatPage;