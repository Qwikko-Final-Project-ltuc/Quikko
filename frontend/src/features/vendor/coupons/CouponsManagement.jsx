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
import { Edit, X, Plus, ToggleLeft, ToggleRight } from "lucide-react";
import Footer from "../Footer";

export default function CouponsManagement() {
  const { isDarkMode } = useOutletContext();

  const [coupons, setCoupons] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [status, setStatus] = useState("loading"); 
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadCoupons();
  }, []);

  const colors = {
    background: isDarkMode ? "#242625" : "#ffffff",
    cardBg: isDarkMode ? "#313131" : "#ffffff",
    text: isDarkMode ? "#ffffff" : "#242625",
    button: "#307A59",
    inputBg: isDarkMode ? "#424242" : "#f9f9f9",
    border: isDarkMode ? "#555" : "#e5e5e5",
    secondaryText: isDarkMode ? "#cccccc" : "#666666",
    success: "#28a745",
    danger: "#dc3545",
  };

  const loadCoupons = async () => {
    setStatus("loading");
    try {
      const data = await fetchCoupons();
      setCoupons(data);
      setStatus("idle");
    } catch (error) {
      console.error("Error loading coupons:", error);
      setStatus("error");
      showToast("Failed to load coupons", "error");
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFormSubmit = async (formData) => {
    try {
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
    } catch (error) {
      console.error("Error saving coupon:", error);
      showToast("Failed to save coupon", "error");
    }
  };

  const handleEditClick = (coupon) => setEditingCoupon(coupon);
  const handleCancelEdit = () => setEditingCoupon(null);

  const handleToggleStatus = async (couponId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await toggleCouponStatus(couponId, newStatus);
      loadCoupons();
      showToast(`Coupon ${newStatus ? "activated" : "deactivated"} successfully!`);
    } catch (error) {
      console.error("Error toggling coupon status:", error);
      showToast("Failed to update coupon status", "error");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: colors.button }}></div>
          <p className="text-lg" style={{ color: colors.text }}>Loading coupons...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-lg mb-4" style={{ color: colors.text }}>Failed to load coupons</p>
          <button
            onClick={loadCoupons}
            className="px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: colors.button, color: "#fff" }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // كارد الكوبون الواحد
  const CouponCard = ({ coupon }) => (
    <div 
      className="border rounded-xl p-4 transition-all duration-300 hover:shadow-lg group"
      style={{ 
        borderColor: colors.border, 
        backgroundColor: colors.cardBg,
      }}
    >
      {/* الهيدر - كود الخصم */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-xl" style={{ color: colors.button }}>
            {coupon.code}
          </h3>
          <p className="text-sm" style={{ color: colors.secondaryText }}>
            Coupon Code
          </p>
        </div>
        
        {/* حالة الكوبون */}
        <div 
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            coupon.is_active 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}
        >
          {coupon.is_active ? 'Active' : 'Inactive'}
        </div>
      </div>

      {/* معلومات الخصم */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="font-medium" style={{ color: colors.text }}>Discount</span>
          <span className="font-bold text-lg" style={{ color: colors.success }}>
            {coupon.discount_value}%
          </span>
        </div>

        {/* معلومات إضافية إذا كانت متوفرة */}
        {coupon.valid_from && (
          <div className="flex justify-between items-center text-sm">
            <span style={{ color: colors.secondaryText }}>Valid From</span>
            <span style={{ color: colors.text }}>
              {new Date(coupon.valid_from).toLocaleDateString()}
            </span>
          </div>
        )}

        {coupon.valid_until && (
          <div className="flex justify-between items-center text-sm">
            <span style={{ color: colors.secondaryText }}>Valid Until</span>
            <span style={{ color: colors.text }}>
              {new Date(coupon.valid_until).toLocaleDateString()}
            </span>
          </div>
        )}

        {coupon.usage_limit && (
          <div className="flex justify-between items-center text-sm">
            <span style={{ color: colors.secondaryText }}>Usage Limit</span>
            <span style={{ color: colors.text }}>
              {coupon.used_count || 0} / {coupon.usage_limit}
            </span>
          </div>
        )}
      </div>

      {/* الأكشنز */}
      <div className="flex justify-between items-center pt-3 border-t" style={{ borderColor: colors.border }}>
        {/* زر التعديل */}
        <button 
          onClick={() => handleEditClick(coupon)} 
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:opacity-80 transition-all duration-200 hover:scale-105"
          style={{ 
            backgroundColor: isDarkMode ? '#444' : '#f5f5f5',
            color: colors.text
          }}
          title="Edit coupon"
        >
          <Edit size={16} />
          <span className="text-sm">Edit</span>
        </button>

        {/* تبديل الحالة */}
        <button 
          onClick={() => handleToggleStatus(coupon.id, coupon.is_active)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${
            coupon.is_active 
              ? 'bg-green-500 text-white hover:bg-green-600' 
              : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
          }`}
          title={coupon.is_active ? "Deactivate coupon" : "Activate coupon"}
        >
          {coupon.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
          <span className="text-sm">{coupon.is_active ? 'Active' : 'Inactive'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: colors.background, color: colors.text }}>
      <main className="flex-grow">
        <div className="max-w-screen-xl mx-4 sm:mx-8 lg:mx-12 mt-18 mb-18 px-4 sm:px-6 md:px-10 lg:px-12 py-6 md:py-10 space-y-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 sm:mb-16">
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: "#307A59" }}>
                Coupon Management
              </h1>
              <p className="text-sm" style={{ color: colors.secondaryText }}>
                {coupons.length} coupon{coupons.length !== 1 ? 's' : ''} available
              </p>
            </div>
            
            {!showAddForm && !editingCoupon && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold text-sm sm:text-base hover:opacity-90 transition-all duration-300 hover:scale-105"
                style={{ backgroundColor: colors.button, color: "#fff" }}
              >
                <Plus size={18} />
                <span>Add New Coupon</span>
              </button>
            )}
          </div>

          {/* Form Card */}
          {(showAddForm || editingCoupon) && (
            <div 
              className="p-4 sm:p-6 border rounded-2xl shadow-lg transition-all duration-300 mb-6 relative"
              style={{ 
                backgroundColor: colors.cardBg, 
                borderColor: colors.border 
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold">
                  {editingCoupon ? "Edit Coupon" : "Add New Coupon"}
                </h2>
                <button
                  onClick={editingCoupon ? handleCancelEdit : () => setShowAddForm(false)}
                  className="p-2 rounded-full hover:bg-opacity-20 transition-colors"
                  style={{ 
                    color: colors.text,
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                  }}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                {editingCoupon ? (
                  <CouponEdit 
                    coupon={editingCoupon}
                    onUpdate={handleFormSubmit}
                    onCancel={handleCancelEdit}
                    colors={colors}
                  />
                ) : (
                  <CouponForm
                    initialData={{}}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setShowAddForm(false)}
                    buttonStyle={{ backgroundColor: colors.button, color: "#fff" }}
                    colors={colors}
                  />
                )}
              </div>
            </div>
          )}

          {/* Coupon Cards Grid */}
          <div 
            className="p-4 sm:p-6 border rounded-2xl shadow-sm transition-colors duration-300"
            style={{ 
              backgroundColor: colors.cardBg, 
              borderColor: colors.border 
            }}
          >
            {coupons.length === 0 ? (
              <div className="text-center py-12" style={{ color: colors.secondaryText }}>
                <div className="text-6xl mb-4">🎫</div>
                <p className="text-lg mb-2">No coupons found</p>
                <p className="text-sm mb-6">Create your first coupon to attract more customers</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity mx-auto"
                  style={{ backgroundColor: colors.button, color: "#fff" }}
                >
                  <Plus size={18} />
                  <span>Create Your First Coupon</span>
                </button>
              </div>
            ) : (
              <>
                {/* Grid Container - متجاوب لثلاثة أحجام شاشات */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {coupons.slice(0, visibleCount).map((coupon) => (
                    <CouponCard key={coupon.id} coupon={coupon} />
                  ))}
                </div>

                {/* Show More Button */}
                {visibleCount < coupons.length && (
                  <div className="text-center mt-8">
                    <button 
                      onClick={() => setVisibleCount(prev => prev + 6)} 
                      className="px-8 py-3 rounded-lg font-semibold text-base hover:opacity-90 transition-all duration-300 hover:scale-105"
                      style={{ 
                        backgroundColor: colors.button, 
                        color: "#fff",
                        border: `2px solid ${colors.button}`
                      }}
                    >
                      Show More Coupons ({coupons.length - visibleCount} remaining)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="w-full bg-[var(--footer-bg)] mt-auto">
        <Footer />
      </footer>

      {/* Toast Notification */}
      {toast && (
        <div 
          className={`fixed bottom-5 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 text-white transition-all duration-300 ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          <span className="text-lg">
            {toast.type === "success" ? "✅" : "⚠️"}
          </span>
          <span className="font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
}