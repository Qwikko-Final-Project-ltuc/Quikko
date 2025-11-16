import React, { useEffect, useState } from "react";
import { fetchOrders, fetchProducts, fetchUnreadCount } from "../VendorAPI2";
import { DollarSign, ShoppingCart, Package, Bell, MapPin } from "lucide-react";
import Footer from "../../customer/customer/components/layout/Footer";

const Dashboard = () => {
  const [report, setReport] = useState(null);
  const [productsCount, setProductsCount] = useState(0);
  const [orders, setOrders] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0); // عدد الاشعارات
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") === "dark");
  const [status, setStatus] = useState("loading");

  const calculateTotalSales = (orders) => {
    return orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
  };

  const fetchReport = async () => {
    try {
      const res = await fetch("https://qwikko.onrender.com/api/vendor/reports", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const json = await res.json();

      if (json.success) {
        const ordersData = await fetchOrders();
        const totalSales = calculateTotalSales(ordersData);
        setReport({
          ...json.data,
          total_sales: totalSales.toFixed(2),
        });
      }
    } catch (err) {
      console.error("❌ Error fetching report:", err);
    }
  };

  const fetchProductsCount = async () => {
    const products = await fetchProducts();
    setProductsCount(products.length);
  };

const fetchLastOrders = async () => {
  try {
    const data = await fetchOrders(); // جلب الأوردرات من API
    if (!data || !Array.isArray(data)) return setOrders([]);

    // ترتيب حسب order_created_at نزولي (أحدث أول)
    const sortedOrders = data.sort(
      (a, b) => new Date(b.order_created_at) - new Date(a.order_created_at)
    );

    // خذ آخر 6 أوردرات مباشرة
    setOrders(sortedOrders.slice(0, 6));
  } catch (err) {
    console.error("❌ Error fetching last orders:", err);
    setOrders([]);
  }
};


  const fetchNotificationsCount = async () => {
    try {
      const count = await fetchUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error("❌ Error fetching unread notifications:", err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setStatus("loading");
      await Promise.all([
        fetchReport(),
        fetchProductsCount(),
        fetchLastOrders(),
        fetchNotificationsCount(),
      ]);
      setStatus("idle");
    };
    loadData();

    const handleStorageChange = () => {
      setIsDarkMode(localStorage.getItem("theme") === "dark");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const formatAddress = (shippingAddress) => {
    try {
      const addr = typeof shippingAddress === "string" ? JSON.parse(shippingAddress) : shippingAddress;
      return (
        <>
          {addr.address_line1}
          {addr.address_line2 && `, ${addr.address_line2}`}
          {addr.city && `, ${addr.city}`}
          {addr.country && `, ${addr.country}`}
        </>
      );
    } catch {
      return shippingAddress || "No address provided";
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      shipped: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
      processing: "bg-purple-100 text-purple-800",
    };
    return statusColors[status?.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--button)] mx-auto mb-4"></div>
          <p className="text-[var(--text)] text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const innerBg = isDarkMode ? "#313131" : "#ffffff";
  const textColor = isDarkMode ? "#ffffff" : "#242625";
  const cardBg = isDarkMode ? "#424242" : "#f8f9fa";
  const borderColor = isDarkMode ? "#555" : "#e5e5e5";
  const iconColor = isDarkMode ? "#ffffff" : "#307A59";

  const OrderCard = ({ order }) => (
    <div className="border rounded-xl p-4 transition-all duration-300 hover:shadow-lg" style={{ backgroundColor: cardBg, borderColor, color: textColor }}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg" style={{ color: "#307A59" }}>Order #{order.order_id}</h3>
          <p className="text-sm" style={{ color: isDarkMode ? "#cccccc" : "#666666" }}>
            {new Date(order.order_created_at || Date.now()).toLocaleDateString()}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
          {order.order_status || "Unknown"}
        </span>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total Amount</span>
          <span className="font-bold text-lg" style={{ color: "#307A59" }}>
            ${parseFloat(order.total_amount || 0).toFixed(2)}
          </span>
        </div>

        <div className="flex items-start gap-2 text-sm">
          <MapPin size={14} className="mt-0.5 flex-shrink-0" style={{ color: iconColor }} />
          <span className="line-clamp-2" title={formatAddress(order.shipping_address)}>
            {formatAddress(order.shipping_address)}
          </span>
        </div>
      </div>

      {(order.customer_name || order.customer_email) && (
        <div className="pt-2 border-t text-sm" style={{ borderColor }}>
          {order.customer_name && (
            <div className="flex justify-between">
              <span style={{ color: isDarkMode ? "#cccccc" : "#666666" }}>Customer:</span>
              <span>{order.customer_name}</span>
            </div>
          )}
          {order.customer_email && (
            <div className="flex justify-between">
              <span style={{ color: isDarkMode ? "#cccccc" : "#666666" }}>Email:</span>
              <span className="truncate ml-2" title={order.customer_email}>{order.customer_email}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: isDarkMode ? "var(--bg-dark)" : "var(--bg)", color: "var(--text)" }}>
      <main className="flex-grow">
        <div className="max-w-screen-xl mx-4 sm:mx-8 lg:mx-12 mt-18 mb-18 px-4 sm:px-6 md:px-10 lg:px-12 py-6 md:py-10 space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { title: "Total Sales", value: `$${report?.total_sales || 0}`, icon: <DollarSign className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: "#307A59" }} />, description: "Total revenue" },
              { title: "Orders Count", value: report?.total_orders || 0, icon: <ShoppingCart className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: "#307A59" }} />, description: "Total orders" },
              { title: "Active Products", value: productsCount, icon: <Package className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: "#307A59" }} />, description: "Products listed" },
              { title: "Notifications", value: unreadCount, icon: <Bell className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: "#307A59" }} />, description: "New alerts" },
            ].map((card, idx) => (
              <div key={idx} className="p-4 sm:p-6 rounded-2xl border shadow-sm transition-all duration-300 hover:shadow-md" style={{ backgroundColor: innerBg, borderColor }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm sm:text-base font-medium">{card.title}</p>
                    <p className="text-xs" style={{ color: isDarkMode ? "#cccccc" : "#666666" }}>{card.description}</p>
                  </div>
                  {card.icon}
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: "#307A59" }}>{card.value}</h2>
              </div>
            ))}
          </div>

          <div className="p-4 sm:p-6 border rounded-2xl shadow-sm" style={{ backgroundColor: innerBg, borderColor }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg sm:text-xl font-bold" style={{ color: textColor }}>Latest Orders</h2>
              <span className="text-sm px-3 py-1 rounded-full" style={{ backgroundColor: isDarkMode ? '#444' : '#f5f5f5', color: textColor }}>
                {orders.length} order{orders.length !== 1 ? 's' : ''}
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-8" style={{ color: isDarkMode ? "#cccccc" : "#666666" }}>
                <ShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">No recent orders</p>
                <p className="text-sm">New orders will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {orders.map((order) => <OrderCard key={order.order_id} order={order} />)}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="w-full bg-[var(--footer-bg)] mt-auto">
        <Footer />
      </footer>
    </div>
  );
};

export default Dashboard;
