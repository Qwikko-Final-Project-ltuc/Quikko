// src/features/vendor/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  if (!token) {
    alert("يجب تسجيل الدخول أولاً");
    return <Navigate to="/vendor/login" replace />;
  }

  try {
    // نفك التوكن لنقرأ الدور (role)
    const payload = JSON.parse(atob(token.split(".")[1]));
    const role = payload.role;

    // تحقق من الدور
    if (role !== "vendor") {
      alert("🚫 هذا القسم مخصص للفيندور فقط.");
      return <Navigate to="/" replace />;
    }
  } catch (error) {
    console.error("Token decoding failed:", error);
    alert("رمز الدخول غير صالح. يرجى تسجيل الدخول مجددًا.");
    return <Navigate to="/vendor/login" replace />;
  }

  // إذا كل شيء تمام، اسمح بالوصول
  return children;
}
