import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchOrderItems,
  updateOrderItemStatus,
  fetchOrderItemsWithCompany as _fetchOrderItemsWithCompany,
} from "../VendorAPI2";
import { getUserIdFromToken } from "../chat/auth";

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

  const navigate = useNavigate();
  const allowedStatuses = ["pending", "accepted", "rejected"];

  // ✅ لو الدالة الجديدة موجودة سنستخدمها، وإلا نرجع للقديمة
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

    const handleStorageChange = () => {
      setIsDarkMode(localStorage.getItem("theme") === "dark");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleStatusChange = async (itemId, newStatus) => {
    if (!allowedStatuses.includes(newStatus)) return;
    await updateOrderItemStatus(itemId, newStatus);
    loadItems(filter);
  };

  const visibleItems = items.slice(0, visibleCount);

  // 🎨 نفس ألوانك الأصلية (بدون تعديل على الديزاين)
  const pageBg = isDarkMode ? "#242625" : "#f0f2f1";
  const innerBg = isDarkMode ? "#666666" : "#ffffff";
  const textColor = isDarkMode ? "#ffffff" : "#242625";
  const borderColor = isDarkMode ? "#f9f9f9" : "#ccc";
  const inputBg = isDarkMode ? "#666666" : "#ffffff";

  // ✅ helper: نختار اسم الشركة (string فقط) و userId للشات
  const pickCompanyFields = (row) => {
    const nameCandidates = [
      row?.delivery_company_name, // من /vendor/orders بعد JOIN
      row?.deliveryCompanyName, // احتمال camelCase
      row?.company_name, // بعض الـ APIs
      // row?.delivery_company     // غالباً ID، نتجاهله كاسم
    ];
    const companyName =
      nameCandidates.find(
        (v) => typeof v === "string" && v.trim().length > 0
      ) || null;

    const userIdCandidates = [
      row?.delivery_company_user_id,
      row?.deliveryCompanyUserId,
      row?.delivery_user_id,
    ];
    const deliveryUserIdRaw = userIdCandidates.find(
      (v) => v !== undefined && v !== null
    );
    const deliveryUserId = Number.isFinite(Number(deliveryUserIdRaw))
      ? Number(deliveryUserIdRaw)
      : null;

    return { companyName, deliveryUserId };
  };

  // 👇 زر فتح الشات مع شركة التوصيل (داخل الدالة، مش خارجها)
  const openChatWithDelivery = (deliveryUserId, companyName, orderId) => {
    if (!deliveryUserId) return; // لا يوجد شركة مرتبطة
    const me = Number(getUserIdFromToken()); // الفندور (المرسل)
    navigate("/vendor/chat", {
      state: {
        senderId: me, // 👈 الفندور (اختياري؛ صفحة الشات أصلاً تقرأ من التوكن)
        receiverId: Number(deliveryUserId), // 👈 الدلفري
        toUserId: Number(deliveryUserId), // لو شاشتك تعتمد هذا الاسم
        toName: companyName || "Delivery",
        chatType: "vendor_to_delivery",
        context: { orderId },
      },
    });
  };

  return (
    <div
      className="p-6 space-y-6"
      style={{ backgroundColor: pageBg, color: textColor }}
    >
      <h1 className="text-2xl font-bold mb-6 text-center">Order Management</h1>

      {/* Filter Buttons */}
      <div className="mb-6 flex flex-wrap gap-3 justify-center">
        {Object.keys(STATUS_LABELS).map((key) => (
          <button
            key={key}
            onClick={() => {
              setFilter(key);
              setVisibleCount(4); // إعادة الضبط عند تغيير الفلتر
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

      {/* Orders Table */}
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
                  <th className="p-2">Delivery Company</th> {/* جديد */}
                  <th className="p-2">Quantity</th>
                  <th className="p-2">Vendor Status</th>
                  <th className="p-2">Chat</th> {/* جديد */}
                </tr>
              </thead>
              <tbody>
                {visibleItems.map((item) => {
                  const { companyName, deliveryUserId } =
                    pickCompanyFields(item);

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

                      {/* اسم شركة التوصيل (string فقط) */}
                      <td className="p-2">
                        <span
                          className="inline-block px-2 py-1 rounded-md"
                          style={{
                            backgroundColor: isDarkMode ? "#5a5a5a" : "#f6f6f6",
                            color: textColor,
                            border: `1px solid ${borderColor}`,
                          }}
                          title={companyName || "-"}
                        >
                          {companyName || "-"}
                        </span>
                      </td>

                      <td className="p-2">{item.quantity}</td>
                      <td className="p-2">
                        <select
                          value={item.vendor_status}
                          onChange={(e) =>
                            handleStatusChange(
                              item.order_item_id,
                              e.target.value
                            )
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

                      {/* زر الشات */}
                      <td className="p-2">
                        <button
                          onClick={() =>
                            openChatWithDelivery(
                              deliveryUserId,
                              companyName,
                              item.order_id
                            )
                          }
                          disabled={!deliveryUserId}
                          className="px-3 py-1 rounded-md transition"
                          style={{
                            backgroundColor: deliveryUserId
                              ? "#307A59"
                              : "#9aa2a1",
                            color: "#ffffff",
                            cursor: deliveryUserId ? "pointer" : "not-allowed",
                          }}
                          aria-label="Open chat with delivery company"
                          title={
                            deliveryUserId
                              ? `Chat with ${companyName || "Delivery"}`
                              : "No delivery company assigned"
                          }
                        >
                          Chat
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {items.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="p-4 text-center italic"
                      style={{ color: "#f9f9f9" }}
                    >
                      No items found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Show More Button (نفسها) */}
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
    </div>
  );
}
