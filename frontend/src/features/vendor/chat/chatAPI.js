// src/api/chatApi.js
import axios from "axios";

/* ========= Base Config ========= */
export const BASE_URL = "http://localhost:3000";
export const SOCKET_URL = BASE_URL;

/* ========= Axios Instance ========= */
const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ✅ ضيف التوكن تلقائيًا مع كل طلب
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ========= Chat API Wrappers ========= */
export const chatApi = {
  // GET /api/chat/vendor/:vendorId/conversations
  async getVendorConversations(vendorUserId) {
    const { data } = await api.get(
      `/api/chat/vendor/${encodeURIComponent(vendorUserId)}/conversations`
    );
    return data; // { conversations: [...] }
  },

  // GET /api/chat/:customerId/:vendorId
  async getMessages(customerId, vendorUserId) {
    const { data } = await api.get(
      `/api/chat/${encodeURIComponent(customerId)}/${encodeURIComponent(
        vendorUserId
      )}`
    );
    return data; // { messages: [...] }
  },

  // POST /api/chat/mark-read
  async markRead({ vendorId, customerId }) {
    const { data } = await api.post(`/api/chat/mark-read`, {
      vendorId,
      customerId,
    });
    return data; // { updated: n }
  },

  // POST /api/chat
  async sendMessage({ sender_id, receiver_id, message, client_id }) {
    const { data } = await api.post(`/api/chat`, {
      sender_id,
      receiver_id,
      message,
      client_id,
    });
    return data; // { success:true, data: {...} }
  },
};

export default api;
