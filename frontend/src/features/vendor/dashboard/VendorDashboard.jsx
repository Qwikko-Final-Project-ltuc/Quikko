import React, { useEffect, useState } from "react";
import { fetchOrders, fetchProducts } from "../VendorAPI2";
import { DollarSign, ShoppingCart, Package, Bell } from "lucide-react";

const Dashboard = () => {
  const [report, setReport] = useState(null);
  const [productsCount, setProductsCount] = useState(0);
  const [orders, setOrders] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [status, setStatus] = useState("loading");

  const calculateTotalSales = (orders) => {
    return orders.reduce(
      (sum, order) => sum + parseFloat(order.total_amount || 0),
      0
    );
  };

  const fetchReport = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/vendor/reports", {
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
      const data = await fetchOrders();
      const uniqueOrders = Object.values(
        data.reduce((acc, order) => {
          acc[order.order_id] = order;
          return acc;
        }, {})
      );
      setOrders(uniqueOrders.slice(0, 5));
    } catch (err) {
      console.error("❌ Error fetching last orders:", err);
      setOrders([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setStatus("loading");
      await Promise.all([fetchReport(), fetchProductsCount(), fetchLastOrders()]);
      setStatus("idle");
    };
    loadData();

    const handleStorageChange = () => {
      setIsDarkMode(localStorage.getItem("theme") === "dark");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

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
  const tableLineColor = isDarkMode ? "#f9f9f9" : "#ccc";
  const iconColor = isDarkMode ? "#ffffff" : "#307A59";

  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundColor: isDarkMode ? "var(--bg-dark)" : "var(--bg)",
        color: "var(--text)",
     padding: "3rem", }}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 py-6 md:py-10 space-y-10">
        {/* Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* كل كارد */}
          {[
            {
              title: "Total Sales",
              value: `$${report?.total_sales || 0}`,
              icon: <DollarSign className="w-10 h-10" style={{ color: iconColor }} />,
            },
            {
              title: "Orders Count",
              value: report?.total_orders || 0,
              icon: <ShoppingCart className="w-10 h-10" style={{ color: iconColor }} />,
            },
            {
              title: "Active Products",
              value: productsCount,
              icon: <Package className="w-10 h-10" style={{ color: iconColor }} />,
            },
            {
              title: "New Notifications",
              value: 0,
              icon: <Bell className="w-10 h-10" style={{ color: iconColor }} />,
            },
          ].map((card, idx) => (
            <div
              key={idx}
              className="p-5 sm:p-6 rounded-2xl shadow flex flex-col sm:flex-row items-center justify-between gap-3"
              style={{ backgroundColor: innerBg }}
            >
              <div className="text-center sm:text-left">
                <p style={{ color: textColor }}>{card.title}</p>
                <h2 style={{ color: textColor }} className="text-2xl font-bold">
                  {card.value}
                </h2>
              </div>
              {card.icon}
            </div>
          ))}
        </div>

        {/* Last Orders Table */}
        <div
          className="p-4 sm:p-6 rounded-2xl shadow overflow-x-auto"
          style={{ backgroundColor: innerBg, color: textColor }}
        >
          <h2 style={{ color: textColor }} className="text-lg font-bold mb-4">
            Latest Orders
          </h2>
          <table className="w-full border-collapse text-sm sm:text-base text-center min-w-[600px]">
            <thead>
              <tr style={{ borderBottom: `1px solid ${tableLineColor}` }}>
                <th className="p-2">Order ID</th>
                <th className="p-2">Status</th>
                <th className="p-2">Total</th>
                <th className="p-2">Address</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.order_id}
                  style={{
                    borderBottom: `1px solid ${tableLineColor}`,
                    color: textColor,
                    backgroundColor: "transparent",
                  }}
                >
                  <td className="p-2">{order.order_id}</td>
                  <td className="p-2">{order.status}</td>
                  <td className="p-2">${order.total_amount}</td>
                  <td className="p-2">
                    {(() => {
                      try {
                        const addr =
                          typeof order.shipping_address === "string"
                            ? JSON.parse(order.shipping_address)
                            : order.shipping_address;
                        return (
                          <>
                            {addr.address_line1},{" "}
                            {addr.address_line2 && addr.address_line2 + ", "}
                            {addr.city}, {addr.country}
                          </>
                        );
                      } catch {
                        return order.shipping_address;
                      }
                    })()}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="p-4 text-center italic"
                    style={{ color: textColor }}
                  >
                    No recent orders
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
