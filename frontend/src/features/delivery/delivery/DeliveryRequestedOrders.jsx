// DeliveryRequestedOrders.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getRequestedOrders, acceptOrder } from "./services/deliveryService";

const DeliveryRequestedOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const isDarkMode = useSelector((s) => s.deliveryTheme.darkMode);

  const themeOverrides = isDarkMode
    ? {
        "--bg": "#0f1115",
        "--text": "#f5f7fb",
        "--border": "#2a2f3a",
        "--light-gray": "#aeb6c2",
        "--hover": "#1a1f29",
        "--textbox": "#151923",
        "--button": "#026a4b",
        "--success": "#22c55e",
        "--warning": "#f59e0b",
      }
    : {
        "--bg": "#f5f6f5",
        "--text": "#17202a",
        "--border": "#e1e5ea",
        "--light-gray": "#6b7280",
        "--hover": "#eaf2ff",
        "--textbox": "#f0f4f8",
        "--button": "#026a4b",
        "--success": "#16a34a",
        "--warning": "#f59e0b",
      };

  // Custom Toast Function
  const showToast = (message, type = "info") => {
    // إنشاء عنصر toast ديناميكي
    const toast = document.createElement("div");
    toast.className = `fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white font-semibold transform transition-all duration-300 ${
      type === "success"
        ? "bg-green-500"
        : type === "error"
        ? "bg-red-500"
        : type === "warning"
        ? "bg-yellow-500"
        : "bg-blue-500"
    }`;
    toast.textContent = message;
    toast.style.zIndex = "9999";

    document.body.appendChild(toast);

    // إخفاء الـ toast بعد 4 ثواني
    setTimeout(() => {
      toast.style.transform = "translateX(100%)";
      toast.style.opacity = "0";
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 4000);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await getRequestedOrders();
      setOrders(data);
    } catch (error) {
      console.error("❌ Error loading orders:", error);
      showToast(" Failed to load orders. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      await acceptOrder(orderId);
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
      showToast("🎉 Order accepted successfully!", "success");
    } catch (error) {
      console.error("❌ Error accepting order:", error);
      showToast(`❌ Failed to accept order: ${error.message}`, "error");
    }
  };

  const SkeletonCard = () => (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)]/60 shadow-sm p-3 sm:p-4 animate-pulse">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 space-y-3">
          <div className="h-5 w-40 rounded bg-[var(--hover)]/40"></div>
          <div className="h-4 w-64 rounded bg-[var(--hover)]/30"></div>
          <div className="h-4 w-56 rounded bg-[var(--hover)]/30"></div>
          <div className="h-4 w-60 rounded bg-[var(--hover)]/30"></div>
          <div className="h-4 w-48 rounded bg-[var(--hover)]/30"></div>
        </div>
        <div className="h-10 w-32 rounded-lg bg-[var(--hover)]/50"></div>
      </div>
    </div>
  );

  return (
    <div
      className="mx-auto max-w-6xl px-4 py-6"
      style={{ paddingTop: "900px", backgroundColor: "var(--bg)" }}
    >
      {/* ===== Header ===== */}
      <div
        className="
          mb-20 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between
          bg-[var(--bg)] rounded-2xl border border-[var(--border)] p-4
          shadow-sm
        "
        style={{ marginTop: "20px" }}
      >
        <div className="mt-20 pt-4 sm:mt-0">
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text)] tracking-tight">
            Requested Orders
          </h1>
          <p className="text-xs sm:text-sm text-[var(--light-gray)]">
            Review and accept new orders quickly
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <span
            className="
              inline-flex items-center justify-center gap-2 rounded-full
              border border-[var(--border)]
              px-3 py-1 text-xs sm:text-sm font-semibold
              text-[var(--text)]
            "
          >
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: "var(--warning)" }}
            />
            {loading ? "Loading…" : `${orders.length} pending`}
          </span>

          <button
            onClick={loadOrders}
            className="
              rounded-xl px-4 py-2 font-semibold
              text-white hover:brightness-110 active:scale-95 shadow-sm
              w-full sm:w-auto
            "
            style={{ backgroundColor: "var(--button)" }}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* ===== Content ===== */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : orders.length === 0 ? (
        <div
          className="
            text-center py-10 sm:py-12 rounded-2xl
            border border-[var(--border)] bg-[var(--bg)]/60 shadow-sm
          "
        >
          <div
            className="mx-auto mb-3 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: "var(--hover)" }}
          >
            <span className="text-xl sm:text-2xl">📭</span>
          </div>
          <p className="text-sm sm:text-lg text-[var(--light-gray)] mb-3">
            No requested orders available
          </p>
          <button
            onClick={loadOrders}
            className="
              rounded-xl px-4 py-2 font-semibold text-white hover:brightness-110 active:scale-95 shadow-sm
              w-full sm:w-auto
            "
            style={{ backgroundColor: "var(--button)" }}
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {orders.map((order) => (
            <div
              key={order.id}
              className="
                group rounded-2xl border border-[var(--border)]
                bg-[var(--bg)]/70 p-3 sm:p-4 shadow-sm
                hover:shadow-md hover:-translate-y-0.5
                transition-transform
              "
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-[var(--text)]">
                    Order #{order.id}
                  </h3>
                  <span
                    className="
                      inline-flex items-center gap-2 rounded-full px-2.5 py-1
                      text-[10px] sm:text-xs font-semibold border border-[var(--border)]
                      text-[var(--text)]
                    "
                  >
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: "var(--warning)" }}
                    />
                    Requested
                  </span>
                </div>

                <button
                  onClick={() => handleAcceptOrder(order.id)}
                  className="
                    hidden sm:inline-flex
                    rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm
                    hover:brightness-110 active:scale-95
                  "
                  style={{ backgroundColor: "var(--button)" }}
                >
                  Accept Order
                </button>
              </div>

              <div className="grid gap-1 text-[var(--text)] text-sm sm:text-base">
                <p className="text-[var(--light-gray)]">
                  Customer:
                  <span className="ml-1 text-[var(--text)] font-medium">
                    {order.customer_name}
                  </span>
                </p>
                <p className="text-[var(--light-gray)]">
                  Phone:
                  <span className="ml-1 text-[var(--text)] font-medium">
                    {order.customer_phone}
                  </span>
                </p>
                <p className="text-[var(--light-gray)]">
                  Address:
                  <span className="ml-1 text-[var(--text)] font-medium">
                    {order.address_line1}, {order.city}
                  </span>
                </p>
                <p className="text-[var(--light-gray)]">
                  Items:
                  <span className="ml-1 text-[var(--text)] font-medium">
                    {order.items_count} products ({order.total_quantity} units)
                  </span>
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-3">
                  <span
                    className="
                      rounded-lg border border-[var(--border)]
                      px-2.5 py-1
                      text-xs sm:text-sm text-[var(--text)] font-semibold
                    "
                    title="Delivery Fee"
                  >
                    Fee: ${order.delivery_fee}
                  </span>
                  <span
                    className="
                      rounded-lg border border-[var(--border)]
                      px-2.5 py-1
                      text-xs sm:text-sm text-[var(--text)] font-semibold
                    "
                    title="Final Amount"
                  >
                    Total: ${order.total_amount}
                  </span>
                </div>
              </div>

              {/* زر الموبايل فقط — آخر الكارد */}
              <button
                onClick={() => handleAcceptOrder(order.id)}
                className="
                  sm:hidden mt-3
                  w-full rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm
                  hover:brightness-110 active:scale-95
                "
                style={{ backgroundColor: "var(--button)" }}
              >
                Accept Order
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryRequestedOrders;
