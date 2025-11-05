import React from "react";
import CouponForm from "./CouponForm";
import { X } from "lucide-react";

export default function CouponEdit({ coupon, onUpdate, onCancel, isDarkMode }) {
  const handleSubmit = (data) => onUpdate({ ...coupon, ...data });

  const colors = {
    text: "var(--text)",
    hover: "var(--hover)",
  };

  return (
    <div className="relative">
      {/* زر X لإغلاق التعديل */}
      <button
        onClick={onCancel}
        className="absolute top-0 right-0 p-1 rounded-full transition-all duration-200"
        style={{
          color: colors.text,
          transform: "translate(8px, -49px)", // حركه شوية على اليمين والأسفل
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
