import axios from "axios";

const API_URL = "https://qwikko.onrender.com/api/auth"; 

const CustomerAuthAPI = {
  async register(data) {
    const res = await axios.post(`${API_URL}/register/customer`, data);
    return res.data;
  },

  async login(credentials) {
    const res = await axios.post(`${API_URL}/login`, credentials, {
    withCredentials: true 
  });
    return res.data;
  },
};

export default CustomerAuthAPI;
