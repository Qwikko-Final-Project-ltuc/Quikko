import { useState, useEffect } from "react";
import { fetchDeliveryReport } from "./DeliveryAPI";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  FaClock,
  FaCheck,
  FaDollarSign,
  FaUsers,
  FaStore,
} from "react-icons/fa";
import { useSelector } from "react-redux";

export default function DeliveryReports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [days, setDays] = useState(30);
  const isDarkMode = useSelector((state) => state.deliveryTheme.darkMode);

  const [topCount, setTopCount] = useState(3);

  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoading(true);
        const data = await fetchDeliveryReport(days);
        setReport(data);
      } catch (err) {
        setError(err.message || "Failed to load report");
      } finally {
        setLoading(false);
      }
    };
    loadReport();
  }, [days]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;
  if (!report)
    return <p className="text-center mt-10">No report data available</p>;

  const ordersData = report.daily_orders || report.orders_over_time || [];
  const topCustomers = report?.top_customers?.slice(0, topCount) || [];
  const topVendors = report?.top_vendors?.slice(0, topCount) || [];

  return (
    <div
      style={{
        backgroundColor: isDarkMode ? "#242625" : "#f0f2f1",
        color: isDarkMode ? "#ffffff" : "#242625",
        minHeight: "100vh",
      }}
      className="p-8 max-w-7xl mx-auto space-y-10 transition-colors"
    >
      <h1
        style={{
          color: isDarkMode ? "#f9f9f9" : "#307A59",
        }}
        className="text-4xl font-bold text-center mb-8"
      >
        Delivery Performance Dashboard
      </h1>

      <div className="flex justify-center items-center gap-4 mb-10">
        <label className="font-semibold text-lg">Select period:</label>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="border rounded-lg px-4 py-2  shadow-sm transition "
          style={{
            color: isDarkMode ? "#242625" : "#242625",
            backgroundColor: isDarkMode ? "#f9f9f9" : "#f9f9f9",
          }}
        >
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 3 months</option>
          <option value={180}>Last 6 months</option>
        </select>
      </div>

      {/* 📈 الرسم البياني */}
      <div
        style={{
          backgroundColor: isDarkMode ? "#666666" : "#ffffff",
          color: isDarkMode ? "#ffffff" : "#242625",
        }}
        className="p-6 rounded-2xl shadow-lg"
      >
        <h2
          style={{
            color: isDarkMode ? "#f9f9f9" : "#307A59",
          }}
          className="text-2xl font-semibold mb-4"
        >
          Orders Over Time
        </h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={ordersData} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="order_date" />
            <YAxis />
            <Tooltip />
            <Bar
              dataKey="orders_count"
              fill={isDarkMode ? "#f9f9f9" : "#307A59"}
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          style={{
            backgroundColor: isDarkMode ? "#307A59" : "#d3f3e2",
            color: isDarkMode ? "#ffffff" : "#242625",
          }}
          className="p-6 rounded-2xl shadow flex flex-col items-center"
        >
          <FaCheck
            style={{ color: isDarkMode ? "#ffffff" : "#307A59" }}
            className="text-4xl mb-2"
          />
          <h2 className="text-lg font-semibold">Total Orders</h2>
          <p className="text-3xl font-bold">{report.totals.total_orders}</p>
        </div>

        <div
          style={{
            backgroundColor: isDarkMode ? "#307A59" : "#e6f4ea",
            color: isDarkMode ? "#ffffff" : "#242625",
          }}
          className="p-6 rounded-2xl shadow flex flex-col items-center"
        >
          <FaDollarSign
            style={{ color: isDarkMode ? "#ffffff" : "#307A59" }}
            className="text-4xl mb-2"
          />
          <h2 className="text-lg font-semibold">Total Revenue</h2>
          <p className="text-3xl font-bold">${report.totals.total_amount}</p>
        </div>
        <div
          style={{
            backgroundColor: isDarkMode ? "#993333" : "#fde2e2",
            color: isDarkMode ? "#ffffff" : "#242625",
          }}
          className="p-6 rounded-2xl shadow flex flex-col items-center"
        >
          <FaClock
            style={{ color: isDarkMode ? "#ffffff" : "#cc0000" }}
            className="text-4xl mb-2"
          />
          <h2 className="text-lg font-semibold">Pending Orders</h2>
          <p className="text-3xl font-bold">{report.pending_count}</p>
        </div>
      </div>

      <div
        style={{
          backgroundColor: isDarkMode ? "#666666" : "#ffffff", // dark.div / light.div
          padding: "1.5rem",
          borderRadius: "1rem",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "600",
            marginBottom: "1.5rem",
            color: isDarkMode ? "#ffffff" : "#242625", // dark.text / light.text
          }}
        >
          Payment Status
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: "1rem",
          }}
        >
          {Object.entries(report.payment_status).map(([key, val]) => (
            <div
              key={key}
              style={{
                backgroundColor: isDarkMode ? "#242625" : "#f9f9f9", // dark.background / light.textbox
                padding: "1rem",
                borderRadius: "0.75rem",
                textAlign: "center",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              <p
                style={{
                  fontWeight: "600",
                  textTransform: "capitalize",
                  color: isDarkMode ? "#f9f9f9" : "#242625", // dark.text / light.text
                  marginBottom: "0.5rem",
                }}
              >
                {key}
              </p>
              <p
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  color: isDarkMode ? "#e2fcf0ff" : "#307A59", // dark.button / light.button
                }}
              >
                {val}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          backgroundColor: isDarkMode ? "#666666" : "#ffffff", // dark.div / light.div
          padding: "1.5rem",
          borderRadius: "1rem",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "600",
            marginBottom: "1.5rem",
            color: isDarkMode ? "#ffffff" : "#242625", // dark.text / light.text
          }}
        >
          Order Status
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: "1rem",
          }}
        >
          {Object.entries(report.statuses).map(([key, val]) => (
            <div
              key={key}
              style={{
                backgroundColor: isDarkMode ? "#242625" : "#f9f9f9", // dark.background / light.textbox
                padding: "1rem",
                borderRadius: "0.75rem",
                textAlign: "center",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              <p
                style={{
                  fontWeight: "600",
                  textTransform: "capitalize",
                  color: isDarkMode ? "#f9f9f9" : "#242625", // dark.text / light.text
                  marginBottom: "0.5rem",
                }}
              >
                {key.replace(/_/g, " ")}
              </p>
              <p
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  color: isDarkMode ? "#ffffffff" : "#307A59", // dark.button / light.button
                }}
              >
                {val}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          backgroundColor: isDarkMode ? "#666666" : "#ffffff", // dark.div / light.div
          padding: "1.5rem",
          borderRadius: "1rem",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "600",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: isDarkMode ? "#ffffff" : "#242625", // dark.text / light.text
          }}
        >
          <FaUsers />
          Top Customers
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
          }}
        >
          {report.top_customers.slice(0, 3).map((c) => (
            <div
              key={c.customer_id}
              style={{
                backgroundColor: isDarkMode ? "#242625" : "#f9f9f9", // dark.background / light.textbox
                padding: "1rem",
                borderRadius: "0.75rem",
                textAlign: "center",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              <p
                style={{
                  fontWeight: "600",
                  color: isDarkMode ? "#f9f9f9" : "#242625", // dark.text / light.text
                  marginBottom: "0.5rem",
                }}
              >
                {c.customer_email}
              </p>
              <p
                style={{
                  fontWeight: "500",
                  color: isDarkMode ? "#ffffffff" : "#307A59", // dark.button / light.button
                  marginBottom: "0.25rem",
                }}
              >
                Orders: {c.orders_count}
              </p>
              <p
                style={{
                  fontWeight: "500",
                  color: isDarkMode ? "#ffffffff" : "#307A59",
                }}
              >
                Total Spent: ${c.total_amount}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          backgroundColor: isDarkMode ? "#666666" : "#ffffff",
          color: isDarkMode ? "#ffffff" : "#242625",
          padding: "1.5rem",
          borderRadius: "1rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "600",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: isDarkMode ? "#ffffff" : "#242625",
          }}
        >
          <FaStore /> Top Vendors
        </h2>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {report.top_vendors.slice(0, 3).map((v) => (
            <div
              key={v.vendor_id}
              style={{
                color: isDarkMode ? "#ffffff" : "#242625",
                backgroundColor: isDarkMode ? "#242625" : "#f9f9f9", // dark.background / light.textbox
                padding: "1rem",
                borderRadius: "1rem",
                flex: "1 1 250px",
                textAlign: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <p
                style={{
                  fontWeight: "600",
                  marginBottom: "0.5rem",
                  color: isDarkMode ? "#ffffff" : "#242625",
                }}
              >
                {v.store_name}
              </p>
              <p
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  marginBottom: "0.25rem",
                  color: isDarkMode ? "#ffffff" : "#242625",
                }}
              >
                Orders: {v.orders_count}
              </p>
              <p
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  color: isDarkMode ? "#ffffff" : "#242625",
                }}
              >
                Revenue: ${v.revenue}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
