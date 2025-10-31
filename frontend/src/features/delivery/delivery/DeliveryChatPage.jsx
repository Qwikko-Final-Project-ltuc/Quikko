import React, { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import { chatApi, SOCKET_URL } from "./chatAPI";
import { useLocation } from "react-router-dom";

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

const safeText = (v) => {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
};

const DeliveryChatPage = () => {
  const location = useLocation();
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

  return (
    <div className="h-screen flex bg-gray-100 overflow-x-hidden">
      <aside
        className="w-80 border-r bg-white flex flex-col"
        style={{
          backgroundColor: themeDark ? "#242625" : "#ffffff",
          color: themeDark ? "#ffffff" : "#242625",
        }}
      >
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Inbox</h2>
          {authError && (
            <p className="text-xs text-red-600 mt-1">{authError}</p>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="p-4 text-sm opacity-70">Loading…</p>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-sm opacity-70">No conversations yet.</div>
          ) : (
            conversations.map((c) => (
              <div
                key={c.vendorUserId}
                onClick={() => handleSelectConversation(c)}
                className={`cursor-pointer px-4 py-3 border-b hover:bg-gray-50 ${
                  Number(activeVendorId) === Number(c.vendorUserId)
                    ? "bg-blue-50"
                    : ""
                }`}
              >
                <div className="flex justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{c.vendorName}</p>
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
          {activeVendorId ? (
            <>
              {chat.map((msg) => (
                <div
                  key={msg.clientId || msg.id}
                  className={`max-w-[70%] p-2 rounded-lg text-sm ${
                    msg.sender === "delivery"
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
            <div className="p-4 text-sm text-gray-500">
              Select a conversation from the left.
            </div>
          )}
        </div>

        {activeVendorId && (
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

export default DeliveryChatPage;
