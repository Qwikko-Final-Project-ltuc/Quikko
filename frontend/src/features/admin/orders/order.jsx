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
    <div className="w-full mx-auto p-4 sm:p-6 rounded-2xl mt-10">
      <h1 className="text-2xl sm:text-3xl font-extrabold pb-2 sm:pb-3 opacity-90 mb-4 sm:mb-5">
        Orders Tracking
      </h1>
      <div
        className={`min-h-screen p-4 sm:p-6 transition-colors duration-500 ${
          isDark
            ? "bg-[var(--bg)] text-[var(--text)]"
            : "bg-[var(--bg)] text-[var(--text)]"
        }`}
      >
        {/* Search & Filters */}
        <div
          className={`p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-md mb-4 sm:mb-6 transition-colors duration-500 border ${
            isDark
              ? "bg-[var(--bg)] border-[var(--border)]"
              : "bg-[var(--bg)] border-[var(--border)]"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center mb-4 gap-3 sm:gap-4">
            <div className="relative flex-1 w-full">
              <IoIosSearch
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${
                  isDark ? "text-[var(--text)]" : "text-[var(--text)]"
                }`}
              />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full p-2 sm:p-3 pl-8 sm:pl-10 rounded-lg border transition-colors duration-300 focus:outline-none focus:ring-2 text-sm sm:text-base ${
                  isDark
                    ? "bg-[var(--div)] border-[var(--border)] text-[var(--text)] focus:ring-[#307A59]"
                    : "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-[#307A59]"
                }`}
              />
            </div>
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm font-medium">
            {[
              "all",
              "requested",
              "needs_decision",
              "accepted",
              "processing",
              "out_for_delivery",
              "delivered",
            ].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full transition-colors duration-200 cursor-pointer whitespace-nowrap ${
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
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Array.isArray(visibleOrders) && visibleOrders.length > 0 ? (
            visibleOrders.map((order, index) => (
              <OrdersCard
                key={order.order_id || index}
                order={order}
                isDark={isDark}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8 sm:py-12">
              <div
                className={`text-lg sm:text-xl mb-2 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                No orders found
              </div>
              <p
                className={`text-sm sm:text-base ${
                  isDark ? "text-gray-500" : "text-gray-600"
                }`}
              >
                {searchTerm || activeFilter !== "all"
                  ? "Try changing your search or filter criteria"
                  : "There are no orders to display"}
              </p>
            </div>
          )}
        </div>

        {/* Load More */}
        {visibleCount < filteredOrders.length && (
          <div className="flex justify-center mt-4 sm:mt-6">
            <button
              onClick={() => setVisibleCount(visibleCount + increment)}
              className="px-5 sm:px-6 py-2 sm:py-3 rounded-full bg-[var(--button)] text-white font-medium hover:bg-[#2b7556] transition-all duration-300 cursor-pointer text-sm sm:text-base"
            >
              Load More
            </button>
          </div>
        )}

        {visibleOrders.length > 0 && (
          <div className="text-center mt-4 sm:mt-6">
            <p
              className={`text-sm sm:text-base ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Showing {visibleOrders.length} of {filteredOrders.length} Orders
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
