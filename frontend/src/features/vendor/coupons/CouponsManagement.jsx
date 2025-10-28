import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  fetchCoupons,
  addCoupon,
  updateCoupon,
  toggleCouponStatus,
} from "../VendorAPI2";
import CouponForm from "./CouponForm";
import CouponEdit from "./CouponEdit";
import { Edit } from "lucide-react";

export default function CouponsManagement() {
  const { isDarkMode } = useOutletContext();

  const [coupons, setCoupons] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5);
  const [editingCoupon, setEditingCoupon] = useState(null);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => setCoupons(await fetchCoupons());

  const handleFormSubmit = async (formData) => {
    if (editingCoupon) {
      await updateCoupon(editingCoupon.id, formData);
      setEditingCoupon(null);
    } else {
      await addCoupon(formData);
    }
    loadCoupons();
  };

  const handleEditClick = (coupon) => setEditingCoupon(coupon);
  const handleCancelEdit = () => setEditingCoupon(null);

  const colors = {
    background: isDarkMode ? "#242625" : "#f0f2f1",
    cardBg: isDarkMode ? "#666666" : "#ffffff",
    text: isDarkMode ? "#ffffff" : "#242625",
    button: "#307A59",
    line: isDarkMode ? "#f9f9f9" : "#ccc",
  };

  return (
    <div className="p-6 space-y-6 min-h-screen transition-colors duration-300" style={{ backgroundColor: colors.background, color: colors.text }}>
      <h1 className="text-2xl font-bold mb-6 text-center">Coupon Management</h1>

      {/* Form Card */}
      <div className="p-6 rounded-2xl shadow-md transition-colors duration-300" style={{ backgroundColor: colors.cardBg }}>
        <h2 className="text-lg font-semibold mb-4">{editingCoupon ? "Edit Coupon" : "Add New Coupon"}</h2>
        {editingCoupon ? (
          <CouponEdit coupon={editingCoupon} onUpdate={handleFormSubmit} onCancel={handleCancelEdit} />
        ) : (
          <CouponForm initialData={{}} onSubmit={handleFormSubmit} buttonStyle={{ backgroundColor: colors.button, color: "#ffffff" }} />
        )}
      </div>

      {/* Coupon List */}
      <div className="p-6 rounded-2xl shadow-md transition-colors duration-300" style={{ backgroundColor: colors.cardBg }}>
        <h2 className="text-lg font-semibold mb-4">Coupon List</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left border-b" style={{ color: colors.text, borderBottom: `1px solid ${colors.line}` }}>
              <th className="p-2">Code</th>
              <th className="p-2">Discount (%)</th>
              <th className="p-2">Status</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(coupons || []).slice(0, visibleCount).map((c) => (
              <tr key={c.id} className="border-b text-sm transition-colors duration-300" style={{ borderBottom: `1px solid ${colors.line}`, color: colors.text }}>
                <td className="p-2">{c.code}</td>
                <td className="p-2">{c.discount_value}</td>
                <td className="p-2">{c.is_active ? "Active" : "Inactive"}</td>
                <td className="p-2 flex gap-3 justify-center items-center">
                  <button onClick={() => handleEditClick(c)} style={{ color: colors.text }} className="hover:opacity-80 transition">
                    <Edit size={18} />
                  </button>

                  {/* Select لتغيير الحالة */}
                  <select
  value={c.is_active ? "active" : "inactive"}
  onChange={async (e) => {
    const newStatus = e.target.value === "active";
    await toggleCouponStatus(c.id, newStatus);
    loadCoupons();
  }}
  className="border rounded-lg px-2 py-1 text-sm"
  style={{ backgroundColor: colors.cardBg, color: colors.text }}
>
  <option value="active">Active</option>
  <option value="inactive">Inactive</option>
</select>

                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan="4" className="p-4 text-center italic" style={{ color: "#999" }}>No coupons found</td>
              </tr>
            )}
          </tbody>
        </table>

        {visibleCount < coupons.length && (
          <div className="text-center mt-4">
            <button onClick={() => setVisibleCount(visibleCount + 5)} className="px-4 py-2 rounded-lg" style={{ backgroundColor: colors.button, color: "#ffffff" }}>Show More</button>
          </div>
        )}
      </div>
    </div>
  );
}
