import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setVendors } from "../vendor/vendorSlice";
import { Vendor } from "../vendor/vendorApi";

export default function ActiveVendors() {
  const dispatch = useDispatch();
  const vendors = useSelector((state) => state.vendors.vendors);
  const orders = useSelector((state) => state.ordersAdmin.orders);
  const mode = useSelector((state) => state.theme.mode);
  const isDark = mode === "dark";

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const data = await Vendor();

        const approvedVendors = (data.data || data).filter(
          (v) => v.status === "approved"
        );
        console.log("vendor data:",data);
        
        dispatch(setVendors(approvedVendors));
      } catch (error) {
        console.error("Failed to fetch vendors:", error);
      }
    };
    fetchVendors();
  }, [dispatch]);

  const vendorsWithOrders = (vendors || []).map((vendor) => {
    const vendorOrders = (orders || []).filter((order) =>
      (order.items || []).some((item) => item.vendor?.id === vendor.vendor_id)
    );

    const totalSales = vendorOrders.reduce((sum, order) => {
      const itemsForVendor = (order.items || []).filter(
        (item) => item.vendor?.id === vendor.vendor_id
      );
      return (
        sum +
        itemsForVendor.reduce((s, item) => s + item.price * item.quantity, 0)
      );
    }, 0);

    return {
      ...vendor,
      totalOrders: vendorOrders.length,
      totalSales,
    };
  });

  const topTwoVendors = [...vendorsWithOrders]
    .sort((a, b) => b.totalOrders - a.totalOrders)
    .slice(0, 2);

  return (
    <>
      <div>
        <h2 className="text-lg md:text-xl font-semibold pb-2 md:pb-3 opacity-90 ml-1">
          Active Vendors
        </h2>
        <div
          className={`rounded-xl md:rounded-2xl shadow-lg transition-all duration-500 ease-in-out p-4 md:p-6 border ${
            isDark
              ? "bg-gradient-to-b from-[#474747] to-[#242625] text-[var(--text)] border-[var(--border)]"
              : "bg-gradient-to-b from-[#FFFFFF] to-[#f3f3f3] text-[var(--text)] border-[var(--border)]"
          }`}
        >
          {topTwoVendors.length === 0 ? (
            <p className="text-sm md:text-base text-center py-4 opacity-80">
              No active vendors
            </p>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {topTwoVendors.map((vendor, index) => (
                <div
                  key={vendor.vendor_id}
                  className={`p-4 md:p-5 border rounded-lg md:rounded-xl shadow-md transition-all duration-300 ${
                    isDark
                      ? "bg-[var(--bg)] border-[var(--border)]"
                      : "bg-[var(--bg)] border-[var(--border)]"
                  }${
                    index === 0
                      ? isDark
                        ? "border-l-4 border-l-green-500 border-[var(--border)]"
                        : "border-l-4 border-l-green-500 border-[var(--border)]"
                      : isDark
                      ? "border-l-4 border-l-blue-500 border-[var(--border)]"
                      : "border-l-4 border-l-blue-500 border-[var(--border)]"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 md:gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base md:text-lg mb-1 md:mb-2">
                        {vendor.store_name}
                      </h3>
                      <div className="flex flex-col xs:flex-row xs:items-center xs:gap-4 gap-2 text-xs md:text-sm">
                        <p className="opacity-80 flex items-center gap-1">
                          <span className="hidden xs:inline">Rate:</span>
                          <span className="xs:hidden">⭐</span>
                          {vendor.rating ?? 0}%
                        </p>
                        <p className="opacity-70 flex items-center gap-1">
                          <span className="hidden xs:inline">Orders:</span>
                          <span className="xs:hidden">📦</span>
                          {vendor.totalOrders} Orders
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between xs:justify-end items-center gap-4 sm:gap-6 w-full sm:w-auto">
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-bold text-[var(--text)] text-sm md:text-base whitespace-nowrap">
                          ${vendor.totalSales.toFixed(2)}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            index === 0
                          ? isDark
                            ? "bg-green-900 text-green-200"
                            : "bg-green-100 text-green-800"
                          : isDark
                            ? "bg-blue-900 text-blue-200"
                            : "bg-blue-100 text-blue-800"
                      }`}
                        >
                          #{index + 1} Top
                        </span>
                      </div>

                      <div
                        className={`sm:hidden w-2 h-2 rounded-full ${
                          index === 0 ? "bg-green-500" : "bg-blue-500"
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
