import axios from "axios";

const API_URL = "http://localhost:3000/api"; // عدلي حسب الباك إند

const couponsAPI = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

couponsAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// دالة التحقق من الكوبون
const validateCoupon = async (couponCode, userId, cartItems = []) => {
  if (!userId) throw new Error("User ID not found. Please login again.");

  userId = Number(userId); // حوله لرقم قبل الإرسال

  console.log("📦 Sending to backend:", {
    coupon_code: couponCode,
    userId,
    cartItems,
  });

  const res = await couponsAPI.post("/coupons/validate", {
    coupon_code: couponCode,
    userId,
    cartItems,
  });

  return res.data;
};

export default { validateCoupon };
