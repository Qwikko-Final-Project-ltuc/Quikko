import React, { useState, useEffect } from "react";

export default function CouponForm({ initialData = {}, onSubmit, buttonStyle }) {
  const [formData, setFormData] = useState({
    code: initialData.code || "",
    discount_type: initialData.discount_type || "percentage",
    discount_value: initialData.discount_value || "",
    valid_from: initialData.valid_from ? initialData.valid_from.slice(0, 10) : "",
    valid_to: initialData.valid_to ? initialData.valid_to.slice(0, 10) : "",
    usage_limit: initialData.usage_limit || "",
    is_active: initialData.is_active !== undefined ? initialData.is_active : true,
  });

  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") === "dark");
  const [status, setStatus] = useState("idle"); // ✅ حالة التحميل

  useEffect(() => {
    const handleStorageChange = () =>
      setIsDarkMode(localStorage.getItem("theme") === "dark");
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.discount_value ||
      isNaN(formData.discount_value) ||
      formData.discount_value <= 0
    ) {
      alert("يرجى إدخال قيمة خصم صحيحة أكبر من 0");
      return;
    }
    if (formData.discount_value > 100 && formData.discount_type === "percentage") {
      alert("قيمة الخصم بالنسبة المئوية لا يمكن أن تتجاوز 100%");
      return;
    }

    setStatus("loading"); // ✅ بدء التحميل
    await onSubmit(formData);
    setStatus("idle"); // ✅ انتهاء التحميل

    setFormData({
      code: "",
      discount_type: "percentage",
      discount_value: "",
      valid_from: "",
      valid_to: "",
      usage_limit: "",
      is_active: true,
    });
  };

  // تحديد لون خلفية الـ input حسب المود
  const inputBg = isDarkMode ? "var(--mid-dark)" : "var(--textbox)";

  // ✅ شاشة التحميل
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--button)] mx-auto mb-4"></div>
          <p className="text-[var(--text)] text-lg">Submitting coupon...</p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 w-full p-0"
      style={{ color: "var(--text)" }}
    >
      {/* 🧾 Code */}
      <div className="flex flex-col p-2 rounded-lg">
        <label className="text-sm font-medium mb-1">Code</label>
        <input
          type="text"
          name="code"
          value={formData.code}
          onChange={handleChange}
          className="border rounded-lg p-2 focus:ring-2 outline-none"
          style={{
            color: "var(--text)",
            borderColor: "var(--border)",
          }}
          required
        />
      </div>

      {/* 💸 Discount */}
      <div className="flex flex-col p-2 rounded-lg">
        <label className="text-sm font-medium mb-1">Discount (%)</label>
        <input
          type="number"
          name="discount_value"
          value={formData.discount_value}
          onChange={(e) => {
            let value = Number(e.target.value);
            if (formData.discount_type === "percentage") {
              value = Math.min(Math.max(value, 0), 100);
            }
            setFormData({ ...formData, discount_value: value });
          }}
          className="border rounded-lg p-2 focus:ring-2 outline-none"
          style={{
            color: "var(--text)",
            borderColor: "var(--border)",
          }}
          required
        />
      </div>

      {/* 📅 Valid From */}
      <div className="flex flex-col p-2 rounded-lg">
        <label className="text-sm font-medium mb-1">Valid From</label>
        <input
          type="date"
          name="valid_from"
          value={formData.valid_from}
          onChange={(e) => {
            const today = new Date().toISOString().split("T")[0];
            if (e.target.value < today) {
              alert("تاريخ البداية لا يمكن أن يكون قديمًا");
              return;
            }
            setFormData({ ...formData, valid_from: e.target.value });
          }}
          className="border rounded-lg p-2 focus:ring-2 outline-none"
          style={{
            color: "var(--text)",
            borderColor: "var(--border)",
          }}
          required
        />
      </div>

      {/* 📅 Valid To */}
      <div className="flex flex-col p-2 rounded-lg">
        <label className="text-sm font-medium mb-1">Valid To</label>
        <input
          type="date"
          name="valid_to"
          value={formData.valid_to}
          onChange={(e) => {
            if (formData.valid_from && e.target.value < formData.valid_from) {
              alert("تاريخ النهاية يجب أن يكون بعد تاريخ البداية");
              return;
            }
            setFormData({ ...formData, valid_to: e.target.value });
          }}
          className="border rounded-lg p-2 focus:ring-2 outline-none"
          style={{
            color: "var(--text)",
            borderColor: "var(--border)",
          }}
          required
        />
      </div>

      {/* 🔢 Usage Limit */}
      <div className="flex flex-col p-2 rounded-lg">
        <label className="text-sm font-medium mb-1">Usage Limit</label>
        <input
          type="number"
          name="usage_limit"
          value={formData.usage_limit}
          onChange={handleChange}
          className="border rounded-lg p-2 focus:ring-2 outline-none"
          style={{
            color: "var(--text)",
            borderColor: "var(--border)",
          }}
          required
        />
      </div>

      {/* ✅ Button */}
      <button
        type="submit"
        className="px-4 py-2 rounded-lg hover:opacity-90 transition font-medium"
        style={{
          backgroundColor: "var(--button)",
          color: "#fff",
        }}
      >
        {initialData?.id ? "Update Coupon" : "Add Coupon"}
      </button>
    </form>
  );
}
