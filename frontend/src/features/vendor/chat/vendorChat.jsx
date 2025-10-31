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

/** اختر اسم العرض حسب الدور */
const pickDisplayName = ({ role, userName, companyName, fallback }) => {
  if (role === "delivery") return companyName || fallback;
  if (role === "customer") return userName || fallback;
  return fallback; // vendor أو غيره
};

/* ===== Component ===== */
const VendorChatPage = () => {
  const myUserId = useMemo(() => {
    const fromToken = Number(getUserIdFromToken());
    if (Number.isFinite(fromToken) && fromToken > 0) return fromToken;
    const fromLS = Number(localStorage.getItem("vendorUserId"));
    if (Number.isFinite(fromLS) && fromLS > 0) return fromLS;
    return null;
  }, []);

  // 👇 نقرأ الـ receiverId / toName القادمين من navigate(...) في صفحة الأوردرات
  const location = useLocation();
  const preReceiverId = useMemo(
    () =>
      Number(location.state?.receiverId) ||
      Number(location.state?.toUserId) ||
      null,
    [location.state]
  );
  const preReceiverName = useMemo(
    () => location.state?.toName || null,
    [location.state]
  );

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

  /* ===== Load vendor conversations ===== */
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
            // Backend: other_user_id | other_role | other_user_name | last_message | unread_count | last_at
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

          // 👇 لو جايي من صفحة الأوردرات مع receiverId: افتح هذه المحادثة مباشرة
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

  /* ===== Socket setup ===== */
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
      if (
        String(err?.message || "")
          .toLowerCase()
          .includes("invalid")
      ) {
        setAuthError("Socket auth failed. Please log in again.");
      }
    });

    s.on("reconnect_error", () => {});

    const onReceive = (msg) => {
      const senderId = Number(msg.sender_id ?? msg.senderId);
      const receiverId = Number(msg.receiver_id ?? msg.receiverId);
      if (!senderId || !receiverId) return;
      if (![senderId, receiverId].includes(Number(myUserId))) return;

      const otherId = senderId === Number(myUserId) ? receiverId : senderId;
      const senderRole = msg.sender_role; // 'customer' | 'delivery' | 'vendor'

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

    const onVisible = () => {
      if (document.visibilityState === "visible") rejoinAll();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      if (socketRef.current) {
        for (const key of joinedRoomsRef.current) {
          socketRef.current.emit("leaveChat", { room: key });
        }
      }
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

  /* ===== Wrapper: get messages regardless of signature ===== */
  const fetchThread = async (meUserId, otherUserId) => {
    try {
      // شائع: getMessages(otherUserId, meUserId)
      const r = await chatApi.getMessages(otherUserId, meUserId);
      return r;
    } catch {
      // fallback: getMessages(otherUserId)
      const r = await chatApi.getMessages(otherUserId);
      return r;
    }
  };

  /* ===== Load messages for one conversation ===== */
  const loadMessages = async (otherUserId, otherName) => {
    const a = Number(myUserId);
    const b = Number(otherUserId);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return;
    try {
      const raw = await fetchThread(a, b);
      const rows = Array.isArray(raw) ? raw : raw?.data ?? raw?.messages ?? [];
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
      try {
        if (chatApi.markRead) {
          await chatApi.markRead({ user1: myUserId, user2: otherUserId });
        } else if (chatApi.markAsRead) {
          await chatApi.markAsRead({ user1: myUserId, user2: otherUserId });
        }
      } catch {}
      setConversations((prev) =>
        prev.map((c) =>
          Number(c.otherUserId) === Number(otherUserId)
            ? { ...c, unread: 0, updatedAt: toUtcISO(new Date()) }
            : c
        )
      );
    } catch {}
  };

  const handleSelectConversation = (c) => {
    loadMessages(c.otherUserId, c.otherUserName);
  };

  /* ===== Send message ===== */
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
    setConversations((prev) =>
      prev.map((c) =>
        Number(c.otherUserId) === Number(activeOtherId)
          ? { ...c, lastMessage: msgText, updatedAt: toUtcISO(new Date()) }
          : c
      )
    );
    setMessage("");
    try {
      await chatApi.sendMessage({
        sender_id: myUserId, // ← الفندور من التوكن (sender)
        receiver_id: activeOtherId, // ← الدليفري المقصود (receiver)
        message: msgText,
        client_id: clientId,
      });
    } catch {
      setChat((prev) => prev.filter((m) => m.clientId !== clientId));
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

  return (
    <div className="h-screen flex bg-gray-100">
      <aside className="w-80 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Inbox</h2>
          <p className="text-xs text-gray-500">My User ID: {myUserId || "—"}</p>
          {authError && (
            <p className="text-xs text-red-600 mt-1">Auth: {authError}</p>
          )}
          {initError && (
            <p className="text-xs text-red-600 mt-1">Error: {initError}</p>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="p-4 text-sm text-gray-500">Loading conversations…</p>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 space-y-2">
              <p>No conversations yet.</p>
              <p className="text-xs">
                <code>/api/chat/vendor/:vendorId/conversations</code> يرجّع
              </p>
            </div>
          ) : (
            conversations.map((c) => (
              <div
                key={c.otherUserId}
                onClick={() => handleSelectConversation(c)}
                className={`cursor-pointer px-4 py-3 border-b hover:bg-gray-50 ${
                  Number(activeOtherId) === Number(c.otherUserId)
                    ? "bg-blue-50"
                    : ""
                }`}
              >
                <div className="flex justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{c.otherUserName}</p>
                    <p className="text-sm text-gray-500 truncate">
                      {c.lastMessage}
                    </p>
                  </div>
                  {Number(c.unread) > 0 && (
                    <span className="bg-blue-600 text-white text-xs px-2 rounded-full h-fit">
                      {c.unread}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <div className="bg-blue-600 text-white p-4">
          <h2 className="text-lg font-semibold">{headerTitle}</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {activeOtherId ? (
            <>
              {chat.map((msg) => {
                const incoming = msg.sender !== "vendor";
                const lineName =
                  msg.senderRole === "delivery"
                    ? msg.senderCompanyName || activeOtherName
                    : msg.senderUserName || activeOtherName;

                return (
                  <div
                    key={msg.clientId || msg.id}
                    className={`max-w-[70%] p-2 rounded-lg text-sm ${
                      incoming
                        ? "bg-white text-left"
                        : "bg-blue-200 ml-auto text-right"
                    }`}
                  >
                    {/* {incoming && (
                      <div className="text-[11px] font-semibold text-gray-500 mb-1">
                        {lineName}
                      </div>
                    )} */}
                    {msg.message}
                    <div className="text-[10px] text-gray-500 mt-1">
                      {fmtLocal(msg.createdAt)}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="p-4 text-sm text-gray-500">
              {loading
                ? "Loading messages…"
                : "Select a conversation from the left."}
            </div>
          )}
        </div>

        {activeOtherId && (
          <div className="bg-white p-3 flex items-center gap-2 border-t">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 border rounded-full px-3 py-2 text-sm"
            />
            <button
              onClick={sendMessage}
              disabled={!message.trim()}
              className={`rounded-full px-4 py-2 text-white ${
                !message.trim()
                  ? "bg-blue-300"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              Send
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default VendorChatPage;
