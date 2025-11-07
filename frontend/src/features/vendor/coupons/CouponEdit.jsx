import React, { useState } from "react";
import CouponForm from "./CouponForm";
import { X } from "lucide-react";

export default function CouponEdit({ coupon, onUpdate, onCancel, isDarkMode }) {
  const [status, setStatus] = useState("idle"); // ✅ حالة التحميل

  const handleSubmit = async (data) => {
    setStatus("loading"); // ✅ بدء التحميل
    await onUpdate({ ...coupon, ...data });
    setStatus("idle"); // ✅ انتهاء التحميل
  };

  const colors = {
    text: "var(--text)",
    hover: "var(--hover)",
  };

  // ✅ شاشة التحميل
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--button)] mx-auto mb-4"></div>
          <p className="text-[var(--text)] text-lg">Updating coupon...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* زر X لإغلاق التعديل */}
      <button
        onClick={onCancel}
        className="absolute top-0 right-0 p-1 rounded-full transition-all duration-200"
        style={{
          color: colors.text,
          transform: "translate(8px, -49px)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.hover)}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
      >
        <X size={18} />
      </button>

      {/* الفورم مباشرة بدون ديف إضافي */}
      <CouponForm
        initialData={coupon}
        onSubmit={handleSubmit}
        buttonStyle={{
          backgroundColor: "var(--button)",
          color: "#ffffff",
          borderRadius: "10px",
        }}
      />
    </div>
  );
}
