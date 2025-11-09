import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrders,
  reorderOrder,
  setCurrentPage,
  setPaymentFilter,
} from "../ordersSlice";
import { useNavigate } from "react-router-dom";

const OrdersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    list: items = [],
    loading,
    error,
    currentPage,
    itemsPerPage,
    paymentFilter,
  } = useSelector((state) => state.orders);

  const themeMode = useSelector((state) => state.customerTheme.mode);
  const [searchTx, setSearchTx] = useState("");
  const [productImages, setProductImages] = useState({});
  const [imagesLoading, setImagesLoading] = useState(false);

  // ----------------------------------------------
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [decisionError, setDecisionError] = useState("");

  // نفس أسلوبك: هيدر التوكن محلي
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // نداء PATCH لاتخاذ القرار
  const submitCustomerDecision = async (orderId, action) => {
    setDecisionError("");
    setDecisionLoading(true);
    try {
      const res = await fetch(
        `http://localhost:3000/api/customers/orders/${orderId}/decision`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({ action }), // "cancel_order" | "proceed_without_rejected"
        }
      );

      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.success === false) {
        throw new Error(json?.message || "Failed to submit decision");
      }

      // رجّع الأوردارات محدّثة
      dispatch(fetchOrders());
    } catch (err) {
      setDecisionError(err.message || "Server error");
    } finally {
      setDecisionLoading(false);
    }
  };
  // ------------------------------------------------------------

  const fetchProductImages = async (productIds) => {
    setImagesLoading(true);
    try {
      const imagesMap = {};

      const imagePromises = productIds.map(async (productId) => {
        try {
          const response = await fetch(
            `http://localhost:3000/api/products/${productId}`
          );
          if (response.ok) {
            const productData = await response.json();
            const firstImage = productData.images?.[0] || null;
            return { productId, image: firstImage };
          } else {
            return { productId, image: null };
          }
        } catch {
          return { productId, image: null };
        }
      });

      const results = await Promise.all(imagePromises);
      results.forEach(({ productId, image }) => {
        imagesMap[productId] = image;
      });

      return imagesMap;
    } catch {
      return {};
    } finally {
      setImagesLoading(false);
    }
  };

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  useEffect(() => {
    if (items.length > 0) {
      const loadProductImages = async () => {
        const allProductIds = items
          .flatMap((order) =>
            (order.items || []).map((item) => item.product_id)
          )
          .filter((id) => id != null);

        const uniqueProductIds = [...new Set(allProductIds)];
        if (uniqueProductIds.length > 0) {
          const images = await fetchProductImages(uniqueProductIds);
          setProductImages(images);
        }
      };

      loadProductImages();
    }
  }, [items]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] py-16">
        <div className="text-center animate-fade-in">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[var(--button)] mx-auto mb-4"></div>
          <p className="text-[var(--text)] text-lg">Loading your orders...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] py-16">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 bg-[var(--error)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-[var(--error)] text-3xl">!</span>
          </div>
          <h3 className="text-xl font-bold text-[var(--error)] mb-2">
            Failed to Load Orders
          </h3>
          <p className="text-[var(--text)] mb-6 max-w-md mx-auto">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[var(--button)] hover:bg-[#015c40] text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  const filteredItems = (items || []).filter((order) => {
    const payments = order.payments || [];

    if (paymentFilter !== "all") {
      let isMatch = false;
      if (payments.length > 0) {
        isMatch = payments.some(
          (p) => p.status?.toLowerCase() === paymentFilter.toLowerCase()
        );
      } else {
        isMatch =
          order.payment_status?.toLowerCase() === paymentFilter.toLowerCase();
      }
      if (!isMatch) return false;
    }

    if (searchTx) {
      const matchTx = payments.some((p) =>
        p.transaction_id?.toLowerCase().includes(searchTx.toLowerCase())
      );
      if (!matchTx) return false;
    }

    return true;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    dispatch(setCurrentPage(pageNumber));
  };

  const handleFilterClick = (filter) => {
    dispatch(setPaymentFilter(filter));
    dispatch(setCurrentPage(1));
  };

  // إصلاح الـ reorder
  const handleReorder = async (orderId) => {
    try {
      const action = await dispatch(reorderOrder(orderId)).unwrap();
      navigate(`/customer/order-details/${action.id}`, {
        state: { reorder: true },
      });
    } catch (err) {
      alert("Failed to reorder: " + err.message);
    }
  };

  // إصلاح النقر على المنتج
  const handleProductClick = (productId) => {
    navigate(`/customer/product/${productId}`);
  };

  return (
    <div
      className={`min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-300`}
    >
      {/* Header Section - Full Width Gradient */}
      <div
        className="w-full text-left pt-4"
        style={{
          color: themeMode === "dark" ? "var(--text)" : "var(--text)",
          background:
            themeMode === "dark"
              ? `linear-gradient(to bottom, 
                rgba(0, 0, 0, 0.21) 0%, 
                var(--bg) 100%)`
              : `linear-gradient(to bottom, 
                rgba(113, 117, 116, 0.12) 0%, 
                var(--bg) 100%)`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-3 pt-8">Your Orders</h1>
          <p className="text-[var(--light-gray)] max-w-2xl">
            Track, manage, and reorder your purchases with ease
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div
          className={`mb-12 p-6 rounded-2xl border-2 ${
            themeMode === "dark"
              ? "bg-gradient-to-br from-[var(--div)] to-[var(--mid-dark)] border-[var(--border)]"
              : "bg-gradient-to-br from-white to-[var(--textbox)] border-gray-200"
          } shadow-xl transition-all duration-300 hover:shadow-2xl animate-fade-in-up`}
        >
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* Search Input */}
            <div className="flex-1 w-full">
              <div className="relative">
                <svg
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--light-gray)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search by Transaction ID..."
                  value={searchTx}
                  onChange={(e) => setSearchTx(e.target.value)}
                  className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    themeMode === "dark"
                      ? "bg-[var(--bg)] border-[var(--border)] text-[var(--text)] focus:border-[var(--button)] focus:ring-[var(--button)]/20 placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-800 focus:border-[var(--button)] focus:ring-[var(--button)]/20 placeholder-gray-500"
                  }`}
                />
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-3">
              {["all", "paid", "pending"].map((filter) => (
                <button
                  key={filter}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                    paymentFilter === filter
                      ? "bg-[var(--button)] text-white shadow-lg"
                      : `${
                          themeMode === "dark"
                            ? "bg-[var(--bg)] text-[var(--text)] hover:bg-[var(--hover)]"
                            : "bg-white text-gray-700 hover:bg-gray-100"
                        } border-2 border-[var(--border)] hover:border-[var(--button)]`
                  }`}
                  onClick={() => handleFilterClick(filter)}
                >
                  {filter === "all"
                    ? "All Orders"
                    : filter === "paid"
                    ? "Paid"
                    : "Pending"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredItems.length === 0 ? (
          <div
            className={`text-center py-20 rounded-2xl border-2 ${
              themeMode === "dark"
                ? "bg-gradient-to-br from-[var(--div)] to-[var(--mid-dark)] border-[var(--border)]"
                : "bg-gradient-to-br from-white to-[var(--textbox)] border-gray-200"
            } shadow-xl animate-fade-in mb-16`}
          >
            <div className="w-24 h-24 bg-[var(--button)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📦</span>
            </div>
            <h3
              className={`text-2xl font-bold mb-3 ${
                themeMode === "dark" ? "text-[var(--textbox)]" : "text-gray-800"
              }`}
            >
              No orders found
            </h3>
            <p
              className={`text-lg mb-8 max-w-md mx-auto ${
                themeMode === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {searchTx || paymentFilter !== "all"
                ? "Try adjusting your search criteria or filters"
                : "Start shopping to see your orders here"}
            </p>
            <button
              onClick={() => navigate("/customer/product")}
              className="bg-[var(--button)] hover:bg-[#015c40] text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in-up">
            {currentOrders.map((order, index) => {
              const shippingAddress = order.shipping_address
                ? JSON.parse(order.shipping_address)
                : null;

              // ✅ يظهر بلوك القرار فقط لو الأوردر بإنتظار قرار الزبون + فيه آيتم مرفوض
              const hasRejected =
                Array.isArray(order.items) &&
                order.items.some(
                  (it) => (it.vendor_status || "").toLowerCase() === "rejected"
                );
              const showDecisionPanel =
                order.status === "awaiting_customer_decision" && hasRejected;

              return (
                <div
                  key={order.id}
                  className={`border-2 border-[var(--border)] rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:border-[var(--button)]/50 ${
                    themeMode === "dark"
                      ? "bg-gradient-to-br from-[var(--div)] to-[var(--mid-dark)]"
                      : "bg-gradient-to-br from-white to-[var(--textbox)]"
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Order Header */}
                  <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 mb-8 items-center">
                    {/* Order ID */}
                    <div className="text-center">
                      <div className="text-xs font-semibold uppercase tracking-wider text-[var(--light-gray)] mb-2">
                        Order ID
                      </div>
                      <div className="text-lg font-bold bg-gradient-to-r from-[var(--text)] to-[var(--button)] bg-clip-text text-transparent">
                        #{order.id}
                      </div>
                    </div>

                    {/* Order Date */}
                    <div className="text-center">
                      <div className="text-xs font-semibold uppercase tracking-wider text-[var(--light-gray)] mb-2">
                        Order Date
                      </div>
                      <div className="text-[var(--text)] font-semibold">
                        {new Date(order.created_at).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "short", day: "numeric" }
                        )}
                      </div>
                    </div>

                    {/* Total Amount */}
                    <div className="text-center">
                      <div className="text-xs font-semibold uppercase tracking-wider text-[var(--light-gray)] mb-2">
                        Total Amount
                      </div>
                      <div className="text-xl font-bold text-[var(--button)]">
                        $
                        {parseFloat(
                          order.total_with_shipping || order.total_amount
                        ).toFixed(2)}
                      </div>
                    </div>

                    {/* Ship To */}
                    <div className="text-center">
                      <div className="text-xs font-semibold uppercase tracking-wider text-[var(--light-gray)] mb-2">
                        Ship To
                      </div>
                      <div className="text-[var(--text)] font-semibold">
                        {shippingAddress ? `${shippingAddress.city}` : "N/A"}
                      </div>
                    </div>

                    {/* Order Status */}
                    <div className="text-center">
                      <div className="text-xs font-semibold uppercase tracking-wider text-[var(--light-gray)] mb-2">
                        Order Status
                      </div>
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                          order.status === "completed"
                            ? "bg-green-500/20 text-green-600 border border-green-500/30"
                            : order.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-600 border border-yellow-500/30"
                            : order.status === "awaiting_customer_decision"
                            ? "bg-orange-500/20 text-orange-600 border border-orange-500/30"
                            : "bg-blue-500/20 text-blue-600 border border-blue-500/30"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    {/* Payment Status */}
                    <div className="text-center">
                      <div className="text-xs font-semibold uppercase tracking-wider text-[var(--light-gray)] mb-2">
                        Payment
                      </div>
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                          order.payment_status === "paid"
                            ? "bg-green-500/20 text-green-600 border border-green-500/30"
                            : "bg-red-500/20 text-red-500 border border-red-500/30"
                        }`}
                      >
                        {order.payment_status}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="text-center">
                      <div className="text-xs font-semibold uppercase tracking-wider text-[var(--light-gray)] mb-3">
                        Actions
                      </div>
                      <div className="flex flex-col sm:flex-row justify-center gap-2 min-w-[120px]">
                        <button
                          className="bg-[var(--button)] hover:bg-[#015c40] text-white font-semibold px-3 py-2 rounded-lg text-xs transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-1 justify-center w-full sm:w-auto"
                          onClick={() =>
                            navigate(`/customer/track-order/${order.id}`)
                          }
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            />
                          </svg>
                          Track
                        </button>
                        <button
                          className={`font-semibold px-3 py-2 rounded-lg text-xs transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-1 justify-center w-full sm:w-auto ${
                            themeMode === "dark"
                              ? "bg-[var(--textbox)] text-[var(--button)] hover:bg-[var(--button)] hover:text-white"
                              : "bg-white text-[var(--button)] border border-[var(--button)] hover:bg-[var(--button)] hover:text-white"
                          }`}
                          onClick={() => handleReorder(order.id)}
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                          Reorder
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 💡 Customer Decision Panel (يظهر فقط إذا فيه مرفوض) */}
                  {showDecisionPanel && (
                    <div
                      className="mb-6 p-4 rounded-2xl border-2"
                      style={{
                        borderColor: "rgba(234,179,8,0.4)", // أصفر هادئ
                        background:
                          themeMode === "dark"
                            ? "linear-gradient(180deg, rgba(161,98,7,0.10), transparent)"
                            : "linear-gradient(180deg, rgba(253,230,138,0.25), white)",
                      }}
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                          <div
                            className="font-bold mb-1"
                            style={{
                              color:
                                themeMode === "dark"
                                  ? "var(--textbox)"
                                  : "#854d0e",
                            }}
                          >
                            Some items were rejected by vendors
                          </div>
                          <div
                            className="text-sm"
                            style={{
                              color:
                                themeMode === "dark"
                                  ? "var(--text)"
                                  : "#7c6f57",
                            }}
                          >
                            You can cancel the entire order, or proceed without
                            the rejected items.
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            disabled={decisionLoading}
                            onClick={async () => {
                              const ok = window.confirm(
                                "Are you sure you want to cancel the entire order?"
                              );
                              if (!ok) return;
                              await submitCustomerDecision(
                                order.id,
                                "cancel_order"
                              );
                            }}
                            className="px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200"
                            style={{
                              borderColor: "rgba(239,68,68,0.35)",
                              color: "#b91c1c",
                              backgroundColor: "rgba(239,68,68,0.08)",
                              opacity: decisionLoading ? 0.7 : 1,
                            }}
                          >
                            Cancel Order
                          </button>

                          <button
                            disabled={decisionLoading}
                            onClick={async () => {
                              const ok = window.confirm(
                                "Proceed without rejected items?"
                              );
                              if (!ok) return;
                              await submitCustomerDecision(
                                order.id,
                                "proceed_without_rejected"
                              );
                            }}
                            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                            style={{
                              backgroundColor: "var(--button)",
                              color: "white",
                              opacity: decisionLoading ? 0.7 : 1,
                            }}
                          >
                            Proceed Without Rejected
                          </button>
                        </div>
                      </div>

                      {/* خطأ السيرفر إن وجد */}
                      {decisionError && (
                        <div
                          className="mt-3 text-xs px-3 py-2 rounded-lg"
                          style={{
                            border: "1px solid rgba(239,68,68,0.35)",
                            backgroundColor: "rgba(239,68,68,0.06)",
                            color: "#b91c1c",
                          }}
                        >
                          {decisionError}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Order Items with Images */}
                  <div className="border-t border-[var(--border)] pt-6">
                    <h3
                      className={`font-bold text-lg mb-4 flex items-center gap-2 ${
                        themeMode === "dark"
                          ? "text-[var(--textbox)]"
                          : "text-gray-800"
                      }`}
                    >
                      <svg
                        className="w-5 h-5 text-[var(--button)]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                      Order Items
                      {imagesLoading && (
                        <span className="text-sm text-[var(--light-gray)] ml-2">
                          (Loading images...)
                        </span>
                      )}
                    </h3>

                    <div className="space-y-4">
                      {order.items.map((item) => {
                        const imageUrl = productImages[item.product_id];

                        // شارة الحالة (بدون تغيير على الألوان العامة)
                        const status = (item.vendor_status || "").toLowerCase(); // pending | accepted | rejected
                        const statusLabel =
                          status === "accepted"
                            ? "Accepted"
                            : status === "rejected"
                            ? "Rejected"
                            : "Pending";

                        const statusClass =
                          status === "accepted"
                            ? "bg-green-500/15 text-green-600 border border-green-500/25"
                            : status === "rejected"
                            ? "bg-red-500/15 text-red-600 border border-red-500/25"
                            : "bg-yellow-500/15 text-yellow-600 border border-yellow-500/25";

                        return (
                          <div
                            key={item.product_id}
                            className="relative flex items-center gap-4 p-4 rounded-xl border border-[var(--border)] hover:border-[var(--button)]/50 transition-all duration-200 cursor-pointer"
                            onClick={() => handleProductClick(item.product_id)}
                          >
                            {/* شارة الحالة أعلى يمين الكارد */}
                            <span
                              className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-semibold ${statusClass}`}
                            >
                              {statusLabel}
                            </span>

                            {/* صورة المنتج */}
                            <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 border-[var(--border)]">
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                              ) : null}
                              <div
                                className={`w-full h-full flex items-center justify-center rounded-xl ${
                                  imageUrl ? "hidden" : "flex"
                                } ${
                                  themeMode === "dark"
                                    ? "bg-[var(--div)]"
                                    : "bg-gray-100"
                                }`}
                              >
                                {imagesLoading ? (
                                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--button)]"></div>
                                ) : (
                                  <span className="text-[var(--light-gray)] text-xs">
                                    No Image
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* تفاصيل المنتج */}
                            <div className="flex-1 flex justify-between items-center">
                              <div>
                                <span
                                  className={`font-bold text-lg block mb-1 ${
                                    themeMode === "dark"
                                      ? "text-[var(--text)]"
                                      : "text-gray-800"
                                  }`}
                                >
                                  {item.name}
                                </span>

                                {/* سطر الكمية والسعر (يبقى كما هو) */}
                                <span
                                  className={`text-sm ${
                                    themeMode === "dark"
                                      ? "text-gray-400"
                                      : "text-gray-500"
                                  }`}
                                >
                                  Quantity: {item.quantity} × $
                                  {parseFloat(item.price).toFixed(2)}
                                </span>

                                {/* سبب الرفض إن وُجد */}
                                {status === "rejected" && (
                                  <div className="mt-1 text-xs flex items-center gap-1 text-red-600">
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    <span>
                                      Reason:{" "}
                                      {item.rejection_reason &&
                                      item.rejection_reason.trim()
                                        ? item.rejection_reason
                                        : "No reason provided"}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <span
                                className={`font-bold text-lg ${
                                  themeMode === "dark"
                                    ? "text-[var(--textbox)]"
                                    : "text-gray-700"
                                }`}
                              >
                                $
                                {(
                                  parseFloat(item.price) * item.quantity
                                ).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Payment Details */}
                  {order.payments && order.payments.length > 0 && (
                    <div className="border-t border-[var(--border)] pt-6 mt-6">
                      <h3
                        className={`font-bold text-lg mb-4 flex items-center gap-2 ${
                          themeMode === "dark"
                            ? "text-[var(--textbox)]"
                            : "text-gray-800"
                        }`}
                      >
                        <svg
                          className="w-5 h-5 text-[var(--button)]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                          />
                        </svg>
                        Payment Details
                      </h3>
                      {order.payments.map((payment) => (
                        <div
                          key={payment.id}
                          className={`p-4 rounded-xl border border-[var(--border)] ${
                            themeMode === "dark"
                              ? "bg-[var(--bg)]"
                              : "bg-gray-50"
                          }`}
                        >
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <span
                              className={`font-semibold ${
                                themeMode === "dark"
                                  ? "text-[var(--textbox)]"
                                  : "text-gray-700"
                              }`}
                            >
                              💳 {payment.payment_method}
                            </span>
                            <span className="text-[var(--button)] font-bold">
                              ${parseFloat(payment.amount).toFixed(2)}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-bold ${
                                payment.status === "completed"
                                  ? "bg-green-500/20 text-green-600"
                                  : "bg-yellow-500/20 text-yellow-600"
                              }`}
                            >
                              {payment.status}
                            </span>
                            {payment.card_last4 && (
                              <span className="text-[var(--light-gray)]">
                                Card: ****{payment.card_last4}
                              </span>
                            )}
                            {payment.transaction_id && (
                              <span className="text-[var(--light-gray)] font-mono">
                                TX: {payment.transaction_id}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Pagination and Continue Shopping */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mt-16 pt-8 border-t border-[var(--border)]">
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex-1 flex justify-center lg:justify-start">
                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                            currentPage === page
                              ? "bg-[var(--button)] text-white shadow-lg"
                              : `${
                                  themeMode === "dark"
                                    ? "bg-[var(--bg)] text-[var(--text)] hover:bg-[var(--hover)]"
                                    : "bg-white text-gray-700 hover:bg-gray-100"
                                } border-2 border-[var(--border)] hover:border-[var(--button)]`
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Continue Shopping Button */}
              <div className="flex justify-center lg:justify-end">
                <button
                  onClick={() => navigate("/customer/products")}
                  className="bg-[var(--button)] hover:bg-[#015c40] text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center gap-3"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
