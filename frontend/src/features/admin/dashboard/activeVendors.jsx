import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setVendors } from "../vendor/vendorSlice";
import { Vendor } from "../vendor/vendorApi";

export default function ActiveVendors() {
  const dispatch = useDispatch();
  const { vendors } = useSelector((state) => state.vendors);
  const { orders } = useSelector((state) => state.orders);

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

  const vendorsWithOrders = vendors.map((vendor) => {
    const vendorOrders = orders.filter((order) =>
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
    .sort((a, b) => b.totalSales - a.totalSales)
    .slice(0, 2);

  return (
    <div className="bg-white shadow rounded p-4">
      <h2 className="text-lg font-semibold mb-4">Active Vendors</h2>
      {topTwoVendors.map((vendor) => (
        <div
          key={vendor.vendor_id}
          className="p-4 border rounded mb-3 shadow-sm bg-white flex justify-between items-center"
        >
          <div>
            <h3 className="font-semibold">{vendor.store_name}</h3>
            <p className="text-sm">Rate: {vendor.commission_rate}</p>
            <p className="text-sm text-gray-600">{vendor.totalOrders} Orders</p>
          </div>
          <span className="font-bold">Total Sales: ${vendor.totalSales}</span>
        </div>
      ))}
    </div>
  );
}
