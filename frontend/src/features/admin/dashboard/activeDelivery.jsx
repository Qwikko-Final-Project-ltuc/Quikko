import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setDelivery } from "../delivery/deliverySlice";
import { setOrders } from "../orders/orderSlice";
import { DeliveryCompanies } from "../delivery/deliveryApi";
import { Orders } from "../orders/orderApi";

export default function ActiveDeliveryCompanies() {
  const dispatch = useDispatch();
  const  deliveries  = useSelector((state) => state.deliveries.deliveries);
  const  orders  = useSelector((state) => state.ordersAdmin.orders);
  const mode = useSelector((state) => state.theme.mode);
  const isDark = mode === "dark";

  useEffect(() => {
    async function fetchData() {
      try {
        const companies = await DeliveryCompanies();
        const allOrders = await Orders();
        console.log("Delivery companies:", companies);

        const approvedCompanies = (companies.data || []).filter(
          (d) => d.status === "approved"
        );

        dispatch(setDelivery(approvedCompanies));
        dispatch(setOrders(allOrders.data || []));
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    }
    fetchData();
  }, [dispatch]);

  const companiesWithOrders = (deliveries || []).map((delivery) => {
  const deliveryOrders = (orders || []).filter(
    (o) =>
      o.delivery_company?.id === delivery.company_id ||
      o.delivery_company_id === delivery.company_id
  );

    const totalSales = deliveryOrders.reduce((sum, order) => {
      const orderTotal = (order.items || []).reduce(
        (s, item) => s + item.price * item.quantity,
        0
      );
      return sum + orderTotal;
    }, 0);

    return {
      ...delivery,
      totalOrders: deliveryOrders.length,
      totalSales,
      coverage: (delivery.coverage_areas || []).join(", "),
    };
  });

  const topTwo = [...companiesWithOrders]
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
        Active Delivery Companies
      </h2>

      {topTwo.length === 0 ? (
        <p>No active delivery companies</p>
      ) : (
        topTwo.map((delivery) => (
          <div
            key={delivery.company_id}
            className={`p-5 border rounded-xl shadow-md mb-4 flex justify-between items-center hover:scale-[1.02] transition-all duration-300 ${
              isDark ? "bg-[#242625]" : "bg-white"
            }`}
            style={{
              borderColor: isDark ? "#f9f9f9" : "#e5e5e5",
            }}
          >
            <div>
              <h3 className="font-semibold">{delivery.company_name}</h3>
              <p className="text-sm opacity-80">Coverage: {delivery.coverage}</p>
              <p className="text-sm opacity-70">{delivery.totalOrders} Orders</p>
            </div>
            <span className="font-bold text-[#307A59]">
              ${delivery.totalSales.toFixed(2)}
            </span>
          </div>
        ))
      )}
    </div>
  );
}
