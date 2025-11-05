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
    fetchReport();
    fetchProductsCount();
    fetchLastOrders();

    const handleStorageChange = () => {
      setIsDarkMode(localStorage.getItem("theme") === "dark");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const pageBg = isDarkMode ? "#242625" : "#f0f2f1";
  const innerBg = isDarkMode ? "#313131" : "#ffffff";
  const textColor = isDarkMode ? "#ffffff" : "#242625";
  const tableLineColor = isDarkMode ? "#f9f9f9" : "#ccc";
  const inputBg = isDarkMode ? "#f9f9f9" : "#f9f9f9";
  const iconColor = isDarkMode ? "#ffffff" : "#307A59";

  return (
    <div
      className="p-6 space-y-6 min-h-screen"
      style={{ backgroundColor: pageBg, color: textColor }}
    >
      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div
          className="p-6 rounded-2xl shadow flex items-center justify-between"
          style={{ backgroundColor: innerBg }}
        >
          <div>
            <p  style={{ color: textColor }}>Total Sales</p>
            <h2 style={{ color: textColor }} className="text-2xl font-bold">
              ${report?.total_sales || 0}
            </h2>
          </div>
          <DollarSign className="w-10 h-10" style={{ color: iconColor }} />
        </div>

        <div
          className="p-6 rounded-2xl shadow flex items-center justify-between"
          style={{ backgroundColor: innerBg }}
        >
          <div>
            <p style={{ color: textColor }}>Orders Count</p>
            <h2 style={{ color: textColor }} className="text-2xl font-bold">
              {report?.total_orders || 0}
            </h2>
          </div>
          <ShoppingCart className="w-10 h-10" style={{ color: iconColor }} />
        </div>

        <div
          className="p-6 rounded-2xl shadow flex items-center justify-between"
          style={{ backgroundColor: innerBg }}
        >
          <div>
            <p style={{ color: textColor }}>Active Products</p>
            <h2 style={{ color: textColor }} className="text-2xl font-bold">
              {productsCount}
            </h2>
          </div>
          <Package className="w-10 h-10" style={{ color: iconColor }} />
        </div>

        <div
          className="p-6 rounded-2xl shadow flex items-center justify-between"
          style={{ backgroundColor: innerBg }}
        >
          <div>
            <p style={{ color: textColor }}>New Notifications</p>
            <h2 style={{ color: textColor }} className="text-2xl font-bold">
              0
            </h2>
          </div>
          <Bell className="w-10 h-10" style={{ color: iconColor }} />
        </div>
      </div>

      {/* Last Orders Table */}
      <div
        className="p-6 rounded-2xl shadow"
        style={{ backgroundColor: innerBg, color: textColor }}
      >
        <h2 style={{ color: textColor }} className="text-lg font-bold mb-4">
          Latest Orders
        </h2>
        <table className="w-full border-collapse text-center">
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
                <td className="p-2">{order.shipping_address}</td>
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
  );
};

export default Dashboard;
