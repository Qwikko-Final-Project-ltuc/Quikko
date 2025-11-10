import React, { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { chatApi, SOCKET_URL } from "./chatAPI";
import { setUnreadCount } from '../components/chatUnreadSlice';
import { fetchProfile } from "../profileSlice";
import { 
  FaTimes,
  FaBars,
  FaArrowLeft
} from "react-icons/fa";
import { Sparkles, Zap, Star, MapPin, Phone, Mail, User, Edit3, CreditCard, ChevronDown } from "lucide-react";

const roomKeyOf = (a, b) => [String(a), String(b)].sort().join(":");
const safeText = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v));

const toUtcISO = (v) => {
  if (!v) return new Date().toISOString();
  if (v instanceof Date) return new Date(v.getTime()).toISOString();
  const num =
    typeof v === "number"
      ? v < 2e12
        ? v * 1000
        : v
      : /^\d+$/.test(v)
      ? Number(v) < 2e12
        ? Number(v) * 1000
        : Number(v)
      : null;
  return num ? new Date(num).toISOString() : new Date(v).toISOString();
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

const CustomerChatPage = () => {
  const auth = useSelector((s) => s.customerAuth);
  const profile = useSelector((s) => s.profile.data);
  const { loading: profileLoading, error: profileError } = useSelector((s) => s.profile);
  const themeMode = useSelector((s) => s.customerTheme.mode);
  const location = useLocation();
  const dispatch = useDispatch();

  // نفس طريقة البروفايل تماماً للحصول على customerId
  const customerId = useMemo(() => {
    // الأولوية للبيانات من الـ profile slice
    if (profile?.id) return String(profile.id);
    if (profile?.customer_id) return String(profile.customer_id);
    if (profile?.user_id) return String(profile.user_id);
    
    // ثم من الـ auth
    const fromAuth = auth.user?.id || auth.user?.user_id || auth.user?.customerId;
    if (fromAuth) return String(fromAuth);
    
    // ثم من localStorage
    const fromStorage = localStorage.getItem("customerId");
    if (fromStorage && fromStorage !== "temp_id" && fromStorage !== "undefined") {
      return String(fromStorage);
    }
    
    return null;
  }, [profile, auth.user]);

  const initialVendorFromState = Number(location.state?.vendorId);
  const validInitialVendor = Number.isFinite(initialVendorFromState) && initialVendorFromState > 0 ? initialVendorFromState : null;

  const [conversations, setConversations] = useState([]);
  const [activeVendorId, setActiveVendorId] = useState(null);
  const [activeVendorName, setActiveVendorName] = useState("");
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [authError, setAuthError] = useState("");
  const [mobileView, setMobileView] = useState('conversations'); // 'conversations' or 'chat'

  const socketRef = useRef(null);
  const socketInitRef = useRef(false);
  const joinedRoomsRef = useRef(new Set());
  const activeVendorIdRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    activeVendorIdRef.current = activeVendorId;
  }, [activeVendorId]);

  // نفس loading behavior مثل البروفايل
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // احسب العدد الإجمالي للرسائل غير المقروءة من جميع المحادثات
  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((total, conversation) => {
      return total + (conversation.unread || 0);
    }, 0);
  }, [conversations]);

  // تحديث Redux عند تغيير العدد
  useEffect(() => {
    dispatch(setUnreadCount(totalUnreadCount));
  }, [totalUnreadCount, dispatch]);

  const upsertConversation = (list, item) => {
    const key = Number(item.vendorId);
    const i = list.findIndex((c) => Number(c.vendorId) === key);
    if (i === -1) return [item, ...list].sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    const merged = { ...list[i], ...item };
    const next = [merged, ...list.slice(0, i), ...list.slice(i + 1)];
    return next.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
  };

  useEffect(() => {
    if (validInitialVendor == null || customerId == null) return;
    const draft = {
      vendorId: Number(validInitialVendor),
      vendorName: safeText(location.state?.vendorName) || `Vendor #${validInitialVendor}`,
      lastMessage: "",
      unread: 0,
      updatedAt: null,
    };
    setConversations((prev) => upsertConversation(prev, draft));
    setActiveVendorId(Number(validInitialVendor));
    setActiveVendorName(safeText(location.state?.vendorName) || `Vendor #${validInitialVendor}`);
    loadMessages(Number(validInitialVendor));
    setMobileView('chat');
  }, [validInitialVendor, customerId]);

  useEffect(() => {
    if (customerId == null) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await chatApi.getCustomerConversations(customerId);
        const rows = Array.isArray(data) ? data : data?.conversations || [];
        const mapped = rows
          .map((r) => {
            const id = Number(r.vendor_user_id ?? r.user_id ?? r.vendor_id ?? r.vendorId ?? r.id);
            if (!Number.isFinite(id) || id <= 0) return null;
            return {
              vendorId: id,
              vendorName: safeText(r.vendor_name ?? r.vendorName) || `Vendor #${id}`,
              lastMessage: safeText(r.last_message ?? r.lastMessage ?? ""),
              unread: Number(r.unread_count ?? r.unread ?? 0),
              updatedAt: r.last_at ?? r.updatedAt ?? r.updated_at ?? null,
            };
          })
          .filter(Boolean)
          .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
        if (!cancelled) {
          setConversations(mapped);
          mapped.forEach((c) => joinRoom(c.vendorId));
        }
      } catch (e) {
        if ([401, 403].includes(e?.response?.status)) setAuthError("Unauthorized. Please log in again.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [customerId]);

  useEffect(() => {
    if (customerId == null || socketInitRef.current) return;
    socketInitRef.current = true;
    const token = localStorage.getItem("token") || "";
    const s = io(SOCKET_URL, { transports: ["websocket"], auth: { token } });
    socketRef.current = s;

    const rejoinAll = () => {
      if (!socketRef.current) return;
      for (const key of joinedRoomsRef.current) {
        const [u1, u2] = key.split(":").map(Number);
        if (!Number.isFinite(u1) || !Number.isFinite(u2)) continue;
        socketRef.current.emit("joinChat", { room: key, user1: u1, user2: u2 });
      }
    };
    s.on("connect", rejoinAll);
    s.on("reconnect", rejoinAll);
    s.on("connect_error", (err) => {
      if (String(err?.message || "").toLowerCase().includes("invalid")) setAuthError("Socket auth failed. Please log in again.");
    });
    s.on("reconnect_error", () => {});

    const onReceive = (msgRaw) => {
      const msg = { ...msgRaw, message: safeText(msgRaw?.message) };
      const senderId = Number(msg.sender_id ?? msg.senderId);
      const receiverId = Number(msg.receiver_id ?? msg.receiverId);
      if (!Number.isFinite(senderId) || !Number.isFinite(receiverId)) return;
      if (![senderId, receiverId].includes(Number(customerId))) return;
      const vId = senderId === Number(customerId) ? receiverId : senderId;

      if (Number(activeVendorIdRef.current) !== Number(vId)) {
        setConversations((prevC) => {
          const i = prevC.findIndex((c) => Number(c.vendorId) === Number(vId));
          const isIncomingFromVendor = senderId === Number(vId) && receiverId === Number(customerId);
          const unreadInc = isIncomingFromVendor ? 1 : 0;
          if (i === -1)
            return upsertConversation(prevC, {
              vendorId: Number(vId),
              vendorName: `Vendor #${Number(vId)}`,
              lastMessage: msg.message,
              unread: unreadInc,
              updatedAt: toUtcISO(msg.createdAt) || new Date().toISOString(),
            });
          const existing = prevC[i];
          return upsertConversation(prevC, {
            ...existing,
            lastMessage: msg.message,
            unread: Number(existing.unread || 0) + unreadInc,
            updatedAt: toUtcISO(msg.createdAt) || new Date().toISOString(),
          });
        });
        return;
      }

      setChat((prev) => {
        const exists = prev.some(
          (m) => (msg.clientId && m.clientId === msg.clientId) || (msg.id && m.id === msg.id)
        );
        if (exists) return prev;
        return [
          ...prev,
          {
            id: msg.id ?? Date.now(),
            clientId: msg.clientId ?? null,
            sender: senderId === Number(customerId) ? "customer" : "vendor",
            message: msg.message,
            createdAt: toUtcISO(msg.createdAt) || new Date().toISOString(),
            customerId: Number(customerId),
            vendorId: Number(vId),
          },
        ];
      });

      setConversations((prevC) =>
        prevC.map((c) =>
          Number(c.vendorId) === Number(vId)
            ? { ...c, lastMessage: msg.message, updatedAt: toUtcISO(msg.createdAt) || new Date().toISOString() }
            : c
        )
      );
    };

    s.off("receiveChat", onReceive);
    s.on("receiveChat", onReceive);
    const onVisible = () => {
      if (document.visibilityState === "visible") rejoinAll();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      if (socketRef.current)
        for (const key of joinedRoomsRef.current) socketRef.current.emit("leaveChat", { room: key });
      joinedRoomsRef.current.clear();
      document.removeEventListener("visibilitychange", onVisible);
      s.off("receiveChat", onReceive);
      s.off("connect");
      s.off("reconnect");
      s.off("connect_error");
      s.off("reconnect_error");
      s.disconnect();
      socketRef.current = null;
      socketInitRef.current = false;
    };
  }, [customerId]);

  const joinRoom = (vendorId) => {
    if (!socketRef.current || vendorId == null || customerId == null) return;
    const key = roomKeyOf(customerId, vendorId);
    if (joinedRoomsRef.current.has(key)) return;
    socketRef.current.emit("joinChat", { room: key, user1: Number(customerId), user2: Number(vendorId) });
    joinedRoomsRef.current.add(key);
  };

  const loadMessages = async (vendorId) => {
    if (customerId == null || vendorId == null) return;
    try {
      const data = await chatApi.getMessages(Number(customerId), vendorId);
      const rows = Array.isArray(data?.messages) ? data.messages : [];
      const normalized = rows.map((m) => ({
        id: m.id,
        clientId: m.client_id || null,
        message: safeText(m.message),
        sender: Number(m.sender_id) === vendorId ? "vendor" : "customer",
        createdAt: toUtcISO(m.created_at ?? m.createdAt),
        customerId: Number(customerId),
        vendorId,
      }));
      setChat(normalized);
      joinRoom(vendorId);
      try {
        await chatApi.markRead({ vendorId, customerId: Number(customerId) });
      } catch {}
    } catch {}
  };

  const handleSelectConversation = (v) => {
    const vid = Number(v.vendorId);
    setActiveVendorId(Number.isFinite(vid) ? vid : null);
    setActiveVendorName(safeText(v.vendorName) || (Number.isFinite(vid) ? `Vendor #${vid}` : ""));
    loadMessages(vid);
    setConversations((prev) => prev.map((c) => (Number(c.vendorId) === vid ? { ...c, unread: 0 } : c)));
    setMobileView('chat');
  };

  const closeChat = () => {
    setActiveVendorId(null);
    setActiveVendorName("");
    setChat([]);
    setMobileView('conversations');
  };

  const showConversations = () => {
    setMobileView('conversations');
  };

  const sendMessage = async () => {
    if (!message.trim() || activeVendorId == null || customerId == null) return;
    const msgText = message.trim();
    const clientId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
    const optimistic = {
      id: Date.now(),
      clientId,
      sender: "customer",
      message: safeText(msgText),
      createdAt: toUtcISO(new Date()),
      customerId: Number(customerId),
      vendorId: Number(activeVendorId),
    };
    setChat((prev) => [...prev, optimistic]);
    setMessage("");
    setConversations((prev) =>
      prev.map((c) =>
        Number(c.vendorId) === Number(activeVendorId)
          ? { ...c, lastMessage: safeText(msgText), updatedAt: toUtcISO(new Date()) }
          : c
      )
    );
    try {
      await chatApi.sendMessage({
        sender_id: Number(customerId),
        receiver_id: Number(activeVendorId),
        message: msgText,
        client_id: clientId,
      });
    } catch {}
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const headerTitle = useMemo(
    () => activeVendorName || (activeVendorId != null ? `Vendor #${activeVendorId}` : "Select a conversation"),
    [activeVendorName, activeVendorId]
  );

  const filteredConversations = useMemo(() => {
    if (!searchTerm.trim()) return conversations;
    const term = searchTerm.trim().toLowerCase();
    return conversations.filter((c) => c.vendorName.toLowerCase().includes(term));
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

if (profileLoading) {
  return (
    <div className={`min-h-screen ${themeMode === 'dark' ? 'bg-[var(--bg)]' : 'bg-white'} relative overflow-hidden`}>
      {/* Animated Background - شادو أخف */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--button)]/2 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-[var(--primary)]/2 rounded-full blur-xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
      </div>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="relative">
            {/* اللودينغ - شادو أخف */}
            <div className="w-16 h-16 bg-gradient-to-r from-[var(--button)] to-[var(--primary)] rounded-xl flex items-center justify-center mx-auto mb-4 animate-spin">
              {/* أيقونة النجوم (Sparkles) */}
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            {/* تأثير ping - أخف */}
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

  // Error state - مثل باقي الصفحات
  if (profileError) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <p className="text-red-600 text-lg mb-2">Error Loading Chat</p>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{profileError}</p>
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

  // No customerId state - مشابه للبروفايل
  if (!customerId) {
    return (
      <div className={`min-h-screen bg-[var(--bg)] flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-[var(--div)] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-[var(--text)] text-2xl">💬</span>
          </div>
          <p className={`text-[var(--text)] mb-4`}>Please log in to access chat</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-[var(--button)] hover:bg-[#015c40] text-white font-semibold px-6 py-2 rounded-xl transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-[var(--bg)]" style={{ height: "calc(100vh - 60px)" }}>
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

        /* Responsive height adjustments for iPad */
        @media (max-width: 1024px) and (min-width: 768px) {
          .chat-container {
            height: calc(100vh - 280px) !important;
          }
        }

        /* Mobile responsive styles */
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

          /* Fix scrolling for mobile */
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
            ${themeMode === "dark" ? "border-color: var(--div);" : "border-color: var(--textbox);"}
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
            ${themeMode === "dark" ? "border-color: var(--div);" : "border-color: var(--textbox);"}
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
            ${themeMode === "dark" ? "border-color: var(--div);" : "border-color: var(--textbox);"}
          }

          /* Ensure proper stacking */
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
          {/* Desktop Sidebar - shown only on desktop */}
          <aside
            className={`sidebar-desktop w-80 flex flex-col min-h-0 border-r-3 ${
              themeMode === "dark" ? "border-[var(--mid-dark)]" : "border-[var(--textbox)]"
            }`}
          >
            <div className="p-4 flex-shrink-0">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Contact..."
                className={`w-full px-4 py-2 rounded-full text-sm ${
                  themeMode === "dark"
                    ? "bg-[var(--div)] text-[var(--text)]"
                    : "bg-[var(--textbox)] text-[var(--text)]"
                } placeholder-gray-400 focus:outline-none`}
              />
            </div>
            <div className="flex-1 overflow-y-auto min-h-0 px-2 pb-4 messages-scroll">
              {filteredConversations.map((v) => (
                <div
                  key={v.vendorId}
                  onClick={() => handleSelectConversation(v)}
                  className={`cursor-pointer mb-2 rounded-xl p-3 transition-all ${
                    Number(activeVendorId) === Number(v.vendorId)
                      ? themeMode === "dark"
                        ? "bg-[var(--hover)] border-r-4 border-[var(--button)]"
                        : "bg-gray-200 border-l-4 border-[var(--button)]"
                      : Number(v.unread) > 0
                      ? themeMode === "dark"
                        ? "bg-[var(--div)]"
                        : "bg-[var(--textbox)]"
                      : themeMode === "dark"
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

          {/* Mobile Sidebar - shown only on mobile when in conversations view */}
          {mobileView === 'conversations' && (
            <div className="sidebar-mobile mobile-conversations-container w-full">
              {/* Header with Search - Fixed */}
              <div className="conversations-header p-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search Contact..."
                  className={`w-full px-4 py-2 rounded-full text-sm ${
                    themeMode === "dark"
                      ? "bg-[var(--div)] text-[var(--text)]"
                      : "bg-[var(--textbox)] text-[var(--text)]"
                  } placeholder-gray-400 focus:outline-none`}
                />
              </div>
              
              {/* Conversations List - Scrollable */}
              <div className="conversations-list overflow-y-auto min-h-0 px-2 pb-4 messages-scroll">
                {filteredConversations.map((v) => (
                  <div
                    key={v.vendorId}
                    onClick={() => handleSelectConversation(v)}
                    className={`cursor-pointer mb-2 rounded-xl p-3 transition-all ${
                      Number(activeVendorId) === Number(v.vendorId)
                        ? themeMode === "dark"
                          ? "bg-[var(--hover)] border-r-4 border-[var(--button)]"
                          : "bg-gray-200 border-l-4 border-[var(--button)]"
                        : Number(v.unread) > 0
                        ? themeMode === "dark"
                          ? "bg-[var(--div)]"
                          : "bg-[var(--textbox)]"
                        : themeMode === "dark"
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
              themeMode === "dark" ? "border-[var(--div)]" : "border-[var(--textbox)]"
            } rounded-lg`}
          >
            {activeVendorId ? (
              <>
                {/* Header */}
                <div className="w-full h-1"></div>
                <div
                  className={`flex items-center justify-between px-6 py-4 flex-shrink-0 border-b-2  ${
                    themeMode === "dark" ? "border-[var(--light-gray)]" : "border-[var(--div)]"
                  }`}
                >
                  
                  <h2 className="font-bold text-[var(--text)] text-lg mt-2">{headerTitle}</h2>
                  <button 
                    onClick={closeChat} 
                    className={`
                      w-8 h-8 flex items-center justify-center rounded-full 
                      transition-all duration-200 hover:scale-110
                      ${themeMode === "dark" 
                        ? "text-gray-300 hover:text-white hover:bg-gray-600" 
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                      }
                    `}
                  >
                    <FaTimes className="mt-1 flex-shrink-0" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto min-h-0 px-6 py-4 space-y-3 messages-scroll">
                  {groupedMessages.map((msg) =>
                    msg.type === "date" ? (
                      <div key={msg.id} className="text-center text-xs text-gray-400 my-2">
                        {msg.date}
                      </div>
                    ) : (
                      <div key={msg.clientId || msg.id} className={`flex ${msg.sender === "customer" ? "justify-end" : "justify-start"}`}>
                        <div className="max-w-[70%]">
                          <div
                            className={`p-3 rounded-lg text-sm ${
                              msg.sender === "customer"
                                ? "bg-[var(--button)] text-white"
                                : `${
                                    themeMode === "dark" ? "bg-[var(--div)] border-[var(--button)]" : "bg-[var(--textbox)] border-[var(--button)]"
                                  } text-[var(--text)]`
                            }`}
                          >
                            {msg.message}
                          </div>
                          <div
                            className={`text-xs mt-1 ${
                              msg.sender === "customer" ? "text-right text-[var(--text)]" : "text-left text-[var(--text)]"
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

                {/* Input */}
                <div
                  className={`px-6 py-4 flex items-center gap-3 flex-shrink-0 border-t-2 ${
                    themeMode === "dark" ? "border-[var(--light-gray)]" : "border-[var(--div)]"
                  }`}
                >
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type a message here..."
                    className={`flex-1 px-4 py-2 rounded-full  border-2 ${
                      themeMode === "dark" ? "bg-[var(--bg)] border-[var(--light-gray)] text-[var(--text)]" : "bg-white text-[var(--text)] border-[var(--div)]"
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

          {/* Mobile Chat Area - shown only on mobile when in chat view */}
          {mobileView === 'chat' && activeVendorId && (
            <div className="chat-mobile mobile-chat-container w-full">
              {/* Header - Fixed */}
              <div
                className={`chat-header flex items-center justify-between px-4 py-3`}
              >
                <button 
                  onClick={showConversations}
                  className={`
                    w-8 h-8 flex items-center justify-center rounded-full 
                    transition-all duration-200
                    ${themeMode === "dark" 
                      ? "text-gray-300 hover:text-white hover:bg-gray-600" 
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                    }
                  `}
                >
                  <FaArrowLeft className="mt-1 flex-shrink-0" />
                </button>
                <h2 className="font-bold text-[var(--text)] text-lg flex-1 text-center mr-8">{headerTitle}</h2>
              </div>

              {/* Messages - Scrollable */}
              <div className="messages-area overflow-y-auto min-h-0 px-4 py-3 space-y-3 messages-scroll">
                {groupedMessages.map((msg) =>
                  msg.type === "date" ? (
                    <div key={msg.id} className="text-center text-xs text-gray-400 my-2">
                      {msg.date}
                    </div>
                  ) : (
                    <div key={msg.clientId || msg.id} className={`flex ${msg.sender === "customer" ? "justify-end" : "justify-start"}`}>
                      <div className="max-w-[80%]">
                        <div
                          className={`p-3 rounded-lg text-sm ${
                            msg.sender === "customer"
                              ? "bg-[var(--button)] text-white"
                              : `${
                                  themeMode === "dark" ? "bg-[var(--div)] border-[var(--button)]" : "bg-[var(--textbox)] border-[var(--button)]"
                                } text-[var(--text)]`
                          }`}
                        >
                          {msg.message}
                        </div>
                        <div
                          className={`text-xs mt-1 ${
                            msg.sender === "customer" ? "text-right text-[var(--text)]" : "text-left text-[var(--text)]"
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

              {/* Input - Fixed */}
              <div
                className={`input-area px-4 py-3 flex items-center gap-3 border-t-2 ${
                  themeMode === "dark" ? "border-[var(--div)]" : "border-[var(--textbox)]"
                }`}
              >
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message here..."
                  className={`flex-1 px-4 py-2 rounded-full border-2 ${
                    themeMode === "dark" ? "bg-[var(--bg)] border-[var(--div)] text-[var(--text)]" : "bg-white text-[var(--text)] border-[var(--textbox)]"
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

export default CustomerChatPage;