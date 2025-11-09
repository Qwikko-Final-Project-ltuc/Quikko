import React, { useState, useEffect } from "react";

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
    `http://localhost:3000/api/vendor/order-items${query}`,
    { headers: getAuthHeaders() }
  );
  const json = await res.json();
  return json.data || [];
};

const fetchOrders_endpoint = async () => {
  const res = await fetch(`http://localhost:3000/api/vendor/orders`, {
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
      // نموذجك الأخير من /vendor/orders:
      // item_id, order_id, product_name, quantity, vendor_status, rejection_reason,
      // order_status, ... إلخ
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
      // /vendor/order-items (القديم)
      return {
        order_item_id: r.order_item_id ?? r.item_id ?? r.id,
        order_id: r.order_id,
        product_name: r.product_name,
        quantity: r.quantity,
        vendor_status: r.vendor_status || "pending",
        // ممكن ما يرجّع السبب/الحالة من القديم
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
  const [visibleCount, setVisibleCount] = useState(5);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  // مودال سبب الرفض
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [pendingChange, setPendingChange] = useState(null); // { itemId, orderId }

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

  // PATCH /vendor/orders/:orderId/items/:itemId
  const callUpdateItemStatus = async ({
    orderId,
    itemId,
    action,
    reason = null,
  }) => {
    const url = `http://localhost:3000/api/vendor/orders/${orderId}/items/${itemId}`;
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

    // لو الطلب مكنسل ما نسمح بأي تغيير
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
      // عندك أكشنين فقط: accept/reject
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
  const pageBg = isDarkMode ? "#242625" : "#f0f2f1";
  const innerBg = isDarkMode ? "#313131" : "#ffffff";
  const textColor = isDarkMode ? "#ffffff" : "#242625";
  const borderColor = isDarkMode ? "#f9f9f9" : "#ccc";
  const inputBg = isDarkMode ? "#666666" : "#ffffff";

  // Badge بسيطة حسب حالة الطلب
  const OrderBadge = ({ status }) => {
    const s = (status || "").toLowerCase();
    const base =
      "inline-block px-2 py-0.5 rounded text-xs font-semibold border";
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

  return (
    <div
      className="p-6 space-y-6"
      style={{ backgroundColor: pageBg, color: textColor }}
    >
      <h1 className="text-2xl font-bold mb-6">Order Management</h1>

      {/* الفلاتر */}
      <div className="mb-6 flex flex-wrap gap-3">
        {Object.keys(STATUS_LABELS).map((key) => (
          <button
            key={key}
            onClick={() => {
              setFilter(key);
              setVisibleCount(5);
              // لو شغّالين على /vendor/orders بنفلتر بالفرونت
              if (USE_ORDERS_ENDPOINT) {
                setItems((prev) =>
                  key === ""
                    ? prev
                    : prev.filter((i) => i.vendor_status === key)
                );
                // بس لسلامة التحديث: نعيد تحميل البيانات لتطبيق الفلتر
                loadItems(key);
              } else {
                loadItems(key);
              }
            }}
            className={`px-4 py-1 rounded-2xl border transition-all duration-300 ${
              filter === key
                ? "bg-[#307A59] text-white border-[#307A59] shadow-md"
                : "bg-white text-gray-500 border-gray-300 hover:bg-gray-100"
            }`}
          >
            {STATUS_LABELS[key]}
          </button>
        ))}
      </div>

      {/* الجدول */}
      <div
        className="p-6 rounded-2xl shadow"
        style={{ backgroundColor: innerBg, color: textColor }}
      >
        {loading ? (
          <p style={{ color: textColor }}>Loading items...</p>
        ) : (
          <>
            <table
              className="w-full border-collapse"
              style={{ color: textColor }}
            >
              <thead>
                <tr style={{ borderBottom: `1px solid ${borderColor}` }}>
                  <th className="p-2">Item ID</th>
                  <th className="p-2">Order ID</th>
                  <th className="p-2">Product</th>
                  <th className="p-2">Quantity</th>
                  <th className="p-2">Vendor Status</th>
                  <th className="p-2">Order Status</th> {/* جديد */}
                  <th className="p-2">Reject Reason</th> {/* جديد */}
                </tr>
              </thead>
              <tbody>
                {visibleItems.map((item) => {
                  const isCancelled = (item.order_status || "") === "cancelled";
                  return (
                    <tr
                      key={item.order_item_id}
                      className="border-b hover:bg-gray-50 transition"
                      style={{
                        borderBottom: `1px solid ${borderColor}`,
                        color: textColor,
                        backgroundColor: "transparent",
                      }}
                    >
                      <td className="p-2">{item.order_item_id}</td>
                      <td className="p-2">{item.order_id}</td>
                      <td className="p-2">{item.product_name}</td>
                      <td className="p-2">{item.quantity}</td>
                      <td className="p-2">
                        <select
                          value={item.vendor_status || "pending"}
                          onChange={(e) =>
                            handleStatusChange(item, e.target.value)
                          }
                          className="p-1 rounded-md font-medium"
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
                      </td>

                      {/* Order Status badge */}
                      <td className="p-2">
                        <OrderBadge status={item.order_status} />
                      </td>

                      {/* Reject Reason */}
                      <td className="p-2">
                        {item.vendor_status === "rejected" ? (
                          <span
                            className="inline-block max-w-[220px] truncate"
                            title={item.rejection_reason || "No reason"}
                            style={{
                              color: isDarkMode ? "#ffdada" : "#a01818",
                            }}
                          >
                            {item.rejection_reason || "—"}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })}

                {items.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="p-4 text-center italic"
                      style={{ color: textColor }}
                    >
                      No items found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {visibleCount < items.length && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => setVisibleCount(items.length)}
                  className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition"
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
  );
}
