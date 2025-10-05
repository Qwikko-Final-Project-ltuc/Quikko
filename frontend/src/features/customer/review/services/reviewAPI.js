import axios from "axios";

const API_URL = "http://localhost:3000/api/reviews"; // عدّل حسب الباك

const api = axios.create({ baseURL: API_URL });

// إضافة review جديد أو تحديثه (UPSERT)
export const addReview = async ({ vendor_id, rating }) => {
  const token = localStorage.getItem("token");
  const res = await api.post(
    "/",
    { vendor_id, rating },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

// جلب كل الreviews لبائع معين
export const getReviewsByVendor = async (vendor_id) => {
  const res = await api.get(`/vendor/${vendor_id}`);
  return res.data;
};

// جلب متوسط تقييم البائع
export const getVendorAverageRating = async (vendor_id) => {
  const res = await api.get(`/vendor/${vendor_id}/average`);
  return res.data.average_rating; // رقم مباشرة
};

// جلب تقييم المستخدم الحالي للبائع
export const getUserReview = async (vendor_id) => {
  const token = localStorage.getItem("token");
  const res = await api.get(`/vendor/${vendor_id}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.rating || 0;
};
