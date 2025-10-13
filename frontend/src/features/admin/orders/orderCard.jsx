import { MdOutlinePendingActions } from "react-icons/md";
import { FcShipped } from "react-icons/fc";
import { FaTruckLoading, FaBoxes } from "react-icons/fa";
import { useState } from "react";
import { LiaWindowCloseSolid } from "react-icons/lia";
import { useSelector } from "react-redux";

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
  const mode = useSelector((state) => state.theme.mode);
  const isDark = mode === "dark";

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
    <div
      className={`rounded-xl shadow-md p-5 w-full transition-transform transform hover:scale-[1.02] ${
        isDark
          ? "bg-[#2c2f33] text-white border border-gray-600"
          : "bg-white text-gray-800 border border-gray-200"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-3 mb-3">
        {/* Basic Info */}
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-lg">Order ID:</span>
          <span className="font-medium">{order_id}</span>
        </div>
        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
          <span className="font-semibold text-lg">Customer:</span>
          <span className="font-medium">{customer?.name}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
        <div className="flex items-center space-x-1">
          <span className="font-semibold">Total:</span>
          <span>${total_amount}</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="font-semibold">Vendor:</span>
          <span>{items?.[0]?.vendor?.name}</span>
        </div>

        <div className="flex items-center space-x-1">
          <span className="font-semibold">Status:</span>
          <span className="capitalize flex items-center">
            {getStatusIcon(status)}
            <span className="ml-1">{status}</span>
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="font-semibold">Delivery:</span>
          <span>{delivery_company?.company_name}</span>
        </div>
      </div>

      {/* View Details Button */}
      <div className="mt-2 flex justify-end">
        <button
          className="px-4 py-2 rounded-md bg-[#307A59] text-white hover:bg-[#265e46] transition font-medium"
          onClick={() => setShowDetailsDrawer(true)}
        >
          View Details ({items?.length || 0})
        </button>
      </div>

      {/* Drawer */}
      {showDetailsDrawer && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
            onClick={() => setShowDetailsDrawer(false)}
          ></div>
          <div
            className={`relative w-[420px] max-w-full p-6 rounded-xl shadow-2xl z-10 transition-transform transform ${
              isDark ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"
            }`}
          >
            <div className="flex justify-between items-center mb-5 border-b pb-3">
              <h3 className="text-xl font-bold">Order Details</h3>
              <button
                onClick={() => setShowDetailsDrawer(false)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <LiaWindowCloseSolid size={22} />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">Company:</span>{" "}
                {delivery_company?.company_name || "-"}
              </p>
              <p>
                <span className="font-semibold">Payment:</span>{" "}
                {payment_status || "-"}
              </p>
              <p>
                <span className="font-semibold">Status:</span> {status || "-"}
              </p>
            </div>

            <hr className="my-3" />
            {items?.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-3 border-b pb-1">
                  Items
                </h4>
                <ul className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {items.map((item) => (
                    <li
                      key={item.product_id}
                      className={`p-3 rounded-lg border ${
                        isDark
                          ? "border-gray-600 bg-gray-700 text-gray-100"
                          : "border-gray-200 bg-gray-50 text-gray-800"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{item.name}</span>
                        <span>${item.price}</span>
                      </div>
                      <div
                        className={`text-sm mt-1 ${
                          isDark ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        Quantity: {item.quantity}
                      </div>

                      {item.variant && Object.keys(item.variant).length > 0 ? (
                        <div
                          className={`text-sm mt-1 ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Variants:{" "}
                          {Object.entries(item.variant)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(", ")}
                        </div>
                      ) : (
                        <div className={`text-sm mt-1 italic ${isDark ? "text-gray-500" : "text-gray-400"}`}>
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
  );
}
