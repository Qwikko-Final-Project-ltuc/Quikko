import { useSelector } from "react-redux";
import TotalOrders from "./totalOrders";
import ActiveDeliveryCompanies from "./activeDelivery";
import ActiveVendors from "./activeVendors";

export default function AdminHome() {
  const mode = useSelector((state) => state.theme.mode);
  const isDark = mode === "dark";

  return (
    <div
      className={`grid grid-cols-3 gap-6 p-8 min-h-screen transition-colors duration-500 ${
        isDark ? "bg-[#242625]" : "bg-[#f0f2f1]"
      }`}
    >
      <div className="col-span-2 space-y-6">
        <TotalOrders />
      </div>

      <div className="space-y-6">
        <ActiveDeliveryCompanies />
        <ActiveVendors />
      </div>
    </div>
  );
}
