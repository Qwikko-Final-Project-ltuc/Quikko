import React, { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { chatApi, SOCKET_URL } from "./chatAPI";

const roomKeyOf = (a, b) =>
  [Number(a), Number(b)].sort((x, y) => x - y).join(":");

const safeText = (v) => {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
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

const CustomerChatPage = () => {
  const auth = useSelector((s) => s.customerAuth);
  const customerId = useMemo(() => {
    const v1 = Number(auth.user?.id);
    if (Number.isFinite(v1) && v1 > 0) return v1;
    const v2 = Number(localStorage.getItem("customerId"));
    return Number.isFinite(v2) && v2 > 0 ? v2 : null;
  }, [auth.user?.id]);

  const location = useLocation();
  const initialVendorFromState = Number(location.state?.vendorId);
  const validInitialVendor =
    Number.isFinite(initialVendorFromState) && initialVendorFromState > 0
      ? initialVendorFromState
      : null;

  const [conversations, setConversations] = useState([]);
  const [activeVendorId, setActiveVendorId] = useState(null);
  const [activeVendorName, setActiveVendorName] = useState("");
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const [authError, setAuthError] = useState("");

  const socketRef = useRef(null);
  const socketInitRef = useRef(false);
  const joinedRoomsRef = useRef(new Set());
  const activeVendorIdRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    activeVendorIdRef.current = activeVendorId;
  }, [activeVendorId]);

  const upsertConversation = (list, item) => {
    const key = Number(item.vendorId);
    const i = list.findIndex((c) => Number(c.vendorId) === key);
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
    const target = validInitialVendor;
    if (target == null || customerId == null) return;
    const draft = {
      vendorId: Number(target),
      vendorName: safeText(location.state?.vendorName) || `Vendor #${target}`,
      lastMessage: "",
      unread: 0,
      updatedAt: null,
    };
    setConversations((prev) => upsertConversation(prev, draft));
    setActiveVendorId(Number(target));
    setActiveVendorName(
      safeText(location.state?.vendorName) || `Vendor #${target}`
    );
    loadMessages(Number(target));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            const id = Number(
              r.vendor_user_id ?? r.user_id ?? r.vendor_id ?? r.vendorId ?? r.id
            );
            if (!Number.isFinite(id) || id <= 0) return null;
            return {
              vendorId: id,
              vendorName:
                safeText(r.vendor_name ?? r.vendorName) || `Vendor #${id}`,
              lastMessage: safeText(r.last_message ?? r.lastMessage ?? ""),
              unread: Number(r.unread_count ?? r.unread ?? 0) || 0,
              updatedAt: r.last_at ?? r.updatedAt ?? r.updated_at ?? null,
            };
          })
          .filter(Boolean)
          .sort(
            (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
          );
        if (!cancelled) {
          setConversations(mapped);
          mapped.forEach((c) => joinRoom(c.vendorId));
        }
      } catch (e) {
        const status = e?.response?.status;
        if (status === 401 || status === 403)
          setAuthError("Unauthorized. Please log in again.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [customerId]);

  useEffect(() => {
    if (customerId == null) return;
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
          const isIncomingFromVendor =
            senderId === Number(vId) && receiverId === Number(customerId);
          const unreadInc = isIncomingFromVendor ? 1 : 0;
          if (i === -1) {
            const base = {
              vendorId: Number(vId),
              vendorName: `Vendor #${Number(vId)}`,
              lastMessage: msg.message,
              unread: unreadInc,
              updatedAt: toUtcISO(msg.createdAt) || new Date().toISOString(),
            };
            return upsertConversation(prevC, base);
          }
          const existing = prevC[i];
          const merged = {
            ...existing,
            lastMessage: msg.message,
            unread: Number(existing.unread || 0) + unreadInc,
            updatedAt: toUtcISO(msg.createdAt) || new Date().toISOString(),
          };
          return upsertConversation(prevC, merged);
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
            ? {
                ...c,
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
  }, [customerId]);

  const joinRoom = (vendorId) => {
    if (!socketRef.current || vendorId == null || customerId == null) return;
    const a = Number(customerId);
    const b = Number(vendorId);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return;
    const key = roomKeyOf(a, b);
    if (joinedRoomsRef.current.has(key)) return;
    socketRef.current.emit("joinChat", { room: key, user1: a, user2: b });
    joinedRoomsRef.current.add(key);
  };

  const loadMessages = async (vendorId) => {
    if (customerId == null || vendorId == null) return;
    const vid = Number(vendorId);
    if (!Number.isFinite(vid) || vid <= 0) return;
    try {
      const data = await chatApi.getMessages(Number(customerId), vid);
      const rows = Array.isArray(data?.messages) ? data.messages : [];
      const normalized = rows.map((m) => ({
        id: m.id,
        clientId: m.client_id || null,
        message: safeText(m.message),
        sender: Number(m.sender_id) === vid ? "vendor" : "customer",
        createdAt: toUtcISO(m.created_at ?? m.createdAt),
        customerId: Number(customerId),
        vendorId: vid,
      }));
      setChat(normalized);
      joinRoom(vid);
      try {
        await chatApi.markRead({
          vendorId: vid,
          customerId: Number(customerId),
        });
      } catch {}
    } catch {}
  };

  const handleSelectConversation = (v) => {
    const vid = Number(v.vendorId);
    setActiveVendorId(Number.isFinite(vid) ? vid : null);
    setActiveVendorName(
      safeText(v.vendorName) || (Number.isFinite(vid) ? `Vendor #${vid}` : "")
    );
    loadMessages(vid);
    setConversations((prev) =>
      prev.map((c) => (Number(c.vendorId) === vid ? { ...c, unread: 0 } : c))
    );
  };

  const sendMessage = async () => {
    if (!message.trim() || activeVendorId == null || customerId == null) return;
    const msgText = message.trim();
    const clientId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now());
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
          ? {
              ...c,
              lastMessage: safeText(msgText),
              updatedAt: toUtcISO(new Date()),
            }
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
    () =>
      activeVendorName ||
      (activeVendorId != null
        ? `Vendor #${activeVendorId}`
        : "Select a conversation"),
    [activeVendorName, activeVendorId]
  );

  if (customerId == null) {
    return <p className="text-center mt-10">Loading your session…</p>;
  }

  return (
    <div className="h-screen flex bg-gray-100 overflow-x-hidden">
      <aside className="w-80 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Inbox</h2>
          {authError && (
            <p className="text-xs text-red-600 mt-1">{authError}</p>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((v) => (
            <div
              key={v.vendorId}
              onClick={() => handleSelectConversation(v)}
              className={`cursor-pointer px-4 py-3 border-b hover:bg-gray-50 ${
                Number(activeVendorId) === Number(v.vendorId)
                  ? "bg-blue-50"
                  : ""
              }`}
            >
              <div className="flex justify-between">
                <div className="min-w-0">
                  <p className="font-semibold truncate">
                    {safeText(v.vendorName) || `Vendor #${v.vendorId}`}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {safeText(v.lastMessage)}
                  </p>
                </div>
                {Number(v.unread) > 0 && (
                  <span className="bg-blue-600 text-white text-xs px-2 rounded-full h-fit">
                    {v.unread}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <div className="bg-blue-600 text-white p-4">
          <h2 className="text-lg font-semibold">{headerTitle}</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {activeVendorId != null ? (
            <>
              {chat.map((msg) => (
                <div
                  key={msg.clientId || msg.id}
                  className={`max-w-[70%] p-2 rounded-lg text-sm ${
                    msg.sender === "customer"
                      ? "bg-blue-200 ml-auto text-right"
                      : "bg-white text-left"
                  }`}
                >
                  {safeText(msg.message)}
                  <div className="text-[10px] text-gray-500 mt-1">
                    {fmtLocal(msg.createdAt)}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <p className="text-center text-gray-500 mt-10">
              Select a conversation from the left.
            </p>
          )}
        </div>

        {activeVendorId != null && (
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

export default CustomerChatPage;
