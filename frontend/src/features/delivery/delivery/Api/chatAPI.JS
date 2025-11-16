import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "https://qwikko.onrender.com";
export const SOCKET_URL = API_BASE;

const instance = axios.create({
  baseURL: `${API_BASE}/api/chat`,
  headers: { "Content-Type": "application/json" },
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const unwrap = (r) => r.data;

export const chatApi = {
  getVendorConversations(vendorId) {
    return instance
      .get(`/vendor/${encodeURIComponent(vendorId)}/conversations`)
      .then(unwrap);
  },
  getCustomerConversations(customerId) {
    return instance
      .get(`/customer/${encodeURIComponent(customerId)}/conversations`)
      .then(unwrap);
  },
  getDeliveryConversations(deliveryId) {
    return instance
      .get(`/delivery/${encodeURIComponent(deliveryId)}/conversations`)
      .then(unwrap);
  },
  getMessages(a, b) {
    return instance
      .get(`/${encodeURIComponent(a)}/${encodeURIComponent(b)}`)
      .then(unwrap);
  },
  sendMessage({ sender_id, receiver_id, message, client_id }) {
    return instance
      .post(`/`, { sender_id, receiver_id, message, client_id })
      .then(unwrap);
  },
  markRead({ vendorId, customerId }) {
    return instance.post(`/mark-read`, { vendorId, customerId }).then(unwrap);
  },
  markReadForVendorDelivery({ vendorId, deliveryId }) {
    return instance
      .post(`/mark-read`, { vendorId, customerId: deliveryId })
      .then(unwrap);
  },
};

export default chatApi;
