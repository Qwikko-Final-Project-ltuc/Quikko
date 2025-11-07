import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
import {
  fetchOrderItems,
  updateOrderItemStatus,
  fetchOrderItemsWithCompany as _fetchOrderItemsWithCompany,
} from "../VendorAPI2";
// import { getUserIdFromToken } from "../chat/auth";

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

  // const navigate = useNavigate();
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

            {/* Show More Button */}
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