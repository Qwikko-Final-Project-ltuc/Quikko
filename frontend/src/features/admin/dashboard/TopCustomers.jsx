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
        className={`rounded-2xl shadow-lg p-6 ${
          isDark
            ? "bg-[var(--bg)] text-[var(--text)]"
            : "bg-[var(--bg)] text-[var(--text)]"
        }`}
      >
        <h2 className="text-xl font-semibold mb-6 border-b pb-3 opacity-90">
          Top Customers
        </h2>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div>
        <h2 className="text-xl font-semibold pb-3 opacity-90 ml-1">
          Top Customers
        </h2>
        <div
          className={`rounded-2xl shadow-lg transition-all duration-500 ease-in-out p-6 border ${
            isDark
              ? "bg-gradient-to-b from-[#474747] to-[#242625] text-[var(--text)] border-[var(--border)]"
              : "bg-gradient-to-b from-[#FFFFFF] to-[#f3f3f3] text-[var(--text)] border-[var(--border)]"
          }`}
        >
          {customers.length === 0 ? (
            <p className="text-center opacity-70">No data available</p>
          ) : (
            <div className="space-y-4">
              {customers.map((customer, index) => (
                <div
                  key={customer.name}
                  className={`p-4 border rounded-xl shadow-md flex justify-between items-center transition-all duration-300 ${
                    isDark ? "bg-[var(--bg)] border-[var(--border)]" : "bg-[var(--bg)] border-[var(--border)]"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0
                          ? "bg-[#307A59] text-[#ffffff]"
                          : index === 1
                          ? "bg-[#307A59] text-[#ffffff]"
                          : index === 2
                          ? "bg-[#307A59] text-[#ffffff]"
                          : "bg-[#307A59] text-[#ffffff]"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold">{customer.name}</h3>
                      <p className="text-sm opacity-80">
                        ${parseFloat(customer.total_spent).toFixed(2)} spent
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-[#307A59]">
                    Top {index + 1}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
