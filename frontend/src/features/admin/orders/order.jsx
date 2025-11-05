import { Orders } from "./orderApi";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setOrders } from "./orderSlice";
import OrdersCard from "./orderCard";
import { IoIosSearch } from "react-icons/io";

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(6);
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.ordersAdmin.orders);

  const mode = useSelector((state) => state.theme.mode);
  const isDark = mode === "dark";

  useEffect(() => {
    const handleOrders = async () => {
      try {
        const result = await Orders();

        dispatch(setOrders(result.data || []));
      } catch (err) {
        alert(err.message);
      }
    };
    handleOrders();
  }, [dispatch]);

  const filteredOrders = (orders || []).filter((order) => {
    const matchesSearch =
      (order.customer?.name &&
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.delivery_company?.company_name &&
        order.delivery_company.company_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));
    const matchesFilter =
      activeFilter === "all" || order.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const increment = 6;
  const visibleOrders = filteredOrders.slice(0, visibleCount);

  return (
    <div className="w-full mx-auto  p-6  rounded-2xl">
      <h1 className="text-3xl font-extrabold pb-3 opacity-90 ml-7">Orders Tracking</h1>
      <div
        className={`min-h-screen p-6 transition-colors duration-500 ${
          isDark
            ? "bg-[var(--bg)] text-[var(--text)]"
            : "bg-[var(--bg)] text-[var(--text)]"
        }`}
      >
        {/* Search & Filters */}
        <div
          className={`p-6 rounded-xl shadow-md mb-6 transition-colors duration-500 border ${
            isDark ? "bg-[var(--bg)] border-[var(--border)]" : "bg-[var(--bg)] border-[var(--border)]"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center mb-4 sm:space-x-4 space-y-4 sm:space-y-0">
            <div className="relative flex-1">
              <IoIosSearch
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  isDark ? "text-[var(--text)]" : "text-[var(--text)]"
                }`}
              />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full p-3 pl-10 rounded-lg border transition-colors duration-300 focus:outline-none focus:ring-2 ${
                  isDark
                    ? "bg-[var(--div)] border-[var(--border)] text-[var(--text)] focus:ring-[#307A59]"
                    : "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-[#307A59]"
                }`}
              />
            </div>
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-3 text-sm font-medium">
            {[
              "all",
              "pending",
              "accepted",
              "processing",
              "out_for_delivery",
              "delivered",
            ].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1 rounded-full transition-colors duration-200 cursor-pointer ${
                  activeFilter === filter
                    ? "bg-[#307A59] text-white"
                    : isDark
                    ? "hover:bg-[var(--hover)] text-white"
                    : "hover:bg-[var(--hover)] text-gray-800"
                }`}
              >
                {filter
                  .split("_")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(visibleOrders) &&
            visibleOrders.map((order, index) => (
              <OrdersCard key={order.order_id || index} order={order} />
            ))}
        </div>

        {/* Load More */}
        {visibleCount < filteredOrders.length && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setVisibleCount(visibleCount + increment)}
              className="px-6 py-2 rounded-full bg-[var(--button)] text-white font-medium hover:bg-[#2b7556] transition-all duration-300 cursor-pointer"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
