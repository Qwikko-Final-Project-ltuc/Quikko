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

  const paymentStatus = report.payment_status || {};

  const dd = {
    bg: isDarkMode ? "#475058ff" : "#ffffff",
    text: isDarkMode ? "#f9fafb" : "#1f2937",
    border: isDarkMode ? "#2a2e33" : "#e5e7eb",
  };

  return (
    <div
      className="w-full  min-h-screen pb-[calc(env(safe-area-inset-bottom,0px)+8px)]"
      style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
    >
      {/* WRAPPER */}
      <div
        className="
          max-w-7xl mx-auto 
          px-4 sm:px-6 md:px-8 
          py-5 sm:py-7 md:py-8 
          rounded-none md:rounded-2xl
        "
        style={{
          backgroundColor: "var(--bg)",
          color: "var(--text)",
          borderTop: "none",
        }}
      >
        {/* ===== Hero ===== */}
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

        {/* ===== Controls + Chart + KPIs ===== */}
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
              {/* Controls */}
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

              {/* Chart */}
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

            {/* KPIs (stack on mobile, 2-up on small, column on lg) */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-6">
              {/* KPI #1 */}
              <div
                className="p-4 sm:p-6 rounded-2xl shadow flex flex-col items-center justify-center"
                style={{
                  backgroundColor: isDarkMode ? "#307A59" : "#d3f3e2",
                  color: isDarkMode ? "#ffffff" : "#242625",
                }}
              >
                <FaCheck
                  style={{ color: isDarkMode ? "#ffffff" : "#307A59" }}
                  className="text-3xl sm:text-4xl mb-2"
                />
                <h2 className="text-sm sm:text-base font-semibold">
                  Total Orders
                </h2>
                <p className="text-2xl sm:text-3xl font-bold">{totalOrders}</p>
              </div>

              {/* KPI #2 */}
              <div
                className="p-4 sm:p-6 rounded-2xl shadow flex flex-col items-center justify-center"
                style={{
                  backgroundColor: isDarkMode ? "#307A59" : "#e6f4ea",
                  color: isDarkMode ? "#ffffff" : "#242625",
                }}
              >
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

        {/* ===== Cards Sections ===== */}
        <section className="space-y-6 sm:space-y-8 md:space-y-10">
          {/* Order Status */}
          <div
            className="rounded-2xl p-4 sm:p-6 shadow-md"
            style={{
              backgroundColor: isDarkMode ? "#313131" : "#f5f6f5",
              color: "var(--text)",
            }}
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-5 flex items-center gap-2">
              <FaClock style={{ color: isDarkMode ? "#ffffff" : "#292e2c" }} />{" "}
              Order Status
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {["accepted", "processing", "out_for_delivery", "delivered"].map(
                (statusKey) => {
                  const val = report.statuses?.[statusKey] || 0;
                  let color = "#6b7280";
                  const label = statusKey.replace(/_/g, " ");
                  switch (statusKey) {
                    case "accepted":
                      color = "#3b82f6";
                      break;
                    case "processing":
                      color = "#facc15";
                      break;
                    case "out_for_delivery":
                      color = "#f97316";
                      break;
                    case "delivered":
                      color = "#22c55e";
                      break;
                  }
                  return (
                    <div
                      key={statusKey}
                      className="p-3 sm:p-4 rounded-xl text-center shadow border transition-transform duration-300 hover:scale-[1.01]"
                      style={{
                        backgroundColor: "var(--bg)",
                        borderColor: "var(--border)",
                      }}
                    >
                      <FaClock
                        style={{ color }}
                        className="text-xl sm:text-2xl mx-auto mb-1.5"
                      />
                      <p className="capitalize font-semibold text-xs sm:text-sm mb-0.5">
                        {label}
                      </p>
                      <p className="text-sm sm:text-base font-bold">
                        {val} orders
                      </p>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* Payment Status */}
          <div
            className="rounded-2xl p-4 sm:p-6 shadow-md"
            style={{
              backgroundColor: isDarkMode ? "#313131" : "#f5f6f5",
              color: "var(--text)",
            }}
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-5 flex items-center gap-2">
              <FaDollarSign
                style={{ color: isDarkMode ? "#ffffff" : "#292e2c" }}
              />{" "}
              Payment Status
            </h2>

            {/* موبايل: عمودين / ديسكتوب: 3 أعمدة، والكارد الثالث بالموبايل يمتد عمودين ليصير بالنص */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {["paid", "pending", "unpaid"].map((key, i) => {
                const val = paymentStatus?.[key] ?? 0;
                let iconColor = "#22c55e";
                if (key === "pending") iconColor = "#facc15";
                if (key === "unpaid") iconColor = "#ef4444";
                const label = key.replace(/_/g, " ");

                // لو هو الكارد الثالث (i === 2): خلِّيه يمتد عمودين على الموبايل ويتوسّط
                const spanCenterMobile =
                  i === 2
                    ? "col-span-2 justify-self-center lg:col-span-1 lg:justify-self-stretch"
                    : "";

                return (
                  <div
                    key={key}
                    className={`p-4 sm:p-5 rounded-xl text-center shadow border ${spanCenterMobile}`}
                    style={{
                      backgroundColor: "var(--bg)",
                      borderColor: "var(--border)",
                      // اختيارياً: حددي أقصى عرض للكارد الثالث عشان ما يصير أعرض من اللازم وهو بالنص
                      maxWidth: i === 2 ? "22rem" : "unset",
                      width: "100%",
                    }}
                  >
                    <FaDollarSign
                      style={{ color: iconColor }}
                      className="text-2xl sm:text-3xl mx-auto mb-2"
                    />
                    <p className="capitalize font-semibold mb-1 text-sm sm:text-base">
                      {label}
                    </p>
                    <p className="text-base sm:text-lg font-bold">
                      {val} orders
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Customers */}
          <div
            className="rounded-2xl p-4 sm:p-6 shadow-md"
            style={{ backgroundColor: isDarkMode ? "#313131" : "#f5f6f5" }}
          >
            <h2
              className="text-xl sm:text-2xl font-bold mb-4 sm:mb-5 flex items-center gap-2"
              style={{ color: "var(--text)" }}
            >
              <FaUsers style={{ color: isDarkMode ? "#ffffff" : "#292e2c" }} />{" "}
              Top Customers
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {report.top_customers?.slice(0, 3).map((c) => (
                <div
                  key={c.customer_id}
                  className="p-4 rounded-xl text-center"
                  style={{
                    backgroundColor: "var(--bg)",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                  }}
                >
                  <p className="font-semibold mb-2 text-sm sm:text-base">
                    {c.customer_email}
                  </p>
                  <p className="text-sm sm:text-base">
                    Orders: {c.orders_count}
                  </p>
                  <p className="text-sm sm:text-base">
                    Total Spent: ${c.total_amount}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Vendors */}
          <div
            className="rounded-2xl p-4 sm:p-6 shadow-md"
            style={{ backgroundColor: isDarkMode ? "#313131" : "#f5f6f5" }}
          >
            <h2
              className="text-xl sm:text-2xl font-bold mb-4 sm:mb-5 flex items-center gap-2"
              style={{ color: "var(--text)" }}
            >
              <FaStore style={{ color: isDarkMode ? "#ffffff" : "#292e2c" }} />{" "}
              Top Vendors
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {report.top_vendors?.slice(0, 3).map((v) => (
                <div
                  key={v.vendor_id}
                  className="p-4 rounded-xl text-center"
                  style={{
                    backgroundColor: "var(--bg)",
                    border: "1px solid var(--border)",
                    color: isDarkMode ? "#ffffff" : "#292e2c",
                  }}
                >
                  <p className="font-semibold mb-1 text-sm sm:text-base">
                    {v.store_name}
                  </p>
                  <p className="text-sm sm:text-base">
                    Orders: {v.orders_count}
                  </p>
                  <p className="text-sm sm:text-base">Revenue: ${v.revenue}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      {/* /WRAPPER */}
    </div>
  );
}
