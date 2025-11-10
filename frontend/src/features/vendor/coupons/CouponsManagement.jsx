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
import { Edit, X } from "lucide-react";

export default function CouponsManagement() {
  const { isDarkMode } = useOutletContext();

  const [coupons, setCoupons] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [status, setStatus] = useState("loading"); // ✅ حالة التحميل

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setStatus("loading"); // ✅ بدء التحميل
    const data = await fetchCoupons();
    setCoupons(data);
    setStatus("idle"); // ✅ انتهاء التحميل
  };

  const handleFormSubmit = async (formData) => {
    if (editingCoupon) {
      await updateCoupon(editingCoupon.id, formData);
      setEditingCoupon(null);
    } else {
      await addCoupon(formData);
      setShowAddForm(false);
    }
    loadCoupons();
  };

  const handleEditClick = (coupon) => setEditingCoupon(coupon);
  const handleCancelEdit = () => setEditingCoupon(null);

  // ✅ شاشة التحميل
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--button)] mx-auto mb-4"></div>
          <p className="text-[var(--text)] text-lg">Loading coupons...</p>
        </div>
      </div>
    );
  }

  return (
  <div
    className="min-h-screen w-full"
    style={{
      backgroundColor: isDarkMode ? "var(--bg-dark)" : "var(--bg)",
      color: "var(--text)",
      padding: "3rem",
    }}
  >
    {/* ✅ الحاوية العامة المتجاوبة */}
    <div className="max-w-screen-xl mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12 lg:py-16">
      
      {/* ✅ العنوان والزر متجاوب */}
      <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 mb-10 sm:mb-16">
        <h1 className="text-xl sm:text-2xl font-bold text-center sm:text-left">
          Coupon Management
        </h1>

        {!showAddForm && !editingCoupon && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 rounded-lg font-semibold text-sm sm:text-base transition"
            style={{
              backgroundColor: "var(--button)",
              color: "#fff",
            }}
          >
            Add New Coupon
          </button>
        )}
      </div>

      {/* ✅ كارد الفورم */}
      {(showAddForm || editingCoupon) && (
        <div
          className="p-4 sm:p-6 rounded-2xl shadow-md transition-colors duration-300 mb-6 relative"
          style={{
            backgroundColor: isDarkMode ? "var(--mid-dark)" : "var(--bg)",
          }}
        >
          {!editingCoupon && (
            <button
              onClick={() => setShowAddForm(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-[var(--hover)] transition"
              style={{ color: "var(--text)" }}
            >
              <X size={18} />
            </button>
          )}

          <h2 className="text-base sm:text-lg font-semibold mb-4">
            {editingCoupon ? "Edit Coupon" : "Add New Coupon"}
          </h2>

          <div className="space-y-4">
            {editingCoupon ? (
              <CouponEdit
                coupon={editingCoupon}
                onUpdate={handleFormSubmit}
                onCancel={handleCancelEdit}
                isDarkMode={isDarkMode}
              />
            ) : (
              <CouponForm
                initialData={{}}
                onSubmit={handleFormSubmit}
                buttonStyle={{
                  backgroundColor: "var(--button)",
                  color: "#fff",
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* ✅ جدول الكوبونات */}
      <div
        className="p-4 sm:p-6 rounded-2xl shadow-md transition-colors duration-300 overflow-x-auto"
        style={{
          backgroundColor: isDarkMode ? "var(--mid-dark)" : "var(--bg)",
        }}
      >
        <h2 className="text-base sm:text-lg font-semibold mb-4">
          Coupon List
        </h2>

        <table className="w-full border-collapse text-sm sm:text-base">
          <thead>
            <tr
              className="text-left border-b"
              style={{
                color: "var(--text)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <th className="p-2">Code</th>
              <th className="p-2">Discount (%)</th>
              <th className="p-2">Status</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {(coupons || []).slice(0, visibleCount).map((c) => (
              <tr
                key={c.id}
                className="border-b text-sm transition-colors duration-300"
                style={{
                  borderBottom: "1px solid var(--border)",
                  color: "var(--text)",
                }}
              >
                <td className="p-2">{c.code}</td>
                <td className="p-2">{c.discount_value}</td>
                <td className="p-2">{c.is_active ? "Active" : "Inactive"}</td>

                <td className="p-2 flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <button
                    onClick={() => handleEditClick(c)}
                    style={{ color: "var(--text)" }}
                    className="hover:opacity-80 transition"
                  >
                    <Edit size={18} />
                  </button>

                  <select
                    value={c.is_active ? "active" : "inactive"}
                    onChange={async (e) => {
                      const newStatus = e.target.value === "active";
                      await toggleCouponStatus(c.id, newStatus);
                      loadCoupons();
                    }}
                    className="rounded-lg px-2 py-1 text-sm sm:text-base"
                    style={{
                      backgroundColor: isDarkMode
                        ? "var(--mid-dark)"
                        : "var(--bg)",
                      color: "var(--text)",
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </td>
              </tr>
            ))}

            {coupons.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="p-4 text-center italic"
                  style={{ color: "var(--light-gray)" }}
                >
                  No coupons found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ✅ زر عرض المزيد */}
        {visibleCount < coupons.length && (
          <div className="text-center mt-4">
            <button
              onClick={() => setVisibleCount(visibleCount + 5)}
              className="px-4 py-2 rounded-lg text-sm sm:text-base"
              style={{
                backgroundColor: "var(--button)",
                color: "#ffffff",
              }}
            >
              Show More
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);

}
