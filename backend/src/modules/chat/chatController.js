const Chat = require("./chatModel");
const { roomKey } = require("./helper/chatrooms");
const n = (v) => Number(v);

/* ===================== GET /:customerId/:vendorId ===================== */
// chatController.js
exports.getMessages = async (req, res) => {
  try {
    const me = n(req.user?.id);
    const customerId = n(req.params.customerId);
    const vendorId = n(req.params.vendorId);

    if (!Number.isFinite(me) || !Number.isFinite(customerId) || !Number.isFinite(vendorId)) {
      return res.status(400).json({ error: "Bad ids" });
    }
    if (me !== customerId && me !== vendorId) {
      return res.status(403).json({ error: "Forbidden (not a participant)" });
    }

    const rows = await Chat.getMessagesBetween(customerId, vendorId);

    const messages = rows.map((r) => ({
      id: r.id,
      sender_id: r.sender_id,
      receiver_id: r.receiver_id,
      sender_role: r.sender_role,                         // 👈 جديد
      sender_user_name: r.sender_user_name || null,       // 👈 جديد
      sender_company_name: r.sender_company_name || null, // 👈 جديد
      message: r.message,
      read_status: r.read_status,
      created_at: r.created_at_iso,
    }));

    return res.json({ messages });
  } catch (err) {
    console.error("getMessages error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


/* ===================== POST / (send message) ===================== */
// chatController.js
exports.postMessage = (io) => async (req, res) => {
  try {
    let { sender_id, receiver_id, message, client_id } = req.body;

    const me = n(req.user?.id);
    sender_id = n(sender_id);
    receiver_id = n(receiver_id);

    if (!Number.isFinite(me)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!sender_id || !receiver_id || !message || !String(message).trim()) {
      return res.status(400).json({ error: "sender_id, receiver_id, message are required" });
    }
    if (!Number.isFinite(sender_id) || !Number.isFinite(receiver_id)) {
      return res.status(400).json({ error: "sender_id/receiver_id must be numbers" });
    }
    if (me !== sender_id) {
      return res.status(403).json({ error: "Forbidden (sender must be the authenticated user)" });
    }

    const text = String(message).trim();

    const saved = await Chat.insertMessage(sender_id, receiver_id, text);
    if (!saved) {
      console.error("Insert returned no rows!");
      return res.status(500).json({ error: "Insert failed" });
    }

    // 👇 هوية المُرسل (role + الاسم) اعتمادًا على جداول users/delivery_companies
    // نحتاج vendorId لتمييز المرسِل إن كان بائعًا؛ بما إن الرسائل عندك بين customer↔vendor
    // vendorId هو الطرف الثاني هنا:
    const identity = await Chat.getIdentityForUser(sender_id, receiver_id);
    const payload = {
      id: saved.id,
      sender_id: saved.sender_id,
      receiver_id: saved.receiver_id,
      sender_role: identity?.role || null,               // 'vendor' | 'customer' | 'delivery'
      sender_user_name: identity?.user_name || null,
      sender_company_name: identity?.company_name || null,
      message: saved.message,
      createdAt: saved.created_at_iso, // UTC ISO
      clientId: client_id ?? null,
    };

    const room = roomKey(sender_id, receiver_id);
    io.to(room).emit("receiveChat", payload);
    console.log("EMIT →", room, payload);

    const data = { ...saved, created_at: saved.created_at_iso };
    delete data.created_at_iso;

    return res.status(201).json({ success: true, data });
  } catch (err) {
    console.error("postMessage error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


/* ===================== GET /vendor/:vendorId/conversations ===================== */
// chatController.js
exports.getVendorConversations = async (req, res) => {
  try {
    const me = n(req.user?.id);
    const vendorId = n(req.params.vendorId);

    if (!Number.isFinite(me) || !Number.isFinite(vendorId)) {
      return res.status(400).json({ error: "Bad vendorId" });
    }
    if (me !== vendorId) {
      return res.status(403).json({ error: "Forbidden (vendor mismatch)" });
    }

    const rows = await Chat.getVendorConversations(vendorId);

    return res.json({
      conversations: rows.map((r) => ({
        other_user_id: Number(r.other_user_id),
        other_role: r.other_role,                         // 'customer' | 'delivery'
        other_user_name: r.other_name || `User ${r.other_user_id}`,
        last_message: r.last_message || "",
        unread_count: Number(r.unread_count || 0),
        last_at: r.last_at_iso,
      })),
    });
  } catch (err) {
    console.error("getVendorConversations error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


/* ===================== POST /mark-read ===================== */
exports.markRead = async (req, res) => {
  try {
    let { vendorId, customerId } = req.body || {};
    const me = n(req.user?.id);
    vendorId = n(vendorId);
    customerId = n(customerId);

    if (
      !Number.isFinite(me) ||
      !Number.isFinite(vendorId) ||
      !Number.isFinite(customerId)
    ) {
      return res
        .status(400)
        .json({ error: "vendorId and customerId are required (numbers)" });
    }

    if (me !== vendorId && me !== customerId) {
      return res.status(403).json({ error: "Forbidden (not a participant)" });
    }

    const receiverId = me;
    const senderId = me === vendorId ? customerId : vendorId;

    const updated = await Chat.markReadFor(receiverId, senderId);

    return res.json({ updated });
  } catch (err) {
    console.error("markRead error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* ===================== GET /customer/:customerId/conversations ===================== */
exports.getCustomerConversations = async (req, res) => {
  try {
    const me = n(req.user?.id);
    const customerId = n(req.params.customerId);

    if (!Number.isFinite(me) || !Number.isFinite(customerId)) {
      return res.status(400).json({ error: "Bad customerId" });
    }
    if (me !== customerId) {
      return res.status(403).json({ error: "Forbidden (customer mismatch)" });
    }

    const rows = await Chat.getCustomerConversations(customerId);

    const data = rows.map((r) => ({
      vendor_id: r.vendor_id != null ? Number(r.vendor_id) : null,
      vendor_user_id: Number(r.vendor_user_id),
      vendor_name: r.vendor_name || null,
      last_message: r.last_message || "",
      unread_count: Number(r.unread_count || 0),
      last_at: r.last_at_iso,
    }));

    return res.json({ conversations: data });
  } catch (err) {
    console.error("getCustomerConversations error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// controllers/chatController.js
exports.getDeliveryConversations = async (req, res) => {
  try {
    const me = Number(req.user?.id);
    const deliveryId = Number(req.params.deliveryId);

    if (!Number.isFinite(me) || !Number.isFinite(deliveryId)) {
      return res.status(400).json({ error: "Bad deliveryId" });
    }
    if (me !== deliveryId) {
      return res.status(403).json({ error: "Forbidden (delivery mismatch)" });
    }

    const rows = await Chat.getDeliveryConversations(deliveryId);

    const conversations = rows.map((r) => ({
      vendor_id: r.vendor_id != null ? Number(r.vendor_id) : null,
      vendor_user_id: Number(r.vendor_user_id),
      vendor_name: r.vendor_name || null,
      last_message: r.last_message || "",
      unread_count: Number(r.unread_count || 0),
      last_at: r.last_at_iso,
    }));

    return res.json({ conversations });
  } catch (err) {
    console.error("getDeliveryConversations error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
