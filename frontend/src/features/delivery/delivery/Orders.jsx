import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchCompanyOrders,
  updateOrderStatus,
  updateOrderPaymentStatus,
} from "./DeliveryAPI";
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

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [currentStatus, setCurrentStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(6);
  const isDarkMode = useSelector((state) => state.deliveryTheme.darkMode);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await fetchCompanyOrders();
        const validOrders = data.filter((o) =>
          // eslint-disable-next-line no-prototype-builtins
          STATUS_FLOW.hasOwnProperty(o.status)
        );
        setOrders(validOrders);
        setFilteredOrders(validOrders);
      } catch (err) {
        setMessage("❌ " + err.message);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  useEffect(() => {
    if (filter === "all") setFilteredOrders(orders);
    else setFilteredOrders(orders.filter((o) => o.status === filter));
  }, [filter, orders]);

  const openStatusModal = (orderId, status) => {
    setCurrentOrderId(orderId);
    setCurrentStatus(status);
    setShowModal(true);
  };

  const handleUpdateStatus = async () => {
    const nextStatuses = STATUS_FLOW[currentStatus];
    if (!nextStatuses || nextStatuses.length === 0) return;

    const newStatus = nextStatuses[0];
    try {
      setUpdating(true);
      await updateOrderStatus(currentOrderId, newStatus);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === currentOrderId ? { ...o, status: newStatus } : o
        )
      );
      setShowModal(false);
      setMessage(`✅ Order #${currentOrderId} status updated to ${newStatus}`);
      setTimeout(() => setMessage(""), 2000);
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentUpdate = async (orderId) => {
    try {
      const result = await updateOrderPaymentStatus(orderId, "PAID");
      alert(result.message);

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, payment_status: result.order.payment_status }
            : o
        )
      );
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  if (!orders.length)
    return <p className="text-center mt-10"> No orders found.</p>;

  return (
    <div
      className="w-full mx-auto mt-10 p-6  rounded-2xl"
      style={{
        backgroundColor: isDarkMode ? "#242625" : "#f0f2f1",
        color: isDarkMode ? "#ffffff" : "#242625",
      }}
    >
      <h2 className="text-3xl font-extrabold  mb-6 text-center flex items-center justify-center gap-2">
        <FaBox
          className="text-3xl"
          style={{
            backgroundColor: isDarkMode ? "#242625" : "#f0f2f1",
            color: isDarkMode ? "#ffffff" : "#242625",
          }}
        />{" "}
        Company Orders
      </h2>

      {message && (
        <p
          className="text-center mb-4 font-medium  transition-all duration-300"
          style={{
            color: isDarkMode ? "#ffffff" : "#242625",
          }}
        >
          {message}
        </p>
      )}

      <div className="mb-6 flex flex-wrap gap-3 justify-center">
        {Object.keys(STATUS_LABELS).map((key) => (
          <button
            key={key}
            onClick={() => {
              setFilter(key);
              setVisibleCount(3);
            }}
            className="px-4 py-1 rounded-2xl transition-all duration-300 border shadow-md"
            style={{
              backgroundColor:
                filter === key
                  ? isDarkMode
                    ? "#307A59" // dark mode active button
                    : "#307A59" // light mode active button
                  : isDarkMode
                  ? "#666666" // dark mode inactive button
                  : "#ffffff", // light mode inactive button
              color:
                filter === key
                  ? "#ffffff" // active text is white
                  : isDarkMode
                  ? "#ffffff" // dark mode inactive text
                  : "#242625", // light mode inactive text
              borderColor:
                filter === key
                  ? isDarkMode
                    ? "#307A59"
                    : "#307A59"
                  : isDarkMode
                  ? "#999999"
                  : "#d1d5db", // gray-300
            }}
          >
            {STATUS_LABELS[key]}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrders.slice(0, visibleCount).map((o) => (
          <div
            key={o.id}
            className=" p-5 rounded-2xl shadow-md  flex flex-col justify-between"
            style={{
              backgroundColor: isDarkMode ? "#242625" : "#f0f2f1",
            }}
          >
            <div>
              <h3
                className="text-xl font-bold  mb-2"
                style={{
                  color: isDarkMode ? "#ffffff" : "#242625",
                }}
              >
                Order #{o.id}
              </h3>
              <p
                className="text-sm mb-1"
                style={{
                  color: isDarkMode ? "#ffffff" : "#242625",
                }}
              >
                Customer:{" "}
                <strong
                  style={{
                    color: isDarkMode ? "#ffffff" : "#242625",
                  }}
                >
                  {o.customer_id}
                </strong>
              </p>
              <p
                className="text-sm mb-1"
                style={{
                  color: isDarkMode ? "#ffffff" : "#242625",
                }}
              >
                Amount:{" "}
                <strong
                  style={{
                    color: isDarkMode ? "#ffffff" : "#242625",
                  }}
                >
                  {o.total_amount} $
                </strong>
              </p>
              <p
                className="text-sm mb-1"
                style={{
                  color: isDarkMode ? "#ffffff" : "#242625",
                }}
              >
                Status:{" "}
                <strong
                  className="capitalize "
                  style={{
                    color: isDarkMode ? "#ffffff" : "#242625",
                  }}
                >
                  {o.status.replace(/_/g, " ")}
                </strong>
              </p>
              <p
                className="text-sm mb-1"
                style={{
                  color: isDarkMode ? "#ffffff" : "#242625",
                }}
              >
                Payment:{" "}
                <strong
                  style={{
                    color: isDarkMode ? "#ffffff" : "#242625",
                  }}
                >
                  {o.payment_status}
                </strong>
              </p>
              {/* <p
                className="text-sm  mb-1"
                style={{
                  color: isDarkMode ? "#ffffff" : "#242625",
                }}
              >
                Address:{" "}
                <strong
                  style={{
                    color: isDarkMode ? "#ffffff" : "#242625",
                  }}
                >
                  {o.shipping_address}
                </strong>
              </p> */}
              <p
                className="text-xs  mt-2"
                style={{
                  color: isDarkMode ? "#ffffff" : "#242625",
                }}
              >
                Ordered At :{new Date(o.created_at).toLocaleString()}
              </p>
            </div>

            <div className="mt-4 flex gap-2">
              {STATUS_FLOW[o.status].length > 0 && (
                <button
                  onClick={() => openStatusModal(o.id, o.status)}
                  className="flex-1 py-2 rounded-lg transition-all duration-300"
                  style={{
                    backgroundColor: isDarkMode ? "#307A59" : "#307A59", // نفس اللون الأخضر
                    color: "#ffffff", // نص أبيض
                  }}
                >
                  {updating ? "Updating..." : "Update Status"}
                </button>
              )}

              <button
                onClick={() => navigate(`/delivery/dashboard/tracking/${o.id}`)}
                className="flex-1 py-2 rounded-lg transition-all duration-300"
                style={{
                  backgroundColor: isDarkMode ? "#307A59" : "#307A59", // نفس لون الأزرار
                  color: "#ffffff",
                }}
              >
                Track
              </button>
              <button
                onClick={() => handlePaymentUpdate(o.id)}
                disabled={o.payment_status === "paid"}
                className="py-1 px-3 rounded"
                style={{
                  backgroundColor: isDarkMode ? "#307A59" : "#307A59",
                  color: "#ffffff",
                  opacity: o.payment_status === "paid" ? 0.5 : 1,
                  cursor:
                    o.payment_status === "paid" ? "not-allowed" : "pointer",
                }}
              >
                Mark as Paid
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {visibleCount < filteredOrders.length && (
        <div className="text-center mt-6">
          <button
            onClick={() => setVisibleCount((prev) => prev + 3)}
            className="px-6 py-2 rounded-lg transition-all duration-300"
            style={{
              backgroundColor: isDarkMode ? "#307A59" : "#307A59", // زر أخضر من الثيم
              color: "#ffffff", // نص أبيض
            }}
          >
            Load More
          </button>
        </div>
      )}

      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <div
            style={{
              backgroundColor: isDarkMode ? "#242625" : "#f0f2f1",
              color: isDarkMode ? "#ffffff" : "#242625",
              padding: "1.5rem",
              borderRadius: "1rem",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
              width: "24rem",
              position: "relative",
              transition: "all 0.3s ease",
              transform: "scale(1)",
            }}
          >
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: "absolute",
                top: "0.75rem",
                right: "0.75rem",
                color: isDarkMode ? "#f0f2f1" : "#555",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              <FaTimes
                size={20}
                style={{
                  color: isDarkMode ? "#f0f2f1" : "#555",
                }}
              />
            </button>

            <h3
              style={{
                fontSize: "1.25rem",
                fontWeight: "bold",
                marginBottom: "1rem",
                color: isDarkMode ? "#ffffff" : "#242625",
              }}
            >
              Edit Order Status
            </h3>

            <p
              style={{
                marginBottom: "1rem",
                color: isDarkMode ? "#f0f2f1" : "#444",
              }}
            >
              Current status:{" "}
              <strong>{currentStatus.replace(/_/g, " ")}</strong>
            </p>

            {STATUS_FLOW[currentStatus].length > 0 ? (
              <button
                onClick={handleUpdateStatus}
                disabled={updating}
                style={{
                  width: "100%",
                  padding: "0.5rem 0",
                  borderRadius: "0.5rem",
                  fontWeight: "600",
                  color: "#fff",
                  backgroundColor: updating ? "#999" : "#307A59",
                  cursor: updating ? "not-allowed" : "pointer",
                  transform: updating ? "none" : "scale(1)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  if (!updating)
                    e.currentTarget.style.backgroundColor = "#256d4d";
                }}
                onMouseLeave={(e) => {
                  if (!updating)
                    e.currentTarget.style.backgroundColor = "#307A59";
                }}
              >
                {updating
                  ? "Updating..."
                  : `Change Status to ${STATUS_FLOW[currentStatus][0]
                      .replace(/_/g, " ")
                      .toUpperCase()}`}
              </button>
            ) : (
              <p
                style={{
                  color: isDarkMode ? "#ccc" : "#777",
                  textAlign: "center",
                }}
              >
                No further status change allowed.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
