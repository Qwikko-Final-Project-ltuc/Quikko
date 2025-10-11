import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setVendors } from "../vendor/vendorSlice";
import { Vendor } from "../vendor/vendorApi";

export default function ActiveVendors() {
  const dispatch = useDispatch();
  const  vendors  = useSelector((state) => state.vendors.vendors);
  const  orders  = useSelector((state) => state.ordersAdmin.orders);
  const mode = useSelector((state) => state.theme.mode);
  const isDark = mode === "dark";

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const data = await Vendor();

        const approvedVendors = (data.data || data).filter(
          (v) => v.status === "approved"
        );
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
    <div
      className={`rounded-2xl shadow-lg transition-all duration-500 ease-in-out p-6 ${
        isDark
          ? "bg-gradient-to-b from-[#555] to-[#242625] text-white"
          : "bg-gradient-to-b from-[#ffffff] to-[#f3f3f3] text-[#242625]"
      }`}
    >
      <h2 className="text-xl font-semibold mb-6 border-b pb-3 opacity-90">
        Active Vendors
      </h2>

      {topTwoVendors.length === 0 ? (
        <p>No active vendors</p>
      ) : (
        topTwoVendors.map((vendor) => (
          <div
            key={vendor.vendor_id}
            className={`p-5 border rounded-xl shadow-md mb-4 flex justify-between items-center hover:scale-[1.02] transition-all duration-300 ${
              isDark ? "bg-[#242625]" : "bg-white"
            }`}
            style={{
              borderColor: isDark ? "#f9f9f9" : "#e5e5e5",
            }}
          >
            <div>
              <h3 className="font-semibold">{vendor.store_name}</h3>
              <p className="text-sm opacity-80">Rate: {vendor.commission_rate}</p>
              <p className="text-sm opacity-70">{vendor.totalOrders} Orders</p>
            </div>
            <span className="font-bold text-[#307A59]">
              ${vendor.totalSales.toFixed(2)}
            </span>
          </div>
        ))
      )}
    </div>
  );
}
