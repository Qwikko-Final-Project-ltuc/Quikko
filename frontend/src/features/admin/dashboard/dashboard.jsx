import TotalOrders from "./totalOrders";
import ActiveDeliveryCompanies from "./activeDelivery";
import ActiveVendors from "./activeVendors";

export default function AdminHome() {
  return (
    <div className="grid grid-cols-3 gap-6 p-6">
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
