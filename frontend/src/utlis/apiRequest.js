import axios from "axios";

// دالة موحدة لكل الطلبات
const apiRequest = async (url, options = {}) => {
  try {
    const token = localStorage.getItem("token"); // أو أي مكان خزنتي فيه التوكن
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axios({
      url,
      headers,
      ...options,
    });

    return response.data;
  } catch (error) {
    // إذا الخطأ 401
    if (error.response && error.response.status === 401) {
      return { error: "لا تملك صلاحية عرض هذه البيانات" };
    }

    // أي خطأ آخر
    return { error: error.message || "حدث خطأ" };
  }
};

export default apiRequest;
