import React, { useState, useEffect } from "react";

// ====== Helpers (نفس أسلوبك) ======
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// لو موجودة عندك، تقدر تبقيها. هون نسخة بسيطة للـ fetch من نفس اندبوينتاتك:
const fetchOrderItems = async (status = "") => {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  const res = await fetch(
    `http://localhost:3000/api/vendor/order-items${query}`,
    {
      headers: getAuthHeaders(),
    }
  );
  const json = await res.json();
  return json.data || [];
};

// بديل آخر بجيب من /vendor/orders لو حابة:
const _fetchOrderItemsWithCompany = null; // خليه null لو بدك الافتراضي هو order-items

// ====== المكون الرئيسي ======
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

  // ====== مودال سبب الرفض ======
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [pendingChange, setPendingChange] = useState(null);
  // pendingChange = { itemId, orderId, nextStatus }

  const allowedStatuses = ["pending", "accepted", "rejected"];
  const fetchItemsPref = _fetchOrderItemsWithCompany || fetchOrderItems;

  const loadItems = async (statusFilter = "") => {
    setLoading(true);
    try {
      const data = await fetchItemsPref(statusFilter);
      const filtered =
        statusFilter === ""
          ? data
          : data.filter((i) => i.vendor_status === statusFilter);
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

  // ====== ضرب الاندبوينت الجديد PATCH /vendor/orders/:orderId/items/:itemId ======
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
      const msg = json?.message || `Failed to update item ${itemId}`;
      throw new Error(msg);
    }
    return json;
  };

  // عند تغيير الستيتس من السيلكت
  const handleStatusChange = async (item, newStatus) => {
    if (!allowedStatuses.includes(newStatus)) return;

    // لو رفض → افتح مودال السبب قبل الحفظ
    if (newStatus === "rejected") {
      setPendingChange({
        itemId: item.order_item_id,
        orderId: item.order_id,
        nextStatus: newStatus,
      });
      setRejectReason("");
      setShowRejectModal(true);
      return;
    }

    // غير هيك (accepted/pending) → نستخدم الاندبوينت
    try {
      const action = newStatus === "accepted" ? "accept" : "accept"; // ما في "pending" أكشن عندك؛ خليه يرجع "accept" أو أعِد تحميل
      await callUpdateItemStatus({
        orderId: item.order_id,
        itemId: item.order_item_id,
        action, // "accept"
      });
      await loadItems(filter);
    } catch (err) {
      console.error(err);
      // رجّع القائمة القديمة
      await loadItems(filter);
      alert(err.message);
    }
  };

  // حفظ الرفض من المودال
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

  // إلغاء المودال (ما نحفظ شيء)
  const cancelReject = async () => {
    setShowRejectModal(false);
    setPendingChange(null);
    setRejectReason("");
    // لإرجاع قيمة السيلكت كما كانت، أسهل حل: أعد التحميل
    await loadItems(filter);
  };

  const visibleItems = items.slice(0, visibleCount);

  // 🎨 نفس ألوانك الأصلية
  const pageBg = isDarkMode ? "#242625" : "#f0f2f1";
  const innerBg = isDarkMode ? "#313131" : "#ffffff";
  const textColor = isDarkMode ? "#ffffff" : "#242625";
  const borderColor = isDarkMode ? "#f9f9f9" : "#ccc";
  const inputBg = isDarkMode ? "#666666" : "#ffffff";

  return (
    <div
      className="p-6 space-y-6"
      style={{ backgroundColor: pageBg, color: textColor }}
    >
      <h1 className="text-2xl font-bold mb-6">Order Management</h1>

      {/* Filter Buttons */}
      <div className="mb-6 flex flex-wrap gap-3">
        {Object.keys(STATUS_LABELS).map((key) => (
          <button
            key={key}
            onClick={() => {
              setFilter(key);
              setVisibleCount(4);
              loadItems(key);
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

      {/* Table */}
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
                </tr>
              </thead>
              <tbody>
                {visibleItems.map((item) => (
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
                        }}
                      >
                        {["pending", "accepted", "rejected"].map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}

                {items.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
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

      {/* ====== Reject Reason Modal ====== */}
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
