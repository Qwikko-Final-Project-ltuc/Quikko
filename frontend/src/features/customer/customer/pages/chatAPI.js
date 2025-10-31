import axios from "axios";

export const BASE_URL = "http://localhost:3000";
export const SOCKET_URL = BASE_URL;

const api = axios.create({
  baseURL: `${BASE_URL}/api/chat`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const chatApi = {
  async getCustomerConversations(customerId) {
    const { data } = await api.get(
      `/customer/${encodeURIComponent(customerId)}/conversations`
    );
    return data;
  },
  async getVendorConversations(vendorUserId) {
    const { data } = await api.get(
      `/vendor/${encodeURIComponent(vendorUserId)}/conversations`
    );
    return data;
  },
  async getMessages(customerId, vendorUserId) {
    const { data } = await api.get(
      `/${encodeURIComponent(customerId)}/${encodeURIComponent(vendorUserId)}`
    );
    return data;
  },
  async sendMessage({ sender_id, receiver_id, message, client_id }) {
    const { data } = await api.post(`/`, {
      sender_id,
      receiver_id,
      message,
      client_id,
    });
    return data;
  },
  async markRead({ vendorId, customerId }) {
    const { data } = await api.post(`/mark-read`, { vendorId, customerId });
    return data;
  },
};

export default api;
