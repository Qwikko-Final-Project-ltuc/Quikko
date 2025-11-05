import React, { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useLocation } from "react-router-dom";
import { chatApi, SOCKET_URL } from "./chatAPI";

/* ===== Helpers ===== */
const getUserIdFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token || token.split(".").length < 2) return null;
  try {
    const part = token.split(".")[1];
    const pad = (s) => s + "=".repeat((4 - (s.length % 4)) % 4);
    const b64 = pad(part.replace(/-/g, "+").replace(/_/g, "/"));
    const json = decodeURIComponent(
      atob(b64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const p = JSON.parse(json);
    const id =
      p.id ?? p.userId ?? p.user_id ?? p.sub ?? p.vendorId ?? p.vendor_id;
    return id ? Number(id) : null;
  } catch {
    return null;
  }
};

const toUtcISO = (v) => {
  if (!v) return new Date().toISOString();
  if (v instanceof Date) return new Date(v.getTime()).toISOString();
  if (typeof v === "number") {
    const ms = v < 2e12 ? v * 1000 : v;
    return new Date(ms).toISOString();
  }
  if (typeof v === "string") {
    const s = v.trim();
    if (/^\d+$/.test(s)) {
      const num = Number(s);
      const ms = num < 2e12 ? num * 1000 : num;
      return new Date(ms).toISOString();
    }
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(s)) {
      return new Date(s.replace(" ", "T") + "Z").toISOString();
    }
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(s)) {
      return new Date(s + "Z").toISOString();
    }
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

const pickDisplayName = ({ role, userName, companyName, fallback }) => {
  if (role === "delivery") return companyName || fallback;
  if (role === "customer") return userName || fallback;
  return fallback;
};

/* ===== Component ===== */
const VendorChatPage = ({ themeMode = "light" }) => {
  const myUserId = useMemo(() => {
    const fromToken = Number(getUserIdFromToken());
    if (Number.isFinite(fromToken) && fromToken > 0) return fromToken;
    const fromLS = Number(localStorage.getItem("vendorUserId"));
    if (Number.isFinite(fromLS) && fromLS > 0) return fromLS;
    return null;
  }, []);

  const location = useLocation();
  const preReceiverId = useMemo(
    () =>
      Number(location.state?.receiverId) ||
      Number(location.state?.toUserId) ||
      null,
    [location.state]
  );
  const preReceiverName = useMemo(() => location.state?.toName || null, [
    location.state,
  ]);

  const [initError, setInitError] = useState(null);
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [activeOtherId, setActiveOtherId] = useState(null);
  const [activeOtherName, setActiveOtherName] = useState("");
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");

  const socketRef = useRef(null);
  const socketInitRef = useRef(false);
  const joinedRoomsRef = useRef(new Set());
  const activeOtherIdRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    activeOtherIdRef.current = activeOtherId;
  }, [activeOtherId]);

  useEffect(() => {
    if (!myUserId) {
      setInitError("User ID (vendor) not found from token/localStorage.");
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const raw = await chatApi.getVendorConversations(myUserId);
        const rows = Array.isArray(raw)
          ? raw
          : raw?.conversations ?? raw?.data ?? [];

        const normalized = rows
          .map((c) => {
            const otherId = Number(
              c.other_user_id ?? c.otherUserId ?? c.customer_id ?? c.user_id
            );
            if (!Number.isFinite(otherId)) return null;
            const otherRole = c.other_role ?? c.otherRole ?? "customer";
            const otherUserName =
              c.other_user_name ??
              pickDisplayName({
                role: otherRole,
                userName: c.customer_name ?? c.name,
                companyName: c.company_name,
                fallback: `User ${otherId}`,
              });
            return {
              otherUserId: otherId,
              otherRole,
              otherUserName,
              lastMessage: c.last_message ?? c.lastMessage ?? "",
              unread: Number(c.unread_count ?? c.unread ?? 0),
              updatedAt: toUtcISO(c.last_at ?? c.updated_at ?? c.updatedAt),
            };
          })
          .filter(Boolean)
          .sort(
            (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
          );

        if (!cancelled) {
          setConversations(normalized);
          setLoading(false);
          normalized.forEach((c) => joinRoom(c.otherUserId));

          if (preReceiverId) {
            const exists = normalized.some(
              (c) => Number(c.otherUserId) === Number(preReceiverId)
            );
            if (!exists) {
              const stub = {
                otherUserId: Number(preReceiverId),
                otherRole: "delivery",
                otherUserName: preReceiverName || `User ${preReceiverId}`,
                lastMessage: "",
                unread: 0,
                updatedAt: new Date().toISOString(),
              };
              setConversations((prev) => {
                const next = [stub, ...prev];
                next.sort(
                  (a, b) =>
                    new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
                );
                return next;
              });
            }
            joinRoom(preReceiverId);
            handleSelectConversation({
              otherUserId: Number(preReceiverId),
              otherUserName: preReceiverName || `User ${preReceiverId}`,
            });
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
          setAuthError(msg.includes("Unauthorized") ? msg : "");
          setInitError(msg);
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [myUserId, preReceiverId, preReceiverName]);

  useEffect(() => {
    if (!myUserId) return;
    if (socketInitRef.current) return;
    socketInitRef.current = true;

    const token = localStorage.getItem("token") || "";
    const s = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token },
    });
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
      if (String(err?.message || "").toLowerCase().includes("invalid")) {
        setAuthError("Socket auth failed. Please log in again.");
      }
    });

    const onReceive = (msg) => {
      const senderId = Number(msg.sender_id ?? msg.senderId);
      const receiverId = Number(msg.receiver_id ?? msg.receiverId);
      if (!senderId || !receiverId) return;
      if (![senderId, receiverId].includes(Number(myUserId))) return;

      const otherId = senderId === Number(myUserId) ? receiverId : senderId;
      const senderRole = msg.sender_role;

      const derivedName = pickDisplayName({
        role: senderRole,
        userName: msg.sender_user_name ?? msg.otherUserName ?? msg.from_name,
        companyName: msg.sender_company_name,
        fallback: `User ${otherId}`,
      });

      const isIncomingFromOther =
        senderId === Number(otherId) && receiverId === Number(myUserId);

      if (Number(activeOtherIdRef.current) !== Number(otherId)) {
        setConversations((prev) => {
          const i = prev.findIndex(
            (c) => Number(c.otherUserId) === Number(otherId)
          );
          const unreadInc = isIncomingFromOther ? 1 : 0;

          if (i === -1) {
            const item = {
              otherUserId: otherId,
              otherRole: senderRole === "vendor" ? "customer" : senderRole,
              otherUserName: derivedName,
              lastMessage: msg.message,
              unread: unreadInc,
              updatedAt: toUtcISO(msg.createdAt) || new Date().toISOString(),
            };
            const next = [item, ...prev];
            next.sort(
              (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
            );
            return next;
          }

          const updated = prev.map((c) =>
            Number(c.otherUserId) === Number(otherId)
              ? {
                  ...c,
                  otherUserName: c.otherUserName || derivedName,
                  lastMessage: msg.message,
                  unread: Number(c.unread || 0) + unreadInc,
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
            sender:
              senderId === Number(myUserId)
                ? "vendor"
                : senderRole || "customer",
            senderRole,
            senderUserName: msg.sender_user_name,
            senderCompanyName: msg.sender_company_name,
            message: msg.message,
            createdAt: toUtcISO(msg.createdAt) || new Date().toISOString(),
            otherUserId: otherId,
          },
        ];
      });

      setConversations((prev) =>
        prev.map((c) =>
          Number(c.otherUserId) === Number(otherId)
            ? {
                ...c,
                otherUserName: c.otherUserName || derivedName,
                lastMessage: msg.message,
                updatedAt: toUtcISO(msg.createdAt) || new Date().toISOString(),
              }
            : c
        )
      );
    };

    s.off("receiveChat", onReceive);
    s.on("receiveChat", onReceive);

    return () => {
      s.disconnect();
      socketInitRef.current = false;
    };
  }, [myUserId]);

  const joinRoom = (otherUserId) => {
    if (!socketRef.current) return;
    const a = Number(myUserId);
    const b = Number(otherUserId);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return;
    const key = [a, b].sort((x, y) => x - y).join(":");
    if (joinedRoomsRef.current.has(key)) return;
    socketRef.current.emit("joinChat", { room: key, user1: a, user2: b });
    joinedRoomsRef.current.add(key);
  };

  const fetchThread = async (meUserId, otherUserId) => {
    try {
      const r = await chatApi.getMessages(otherUserId, meUserId);
      return r;
    } catch {
      const r = await chatApi.getMessages(otherUserId);
      return r;
    }
  };

  const loadMessages = async (otherUserId, otherName) => {
    const a = Number(myUserId);
    const b = Number(otherUserId);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return;
    try {
      const raw = await fetchThread(a, b);
      const rows = Array.isArray(raw)
        ? raw
        : raw?.data ?? raw?.messages ?? [];
      const normalized = rows.map((m) => ({
        id: m.id,
        clientId: m.client_id ?? m.clientId ?? null,
        message: m.message,
        sender:
          Number(m.sender_id) === Number(myUserId)
            ? "vendor"
            : m.sender_role || "customer",
        senderRole: m.sender_role,
        senderUserName: m.sender_user_name,
        senderCompanyName: m.sender_company_name,
        createdAt: toUtcISO(m.created_at ?? m.createdAt),
        otherUserId,
        read: Boolean(m.read_status),
      }));
      setChat(normalized);
      setActiveOtherId(otherUserId);
      setActiveOtherName(otherName ?? `User ${otherUserId}`);
      joinRoom(otherUserId);
    } catch {}
  };

  const handleSelectConversation = (c) => {
    loadMessages(c.otherUserId, c.otherUserName);
  };

  const sendMessage = async () => {
    if (!message.trim() || !activeOtherId || !myUserId) return;
    const msgText = message.trim();
    const clientId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now());
    const optimistic = {
      id: Date.now(),
      clientId,
      sender: "vendor",
      senderRole: "vendor",
      message: msgText,
      createdAt: toUtcISO(new Date()),
      otherUserId: activeOtherId,
    };
    setChat((prev) => [...prev, optimistic]);
    setMessage("");
    try {
      await chatApi.sendMessage({
        sender_id: myUserId,
        receiver_id: activeOtherId,
        message: msgText,
        client_id: clientId,
      });
    } catch {
      setMessage(msgText);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const headerTitle = useMemo(
    () =>
      activeOtherName
        ? activeOtherName
        : activeOtherId
        ? `User #${activeOtherId}`
        : "Select a conversation",
    [activeOtherId, activeOtherName]
  );

  /* ===== Return JSX with applied styles ===== */
  return (
    <div className="h-screen flex bg-[var(--bg)] rounded-2xl overflow-hidden">

      {/* Sidebar */}
      <aside
        className={`w-80 flex flex-col min-h-0 border-r-3 ${
          themeMode === "dark" ? "border-[var(--mid-dark)]" : "border-[var(--textbox)]"
        }`}
      >
        <div className="p-4 flex-shrink-0">
          <input
            type="text"
            placeholder="Search Contact..."
            className={`w-full px-4 py-2 rounded-full text-sm ${
              themeMode === "dark"
                ? "bg-[var(--div)] text-[var(--text)]"
                : "bg-[var(--textbox)] text-[var(--text)]"
            } placeholder-gray-400 focus:outline-none`}
          />
        </div>
        <div className="flex-1 overflow-y-auto min-h-0 px-2 pb-4 messages-scroll">
          {conversations.map((c) => (
            <div
              key={c.otherUserId}
              onClick={() => handleSelectConversation(c)}
              className={`cursor-pointer mb-2 rounded-xl p-3 transition-all ${
                Number(activeOtherId) === Number(c.otherUserId)
                  ? themeMode === "dark"
                    ? "bg-[var(--light-gray)] border-l-4 border-[var(--button)]"
                    : "bg-gray-100 border-l-4 border-[var(--button)]"
                  : Number(c.unread) > 0
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
                  <p className="font-semibold truncate text-[var(--text)] mb-1">{c.otherUserName}</p>
                  <p className="text-sm truncate text-[var(--text)]">{c.lastMessage || "No messages yet"}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-[var(--text)] mb-1">{fmtLocal(c.updatedAt)}</span>
                  {Number(c.unread) > 0 && (
                    <span className="bg-[var(--button)] text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                      {c.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Chat Area */}
      <main
        className={`flex-1 flex flex-col min-h-0 rounded-lg border-2 ${
          themeMode === "dark" ? "border-[var(--div)]" : "border-[var(--textbox)]"
        }`}
      >
        {activeOtherId ? (
          <>
            {/* Header */}
            <div
              className={`flex items-center justify-between px-6 py-4 flex-shrink-0 border-b-2 ${
                themeMode === "dark" ? "border-[var(--div)]" : "border-[var(--textbox)]"
              }`}
            >
              <h2 className="font-bold text-[var(--text)] text-lg mt-2">{headerTitle}</h2>
              <button onClick={() => setActiveOtherId(null)} className="text-gray-400 hover:text-[var(--button)] text-2xl">
                ×
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto min-h-0 px-6 py-4 space-y-3 messages-scroll">
              {chat.map((msg) => {
                const incoming = msg.sender !== "vendor";
                return (
                  <div key={msg.clientId || msg.id} className={`flex ${incoming ? "justify-start" : "justify-end"}`}>
                    <div className="max-w-[70%]">
                      <div
                        className={`p-3 rounded-lg text-sm ${
                          incoming
                            ? themeMode === "dark"
                              ? "bg-[var(--div)] border-[var(--button)] text-[var(--text)]"
                              : "bg-[var(--textbox)] border-[var(--button)] text-[var(--text)]"
                            : "bg-[var(--button)] text-white"
                        }`}
                      >
                        {msg.message}
                      </div>
                      <div className={`text-xs mt-1 ${incoming ? "text-left" : "text-right"} text-[var(--text)]`}>
                        {fmtLocal(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
              className={`px-6 py-4 flex items-center gap-3 flex-shrink-0 border-t-2 ${
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
                  themeMode === "dark"
                    ? "bg-[var(--bg)] border-[var(--div)] text-[var(--text)]"
                    : "bg-white border-[var(--textbox)] text-[var(--text)]"
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
    </div>
  );
};

export default VendorChatPage;
