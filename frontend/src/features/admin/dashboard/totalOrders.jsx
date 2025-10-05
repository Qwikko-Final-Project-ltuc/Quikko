import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setOrders } from "../orders/orderSlice";
import { Orders } from "../orders/orderApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function TotalOrders() {
  const dispatch = useDispatch();
  const { orders } = useSelector((state) => state.orders);

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

  const totalOrders = Array.isArray(orders)
    ? orders.reduce((acc, order) => acc + 1, 0)
    : 0;

  const totalSales = orders.reduce(
    (sum, order) => sum + parseFloat(order.total_amount || 0),
    0
  );

  const ordersByDate = {};
  orders.forEach((order) => {
    const date = new Date(order.created_at).toLocaleDateString();
    ordersByDate[date] = (ordersByDate[date] || 0) + 1;
  });

  const chartData = Object.keys(ordersByDate).map((date) => ({
    date,
    count: ordersByDate[date],
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Cards */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-gray-600 text-sm">Total Sales</h2>
          <p className="text-2xl font-bold">$ {totalSales.toFixed(2)}</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-gray-600 text-sm">Total Orders</h2>
          <p className="text-2xl font-bold">{totalOrders}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-lg font-semibold mb-4">Statistics</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#4F46E5" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
