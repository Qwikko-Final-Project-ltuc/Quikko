import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setOrders } from "../orders/orderSlice";
import { Orders } from "../orders/orderApi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function TotalOrders() {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.ordersAdmin.orders);
  const mode = useSelector((state) => state.theme.mode);
  const isDark = mode === "dark";

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await Orders();
        dispatch(setOrders(data.data || data));
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
    };
    fetchOrders();
  }, [dispatch]);

  const totalOrders = Array.isArray(orders) ? orders.length : 0;

  const totalSales = Array.isArray(orders)
    ? orders.reduce(
        (sum, order) => sum + parseFloat(order.total_amount || 0),
        0
      )
    : 0;

  const ordersByDate = {};
  if (Array.isArray(orders)) {
    orders.forEach((order) => {
      const date = new Date(order.created_at).toLocaleDateString();
      ordersByDate[date] = (ordersByDate[date] || 0) + 1;
    });
  }

  const chartData = Object.keys(ordersByDate)
    .sort((a, b) => new Date(a) - new Date(b))
    .map((date) => ({ date, count: ordersByDate[date] }));

  return (
    <>
      <div>
        <h2 className="text-lg md:text-xl font-semibold pb-2 md:pb-3 opacity-90 ml-1">
          Orders Overview
        </h2>
        <div
          className={`rounded-xl md:rounded-2xl shadow-lg transition-all duration-500 ease-in-out p-4 md:p-6 border ${
            isDark
              ? "bg-gradient-to-b from-[#474747] to-[#242625] text-[var(--text)] border-[var(--border)]"
              : "bg-gradient-to-b from-[#FFFFFF] to-[#f3f3f3] text-[var(--text)] border-[var(--border)]"
          }`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
            <div
              className={`rounded-lg md:rounded-xl p-4 md:p-5 shadow-md transform  transition-all duration-300 ${
                isDark ? "bg-[var(--bg)]" : "bg-[var(--bg)]"
              }`}
            >
              <h2 className="text-xs sm:text-sm opacity-80">Total Sales</h2>
              <p className="text-2xl sm:text-3xl font-bold mt-1">
                $ {totalSales.toFixed(2)}
              </p>
            </div>

            <div
              className={`rounded-lg md:rounded-xl p-4 md:p-5 shadow-md transform  transition-all duration-300 ${
                isDark ? "bg-[var(--bg)]" : "bg-[var(--bg)]"
              }`}
            >
              <h2 className="text-xs sm:text-sm opacity-80">Total Orders</h2>
              <p className="text-2xl sm:text-3xl font-bold mt-1">
                {totalOrders}
              </p>
            </div>
          </div>

          <div
            className={`rounded-lg md:rounded-xl p-4 md:p-5 shadow-md ${
              isDark ? "bg-[var(--bg)]" : "bg-[var(--bg)]"
            }`}
          >
            <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4 border-b pb-2 opacity-90">
              Orders by Date
            </h2>
            {chartData.length === 0 ? (
              <p className="text-sm md:text-base">No orders yet</p>
            ) : (
              <ResponsiveContainer
                width="100%"
                height={window.innerWidth < 768 ? 200 : 250}
                className="text-xs md:text-sm"
              >
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 10, bottom: 5, left: 0 }}
                >
                  <CartesianGrid stroke={isDark ? "#555" : "#e5e5e5"} />
                  <XAxis
                    dataKey="date"
                    stroke={isDark ? "#f9f9f9" : "#242625"}
                    fontSize={12}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    stroke={isDark ? "#f9f9f9" : "#242625"}
                    fontSize={12}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#444" : "#fff",
                      color: isDark ? "#fff" : "#242625",
                      fontSize: "12px",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke={isDark ? "#3baa78ff" : "#307A59"}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
