import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setDelivery } from "../delivery/deliverySlice";
import { setOrders } from "../orders/orderSlice";
import { DeliveryCompanies } from "../delivery/deliveryApi";
import { Orders } from "../orders/orderApi";

export default function ActiveDeliveryCompanies() {
  const dispatch = useDispatch();
  const { deliveries } = useSelector((state) => state.deliveries);
  const { orders } = useSelector((state) => state.orders);

  useEffect(() => {
    async function fetchData() {
      try {
        const companies = await DeliveryCompanies();
        const allOrders = await Orders();

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

  const companiesWithOrders = deliveries.map((delivery) => {
    const deliveryOrders = orders.filter(
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
    <div className="bg-white shadow rounded p-4">
      <h2 className="text-lg font-semibold mb-4">Active Delivery Companies</h2>
      {topTwo.map((delivery) => (
        <div
          key={delivery.company_id}
          className="p-4 border rounded mb-3 shadow-sm bg-white flex justify-between items-center"
        >
          <div>
            <h3 className="font-semibold">{delivery.company_name}</h3>
            <p className="text-sm">Coverage Areas: {delivery.coverage}</p>
            <p className="text-sm text-gray-600">
              {delivery.totalOrders} Orders
            </p>
          </div>
          <span className="font-bold">Total Sales: ${delivery.totalSales}</span>
        </div>
      ))}
    </div>
  );
}
