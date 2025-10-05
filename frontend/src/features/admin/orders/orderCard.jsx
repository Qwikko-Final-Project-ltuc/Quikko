import { MdOutlinePendingActions } from "react-icons/md";
import { FcShipped } from "react-icons/fc";
import { FaTruckLoading, FaBoxes } from "react-icons/fa";
import { useState } from "react";
import { LiaWindowCloseSolid } from "react-icons/lia";

export default function OrdersCard({ order }) {
  const {
    order_id,
    total_amount,
    status,
    customer,
    items,
    delivery_company,
    payment_status,
  } = order;
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);

  const getStatusIcon = (status) => {
    switch (status) {
      case "preparing":
        return <FaBoxes className="w-4 h-4 text-gray-600" />;
      case "pending":
        return <MdOutlinePendingActions className="w-4 h-4 text-yellow-500" />;
      case "shipped":
        return <FcShipped className="w-4 h-4 text-gray-600" />;
      case "delivered":
        return <FaTruckLoading className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full transition-transform transform hover:scale-[1.01]">
      <div className="space-y-3 text-gray-600">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <span className="font-medium"><span className="mr-2">•</span>Order ID: {order_id}</span>
          <span className="font-medium"><span className="mr-2">•</span>Customer Name: {customer?.name}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <span className="font-medium"><span className="mr-2">•</span>Total Amount: ${total_amount}</span>
          <span className="font-medium"><span className="mr-2">•</span>Vendor Name: {items?.[0]?.vendor?.name}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <span className="flex items-center capitalize">
            {getStatusIcon(status)}
            <span className="font-medium ml-2"><span className="mr-2">•</span>Status: {status}</span>
          </span>
          <span className="font-medium">
            <span className="mr-2">•</span>Delivery Company: {delivery_company?.company_name}
          </span>
        </div>

        <div className="mt-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            onClick={() => setShowDetailsDrawer(true)}
          >
            View Details ({items?.length || 0})
          </button>
        </div>

        {showDetailsDrawer && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div
              className="absolute inset-0 backdrop-blur-sm bg-black/10"
              onClick={() => setShowDetailsDrawer(false)}
            ></div>

            <div className="relative bg-white rounded-lg shadow-lg w-[400px] p-6 z-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Order Details</h3>
                <button
                  onClick={() => setShowDetailsDrawer(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <LiaWindowCloseSolid size={20} />
                </button>
              </div>

              <p>
                <strong>Company:</strong> {delivery_company?.company_name}
              </p>
              <p>
                <strong>Payment:</strong> {payment_status}
              </p>
              <p>
                <strong>Status:</strong> {status}
              </p>

              <hr className="my-3" />

              {items && items.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-700 flex items-center mb-2">
                    Items
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    {items.map((item) => (
                      <li key={item.product_id} className="border-b pb-2">
                        <div>
                          <span className="font-medium">{item.name}</span> - $
                          {item.price}
                          <span className="ml-2">Qty: {item.quantity}</span>
                        </div>

                        {item.variant &&
                        Object.keys(item.variant).length > 0 ? (
                          <div className="text-gray-500">
                            Variants:{" "}
                            {Object.entries(item.variant)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(", ")}
                          </div>
                        ) : (
                          <div className="text-gray-400 italic">
                            No variants
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
