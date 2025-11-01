import { useSelector } from "react-redux";
import TotalOrders from "./totalOrders";
import ActiveDeliveryCompanies from "./activeDelivery";
import ActiveVendors from "./activeVendors";
import TopCategories from "./TopCategories";
import TopCustomers from "./TopCustomers";

export default function AdminHome() {
  const mode = useSelector((state) => state.theme.mode);
  const isDark = mode === "dark";

  return (
    <div
      className={`grid grid-cols-[2fr_1fr] gap-6 p-8 min-h-screen transition-colors duration-500 ${
        isDark ? "bg-[#242625]" : "bg-[#f0f2f1]"
      }`}
    >
      <div className="space-y-6">
        <TotalOrders />
        <TopCustomers />
      </div>

      <div className="space-y-6">
        <ActiveDeliveryCompanies />
        <ActiveVendors />
        <TopCategories />
      </div>
    </div>
  );
}
