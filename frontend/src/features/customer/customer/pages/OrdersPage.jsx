import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrders,
  reorderOrder,
  setCurrentPage,
  setPaymentFilter,
} from "../ordersSlice";
import { useNavigate } from "react-router-dom";
import { Package, Search, Filter, ShoppingBag, Clock, MapPin, CreditCard, Truck, RotateCcw, Eye, ChevronLeft, ChevronRight, Sparkles, Zap } from "lucide-react";

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


  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    type: "info", // 'cancel' أو 'proceed'
    onConfirm: null,
  });

  const openModal = (title, message, type, onConfirm) => {
  setModalConfig({
    title,
    message,
    type,
    onConfirm,
  });
  setModalOpen(true);
};

  // ----------------------------------------------


  // نفس أسلوبك: هيدر التوكن محلي
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

    const [decisionLoading, setDecisionLoading] = useState(false);
    const [decisionError, setDecisionError] = useState("");
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
          const response = await fetch(`http://localhost:3000/api/products/${productId}`);
          
          if (response.ok) {
            const productData = await response.json();
            const firstImage = productData.images?.[0] || null;
            return {
              productId,
              image: firstImage
            };
          } else {
            return { productId, image: null };
          }
        } catch (error) {
          console.error(`Error fetching product ${productId}:`, error);
          return { productId, image: null };
        }
      });

      const results = await Promise.all(imagePromises);
      
      results.forEach(({ productId, image }) => {
        imagesMap[productId] = image;
      });
      
      return imagesMap;
    } catch (error) {
      console.error('Error fetching product images:', error);
      return {};
    } finally {
      setImagesLoading(false);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/customer/product/${productId}`);
  };

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  useEffect(() => {
    if (items.length > 0) {
      const loadProductImages = async () => {
        const allProductIds = items.flatMap(order => 
          (order.items || []).map(item => item.product_id)
        ).filter(id => id != null); 
        
        const uniqueProductIds = [...new Set(allProductIds)];
        
        if (uniqueProductIds.length > 0) {
          const images = await fetchProductImages(uniqueProductIds);
          setProductImages(images);
        }
      };

      loadProductImages();
    }
  }, [items]);

  // Loading State - Same as profile page
  if (loading) {
  return (
    <div className={`min-h-screen ${themeMode === 'dark' ? 'bg-[var(--bg)]' : 'bg-white'} relative overflow-hidden`}>
      {/* Animated Background - شادو أخف */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--button)]/2 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-[var(--primary)]/2 rounded-full blur-xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
      </div>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="relative">
            {/* اللودينغ - شادو أخف */}
            <div className="w-16 h-16 bg-gradient-to-r from-[var(--button)] to-[var(--primary)] rounded-xl flex items-center justify-center mx-auto mb-4 animate-spin">
              {/* أيقونة النجوم (Sparkles) */}
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            {/* تأثير ping - أخف */}
            <div className="absolute inset-0 w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[var(--button)] to-[var(--primary)] rounded-xl blur-sm opacity-15 animate-ping"></div>
          </div>
          <p className="text-[var(--text)] text-lg font-medium">
            Loading Your Orders...
          </p>
        </div>
      </div>
    </div>
  );

  }

  // Error State - Same as profile page
  if (error) {
    return (
      <div className={`min-h-screen ${themeMode === 'dark' ? 'bg-[var(--bg)]' : 'bg-white'} flex items-center justify-center relative overflow-hidden`}>
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-[var(--error)]/5 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/3 right-1/3 w-56 h-56 bg-[var(--button)]/5 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1.5s'}}></div>
        </div>

        <div className="text-center max-w-md relative z-10">
          <div className="w-28 h-28 bg-[var(--error)]/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform hover:scale-110 transition-all duration-300">
            <Zap className="w-14 h-14 text-[var(--error)]" />
          </div>
          <h3 className="text-3xl font-black mb-4 bg-gradient-to-r from-[var(--error)] to-red-600 bg-clip-text text-transparent">
            Oops! Error Loading
          </h3>
          <p className="text-[var(--text)]/80 text-lg mb-8 leading-relaxed">{error}</p>
          <button 
            onClick={() => dispatch(fetchOrders())}
            className="relative bg-gradient-to-r from-[var(--button)] to-[var(--primary)] text-white px-8 py-4 rounded-2xl hover:shadow-2xl transition-all duration-300 font-bold shadow-lg transform hover:scale-105 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <span className="relative z-10 flex items-center gap-3">
              <Sparkles size={20} />
              Try Again
            </span>
          </button>
        </div>
      </div>
    );
  }

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

  // Pagination Logic - Show only 5 pages max
  const getVisiblePages = () => {
    const visiblePages = 5;
    const half = Math.floor(visiblePages / 2);
    
    let start = Math.max(currentPage - half, 1);
    let end = Math.min(start + visiblePages - 1, totalPages);
    
    if (end - start + 1 < visiblePages) {
      start = Math.max(end - visiblePages + 1, 1);
    }
    
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={`min-h-screen ${themeMode === "dark" ? "bg-[var(--bg)]" : "bg-gray-50"} transition-colors duration-300`}>
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--button)]/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[var(--primary)]/5 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6 lg:py-8">
        {/* Header Section */}
        <div className="relative overflow-hidden mb-6 lg:mb-8">
          <div className="pt-6 lg:pt-8 pb-4 relative">
            {/* Animated Floating Circles */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-10 left-10 w-6 h-6 bg-[var(--button)]/20 rounded-full animate-float"></div>
              <div className="absolute top-20 right-20 w-4 h-4 bg-[var(--primary)]/20 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
              <div className="absolute bottom-20 left-20 w-5 h-5 bg-[var(--success)]/20 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
              <div className="absolute bottom-10 right-10 w-3 h-3 bg-[var(--warning)]/20 rounded-full animate-float" style={{animationDelay: '1.5s'}}></div>
            </div>

            <div className="text-center relative z-10">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 tracking-tight bg-gradient-to-r from-[var(--text)] via-[var(--button)] to-[var(--primary)] bg-clip-text text-transparent animate-gradient-x-slow">
                Your Orders
              </h3>
              <p className={`text-sm sm:text-base lg:text-lg font-medium mb-4 lg:mb-6 leading-relaxed max-w-3xl mx-auto px-4 ${
                themeMode === 'dark' ? 'text-[var(--light-gray)]' : 'text-gray-600'
              }`}>
                Track, manage, and reorder your purchases with ease
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className={`rounded-2xl lg:rounded-3xl p-4 sm:p-5 lg:p-6 mb-6 ${
          themeMode === "dark" 
            ? "bg-gradient-to-br from-[var(--div)] to-[var(--mid-dark)] border-[var(--border)]" 
            : "bg-gradient-to-br from-white to-gray-50 border-gray-200"
        } shadow-xl lg:shadow-2xl border relative overflow-hidden`}>
          
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 items-stretch lg:items-center">
            {/* Search Input */}
            <div className="flex-1 relative">
              <div className="relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--light-gray)]" />
                <input
                  type="text"
                  placeholder="Search by Transaction ID..."
                  value={searchTx}
                  onChange={(e) => setSearchTx(e.target.value)}
                  className={`w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 rounded-xl lg:rounded-2xl border-2 focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
                    themeMode === "dark"
                      ? "bg-[var(--bg)] border-[var(--border)] text-[var(--text)] focus:border-[var(--button)] focus:ring-[var(--button)]/20 placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-800 focus:border-[var(--button)] focus:ring-[var(--button)]/20 placeholder-gray-500"
                  }`}
                />
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {["all", "paid", "pending"].map((filter) => (
                <button
                  key={filter}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-1 ${
                    paymentFilter === filter
                      ? "bg-gradient-to-r from-[var(--button)] to-[var(--primary)] text-white shadow-lg"
                      : `${
                          themeMode === "dark" 
                            ? "bg-[var(--bg)] text-[var(--text)] hover:bg-[var(--hover)]" 
                            : "bg-white text-gray-700 hover:bg-gray-100"
                        } border-2 border-[var(--border)] hover:border-[var(--button)]`
                  }`}
                  onClick={() => handleFilterClick(filter)}
                >
                  <Filter size={12} />
                  {filter === "all" ? "All" : filter === "paid" ? "Paid" : "Pending"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Grid - Responsive */}
        {filteredItems.length === 0 ? (
          <div className={`rounded-2xl lg:rounded-3xl p-6 sm:p-8 ${
            themeMode === "dark" 
              ? "bg-gradient-to-br from-[var(--div)] to-[var(--mid-dark)] border-[var(--border)]" 
              : "bg-gradient-to-br from-white to-gray-50 border-gray-200"
          } shadow-xl lg:shadow-2xl border relative overflow-hidden text-center group`}>
            
            <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full ${
              themeMode === "dark" ? "bg-[var(--div)]" : "bg-white"
            } flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all duration-300 relative z-10`}>
              <Package className={themeMode === "dark" ? "text-gray-400" : "text-gray-500"} size={24} />
            </div>
            <h3 className={`text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 ${
              themeMode === "dark" ? "text-white" : "text-gray-900"
            } relative z-10`}>
              No Orders Found
            </h3>
            <p className={`text-sm sm:text-base ${
              themeMode === "dark" ? "text-gray-400" : "text-gray-600"
            } mb-4 sm:mb-6 relative z-10 max-w-md mx-auto`}>
              {searchTx || paymentFilter !== "all" 
                ? "Try adjusting your search criteria or filters" 
                : "Start shopping to see your orders here"
              }
            </p>
            <button
              onClick={() => navigate("/customer/products")}
              className="bg-gradient-to-r from-[var(--button)] to-[var(--primary)] text-white font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-2 mx-auto text-sm"
            >
              <ShoppingBag size={16} />
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 animate-fade-in-up">
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
                order.status === "needs_decision" && hasRejected;

              return (
                <div
                  key={order.id}
                  className={`border-2 border-[var(--border)] rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6 transition-all duration-300 hover:shadow-lg lg:hover:shadow-xl hover:border-[var(--button)]/50 ${
                    themeMode === "dark"
                      ? "bg-gradient-to-br from-[var(--div)] to-[var(--mid-dark)]"
                      : "bg-gradient-to-br from-white to-[var(--textbox)]"
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Order Header - 6 معلومات في 3 أسطر مع توسيط */}
                  <div className="mb-4 lg:mb-6">
                    {/* السطر الأول */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {/* Order ID */}
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="text-xs font-semibold uppercase tracking-wider text-[var(--light-gray)] mb-1">
                          Order ID
                        </div>
                        <div className="text-base font-bold bg-gradient-to-r from-[var(--text)] to-[var(--button)] bg-clip-text text-transparent">
                          #{order.id}
                        </div>
                      </div>

                      {/* Order Date */}
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="text-xs font-semibold uppercase tracking-wider text-[var(--light-gray)] mb-1">Date</div>
                        <div className="text-[var(--text)] font-semibold flex items-center justify-center gap-1 text-sm">
                          <Clock size={12} />
                          {new Date(order.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                    </div>

                    {/* السطر الثاني */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {/* Total Amount */}
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="text-xs font-semibold uppercase tracking-wider text-[var(--light-gray)] mb-1">Total</div>
                        <div className={`text-base font-bold ${themeMode === 'dark' ? 'text-[var(--text)]' : 'text-[var(--button)]'}`}>
                          ${parseFloat(order.total_with_shipping || order.total_amount).toFixed(2)}
                        </div>
                      </div>

                      {/* Order Status */}
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="text-xs font-semibold uppercase tracking-wider text-[var(--light-gray)] mb-1">Status</div>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide inline-flex items-center gap-1 ${
                          order.status === 'completed' 
                            ? 'bg-green-500/20 text-green-600 border border-green-500/30'
                            : order.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-600 border border-yellow-500/30'
                            : 'bg-blue-500/20 text-blue-600 border border-blue-500/30'
                        }`}>
                          <Truck size={10} />
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* السطر الثالث */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Ship To */}
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="text-xs font-semibold uppercase tracking-wider text-[var(--light-gray)] mb-1">Ship To</div>
                        <div className="text-[var(--text)] font-semibold text-sm flex items-center justify-center gap-1">
                          <MapPin size={12} className={themeMode === "dark" ? "text-[var(--text)]" : "text-[var(--button)]"} />
                          {shippingAddress ? 
                            `${shippingAddress.city}` 
                            : 'N/A'
                          }
                        </div>
                      </div>

                      {/* Payment Status */}
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="text-xs font-semibold uppercase tracking-wider text-[var(--light-gray)] mb-1">Payment</div>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide inline-flex items-center gap-1 ${
                          order.payment_status === 'paid' 
                            ? 'bg-green-500/20 text-green-600 border border-green-500/30'
                            : 'bg-red-500/20 text-red-500 border border-red-500/30'
                        }`}>
                          <CreditCard size={10} />
                          {order.payment_status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 💡 Customer Decision Panel (يظهر فقط إذا فيه مرفوض) */}
                  {showDecisionPanel && (
                    <div
                      className="mb-4 p-3 rounded-xl border-2"
                      style={{
                        borderColor: "rgba(234,179,8,0.4)",
                        background:
                          themeMode === "dark"
                            ? "linear-gradient(180deg, rgba(161,98,7,0.10), transparent)"
                            : "linear-gradient(180deg, rgba(253,230,138,0.25), white)",
                      }}
                    >
                      <div className="flex flex-col gap-2">
                        <div>
                          <div
                            className="font-bold text-sm mb-1"
                            style={{
                              color:
                                themeMode === "dark"
                                  ? "var(--textbox)"
                                  : "#854d0e",
                            }}
                          >
                            Some items were rejected
                          </div>
                          <div
                            className="text-xs"
                            style={{
                              color:
                                themeMode === "dark"
                                  ? "var(--text)"
                                  : "#7c6f57",
                            }}
                          >
                            Cancel order or proceed without rejected items.
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            disabled={decisionLoading}
                            onClick={async () => {
                              openModal(
                                "Cancel Order",
                                "Are you sure you want to cancel the entire order?",
                                "cancel",
                                async () => {
                                  await submitCustomerDecision(order.id, "cancel_order");
                                  setModalOpen(false);
                                }
                              );
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 flex-1"
                            style={{
                              borderColor: "rgba(239,68,68,0.35)",
                              color: "#b91c1c",
                              backgroundColor: "rgba(239,68,68,0.08)",
                              opacity: decisionLoading ? 0.7 : 1,
                            }}
                          >
                            Cancel
                          </button>

                          <button
                            disabled={decisionLoading}
                            onClick={async () => {
                              openModal(
                                "Proceed Without Rejected Items",
                                "Are you sure you want to proceed without the rejected items?",
                                "proceed",
                                async () => {
                                  await submitCustomerDecision(order.id, "proceed_without_rejected");
                                  setModalOpen(false);
                                }
                              );
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex-1"
                            style={{
                              backgroundColor: "var(--button)",
                              color: "white",
                              opacity: decisionLoading ? 0.7 : 1,
                            }}
                          >
                            Proceed
                          </button>
                        </div>
                      </div>

                      {/* خطأ السيرفر إن وجد */}
                      {decisionError && (
                        <div
                          className="mt-2 text-xs px-2 py-1 rounded"
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

                  {/* Order Items with Fixed Height and Scroll */}
                  <div className="border-t border-[var(--border)] pt-4">
                    <h3
                      className={`font-bold text-base mb-3 flex items-center gap-2 ${
                        themeMode === "dark"
                          ? "text-[var(--textbox)]"
                          : "text-gray-800"
                      }`}
                    >
                      <svg
                        className={`w-4 h-4 ${themeMode === 'dark' ? 'text-[var(--text)]' : 'text-[var(--button)]'}`}
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
                        <span className="text-xs text-[var(--light-gray)] ml-1">
                          (Loading...)
                        </span>
                      )}
                    </h3>

                    {/* Items Container with Fixed Height and Custom Scroll */}
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {order.items.map((item) => {
                        const imageUrl = productImages[item.product_id];

                        // شارة الحالة
                        const status = (item.vendor_status || "").toLowerCase();
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
                            className="relative flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] hover:border-[var(--button)]/50 transition-all duration-200 cursor-pointer"
                            onClick={() => handleProductClick(item.product_id)}
                          >
                            {/* شارة الحالة */}
                            <span
                              className={`absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-xs font-semibold ${statusClass}`}
                            >
                              {statusLabel}
                            </span>

                            {/* صورة المنتج */}
                            <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-[var(--border)]">
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
                                className={`w-full h-full flex items-center justify-center rounded-lg ${
                                  imageUrl ? "hidden" : "flex"
                                } ${
                                  themeMode === "dark"
                                    ? "bg-[var(--div)]"
                                    : "bg-gray-100"
                                }`}
                              >
                                {imagesLoading ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--button)]"></div>
                                ) : (
                                  <span className="text-[var(--light-gray)] text-xs">
                                    No Image
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* تفاصيل المنتج */}
                            <div className="flex-1 min-w-0">
                              <span
                                className={`font-semibold text-sm block mb-1 truncate ${
                                  themeMode === "dark"
                                    ? "text-[var(--text)]"
                                    : "text-gray-800"
                                }`}
                              >
                                {item.name}
                              </span>

                              <span
                                className={`text-xs ${
                                  themeMode === "dark"
                                    ? "text-gray-400"
                                    : "text-gray-500"
                                }`}
                              >
                                {item.quantity} × ${parseFloat(item.price).toFixed(2)}
                              </span>

                              {/* سبب الرفض إن وُجد */}
                              {status === "rejected" && (
                                <div className="mt-1 text-xs flex items-center gap-1 text-red-600">
                                  <span className="truncate">
                                    {item.rejection_reason && item.rejection_reason.trim()
                                      ? item.rejection_reason
                                      : "No reason provided"}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Buttons - نفس الحجم */}
                  <div className="flex gap-2 pt-4 border-t border-[var(--border)]/50 mt-4">
                    <button
                      className="bg-[var(--button)] hover:bg-[#015c40] text-white font-semibold px-3 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow flex items-center gap-1 justify-center text-sm flex-1"
                      onClick={() => navigate(`/customer/track-order/${order.id}`)}
                    >
                      <Eye size={14} />
                      Track Order
                    </button>
                    <button
                      className={`font-semibold px-3 py-2 rounded-lg text-xs transition-all duration-300 transform hover:scale-105 hover:shadow flex items-center gap-1 justify-center text-sm flex-1 ${
                        themeMode === 'dark'
                          ? "bg-[var(--textbox)] text-[var(--button)] hover:bg-[var(--button)] hover:text-white"
                          : "bg-white text-[var(--button)] border border-[var(--button)] hover:bg-[var(--button)] hover:text-white"
                      }`}
                      onClick={async () => {
                        try {
                          const action = await dispatch(
                            reorderOrder(order.id)
                          ).unwrap();
                          navigate(`/customer/order-details/${action.id}`, {
                            state: { reorder: true },
                          });
                        } catch (err) {
                          alert("Failed to reorder: " + err.message);
                        }
                      }}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Reorder
                    </button>
                  </div>

                  {/* Payment Details with Custom Scrollbar */}
                  {order.payments && order.payments.length > 0 && (
                    <div className="border-t border-[var(--border)] pt-4 mt-4">
                      <h3 className={`font-bold text-sm mb-3 flex items-center gap-1 ${
                        themeMode === 'dark' ? "text-[var(--textbox)]" : "text-gray-800"
                      }`}>
                        <CreditCard size={14} className="text-[var(--button)]" />
                        Payment Details
                      </h3>
                      <div 
                        className="space-y-2 max-h-24 overflow-y-auto pr-2 custom-scrollbar"
                      >
                        {order.payments.map((payment) => (
                          <div key={payment.id} className={`p-2 rounded-lg border border-[var(--border)] text-xs ${
                            themeMode === 'dark' ? "bg-[var(--bg)]" : "bg-gray-50"
                          }`}>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`font-semibold ${
                                themeMode === 'dark' ? "text-[var(--textbox)]" : "text-gray-700"
                              }`}>
                                {payment.payment_method}
                              </span>
                              <span className="text-[var(--button)] font-bold">
                                ${parseFloat(payment.amount).toFixed(2)}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                                payment.status === 'completed' 
                                  ? 'bg-green-500/20 text-green-600'
                                  : 'bg-yellow-500/20 text-yellow-600'
                              }`}>
                                {payment.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-6 lg:mt-8">
            {/* Previous Button*/}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 text-sm ${
                currentPage === 1
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:shadow'
              } ${
                themeMode === "dark" 
                  ? "bg-[var(--div)] text-[var(--text)] border border-[var(--border)]" 
                  : "bg-white text-gray-700 border border-gray-300"
              }`}
            >
              <ChevronLeft size={16} />
              Prev
            </button>

            {/* Page Numbers - Max 5 */}
            <div className="flex items-center space-x-1">
              {visiblePages.map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`min-w-[36px] h-9 rounded-lg font-bold text-xs transition-all duration-300 ${
                    currentPage === page
                      ? 'bg-gradient-to-r from-[var(--button)] to-[var(--primary)] text-white shadow-lg scale-105'
                      : `${themeMode === "dark" ? "text-white border border-[var(--border)] hover:bg-[var(--hover)]" : "text-gray-700 border border-gray-300 hover:bg-gray-50"} hover:border-[var(--button)] hover:scale-105`
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 text-sm ${
                currentPage === totalPages
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:shadow'
              } ${
                themeMode === "dark" 
                  ? "bg-[var(--div)] text-[var(--text)] border border-[var(--border)]" 
                  : "bg-white text-gray-700 border border-gray-300"
              }`}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        )}

      {/* Custom Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div 
            className={`relative max-w-sm w-full rounded-xl p-5 transform transition-all duration-300 animate-scale-in ${
              themeMode === "dark" 
                ? "bg-gradient-to-br from-[var(--div)] to-[var(--mid-dark)] border border-[var(--border)]" 
                : "bg-gradient-to-br from-white to-gray-50 border border-gray-200"
            } shadow-xl`}  // تغيير من shadow-2xl إلى shadow-xl
          >
            {/* Header Icon - تصغير الأيقونة */}
            <div className="flex justify-center mb-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                modalConfig.type === "cancel" 
                  ? "bg-red-500/20 border border-red-500/30" 
                  : "bg-[var(--button)]/20 border border-[var(--button)]/30"
              }`}>
                {modalConfig.type === "cancel" ? (
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-[var(--button)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
            </div>

            {/* Title - تصغير الخط */}
            <h3 className={`text-lg font-bold text-center mb-2 ${
              themeMode === "dark" ? "text-white" : "text-gray-900"
            }`}>
              {modalConfig.title}
            </h3>

            {/* Message - تصغير الخط */}
            <p className={`text-center mb-4 text-sm leading-relaxed ${
              themeMode === "dark" ? "text-gray-300" : "text-gray-600"
            }`}>
              {modalConfig.message}
            </p>

            {/* Action Buttons - تصغير الأزرار */}
            <div className="flex gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 text-sm ${
                  themeMode === "dark" 
                    ? "bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--hover)]" 
                    : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                }`}
              >
                No, Go Back
              </button>
              <button
                onClick={modalConfig.onConfirm}
                disabled={decisionLoading}
                className={`flex-1 py-2 px-3 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 text-sm ${
                  modalConfig.type === "cancel" 
                    ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700" 
                    : "bg-gradient-to-r from-[var(--button)] to-[var(--primary)] hover:from-[#015c40] hover:to-[var(--button)]"
                } ${decisionLoading ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {decisionLoading ? (
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  "Yes, Confirm"
                )}
              </button>
            </div>

            {/* Close Button - تصغير */}
            <button
              onClick={() => setModalOpen(false)}
              className={`absolute top-2 right-2 p-1 rounded-full transition-colors duration-200 ${
                themeMode === "dark" 
                  ? "hover:bg-white/10 text-gray-400" 
                  : "hover:bg-gray-200 text-gray-500"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scale-in {
          from { 
            opacity: 0;
            transform: scale(0.9) translateY(-10px);
          }
          to { 
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
        
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) rotate(0deg); 
            opacity: 0.7;
          }
          33% { 
            transform: translateY(-20px) translateX(10px) rotate(120deg); 
            opacity: 1;
          }
          66% { 
            transform: translateY(10px) translateX(-15px) rotate(240deg); 
            opacity: 0.8;
          }
        }
        @keyframes gradient-x-slow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${themeMode === 'dark' ? 'var(--bg)' : '#f1f1f1'};
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--button);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #015c40;
        }
      `}</style>
    </div>
  );
};

export default OrdersPage;