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
          <MdOutlinePendingActions className="w-4 h-4 text-yellow-500" />
          <span className="capitalize">Pending</span>
        </>
      );
    case "processing":
      return (
        <>
          <FcProcess className="w-4 h-4 text-gray-600" />
          <span className="capitalize">Processing</span>
        </>
      );
    case "accepted":
      return (
        <>
          <FcApproval className="w-4 h-4" />
          <span className="capitalize">Accepted</span>
        </>
      );
    case "out_for_delivery":
      return (
        <>
          <FcShipped className="w-4 h-4 text-gray-600" />
          <span className="capitalize">Out For Delivery</span>
        </>
      );
    case "delivered":
      return (
        <>
          <FaTruckLoading className="w-4 h-4 text-green-500" />
          <span className="capitalize">Delivered</span>
        </>
      );
    default:
      return null;
  }
};


  return (
    <div
      className={`relative rounded-xl shadow-md p-6 transition-transform duration-300 h-[325px] ${
        isDark
          ? "bg-[var(--bg)] text-[var(--text)] border border-[var(--border)]"
          : "bg-[var(--bg)] text-[var(--text)] border border-[var(--border)]"
      }`}
    >
      {/* Basic Info */}
      <div className="flex items-center mb-4 space-x-4">
        <AiFillProduct
          className={`w-12 h-12 ${
            isDark ? "text-[var(--text)]" : "text-[var(--text)]"
          }`}
        />
        <h3
          className={`text-3xl font-bold ${
            isDark ? "text-[var(--text)]" : "text-[var(--text)]"
          }`}
        >
          Order ID: {order_id}
        </h3>
      </div>

      <div
        className={`space-y-2 text-sm ${
          isDark ? "text-[var(--text)]" : "text-[var(--text)]"
        }`}
      >
        <div className="flex items-center gap-2">
          <IoMdPerson className="w-5 h-5" />
          <span className=" capitalize text-lg">Customer: {customer?.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaUserTie className="w-5 h-5" />
          <span className="capitalize text-lg">Vendor: {items?.[0]?.vendor?.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaTruck className="w-5 h-5" />
          <span className="capitalize text-lg">
            Delivery: {delivery_company?.company_name}
          </span>
        </div>
        <div className="flex items-center gap-2 text-lg">
          {getStatusIcon(status)}
        </div>
        <div className="flex items-center gap-2 text-lg">
          <GrMoney className="w-5 h-5" />
          <span>Total: ${total_amount}</span>
        </div>
      </div>

      {/* View Details Button */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button
          className="px-4 py-2 rounded-md bg-[var(--button)] text-white hover:bg-[#265e46] transition font-medium cursor-pointer"
          onClick={() => setShowDetailsDrawer(true)}
        >
          Items Details ({items?.length || 0})
        </button>
      </div>

      {/* Drawer */}
      {showDetailsDrawer && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
            onClick={() => setShowDetailsDrawer(false)}
          ></div>
          <div
            className={`relative w-[440px] p-8 rounded-xl shadow-2xl z-10 transition-transform transform ${
              isDark
                ? "bg-[var(--bg)] text-[var(--text)]"
                : "bg-[var(--bg)] text-[var(--text)]"
            }`}
          >
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => setShowDetailsDrawer(false)}
                className="text-[var(--text)] hover:text-red-500 transition-colors cursor-pointer"
              >
                <LiaWindowCloseSolid size={22} />
              </button>
            </div>

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
                          ? "bg-[var(--bg)] text-[var(--text)]  border-[var(--border)]"
                          : "bg-[var(--bg)] text-[var(--text)]  border-[var(--border)]"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{item.name}</span>
                        <span>${item.price}</span>
                      </div>
                      <div
                        className={`text-sm mt-1 ${
                          isDark ? "text-[var(--text)]" : "text-[var(--text)]"
                        }`}
                      >
                        Quantity: {item.quantity}
                      </div>

                      {item.variant && Object.keys(item.variant).length > 0 ? (
                        <div
                          className={`text-sm mt-1 ${
                            isDark ? "text-[var(--text)]" : "text-[var(--text)]"
                          }`}
                        >
                          Variants:{" "}
                          {Object.entries(item.variant)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(", ")}
                        </div>
                      ) : (
                        <div
                          className={`text-sm mt-1 italic ${
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
