import axios from "axios";

const API_URL = "https://qwikko.onrender.com/api/notifications"; // غيّر الرابط حسب السيرفر

const notificationAPI = {
  // 📬 جلب جميع الإشعارات
  async getNotifications(token) {
    const res = await axios.get(`${API_URL}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },

  // ✅ تحديد الإشعارات كمقروءة
  async markRead(ids, token) {
    const res = await axios.post(
      `${API_URL}/mark-read`,
      { ids },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  },

  // 🔔 جلب عدد الإشعارات غير المقروءة
  async getUnreadCount(token) {
    const res = await axios.get(`${API_URL}/unread-count`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data.count;
  },
};

export default notificationAPI;
