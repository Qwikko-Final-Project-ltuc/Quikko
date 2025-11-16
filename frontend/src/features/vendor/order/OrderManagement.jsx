import React, { useState, useEffect } from "react";
import Footer from "../Footer";

/* ===== Helpers ===== */
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/* لو بتحبي تستخدمي /vendor/orders فعّلي هذا الفلاغ */
const USE_ORDERS_ENDPOINT = true;

/* ===== Fetchers ===== */
const fetchOrderItems_endpoint = async (status = "") => {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  const res = await fetch(
    `https://qwikko.onrender.com/api/vendor/order-items${query}`,
    { headers: getAuthHeaders() }
  );
  const json = await res.json();
  return json.data || [];
};

const fetchOrders_endpoint = async () => {
  const res = await fetch(`https://qwikko.onrender.com/api/vendor/orders`, {
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  return json.data || [];
};

/* نوحّد الشكل بين الإندبوينتين */
const normalizeRows = (rows, fromOrdersEndpoint) => {
  if (!Array.isArray(rows)) return [];
  return rows.map((r) => {
    if (fromOrdersEndpoint) {
      return {
        order_item_id: r.item_id ?? r.order_item_id ?? r.id,
        order_id: r.order_id,
        product_name: r.product_name,
        quantity: r.quantity,
        vendor_status: r.vendor_status || "pending",
        rejection_reason: r.rejection_reason ?? null,
        order_status: (r.order_status || r.status || "").toLowerCase() || null,
      };
    } else {
      return {
        order_item_id: r.order_item_id ?? r.item_id ?? r.id,
        order_id: r.order_id,
        product_name: r.product_name,
        quantity: r.quantity,
        vendor_status: r.vendor_status || "pending",
        rejection_reason: r.rejection_reason ?? null,
        order_status: (r.order_status || r.status || "").toLowerCase() || null,
      };
    }
  });
};

/* ===== UI labels ===== */
const STATUS_LABELS = {
  "": "All",
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
};

export default function OrderManagement() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  // مودال سبب الرفض
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [pendingChange, setPendingChange] = useState(null);

  const allowedStatuses = ["pending", "accepted", "rejected"];

  const loadItems = async (statusFilter = "") => {
    setLoading(true);
    try {
      let raw = [];
      if (USE_ORDERS_ENDPOINT) {
        raw = await fetchOrders_endpoint();
        raw = normalizeRows(raw, true);
      } else {
        raw = await fetchOrderItems_endpoint(statusFilter);
        raw = normalizeRows(raw, false);
      }

      const filtered =
        statusFilter === ""
          ? raw
          : raw.filter((i) => (i.vendor_status || "pending") === statusFilter);

      setItems(filtered);
    } catch (err) {
      console.error("Error loading order items:", err);
      setItems([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadItems();
    const handleStorageChange = () =>
      setIsDarkMode(localStorage.getItem("theme") === "dark");
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const callUpdateItemStatus = async ({
    orderId,
    itemId,
    action,
    reason = null,
  }) => {
    const url = `https://qwikko.onrender.com/api/vendor/orders/${orderId}/items/${itemId}`;
    const res = await fetch(url, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        action,
        ...(action === "reject" ? { reason } : {}),
      }),
    });
    const json = await res.json();

    if (!res.ok || json?.success === false) {
      const msg =
        json?.message ||
        (res.status === 409
          ? "Order has been cancelled by the customer."
          : `Failed to update item ${itemId}`);
      throw new Error(msg);
    }
    return json;
  };

  const handleStatusChange = async (item, newStatus) => {
    if (!allowedStatuses.includes(newStatus)) return;

    if ((item.order_status || "") === "cancelled") {
      alert("This order is cancelled. You can't change item status.");
      return;
    }

    if (newStatus === "rejected") {
      setPendingChange({
        itemId: item.order_item_id,
        orderId: item.order_id,
      });
      setRejectReason("");
      setShowRejectModal(true);
      return;
    }

    try {
      await callUpdateItemStatus({
        orderId: item.order_id,
        itemId: item.order_item_id,
        action: "accept",
      });
      await loadItems(filter);
    } catch (err) {
      console.error(err);
      alert(err.message);
      await loadItems(filter);
    }
  };

  const confirmReject = async () => {
    if (!pendingChange) return;
    try {
      await callUpdateItemStatus({
        orderId: pendingChange.orderId,
        itemId: pendingChange.itemId,
        action: "reject",
        reason: rejectReason?.trim() || null,
      });
      setShowRejectModal(false);
      setPendingChange(null);
      setRejectReason("");
      await loadItems(filter);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const cancelReject = async () => {
    setShowRejectModal(false);
    setPendingChange(null);
    setRejectReason("");
    await loadItems(filter);
  };

  const visibleItems = items.slice(0, visibleCount);

  // ألوان
  const innerBg = isDarkMode ? "#313131" : "#ffffff";
  const textColor = isDarkMode ? "#ffffff" : "#242625";
  const borderColor = isDarkMode ? "#f9f9f9" : "#ccc";
  const inputBg = isDarkMode ? "#666666" : "#ffffff";
  const cardBg = isDarkMode ? "#424242" : "#f8f9fa";

  // Badge بسيطة حسب حالة الطلب
  const OrderBadge = ({ status }) => {
    const s = (status || "").toLowerCase();
    const base = "inline-block px-2 py-0.5 rounded text-xs font-semibold border";
    let styles = {
      color: "#333",
      bg: "#eee",
      border: "#ddd",
    };
    if (s === "cancelled")
      styles = { color: "#fff", bg: "#e53935", border: "#e53935" };
    else if (s === "requested")
      styles = { color: "#fff", bg: "#1976d2", border: "#1976d2" };
    else if (s === "awaiting_customer_decision")
      styles = { color: "#fff", bg: "#f9a825", border: "#f9a825" };
    else if (s === "delivered")
      styles = { color: "#fff", bg: "#2e7d32", border: "#2e7d32" };

    return (
      <span
        className={base}
        style={{
          color: styles.color,
          backgroundColor: styles.bg,
          borderColor: styles.border,
        }}
        title={status || ""}
      >
        {status ? status.replace(/_/g, " ") : "—"}
      </span>
    );
  };

  // كارد للعنصر الواحد
  const OrderCard = ({ item }) => {
    const isCancelled = (item.order_status || "") === "cancelled";
    
    return (
      <div 
        className="rounded-2xl p-4 border shadow-sm transition-all duration-300 hover:shadow-md"
        style={{
          backgroundColor: cardBg,
          borderColor: borderColor,
          color: textColor,
        }}
      >
        {/* الهيدر - معلومات الأساسية */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg" style={{ color: "#307A59" }}>
              {item.product_name}
            </h3>
            <p className="text-sm opacity-80">Product</p>
          </div>
          <OrderBadge status={item.order_status} />
        </div>

        {/* معلومات الطلب */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <p className="text-sm font-medium">Item ID</p>
            <p className="text-base">{item.order_item_id}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Order ID</p>
            <p className="text-base">{item.order_id}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Quantity</p>
            <p className="text-base">{item.quantity}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Vendor Status</p>
            <select
              value={item.vendor_status || "pending"}
              onChange={(e) => handleStatusChange(item, e.target.value)}
              className="w-full p-1 rounded-md font-medium text-sm mt-1"
              style={{
                backgroundColor: inputBg,
                color: textColor,
                borderColor: borderColor,
                opacity: isCancelled ? 0.6 : 1,
                cursor: isCancelled ? "not-allowed" : "pointer",
              }}
              disabled={isCancelled}
              title={
                isCancelled
                  ? "Order is cancelled. You can't change this item."
                  : "Change vendor status"
              }
            >
              {["pending", "accepted", "rejected"].map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* سبب الرفض */}
        {item.vendor_status === "rejected" && (
          <div className="mt-3 pt-3 border-t" style={{ borderColor: borderColor }}>
            <p className="text-sm font-medium mb-1">Rejection Reason</p>
            <p 
              className="text-sm p-2 rounded-md"
              style={{
                backgroundColor: isDarkMode ? "#5a3a3a" : "#ffeaea",
                color: isDarkMode ? "#ffdada" : "#a01818",
              }}
            >
              {item.rejection_reason || "No reason provided"}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{
        backgroundColor: isDarkMode ? "var(--bg-dark)" : "var(--bg)",
        color: "var(--text)",
      }}
    >
      {/* المحتوى الرئيسي */}
      <main className="flex-grow">
        <div className="max-w-screen-xl mx-4 sm:mx-8 lg:mx-12 mt-18 mb-18 px-4 sm:px-6 md:px-10 lg:px-12 py-6 md:py-10 space-y-10">
          <h1 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-10 text-center sm:text-left" style={{ color: "#307A59" }}>
            Order Management
          </h1>

          {/* أزرار الفلترة */}
          <div className="mb-8 flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3">
            {Object.keys(STATUS_LABELS).map((key) => (
              <button
                key={key}
                onClick={() => {
                  setFilter(key);
                  setVisibleCount(6);
                  if (USE_ORDERS_ENDPOINT) {
                    setItems((prev) =>
                      key === ""
                        ? prev
                        : prev.filter((i) => i.vendor_status === key)
                    );
                    loadItems(key);
                  } else {
                    loadItems(key);
                  }
                }}
                className={`px-3 sm:px-4 py-1 rounded-2xl border text-sm sm:text-base transition-all duration-300 ${
                  filter === key
                    ? "bg-[#307A59] text-white border-[#307A59] shadow-md"
                    : "bg-white text-gray-500 border-gray-300 hover:bg-gray-100"
                }`}
              >
                {STATUS_LABELS[key]}
              </button>
            ))}
          </div>

          {/* كاردز الطلبات */}
          <div
            className="p-4 sm:p-6 border border-[var(--border)] rounded-2xl shadow"
            style={{ backgroundColor: innerBg, color: textColor }}
          >
            {loading ? (
              <p className="text-center" style={{ color: textColor }}>
                Loading items...
              </p>
            ) : (
              <>
                {/* Grid responsive لثلاث أحجام شاشات */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {visibleItems.map((item) => (
                    <OrderCard key={item.order_item_id} item={item} />
                  ))}
                </div>

                {items.length === 0 && (
                  <div className="text-center py-8 italic" style={{ color: textColor }}>
                    No items found
                  </div>
                )}

                {visibleCount < items.length && (
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={() => setVisibleCount(prev => prev + 6)}
                      className="px-6 py-2 rounded-lg transition-all duration-300"
                      style={{
                        backgroundColor: isDarkMode ? "#307A59" : "#307A59",
                        color: "white",
                        border: `1px solid #307A59`,
                      }}
                    >
                      Show More
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* مودال سبب الرفض */}
          {showRejectModal && (
            <div
              className="fixed inset-0 flex items-center justify-center z-50"
              style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
            >
              <div
                className="w-full max-w-md rounded-2xl p-6 shadow-lg"
                style={{ backgroundColor: innerBg, color: textColor }}
              >
                <h2 className="text-lg font-semibold mb-4">Rejection reason</h2>
                <textarea
                  className="w-full p-3 rounded-lg border"
                  style={{
                    backgroundColor: inputBg,
                    color: textColor,
                    borderColor: borderColor,
                  }}
                  rows={4}
                  placeholder="Write the reason (optional)"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    onClick={cancelReject}
                    className="px-4 py-2 rounded-lg border"
                    style={{ borderColor: borderColor }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmReject}
                    className="px-4 py-2 rounded-lg text-white"
                    style={{ backgroundColor: "#307A59" }}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[var(--footer-bg)] mt-auto">
        <Footer />
      </footer>
    </div>
  );
}