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
      className={`w-full mx-auto p-4 md:p-6 rounded-2xl transition-colors duration-500 mt-10 ${
        isDark ? "bg-[var(--bg)]" : "bg-[var(--bg)]"
      }`}
    >
      <h1 className="text-2xl md:text-3xl font-extrabold opacity-90 mb-4 md:mb-5 pb-2 md:pb-3">
        Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr] gap-4 md:gap-6">
        <div className="space-y-4 md:space-y-6">
          <TotalOrders />
          <TopCustomers />
        </div>

        <div className="space-y-4 md:space-y-6">
          <ActiveDeliveryCompanies />
          <ActiveVendors />
          <TopCategories />
        </div>
      </div>
    </div>
  );
}
