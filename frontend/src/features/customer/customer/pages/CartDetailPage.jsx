import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart, setTempCartId } from "../cartSlice";
import CartItem from "../components/CartItem";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

// Toast Notification Component
const Toast = ({ message, type = "success", onClose }) => {
  const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";
  
  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3 animate-in slide-in-from-right duration-300`}>
      <span>{message}</span>
      <button 
        onClick={onClose}
        className="text-white hover:text-gray-200 text-lg font-bold"
      >
        ×
      </button>
    </div>
  );
};

const CartDetailPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { id: cartId } = useParams();
  const { currentCart } = useSelector((state) => state.cart);
  const themeMode = useSelector((state) => state.customerTheme.mode);
  const [groupedItems, setGroupedItems] = useState({});
  const token = localStorage.getItem("token");
  const [modalMsg, setModalMsg] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [redirectToLogin, setRedirectToLogin] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

  const showModal = (msg, shouldRedirect = false) => {
    setModalMsg(msg);
    setModalVisible(true);
    setRedirectToLogin(shouldRedirect);
  };

  const closeModal = () => {
    setModalVisible(false);
    if (redirectToLogin) {
      navigate("/customer/login");
    }
  };
  
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const [appliedCoupons, setAppliedCoupons] = useState({});
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [applyingCoupon, setApplyingCoupon] = useState(null); // Track which coupon is being applied

  // Fetch cart from server
  useEffect(() => {
    if (cartId) {
      dispatch(fetchCart(cartId));
    }
  }, [cartId, dispatch]);

  // Group items by vendor whenever currentCart changes
  useEffect(() => {
    if (currentCart?.items?.length) {
      const grouped = currentCart.items.reduce((acc, item) => {
        const vendor = item.vendor_name || "Unknown Vendor";
        if (!acc[vendor]) {
          acc[vendor] = {
            items: [],
            vendor_id: item.vendor_id // Store vendor_id for coupon handling
          };
        }
        acc[vendor].items.push(item);
        return acc;
      }, {});
      setGroupedItems(grouped);
    } else {
      setGroupedItems({});
    }
  }, [currentCart]);

  const handleAddProduct = () => {
    if (currentCart?.id) {
      dispatch(setTempCartId(currentCart.id));
      navigate("/customer/products", { state: { cartId: currentCart.id } });
    }
  };

  const total =
    currentCart?.items?.reduce(
      (sum, item) => sum + Number(item.price || 0) * (item.quantity || 0),
      0
    ) || 0;

  const totalItemsCount =
    currentCart?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) ||
    0;

  const handleCheckout = async () => {
    try {
      if (!token) {
        showModal("Please log in to proceed to checkout.", true);
        return;
      }
      if (!currentCart?.id) return showModal("Cart not loaded yet");
      
      try {
        localStorage.setItem("currentCart", JSON.stringify(currentCart));
        localStorage.setItem(
          "appliedCoupon",
          JSON.stringify(appliedCoupons || null)
        );
      } catch (e) {
        console.warn("Failed to persist cart/coupon to localStorage", e);
      }
      navigate(`/customer/order-details/${currentCart.id}`, {
        state: { cart: currentCart, appliedCoupon: appliedCoupons || null },
      });
    } catch (err) {
      console.error("Checkout failed", err);
      showToast("Checkout failed. Please try again.", "error");
    }
  };

  const handleApplyCoupon = async (couponCode, couponVendorId) => {
    if (!currentCart?.id) {
      showToast("Cart not loaded yet", "error");
      return;
    }

    // Check if coupon already applied for this vendor
    if (appliedCoupons[couponVendorId]) {
      showToast("Coupon already applied for this vendor", "error");
      return;
    }

    const itemsFromVendor = currentCart.items.filter(
      (item) => item.vendor_id === couponVendorId
    );

    if (itemsFromVendor.length === 0) {
      showToast("No items from this vendor found in the cart.", "error");
      return;
    }

    const itemsForServer = itemsFromVendor.map((item) => ({
      id: item.id,
      cart_id: item.cart_id,
      price: Number(item.price),
      quantity: item.quantity,
      vendor_id: item.vendor_id,
      coupons: item.coupons || [],
    }));

    setApplyingCoupon(couponVendorId);

    try {
      const res = await fetch(`http://localhost:3000/api/coupons/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          coupon_code: couponCode,
          userId: storedUser?.id,
          cartItems: itemsForServer,
          cartId: currentCart.id,
        }),
      });

      const data = await res.json();

      if (data.valid) {
        setAppliedCoupons((prev) => ({
          ...prev,
          [couponVendorId]: {
            code: couponCode,
            discount: Number(data.discount_amount),
          },
        }));

        setTotalDiscount(
          (prevTotal) => prevTotal + Number(data.discount_amount)
        );

        showToast(`Coupon "${couponCode}" applied! Discount: $${data.discount_amount}`, "success");
      } else {
        showToast(data.message || "Invalid coupon", "error");
      }
    } catch (err) {
      console.error("Failed to apply coupon", err);
      showToast("Failed to apply coupon. Please try again.", "error");
    } finally {
      setApplyingCoupon(null);
    }
  };

  const handleRemoveCoupon = (vendorId) => {
    const couponToRemove = appliedCoupons[vendorId];
    if (couponToRemove) {
      setAppliedCoupons(prev => {
        const newAppliedCoupons = { ...prev };
        delete newAppliedCoupons[vendorId];
        return newAppliedCoupons;
      });
      
      setTotalDiscount(prevTotal => prevTotal - couponToRemove.discount);
      showToast(`Coupon "${couponToRemove.code}" removed`, "success");
    }
  };

  const discountedTotal = total - totalDiscount;

  return (
    <div className={`min-h-screen ${themeMode === 'dark' ? 'bg-[var(--bg)]' : 'bg-white'} transition-colors duration-300`}>
      {/* Toast Notification */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ show: false, message: "", type: "success" })}
        />
      )}

      {/* Modal */}
      {modalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className={`p-6 rounded-xl shadow-xl max-w-sm w-full text-center ${
            themeMode === 'dark' ? 'bg-[var(--div)]' : 'bg-white'
          }`}>
            <p className={`mb-4 ${themeMode === 'dark' ? 'text-white' : 'text-gray-800'}`}>{modalMsg}</p>
            <button
              onClick={closeModal}
              className="bg-[var(--button)] text-white px-6 py-2 rounded-lg hover:bg-[#015c40] font-semibold transition-colors duration-300"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="h-6"></div>
      <div className={`w-full text-left ${themeMode === 'dark' ? 'bg-[var(--bg)]' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className={`text-3xl sm:text-4xl font-bold mb-3 pt-6 sm:pt-8 ${
            themeMode === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Shopping Cart
          </h1>
          <p className={`${
            themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
          } max-w-2xl text-base sm:text-lg`}>
            Review and manage your cart items
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            {/* Cart Stats Badge */}
            {currentCart?.items?.length > 0 && (
              <div className={`px-3 sm:px-4 py-2 rounded-2xl ${
                themeMode === 'dark' ? 'bg-[var(--div)]' : 'bg-gray-100'
              } shadow-lg border ${
                themeMode === 'dark' ? 'border-[var(--border)]' : 'border-gray-200'
              }`}>
                <span className={`font-semibold text-sm sm:text-base ${
                  themeMode === 'dark' ? 'text-[var(--text)]' : 'text-[var(--button)]'
                }`}>
                  {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} • ${total.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handleAddProduct}
            className="bg-[var(--button)] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:bg-[#015c40] transition-all duration-300 flex items-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add More Products
          </button>
        </div>

        {/* Compact Cart Stats */}
        {currentCart?.items?.length > 0 && (
          <div className={`mb-6 sm:mb-8 p-3 sm:p-4 rounded-xl ${
            themeMode === 'dark' ? 'bg-[var(--div)]' : 'bg-gray-50'
          } border ${
            themeMode === 'dark' ? 'border-[var(--border)]' : 'border-gray-200'
          }`}>
            <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${
                  themeMode === 'dark' ? 'text-[var(--text)]' : 'text-gray-800'
                }`}>
                  {currentCart.items.length}
                </span>
                <span
                  className={`${
                    themeMode === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Products
                </span>
              </div>

              <div className="w-px h-4 bg-gray-400/30"></div>

              <div className="flex items-center gap-2">
                <span className={`font-semibold ${
                  themeMode === 'dark' ? 'text-[var(--text)]' : 'text-gray-800'
                }`}>
                  {totalItemsCount}
                </span>
                <span
                  className={`${
                    themeMode === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Items
                </span>
              </div>

              <div className="w-px h-4 bg-gray-400/30"></div>

              <div className="flex items-center gap-2">
                <span className={`font-semibold ${
                  themeMode === 'dark' ? 'text-[var(--text)]' : 'text-gray-800'
                }`}>
                  {Object.keys(groupedItems).length}
                </span>
                <span
                  className={`${
                    themeMode === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Vendors
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {Object.keys(groupedItems).length === 0 ? (
          <div className={`text-center py-12 sm:py-20 rounded-2xl sm:rounded-3xl ${
            themeMode === 'dark' ? 'bg-[var(--div)]' : 'bg-white'
          } shadow-2xl border-2 ${
            themeMode === 'dark' ? 'border-[var(--border)]' : 'border-gray-200'
          }`}>
            <div className="max-w-md mx-auto px-4">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 ${
                themeMode === 'dark' ? 'bg-[var(--button)]/10' : 'bg-[var(--button)]/5'
              } rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6`}>
                <svg className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 ${
                  themeMode === 'dark' ? 'text-[var(--button)]' : 'text-[var(--button)]'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 ${
                themeMode === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Your Cart is Empty
              </h3>
              <p className={`text-base sm:text-lg mb-6 sm:mb-8 ${
                themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Start adding products to your cart to see them here
              </p>
              <button
                onClick={handleAddProduct}
                className="bg-[var(--button)] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:bg-[#015c40] transition-all duration-300 inline-flex items-center gap-2 sm:gap-3 font-semibold hover:scale-105 hover:shadow-2xl text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Browse Products
              </button>
            </div>
          </div>
        ) : (
          /* Enhanced Cart Content */
          <div className="space-y-4 sm:space-y-6">
            {/* Vendors Sections */}
            {Object.entries(groupedItems).map(([vendor, vendorData]) => {
              const isCouponApplied = appliedCoupons[vendorData.vendor_id];
              const isApplying = applyingCoupon === vendorData.vendor_id;
              
              return (
                <div
                  key={vendor}
                  className={`rounded-2xl p-6 shadow-lg border-2 transition-all duration-300 ${
                    themeMode === "dark"
                      ? "bg-gradient-to-br from-[var(--div)] to-[var(--mid-dark)] border-[var(--border)] hover:border-[var(--button)]/50"
                      : "bg-[var(--textbox)] border-gray-200 hover:border-[var(--button)]/30 hover:shadow-xl"
                  }`}
                >
                  {/* Vendor Header */}
                  <div className="flex items-center gap-4 mb-6 pb-4 border-b border-[var(--border)]">
                    <div
                      className={`p-3 rounded-xl ${
                        themeMode === "dark"
                          ? "bg-[var(--button)]/10 text-[var(--text)]"
                          : "bg-[var(--button)]/5 text-[var(--button)]"
                      }`}
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2
                        className={`text-xl font-bold ${
                          themeMode === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {vendor}
                      </h2>

                      {/* Applied Coupon Display */}
                      {isCouponApplied && (
                        <div className="mt-2 mb-3">
                          <div className="flex items-center justify-between bg-green-500/10 px-3 py-2 rounded-xl text-sm border border-green-500/20">
                            <div className="flex items-center gap-2">
                              <svg
                                className="w-4 h-4 text-green-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span className="font-semibold text-green-600 dark:text-green-400">
                                Coupon applied: {isCouponApplied.code} (${isCouponApplied.discount.toFixed(2)} off)
                              </span>
                            </div>
                            <button
                              onClick={() => handleRemoveCoupon(vendorData.vendor_id)}
                              className="text-red-500 hover:text-red-700 text-sm font-semibold transition-colors duration-200"
                              disabled={isApplying}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Available Coupons */}
                      {!isCouponApplied && vendorData.items[0]?.coupons?.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {vendorData.items[0].coupons.map((coupon, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-[var(--button)]/10 px-3 py-2 rounded-xl text-sm"
                            >
                              <div className="flex items-center gap-2">
                                <svg
                                  className="w-4 h-4 text-[var(--button)]"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 14l2-2 4 4m0 0l4-4m-4 4V3"
                                  />
                                </svg>
                                <span className="font-semibold text-[var(--text)]">
                                  Coupon available:
                                  <span className={`${themeMode === "dark" ? "text-white" : "text-[var(--button)]"}`}>
                                    {coupon.code} ({coupon.discount_value}%)
                                  </span>
                                </span>
                              </div>
                              <button
                                onClick={() =>
                                  handleApplyCoupon(
                                    coupon.code,
                                    vendorData.vendor_id
                                  )
                                }
                                disabled={isApplying || isCouponApplied}
                                className={`px-4 py-2 rounded-lg transition-all duration-300 text-xs font-semibold ${
                                  isApplying || isCouponApplied
                                    ? "bg-gray-400 cursor-not-allowed text-gray-200"
                                    : "bg-[var(--button)] text-white hover:bg-[#015c40]"
                                }`}
                              >
                                {isApplying ? "Applying..." : "Apply"}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <p
                        className={`text-sm ${
                          themeMode === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {vendorData.items.length} product
                        {vendorData.items.length !== 1 ? "s" : ""} •{" "}
                        {vendorData.items.reduce(
                          (sum, item) => sum + (item.quantity || 0),
                          0
                        )}{" "}
                        items
                      </p>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-3 sm:space-y-4 text-[var(--text)]">
                    {vendorData.items.map((item) => (
                      <CartItem key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Enhanced Checkout Section */}
            <div
              className={`rounded-2xl p-6 shadow-2xl border-2 sticky bottom-6 ${
                themeMode === "dark"
                  ? "bg-gradient-to-br from-[var(--div)] to-[var(--mid-dark)] border-[var(--border)]"
                  : "bg-[var(--textbox)] border-gray-200"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                {/* Total Price */}
                <div className="text-center lg:text-left">
                  {/* المجموع قبل الخصم */}
                  <p
                    className={`text-lg font-semibold line-through ${
                      totalDiscount > 0
                        ? themeMode === "dark"
                          ? "text-gray-500"
                          : "text-gray-400"
                        : "hidden"
                    }`}
                  >
                    ${total.toFixed(2)}
                  </p>

                  {/* الخصم */}
                  {totalDiscount > 0 && (
                    <p
                      className={`text-green-600 font-medium ${
                        themeMode === "dark"
                          ? "text-green-400"
                          : "text-green-600"
                      }`}
                    >
                      -${totalDiscount.toFixed(2)} discount applied
                    </p>
                  )}

                  {/* المجموع بعد الخصم */}
                  <p
                    className={`text-3xl font-bold ${
                      themeMode === "dark"
                        ? "text-[var(--text)]"
                        : "text-[var(--button)]"
                    }`}
                  >
                    ${discountedTotal.toFixed(2)}
                  </p>

                  <p
                    className={`text-sm ${
                      themeMode === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Total for {totalItemsCount} item
                    {totalItemsCount !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-end">
                  <button
                    onClick={handleAddProduct}
                    className={`px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-xl border-2 transition-all duration-300 font-semibold text-sm sm:text-base ${
                      themeMode === 'dark' 
                        ? 'border-[var(--border)] text-[var(--text)] hover:bg-[var(--hover)] hover:border-[var(--button)]' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-[var(--button)]'
                    } hover:scale-105 flex items-center gap-2 sm:gap-3 justify-center`}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add More Items
                  </button>

                  <button
                    onClick={handleCheckout}
                    className="bg-[var(--button)] text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-xl hover:bg-[#015c40] transition-all duration-300 font-semibold flex items-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base justify-center"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="h-6"></div>
    </div>
  );
};

export default CartDetailPage;