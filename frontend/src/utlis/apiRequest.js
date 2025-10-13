import axios from "axios";

const apiRequest = async (url, options = {}) => {
  try {
    const token = localStorage.getItem("token"); 
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axios({
      url,
      headers,
      ...options,
    });

    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return { error: "not aoutharized     " };
    }

    return { error: error.message || " error happen" };
  }
};

export default apiRequest;
