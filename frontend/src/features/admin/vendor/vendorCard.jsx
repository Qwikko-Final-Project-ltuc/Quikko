import { FcApproval } from "react-icons/fc";
import { MdOutlinePendingActions, MdStarRate, MdEmail } from "react-icons/md";
import { IoIosRemoveCircle } from "react-icons/io";
import { IoStorefront } from "react-icons/io5";
import { FaUserTie, FaPhoneAlt } from "react-icons/fa";
import { AiFillProduct } from "react-icons/ai";
import { ApproveVendors, RejectVendors } from "./vendorApi";
import { useDispatch, useSelector } from "react-redux";
import { approveVendorLocal, rejectVendorLocal } from "./vendorSlice";

export default function VendorCard({ vendor }) {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);
  const isDark = mode === "dark";

  const {
    vendor_id,
    store_logo,
    store_banner,
    store_name,
    status,
    commission_rate,
    contact_email,
    phone,
    products,
  } = vendor;

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return (
          <FcApproval className="text-green-500 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
        );
      case "pending":
        return (
          <MdOutlinePendingActions className="text-yellow-500 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
        );
      case "rejected":
        return (
          <IoIosRemoveCircle className="text-red-500 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
        );
      default:
        return null;
    }
  };

  const handleApprove = async (id) => {
    try {
      await ApproveVendors(id);
      dispatch(approveVendorLocal(id));
    } catch (err) {
      alert("Failed to approve vendor");
    }
  };

  const handleReject = async (id) => {
    try {
      await RejectVendors(id);
      dispatch(rejectVendorLocal(id));
    } catch (err) {
      alert("Failed to reject vendor");
    }
  };

  return (
    <div
      className={`relative p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-md transition-all duration-300 min-h-[400px] sm:min-h-[540px] flex flex-col ${
        isDark
          ? "bg-[var(--bg)] text-[var(--text)] border border-[var(--border)]"
          : "bg-[var(--bg)] text-[var(--text)] border border-[var(--border)]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center mb-3 sm:mb-4 space-x-3 sm:space-x-4">
        {store_logo ? (
          <img
            src={store_logo}
            alt={`${store_name} logo`}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-[var(--border)] flex-shrink-0"
          />
        ) : (
          <IoStorefront
            className={`w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 ${
              isDark ? "text-[var(--text)]" : "text-[var(--text)]"
            }`}
          />
        )}

        <h3
          className={`text-xl sm:text-2xl font-bold truncate ${
            isDark ? "text-[var(--text)]" : "text-[var(--text)]"
          }`}
        >
          {store_name}
        </h3>
      </div>

      {/* Vendor Info */}
      <div
        className={`space-y-2 sm:space-y-3 text-base sm:text-lg ${
          isDark ? "text-[var(--text)]" : "text-[var(--text)]"
        }`}
      >
        <div className="flex items-center gap-2">
          <FaUserTie className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="truncate">Vendor ID: {vendor_id}</span>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(status)}
          <span className="capitalize">{status}</span>
        </div>
        <div className="flex items-center gap-2">
          <MdStarRate className="text-yellow-400 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span>Rate: {commission_rate}%</span>
        </div>
        <div className="flex items-center gap-2">
          <MdEmail className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="truncate">{contact_email || "No Email"}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaPhoneAlt className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="truncate">{phone || "No Phone"}</span>
        </div>
      </div>

      {/* Products */}
      {products?.length > 0 && (
        <div
          className={`mt-3 sm:mt-4 pt-3 sm:pt-4 border-t flex-1 flex flex-col ${
            isDark ? "border-[var(--border)]" : "border-[var(--border)]"
          }  `}
        >
          <h4 className="flex items-center font-semibold mb-2 gap-2 text-base sm:text-lg">
            <AiFillProduct className="w-4 h-4 sm:w-5 sm:h-5" />
            Products ({products.length})
          </h4>
          <ul
            className="space-y-2 max-h-32 sm:max-h-48 overflow-y-auto pr-2 h-30"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: isDark ? "#036f4dff #1c222d83" : "#0b7c56ff #f1f5f9",
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
            
            {products.map((product) => (
              <li
                key={product.product_id}
                className={`p-2 sm:p-3 rounded-lg border text-sm sm:text-base ${
                  isDark
                    ? "border-[var(--border)] bg-[var(--bg)] text-[var(--text)]"
                    : "border-[var(--border)] bg-[var(--bg)] text-[var(--text)]"
                }`}
              >
                <div className="flex justify-between items-center gap-2">
                  <span className="font-medium truncate">{product.name}</span>
                  <span className="flex-shrink-0">${product.price}</span>
                </div>
                <div
                  className={`text-xs sm:text-sm mt-1 ${
                    isDark ? "text-[var(--text)]" : "text-[var(--text)]"
                  }`}
                >
                  (Stock: {product.stock_quantity})
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="absolute bottom-4 right-6 flex gap-2">
        {status === "pending" && (
          <>
            <button
              onClick={() => handleApprove(vendor_id)}
              className="px-3 py-1 rounded-md bg-[var(--button)] text-white hover:bg-[#265e46] transition-colors cursor-pointer text-sm sm:text-base text-center"
            >
              Approve
            </button>
            <button
              onClick={() => handleReject(vendor_id)}
              className="px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer text-sm sm:text-base text-center"
            >
              Reject
            </button>
          </>
        )}
        {status === "approved" && (
          <button
            onClick={() => handleReject(vendor_id)}
            className="px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer text-sm sm:text-base text-center"
          >
            Reject
          </button>
        )}
        {status === "rejected" && (
          <button
            onClick={() => handleApprove(vendor_id)}
            className="px-3 py-1 rounded-md bg-[var(--button)] text-white hover:bg-[#265e46] transition-colors cursor-pointer text-sm sm:text-base text-center"
          >
            Approve
          </button>
        )}
      </div>
    </div>
  );
}
