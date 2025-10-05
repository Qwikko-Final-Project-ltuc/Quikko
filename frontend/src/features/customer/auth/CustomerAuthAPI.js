import axios from "axios";

const API_URL = "http://localhost:3000/api/auth"; // غيّر الرابط إذا السيرفر عندك مختلف

const CustomerAuthAPI = {
  async register(data) {
    const res = await axios.post(`${API_URL}/register/customer`, data);
    return res.data;
  },

  async login(credentials) {
    const res = await axios.post(`${API_URL}/login`, credentials, {
    withCredentials: true // 👈 مهم جداً لإرسال كوكيز الغيست
  });
    return res.data;
  },
};

export default CustomerAuthAPI;
