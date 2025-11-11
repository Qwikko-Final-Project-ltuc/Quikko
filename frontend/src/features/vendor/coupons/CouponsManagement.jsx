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
import Footer from "../../customer/customer/components/layout/Footer";

export default function CouponsManagement() {
  const { isDarkMode } = useOutletContext();

  const [coupons, setCoupons] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [status, setStatus] = useState("loading"); 
  const [toast, setToast] = useState(null); // ✅ لإظهار التوست

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setStatus("loading");
    const data = await fetchCoupons();
    setCoupons(data);
    setStatus("idle");
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000); // اختفاء التوست بعد 3 ثواني
  };

  const handleFormSubmit = async (formData) => {
    if (editingCoupon) {
      await updateCoupon(editingCoupon.id, formData);
      setEditingCoupon(null);
      showToast("Coupon updated successfully!");
    } else {
      await addCoupon(formData);
      setShowAddForm(false);
      showToast("Coupon added successfully!");
    }
    loadCoupons();
  };

  const handleEditClick = (coupon) => setEditingCoupon(coupon);
  const handleCancelEdit = () => setEditingCoupon(null);

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
      className="flex flex-col min-h-screen w-full"
      style={{
        backgroundColor: isDarkMode ? "var(--bg-dark)" : "var(--bg)",
        color: "var(--text)",
      }}
    >
      {/* المحتوى الرئيسي */}
      <main className="flex-grow">
        <div className="max-w-screen-xl mx-auto mx-4 sm:mx-8 lg:mx-18 m-18 ">
          {/* العنوان والزر */}
          <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 mb-10 sm:mb-16 px-2 sm:px-4">
            <h1 className="text-xl sm:text-2xl font-bold text-center sm:text-left" style={{ color: isDarkMode ? "#ffffff" : "#307A59" }}>
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

          {/* كارد الفورم */}
          {(showAddForm || editingCoupon) && (
            <div
              className="p-4 sm:p-6 border border-[var(--border)] rounded-2xl shadow-md transition-colors duration-300 mb-6 relative"
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

          {/* جدول الكوبونات */}
          <div
            className="p-4 sm:p-6 border border-[var(--border)] rounded-2xl shadow-md transition-colors duration-300 overflow-x-auto"
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
                          showToast("Coupon status updated!");
                        }}
                        className="rounded-lg px-2 py-1 text-sm sm:text-base"
                        style={{
                          backgroundColor: isDarkMode ? "var(--mid-dark)" : "var(--bg)",
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

            {/* زر عرض المزيد */}
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
      </main>

      {/* Footer */}
      <footer className="w-full mt-auto bg-[var(--footer-bg)]">
        <Footer />
      </footer>

      {/* ✅ Toast Notification أسفل الصفحة */}
      {toast && (
        <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg bg-green-500 text-white flex items-center gap-2 transition-all duration-300">
          <span className="text-lg">✅</span>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
