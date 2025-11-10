import { MdOutlinePendingActions } from "react-icons/md";
import { FcApproval, FcProcess, FcShipped } from "react-icons/fc";
import { FaTruckLoading, FaBoxes, FaTruck, FaUserTie } from "react-icons/fa";
import { useState } from "react";
import { LiaWindowCloseSolid } from "react-icons/lia";
import { useSelector } from "react-redux";
import { AiFillProduct } from "react-icons/ai";
import { IoMdPerson } from "react-icons/io";
import { GrMoney } from "react-icons/gr";

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
      case "pending":
        return (
          <>
            <MdOutlinePendingActions className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-yellow-500" />
            <span className="capitalize">Pending</span>
          </>
        );
      case "processing":
        return (
          <>
            <FcProcess className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-gray-600" />
            <span className="capitalize">Processing</span>
          </>
        );
      case "accepted":
        return (
          <>
            <FcApproval className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="capitalize">Accepted</span>
          </>
        );
      case "out_for_delivery":
        return (
          <>
            <FcShipped className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-gray-600" />
            <span className="capitalize">Out For Delivery</span>
          </>
        );
      case "delivered":
        return (
          <>
            <FaTruckLoading className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-green-500" />
            <span className="capitalize">Delivered</span>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`relative rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6 transition-all duration-300 min-h-[300px] sm:min-h-[325px] flex flex-col ${
        isDark
          ? "bg-[var(--bg)] text-[var(--text)] border border-[var(--border)]"
          : "bg-[var(--bg)] text-[var(--text)] border border-[var(--border)]"
      }`}
    >
      {/* Basic Info */}
      <div className="flex items-center mb-3 sm:mb-4 space-x-3 sm:space-x-4">
        <AiFillProduct
          className={`w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 ${
            isDark ? "text-[var(--text)]" : "text-[var(--text)]"
          }`}
        />
        <h3
          className={`text-xl sm:text-2xl font-bold truncate ${
            isDark ? "text-[var(--text)]" : "text-[var(--text)]"
          }`}
        >
          Order ID: {order_id}
        </h3>
      </div>

      <div
        className={`space-y-2 sm:space-y-3 text-sm sm:text-base mb-4 flex-1 ${
          isDark ? "text-[var(--text)]" : "text-[var(--text)]"
        }`}
      >
        <div className="flex items-center gap-2">
          <IoMdPerson className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className=" capitalize text-base sm:text-lg truncate">
            Customer: {customer?.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <FaUserTie className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="capitalize text-base sm:text-lg truncate">
            Vendor: {items?.[0]?.vendor?.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <FaTruck className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="capitalize text-base sm:text-lg truncate">
            Delivery: {delivery_company?.company_name}
          </span>
        </div>
        <div className="flex items-center gap-2 text-base sm:text-lg">
          {getStatusIcon(status)}
        </div>
        <div className="flex items-center gap-2 text-lg">
          <GrMoney className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="text-base sm:text-lg">Total: ${total_amount}</span>
        </div>
      </div>

      {/* View Details Button */}
      <div className="absolute bottom-4 right-6 flex gap-2 mt-auto">
        <button
          className="flex-1 px-3 sm:px-4 py-2 rounded-md bg-[var(--button)] text-white hover:bg-[#265e46] transition font-medium cursor-pointer text-sm sm:text-base text-center"
          onClick={() => setShowDetailsDrawer(true)}
        >
          View Items ({items?.length || 0})
        </button>
      </div>

      {/* Drawer */}
      {showDetailsDrawer && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 backdrop-blur-sm transition-opacity"
            onClick={() => setShowDetailsDrawer(false)}
          ></div>
          <div
            className={`relative w-full max-w-md sm:max-w-lg max-h-[90vh] p-4 sm:p-6 rounded-xl shadow-2xl z-10 overflow-hidden flex flex-col ${
              isDark
                ? "bg-[var(--bg)] text-[var(--text)] border border-[var(--border)]"
                : "bg-[var(--bg)] text-[var(--text)] border border-[var(--border)]"
            }`}
          >
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => setShowDetailsDrawer(false)}
                className="text-[var(--text)] hover:text-red-500 transition-colors cursor-pointer p-1"
              >
                <LiaWindowCloseSolid size={24} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            {items?.length > 0 && (
              <div className="mt-6">
                <h4 className="text-base sm:text-lg font-semibold mb-3 border-b pb-1">
                  Items
                </h4>
                <ul
                  className="space-y-3 max-h-64 overflow-y-auto pr-2"
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: isDark
                      ? "#036f4dff #1c222d83"
                      : "#0b7c56ff #f1f5f9",
                  }}
                >
                  <style jsx>{`
                    ul::-webkit-scrollbar {
                      width: 6px;
                    }
                    ul::-webkit-scrollbar-track {
                      background: ${isDark ? "#1c222d83" : "#f1f5f9"};
                      border-radius: 10px;
                    }
                    ul::-webkit-scrollbar-thumb {
                      background: ${isDark ? "#036f4dff" : "#0b7c56ff"};
                      border-radius: 10px;
                    }
                    ul::-webkit-scrollbar-thumb:hover {
                      background: ${isDark ? "#0e8462d8" : "#0a664aff"};
                    }
                  `}</style>
                  
                  {items.map((item) => (
                    <li
                      key={item.product_id}
                      className={`p-3 rounded-lg border ${
                        isDark
                          ? "bg-[var(--bg)] text-[var(--text)]  border-[var(--border)]"
                          : "bg-[var(--bg)] text-[var(--text)]  border-[var(--border)]"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-medium truncate">
                          {item.name}
                        </span>
                        <span className="flex-shrink-0">${item.price}</span>
                      </div>
                      <div
                        className={`text-xs sm:text-sm mt-1 ${
                          isDark ? "text-[var(--text)]" : "text-[var(--text)]"
                        }`}
                      >
                        Quantity: {item.quantity}
                      </div>

                      {item.variant && Object.keys(item.variant).length > 0 ? (
                        <div
                          className={`text-xs sm:text-sm mt-1 ${
                            isDark ? "text-[var(--text)]" : "text-[var(--text)]"
                          }`}
                        >
                          <strong>Variants:</strong>{" "}
                          {Object.entries(item.variant)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(", ")}
                        </div>
                      ) : (
                        <div
                          className={`text-xs sm:text-sm mt-1 italic ${
                            isDark ? "text-[var(--text)]" : "text-[var(--text)]"
                          }`}
                        >
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
