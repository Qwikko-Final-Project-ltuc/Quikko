import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { fetchDeliveryReport } from "./Api/DeliveryAPI";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  FaClock,
  FaCheck,
  FaDollarSign,
  FaUsers,
  FaStore,
} from "react-icons/fa";

export default function DeliveryDashboard() {
  const isDarkMode = useSelector((s) => s.deliveryTheme.darkMode);

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchDeliveryReport(days);
        setReport(data);
      } catch (e) {
        setError(e?.message || "Failed to load report");
      } finally {
        setLoading(false);
      }
    })();
  }, [days]);

  // لو لسه ما جهّز التقرير، ما نبني الداتا
  const rawStatuses = report?.statuses || {};

  // نبني الداتا من الباك بس بالأربع حالات اللي بدك إياهم
  const orderStatusData = [
    {
      name: "accepted",
      value: rawStatuses.accepted || 0,
      color: "var(--button)",
    },
    {
      name: "processing",
      value: rawStatuses.processing || 0,
      color: "#3b82f6",
    },
    {
      name: "out_for_delivery",
      value:
        rawStatuses.out_for_delivery || rawStatuses["out for delivery"] || 0,
      color: "#fb923c",
    },
    {
      name: "delivered",
      value: rawStatuses.delivered || 0,
      color: "#10b981",
    },
  ];

  // اللي فوق أصلاً هما اللي بدك تعرضيهم، فبس شيل الصفار
const filteredOrderStatusData = orderStatusData;


  // بيانات Payment Status (لسه ثابتة زي ما عندك)
  const paymentStatusData = [
    { name: "paid", value: 85, color: "var(--button)" },
    { name: "pending", value: 10, color: "#f59e0b" },
    { name: "unpaid", value: 5, color: "#ef4444" },
  ];

  const CustomPieLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    if (percent === 0) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={10}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--button)] mx-auto mb-4"></div>
          <p className="text-[var(--text)] text-lg">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error)
    return (
      <p className="text-center mt-10" style={{ color: "var(--error)" }}>
        {error}
      </p>
    );
  if (!report)
    return (
      <p className="text-center mt-10" style={{ color: "var(--text)" }}>
        No report data available
      </p>
    );

  const ordersData = report.daily_orders || report.orders_over_time || [];
  const totalOrders = report?.totals?.total_orders ?? 0;
  const totalAmount = report?.totals?.total_amount ?? 0;

  const dd = {
    bg: isDarkMode ? "#475058ff" : "#ffffff",
    text: isDarkMode ? "#f9fafb" : "#1f2937",
    border: isDarkMode ? "#2a2e33" : "#e5e7eb",
  };

  return (
    <div
      className="w-full min-h-screen pb-[calc(env(safe-area-inset-bottom,0px)+8px)]"
      style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
    >
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-5 sm:py-7 md:py-8 rounded-none md:rounded-2xl"
        style={{
          backgroundColor: "var(--bg)",
          color: "var(--text)",
          borderTop: "none",
        }}
      >
        {/* Hero */}
        <section className="mb-5 sm:mb-6 md:mb-8">
          <div className="text-center">
            <div className="rounded-2xl px-2 sm:px-6 py-6">
              <h1 className="text-2xl mt-6 sm:text-3xl md:text-5xl font-extrabold leading-tight">
                Welcome to{" "}
                <span style={{ color: isDarkMode ? "#ffffff" : "#292e2c" }}>
                  QWIKKO Delivery
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg mt-2 sm:mt-3 opacity-90">
                Fast, smart, and organized delivery operations—everything you
                need in one dashboard.
              </p>
            </div>
          </div>
        </section>

        {/* Controls + Chart + KPIs */}
        <section className="mb-8 sm:mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Chart Card */}
            <div
              className="lg:col-span-2 rounded-2xl p-4 sm:p-5"
              style={{
                backgroundColor: "var(--bg)",
                boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
                <select
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base outline-none"
                  style={{
                    backgroundColor: dd.bg,
                    color: dd.text,
                    border: `1px solid ${dd.border}`,
                  }}
                >
                  <option value={7}>Last 7 days</option>
                  <option value={14}>Last 14 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 3 months</option>
                  <option value={180}>Last 6 months</option>
                </select>
              </div>

              <div className="w-full h-[240px] sm:h-[300px] md:h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ordersData} barCategoryGap="35%">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                    />
                    <XAxis
                      dataKey="order_date"
                      stroke="var(--light-gray)"
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis stroke="var(--light-gray)" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--bg)",
                        border: "1px solid var(--border)",
                        color: "var(--text)",
                        borderRadius: 8,
                      }}
                    />
                    <Bar
                      dataKey="orders_count"
                      fill="var(--button)"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-6">
              <div
                className="p-4 sm:p-6 rounded-2xl shadow flex flex-col items-center justify-center relative"
                style={{
                  backgroundColor: isDarkMode ? "#307A59" : "#d3f3e2",
                  color: isDarkMode ? "#ffffff" : "#242625",
                }}
              >
                <div className="absolute top-3 right-3 w-16 h-16">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "completed", value: 75 },
                          { name: "remaining", value: 25 },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={15}
                        outerRadius={25}
                        dataKey="value"
                      >
                        <Cell fill={isDarkMode ? "#ffffff" : "#307A59"} />
                        <Cell
                          fill="transparent"
                          stroke={isDarkMode ? "#ffffff" : "#307A59"}
                          strokeWidth={2}
                        />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <FaCheck
                  style={{ color: isDarkMode ? "#ffffff" : "#307A59" }}
                  className="text-3xl sm:text-4xl mb-2"
                />
                <h2 className="text-sm sm:text-base font-semibold">
                  Total Orders
                </h2>
                <p className="text-2xl sm:text-3xl font-bold">{totalOrders}</p>
              </div>

              <div
                className="p-4 sm:p-6 rounded-2xl shadow flex flex-col items-center justify-center relative"
                style={{
                  backgroundColor: isDarkMode ? "#307A59" : "#e6f4ea",
                  color: isDarkMode ? "#ffffff" : "#242625",
                }}
              >
                <div className="absolute top-3 right-3 w-16 h-16">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { value: 10 },
                        { value: 25 },
                        { value: 15 },
                        { value: 30 },
                        { value: 20 },
                        { value: 40 },
                      ]}
                    >
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={isDarkMode ? "#ffffff" : "#307A59"}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <FaDollarSign
                  style={{ color: isDarkMode ? "#ffffff" : "#307A59" }}
                  className="text-3xl sm:text-4xl mb-2"
                />
                <h2 className="text-sm sm:text-base font-semibold">
                  Total Revenue
                </h2>
                <p className="text-2xl sm:text-3xl font-bold">${totalAmount}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Order Status & Payment Status */}
        <section className="mb-8 sm:mb-10">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
            {/* Order Status Distribution */}
            <div
              className="rounded-2xl p-4 sm:p-6 shadow-md"
              style={{
                backgroundColor: "var(--bg)",
                border: "1px solid var(--border)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                <FaClock
                  style={{ color: isDarkMode ? "#ffffff" : "#292e2c" }}
                />
                Order Status Distribution
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                {/* pie */}
                <div className="h-56 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={filteredOrderStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={CustomPieLabel}
                        outerRadius={70}
                        innerRadius={30}
                        dataKey="value"
                      >
                        {filteredOrderStatusData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            stroke="var(--bg)"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--bg)",
                          border: "1px solid var(--border)",
                          color: "var(--text)",
                          borderRadius: 8,
                        }}
                        formatter={(value, name) => [`${value} orders`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* legend */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredOrderStatusData.map((status, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 rounded-lg text-xs"
                      style={{
                        backgroundColor: "var(--bg)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: status.color }}
                      />
                      <span className="capitalize font-medium truncate">
                        {status.name}
                      </span>
                      <span className="font-bold ml-auto">{status.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div
              className="rounded-2xl p-4 sm:p-6 shadow-md"
              style={{
                backgroundColor: "var(--bg)",
                border: "1px solid var(--border)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                <FaDollarSign
                  style={{ color: isDarkMode ? "#ffffff" : "#292e2c" }}
                />
                Payment Status Overview
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                <div className="h-56 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={CustomPieLabel}
                        outerRadius={70}
                        innerRadius={30}
                        dataKey="value"
                      >
                        {paymentStatusData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            stroke="var(--bg)"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--bg)",
                          border: "1px solid var(--border)",
                          color: "var(--text)",
                          borderRadius: 8,
                        }}
                        formatter={(value, name) => [`${value}%`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {paymentStatusData.map((payment, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg"
                      style={{
                        backgroundColor: "var(--bg)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: payment.color }}
                      />
                      <span className="capitalize font-medium text-sm">
                        {payment.name}
                      </span>
                      <span className="font-bold text-sm ml-auto">
                        {payment.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* باقي الأقسام */}
        <section className="mb-8 sm:mb-10">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
            {/* Top Customers */}
            <div
              className="rounded-2xl p-4 sm:p-6 shadow-md"
              style={{
                backgroundColor: "var(--bg)",
                border: "1px solid var(--border)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <h2
                className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2"
                style={{ color: "var(--text)" }}
              >
                <FaUsers
                  style={{ color: isDarkMode ? "#ffffff" : "#292e2c" }}
                />{" "}
                Top Customers
              </h2>

              <div className="h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={report.top_customers?.slice(0, 5) || []}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                    />
                    <XAxis
                      type="number"
                      stroke="var(--light-gray)"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="customer_email"
                      stroke="var(--light-gray)"
                      tick={{ fontSize: 12 }}
                      width={90}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--bg)",
                        border: "1px solid var(--border)",
                        color: "var(--text)",
                        borderRadius: 8,
                      }}
                      formatter={(value, name) => {
                        if (name === "orders_count")
                          return [`${value} orders`, "Orders"];
                        if (name === "total_amount")
                          return [`$${value}`, "Total Spent"];
                        return [value, name];
                      }}
                    />
                    <Bar
                      dataKey="orders_count"
                      fill="var(--button)"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Vendors */}
            <div
              className="rounded-2xl p-4 sm:p-6 shadow-md"
              style={{
                backgroundColor: "var(--bg)",
                border: "1px solid var(--border)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <h2
                className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2"
                style={{ color: "var(--text)" }}
              >
                <FaStore
                  style={{ color: isDarkMode ? "#ffffff" : "#292e2c" }}
                />{" "}
                Top Vendors
              </h2>

              <div className="h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={report.top_vendors?.slice(0, 5) || []}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                    />
                    <XAxis
                      dataKey="store_name"
                      stroke="var(--light-gray)"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="var(--light-gray)" tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--bg)",
                        border: "1px solid var(--border)",
                        color: "var(--text)",
                        borderRadius: 8,
                      }}
                      formatter={(value, name) => {
                        if (name === "revenue") return [`$${value}`, "Revenue"];
                        if (name === "orders_count")
                          return [`${value} orders`, "Orders"];
                        return [value, name];
                      }}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="var(--button)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
