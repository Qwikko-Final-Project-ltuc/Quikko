import React, { useState } from "react";

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

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ التحقق من القيم الرقمية قبل الإرسال
    if (!formData.discount_value || isNaN(formData.discount_value)) {
      alert("يرجى إدخال قيمة خصم صحيحة");
      return;
    }

    if (formData.discount_value <= 0) {
      alert("قيمة الخصم يجب أن تكون أكبر من 0");
      return;
    }

    if (formData.discount_value > 100 && formData.discount_type === "percentage") {
      alert("قيمة الخصم بالنسبة المئوية لا يمكن أن تتجاوز 100%");
      return;
    }

    onSubmit(formData);

    // إعادة تعيين الحقول
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full p-0">
      <div className="flex flex-col p-2 rounded-lg bg-white">
        <label className="text-sm font-medium mb-1">Code</label>
        <input
          type="text"
          name="code"
          value={formData.code}
          onChange={handleChange}
          className="border rounded-lg p-2"
          required
        />
      </div>

      {/* ✅ تعديل الاسم إلى discount_value */}
      <div className="flex flex-col p-2 rounded-lg bg-white">
        <label className="text-sm font-medium mb-1">Discount (%)</label>
        <input
          type="number"
          name="discount_value"
          value={formData.discount_value}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (formData.discount_type === "percentage") {
              if (value > 100) {
                setFormData({ ...formData, discount_value: 100 });
              } else if (value < 0) {
                setFormData({ ...formData, discount_value: 0 });
              } else {
                setFormData({ ...formData, discount_value: value });
              }
            } else {
              setFormData({ ...formData, discount_value: value });
            }
          }}
          className="border rounded-lg p-2"
          required
        />
      </div>

      <div className="flex flex-col p-2 rounded-lg bg-white">
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
          className="border rounded-lg p-2"
          required
        />
      </div>

      <div className="flex flex-col p-2 rounded-lg bg-white">
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
          className="border rounded-lg p-2"
          required
        />
      </div>

      <div className="flex flex-col p-2 rounded-lg bg-white">
        <label className="text-sm font-medium mb-1">Usage Limit</label>
        <input
          type="number"
          name="usage_limit"
          value={formData.usage_limit}
          onChange={handleChange}
          className="border rounded-lg p-2"
          required
        />
      </div>

      <button type="submit" className="px-4 py-2 rounded-lg" style={buttonStyle}>
        {initialData?.id ? "Update Coupon" : "Add Coupon"}
      </button>
    </form>
  );
}
