import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchCompanyOrders,
  updateOrderStatus,
  updateOrderPaymentStatus,
  getTrackingOrder,
  getDeliveryEstimate,
} from "./Api/DeliveryAPI";
import { FaBox, FaTimes } from "react-icons/fa";
import { useSelector } from "react-redux";

const STATUS_FLOW = {
  accepted: ["processing"],
  processing: ["out_for_delivery"],
  out_for_delivery: ["delivered"],
  delivered: [],
};

const STATUS_LABELS = {
  all: "All",
  accepted: "Accepted",
  processing: "Processing",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
};

/* ================= Shipping Helpers (مطابقة للتراكنق) ================= */

function extractShippingFromEstimate(estimate, order) {
  if (!estimate && !order) return 0;

  if (estimate && estimate.total_delivery_fee != null) {
    return Number(estimate.total_delivery_fee) || 0;
  }

  if (estimate && Array.isArray(estimate.route)) {
    const sum = estimate.route.reduce(
      (s, step) => s + Number(step?.delivery_fee || 0),
      0
    );
    if (!Number.isNaN(sum) && sum > 0) return Number(sum) || 0;
  }

  if (order && order.delivery_fee != null) {
    return Number(order.delivery_fee) || 0;
  }

  return 0;
}

async function fetchShippingFee(orderId) {
  try {
    const order = await getTrackingOrder(orderId);
    if (!order) return 0;

    const customerAddressId = order?.shipping_address
      ? JSON.parse(order.shipping_address)?.id
      : null;

    const vendorIds = Array.isArray(order?.items)
      ? order.items.map((it) => it.vendor_id).filter((v) => v != null)
      : [];

    const deliveryUserId =
      order?.delivery_user_id || order?.delivery_company_user_id || null;

    if (!deliveryUserId || !customerAddressId || vendorIds.length === 0) {
      return Number(order?.delivery_fee || 0);
    }

    const est = await getDeliveryEstimate({
      userId: deliveryUserId,
      customerAddressId,
      vendorIds,
    });

    if (Array.isArray(est?.route)) {
      est.route = est.route.map((r) => ({
        ...r,
        lat: r.latitude ?? r.lat,
        lng: r.longitude ?? r.lng,
      }));
    }

    return extractShippingFromEstimate(est, order);
  } catch {
    return 0;
  }
}

async function enrichOrdersWithShipping(orders) {
  const enriched = await Promise.all(
    (orders || []).map(async (o) => {
      const shipping = await fetchShippingFee(o.id);
      const productsTotal = Number(o.total_amount || 0);
      const totalWithShipping = productsTotal + Number(shipping || 0);
      return {
        ...o,
        _shipping_fee: Number(shipping || 0),
        _total_with_shipping: Number(totalWithShipping || 0),
      };
    })
  );
  return enriched;
}

/* ============================ Component ============================ */

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [message, setMessage] = useState("");
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [currentStatus, setCurrentStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [filter, setFilter] = useState("all");

  const PAGE_SIZE = 6;
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // مودال الدفع
  const [showPayModal, setShowPayModal] = useState(false);
  const [payOrderId, setPayOrderId] = useState(null);

  const openPayModal = (orderId, isPaid) => {
    if (isPaid) return;
    setPayOrderId(orderId);
    setShowPayModal(true);
  };
  const cancelMarkPaid = () => {
    setShowPayModal(false);
    setPayOrderId(null);
  };

  // 🎯 شارة الحالة (ألوان محسّنة حسب طلبك)
  const statusBadgeStyle = (status) => {
    const s = String(status || "").toLowerCase();

    const base = {
      borderRadius: "0.75rem",
      padding: "0.25rem 0.75rem",
      display: "inline-block",
      fontWeight: 600,
      color: "#fff",
      letterSpacing: "0.3px",
      boxShadow: "0 0 6px rgba(0,0,0,0.08)",
      transition: "all 0.3s ease",
    };

    switch (s) {
      case "accepted":
        // 💙 أزرق بارد
        return {
          ...base,
          background: "linear-gradient(135deg, #3b82f6, #2563eb)",
          border: "1px solid #2563eb",
        };

      case "processing":
        // 💛 أصفر ناعم وهادي
        return {
          ...base,
          background: "linear-gradient(135deg, #fde047, #facc15)",
          border: "1px solid #eab308",
          color: "#1e1e1e",
        };

      case "out_for_delivery":
        // 🧡 برتقالي دافئ بس رايق
        return {
          ...base,
          background: "linear-gradient(135deg, #fb923c, #f97316)",
          border: "1px solid #ea580c",
        };

      case "delivered":
        // 💚 أخضر بارد ناعم زي وجهك 😌
        return {
          ...base,
          background: "linear-gradient(135deg, #10b981, #34d399)",
          border: "1px solid #059669",
        };

      default:
        // رمادي افتراضي
        return {
          ...base,
          background: "linear-gradient(135deg, #cbd5e1, #e2e8f0)",
          color: "#1e293b",
          border: "1px solid #cbd5e1",
        };
    }
  };

  const navigate = useNavigate();
  const isDarkMode = useSelector((state) => state.deliveryTheme.darkMode);

  const formatCurrency = (v) =>
    Number(v || 0).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });

  // دمج بدون تكرار
  const appendUniqueById = (oldArr, newArr) => {
    const seen = new Set(oldArr.map((o) => o.id));
    const filtered = newArr.filter((o) => !seen.has(o.id));
    return [...oldArr, ...filtered];
  };

  // Toast
  const [toast, setToast] = useState({
    show: false,
    type: "success",
    text: "",
  });
  const toastTimerRef = useRef(null);
  const showToast = (type, text) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, type, text });
    toastTimerRef.current = setTimeout(
      () => setToast((t) => ({ ...t, show: false })),
      3000
    );
  };
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // تحميل أولي + إثراء بالشحن
  useEffect(() => {
    const loadInitialOrders = async () => {
      setLoading(true);
      setMessage("");

      try {
        const resp = await fetchCompanyOrders(1, PAGE_SIZE);
        console.log('📦 Orders response:', resp);
        
        const fetched = resp.orders || [];
        
        if (fetched.length === 0) {
          setMessage("No orders found");
          setOrders([]);
          setHasMore(false);
          return;
        }

        const enriched = await enrichOrdersWithShipping(fetched);
        setOrders(enriched);
        setPage(1);
        setHasMore(resp.pagination?.hasNext || false);
        
      } catch (err) {
        console.error('❌ Error loading orders:', err);
        setMessage("❌ " + (err?.message || "Failed to load orders"));
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialOrders();
  }, [PAGE_SIZE]);

  // فلترة
  useEffect(() => {
    if (filter === "all") setFilteredOrders(orders);
    else setFilteredOrders(orders.filter((o) => o.order_status === filter));
  }, [filter, orders]);

  // Load More (مع الإثراء)
  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const resp = await fetchCompanyOrders(nextPage, PAGE_SIZE);
      const fetched = resp.orders || [];
      
      if (fetched.length === 0) {
        setHasMore(false);
        return;
      }

      const enriched = await enrichOrdersWithShipping(fetched);
      setOrders((prev) => appendUniqueById(prev, enriched));
      setHasMore(resp.pagination?.hasNext || false);
      setPage(nextPage);
      
    } catch (err) {
      console.error('❌ Error loading more orders:', err);
      setMessage("❌ " + err.message);
    } finally {
      setLoadingMore(false);
    }
  };

  // Debug effect
  useEffect(() => {
    console.log('🔄 Orders state updated:', {
      orders: orders,
      filteredOrders: filteredOrders,
      hasMore: hasMore,
      page: page
    });
  }, [orders, filteredOrders, hasMore, page]);

  const openStatusModal = (orderId, status) => {
    setCurrentOrderId(orderId);
    setCurrentStatus(status);
    setShowModal(true);
  };

  const handleUpdateStatus = async () => {
    const next = STATUS_FLOW[currentStatus] || [];
    if (!next.length) return;
    const newStatus = next[0];

    try {
      setUpdating(true);
      await updateOrderStatus(currentOrderId, newStatus);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === currentOrderId ? { ...o, order_status: newStatus } : o
        )
      );
      setShowModal(false);
      showToast("success", `Order #${currentOrderId} status updated to ${newStatus}`);
    } catch (err) {
      showToast("error", err?.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentUpdate = async (orderId) => {
    try {
      const result = await updateOrderPaymentStatus(orderId, "PAID");
      showToast("success", result?.message || "Payment marked as PAID");
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, payment_status: result.order.payment_status }
            : o
        )
      );
    } catch (err) {
      showToast("error", err?.message || "Payment update failed");
    }
  };

  const confirmMarkPaid = async () => {
    if (!payOrderId) return;
    await handlePaymentUpdate(payOrderId);
    setShowPayModal(false);
    setPayOrderId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--button)] mx-auto mb-4"></div>
          <p className="text-[var(--text)] text-lg">Loading Orders...</p>
        </div>
      </div>
    );
  }

  if (!loading && orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <div className="w-20 h-20 bg-[var(--button)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaBox className="text-2xl text-[var(--button)]" />
          </div>
          <h3 className="text-xl font-bold text-[var(--text)] mb-2">No Orders Found</h3>
          <p className="text-[var(--light-gray)] mb-4">
            {message || "There are no accepted orders at the moment."}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-[var(--button)] hover:bg-[#015c40] text-white font-semibold px-6 py-2 rounded-xl transition-all duration-300"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  const cardBg = { backgroundColor: "var(--bg)" };
  const textCol = { color: "var(--text)" };

  const btnBase =
    "inline-flex items-center justify-center rounded-2xl border font-semibold shadow-md transition-all duration-200 active:scale-[0.98] whitespace-nowrap";
  const btnSolid = {
    backgroundColor: "var(--button)",
    color: "var(--btn-text, #ffffff)",
    borderColor: "var(--button)",
  };
  const btnGhost = (active) => ({
    backgroundColor: active ? "var(--button)" : "var(--bg)",
    color: active ? "var(--btn-text, #ffffff)" : "var(--text)",
    borderColor: active ? "var(--button)" : "var(--border)",
  });

  return (
    <div className="w-full">
      {/* Toast */}
      <div
        className={`fixed left-0 right-0 top-0 z-[1000] flex justify-center transition-all duration-300 ${
          toast.show
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
        }`}
        aria-live="polite"
        aria-atomic="true"
      >
        <div
          className="mt-3 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3"
          style={{
            backgroundColor:
              toast.type === "success" ? "var(--success)" : "var(--error)",
            color: "#ffffff",
            borderColor: "var(--border)",
            maxWidth: "42rem",
            width: "calc(100% - 2rem)",
          }}
          role="status"
        >
          <span
            className="inline-flex items-center justify-center w-6 h-6 rounded-full"
            style={{ background: "rgba(255,255,255,0.2)" }}
            aria-hidden="true"
          >
            {toast.type === "success" ? "✓" : "!"}
          </span>
          <span className="font-semibold flex-1">{toast.text}</span>
          <button
            onClick={() => setToast((t) => ({ ...t, show: false }))}
            className="ml-2"
            style={{
              background: "transparent",
              border: "none",
              color: "#ffffff",
              fontSize: "1.1rem",
              lineHeight: 1,
              cursor: "pointer",
            }}
            aria-label="Close"
            title="Close"
            type="button"
          >
            ×
          </button>
        </div>
      </div>

      <h2
        className="text-2xl md:text-3xl font-extrabold mb-4 px-6"
        style={textCol}
      >
        <span className="inline-flex items-center gap-2">
          <FaBox />
          Company Orders
        </span>
      </h2>

      <div
        className="w-full mx-auto p-6 rounded-2xl"
        style={{ background: isDarkMode ? "#313131" : "#f5f6f5" }}
      >
        {/* الفلاتر */}
        <div className="mb-6 flex flex-wrap gap-3 justify-start">
          {Object.keys(STATUS_LABELS).map((key) => {
            const active = filter === key;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={btnBase + " px-4 py-2 text-sm md:text-base"}
                style={btnGhost(active)}
              >
                {STATUS_LABELS[key]}
              </button>
            );
          })}
        </div>

        {/* الشبكة */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((o) => {
            const isPaid = String(o.payment_status).toLowerCase() === "paid";
            return (
              <div
                key={o.id}
                className="p-5 rounded-2xl shadow-md flex flex-col justify-between border"
                style={{
                  ...cardBg,
                  borderColor: "var(--border)",
                  color: "var(--text)",
                }}
              >
                <div>
                  {/* ===== عنوان + زر Mark as Paid (مرفوع) ===== */}
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h3 className="text-lg md:text-xl font-bold m-0">
                      Order #{o.id}
                    </h3>

                    <button
                      onClick={() => openPayModal(o.id, isPaid)}
                      disabled={isPaid}
                      aria-disabled={isPaid}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm md:text-base font-semibold transition-all duration-200 shadow-sm
      ${
        isPaid
          ? "bg-[var(--button)]/80 text-white border-[var(--button)]/80 cursor-not-allowed"
          : "bg-transparent text-[var(--button)] border-[var(--button)] hover:bg-[var(--button)] hover:text-white hover:shadow-md active:scale-[0.97]"
      }`}
                    >
                      {isPaid ? (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4 opacity-90"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span>Paid</span>
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 8c-1.657 0-3 1.343-3 3 0 1.657 1.343 3 3 3m0 0v1m0-4V9m9 3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>Mark as Paid</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-sm mb-1">
                    Customer: <strong>{o.customer_name}</strong>
                  </p>

                  {/* المبلغ النهائي مع الشحن */}
                  <p className="text-sm mb-1">
                    Total Amount:{" "}
                    <strong>
                      {formatCurrency(
                        Number(
                          o._total_with_shipping ??
                            Number(o.total_amount || 0) +
                              Number(o._shipping_fee || 0)
                        )
                      )}
                    </strong>
                  </p>

                  <p className="text-sm mb-1">
                    Status:{" "}
                    <span
                      className="px-2 py-0.5 rounded-md font-semibold capitalize"
                      style={statusBadgeStyle(o.order_status)}
                    >
                      {o.order_status.replace(/_/g, " ")}
                    </span>
                  </p>

                  <p className="text-sm mb-1">
                    Payment: <strong>{o.payment_status || "Pending"}</strong>
                  </p>
                  
                  <p className="text-sm mb-1">
                    Items: <strong>{o.items_count} items ({o.total_quantity} total)</strong>
                  </p>
                  
                  <p className="text-sm mb-1">
                    Address: <strong>{o.address_line1}, {o.city}</strong>
                  </p>
                  
                  <p className="text-xs mt-2">
                    Ordered At:{" "}
                    {new Date(o.created_at).toLocaleString([], {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </p>
                </div>

                {/* ===== الأزرار السفلية (بالعرض دائمًا، بدون لف) ===== */}
                <div className="mt-4 flex gap-2 flex-nowrap">
                  {(STATUS_FLOW[o.order_status] || []).length > 0 && (
                    <button
                      onClick={() => openStatusModal(o.id, o.order_status)}
                      className={
                        btnBase +
                        " flex-1 px-4 py-2 text-sm md:text-base whitespace-nowrap"
                      }
                      style={btnSolid}
                    >
                      {updating ? "Updating..." : "Update Status"}
                    </button>
                  )}

                  <button
                    onClick={() =>
                      navigate(`/delivery/dashboard/tracking/${o.id}`)
                    }
                    className={
                      btnBase +
                      " flex-1 px-4 py-2 text-sm md:text-base whitespace-nowrap"
                    }
                    style={btnSolid}
                  >
                    Track
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Load More */}
        {hasMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className={btnBase + " px-6 py-2 text-sm md:text-base"}
              style={{
                ...btnSolid,
                backgroundColor: loadingMore ? "var(button)" : "var(--button)",
                cursor: loadingMore ? "not-allowed" : "pointer",
              }}
            >
              {loadingMore ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>

      {/* Modal تغيير الحالة */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div
            style={{
              backgroundColor: "var(--bg)",
              color: "var(--text)",
              padding: "1.5rem",
              borderRadius: "1rem",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
              width: "24rem",
              position: "relative",
            }}
          >
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: "absolute",
                top: "0.75rem",
                right: "0.75rem",
                color: "var(--text)",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
              aria-label="Close"
            >
              <FaTimes size={20} />
            </button>

            <h3
              style={{
                fontSize: "1.25rem",
                fontWeight: "bold",
                marginBottom: "1rem",
                color: "var(--text)",
              }}
            >
              Edit Order Status
            </h3>

            <p style={{ marginBottom: "1rem", color: "var(--text)" }}>
              Current status:{" "}
              <strong>{currentStatus.replace(/_/g, " ")}</strong>
            </p>

            {(STATUS_FLOW[currentStatus] || []).length > 0 ? (
              <button
                onClick={handleUpdateStatus}
                disabled={updating}
                className={btnBase + " w-full px-4 py-2 text-sm md:text-base"}
                style={{
                  ...btnSolid,
                  backgroundColor: updating
                    ? "var(--light-gray)"
                    : "var(--button)",
                  color: "var(--btn-text, #ffffff)",
                  cursor: updating ? "not-allowed" : "pointer",
                }}
              >
                {updating
                  ? "Updating..."
                  : `Change Status to ${(STATUS_FLOW[currentStatus] || [])[0]
                      .replace(/_/g, " ")
                      .toUpperCase()}`}
              </button>
            ) : (
              <p style={{ color: "var(--light-gray)", textAlign: "center" }}>
                No further status change allowed.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Modal تأكيد الدفع */}
      {showPayModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div
            style={{
              backgroundColor: "var(--bg)",
              color: "var(--text)",
              padding: "1.25rem",
              borderRadius: "1rem",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
              width: "22rem",
              position: "relative",
            }}
          >
            <button
              onClick={cancelMarkPaid}
              style={{
                position: "absolute",
                top: "0.75rem",
                right: "0.75rem",
                color: "var(--text)",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
              aria-label="Close"
            >
              <FaTimes size={18} />
            </button>

            <h3
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                marginBottom: "0.75rem",
              }}
            >
              Confirm Payment
            </h3>

            <p style={{ marginBottom: "1rem" }}>
              Are you sure you want to mark order <strong>#{payOrderId}</strong>{" "}
              as <strong>PAID</strong>?
            </p>

            <div className="flex gap-2">
              <button
                onClick={confirmMarkPaid}
                className={btnBase + " flex-1 py-2"}
                style={btnSolid}
              >
                Yes, Mark as Paid
              </button>
              <button
                onClick={cancelMarkPaid}
                className={btnBase + " flex-1 py-2"}
                style={{
                  backgroundColor: "var(--bg)",
                  color: "var(--text)",
                  borderColor: "var(--border)",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}