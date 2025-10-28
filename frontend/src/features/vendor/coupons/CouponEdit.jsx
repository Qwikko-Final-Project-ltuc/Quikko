import React from "react";
import CouponForm from "./CouponForm";

export default function CouponEdit({ coupon, onUpdate, onCancel }) {
  const handleSubmit = (data) => onUpdate({ ...coupon, ...data });

  return (
    <div className="mb-6">
      <CouponForm initialData={coupon} onSubmit={handleSubmit} buttonStyle={{ backgroundColor: "#307A59", color: "#fff" }} />
      <div className="flex gap-4 mt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Cancel</button>
      </div>
    </div>
  );
}
