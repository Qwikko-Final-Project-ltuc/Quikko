import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function TopCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const mode = useSelector((state) => state.theme.mode);
  const isDark = mode === "dark";

  useEffect(() => {
    const fetchTopCustomers = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/awareness/top-customers"
        );
        const data = await response.json();
        setCustomers(data);
      } catch (error) {
        console.error("Failed to fetch top customers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopCustomers();
  }, []);

  if (loading) {
    return (
      <div
        className={`rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 ${
          isDark
            ? "bg-[var(--bg)] text-[var(--text)]"
            : "bg-[var(--bg)] text-[var(--text)]"
        }`}
      >
        <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 border-b pb-2 md:pb-3 opacity-90">
          Top Customers
        </h2>
        <p className="text-sm md:text-base opacity-80">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div>
        <h2 className="text-lg md:text-xl font-semibold pb-2 md:pb-3 opacity-90 ml-1">
          Top Customers
        </h2>
        <div
          className={`rounded-xl md:rounded-2xl shadow-lg transition-all duration-500 ease-in-out p-4 md:p-6 border ${
            isDark
              ? "bg-gradient-to-b from-[#474747] to-[#242625] text-[var(--text)] border-[var(--border)]"
              : "bg-gradient-to-b from-[#FFFFFF] to-[#f3f3f3] text-[var(--text)] border-[var(--border)]"
          }`}
        >
          {customers.length === 0 ? (
            <p className="text-sm md:text-base text-center py-4 opacity-70">
              No data available
            </p>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {customers.map((customer, index) => (
                <div
                  key={customer.name}
                  className={`p-3 md:p-4 border rounded-lg md:rounded-xl shadow-md transition-all duration-300 ${
                    isDark
                      ? "bg-[var(--bg)] border-[var(--border)]"
                      : "bg-[var(--bg)] border-[var(--border)]"
                  }${
                    index === 0
                      ? isDark
                        ? "border-l-4 border-l-green-500 border-[var(--border)]"
                        : "border-l-4 border-l-green-500 border-[var(--border)]"
                      : index === 1
                      ? isDark
                        ? "border-l-4 border-l-blue-500 border-[var(--border)]"
                        : "border-l-4 border-l-blue-500 border-[var(--border)]"
                      : index === 2
                      ? isDark
                        ? "border-l-4 border-l-purple-500 border-[var(--border)]"
                        : "border-l-4 border-l-purple-500 border-[var(--border)]"
                      : isDark
                      ? "border-l-4 border-l-gray-500 border-[var(--border)]"
                      : "border-l-4 border-l-gray-500 border-[var(--border)]"
                  }`}
                >
                  <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-3 md:gap-4">
                    <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                          index === 0
                            ? isDark
                              ? "bg-green-600 text-white"
                              : "bg-green-500 text-white"
                            : index === 1
                            ? isDark
                              ? "bg-blue-600 text-white"
                              : "bg-blue-500 text-white"
                            : index === 2
                            ? isDark
                              ? "bg-purple-600 text-white"
                              : "bg-purple-500 text-white"
                            : isDark
                            ? "bg-gray-600 text-white"
                            : "bg-gray-500 text-white"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-base md:text-lg truncate">
                          {customer.name}
                        </h3>
                        <p className="text-xs md:text-sm opacity-80 truncate">
                          ${parseFloat(customer.total_spent).toFixed(2)} spent
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between xs:justify-end items-center gap-3 md:gap-4 w-full xs:w-auto">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          index === 0
                            ? isDark
                              ? "bg-green-900 text-green-200"
                              : "bg-green-100 text-green-800"
                            : index === 1
                            ? isDark
                              ? "bg-blue-900 text-blue-200"
                              : "bg-blue-100 text-blue-800"
                            : index === 2
                            ? isDark
                              ? "bg-purple-900 text-purple-200"
                              : "bg-purple-100 text-purple-800"
                            : isDark
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        #{index + 1} Top
                      </span>
                      <div
                        className={`xs:hidden w-2 h-2 rounded-full ${
                          index === 0
                            ? isDark
                              ? "bg-green-500"
                              : "bg-green-500"
                            : index === 1
                            ? isDark
                              ? "bg-blue-500"
                              : "bg-blue-500"
                            : index === 2
                            ? isDark
                              ? "bg-purple-500"
                              : "bg-purple-500"
                            : isDark
                            ? "bg-gray-500"
                            : "bg-gray-500"
                        } animate-pulse`}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
