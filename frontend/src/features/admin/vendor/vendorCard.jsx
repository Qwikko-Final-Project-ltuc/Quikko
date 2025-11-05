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
        return <FcApproval className="text-green-500 w-5 h-5" />;
      case "pending":
        return <MdOutlinePendingActions className="text-yellow-500 w-5 h-5" />;
      case "rejected":
        return <IoIosRemoveCircle className="text-red-500 w-5 h-5" />;
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
      className={`relative p-6 rounded-xl shadow-md transition-transform duration-300 h-[525px] ${
        isDark
          ? "bg-[var(--bg)] text-[var(--text)] border border-[var(--border)]"
          : "bg-[var(--bg)] text-[var(--text)] border border-[var(--border)]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center mb-4 space-x-4">
        {store_logo ? (
          <img
            src={store_logo}
            alt={`${store_name} logo`}
            className="w-12 h-12 rounded-full object-cover border border-[var(--border)]"
          />
        ) : (
          <IoStorefront
            className={`w-12 h-12 ${
              isDark ? "text-[var(--text)]" : "text-[var(--text)]"
            }`}
          />
        )}

        <h3
          className={`text-2xl font-bold ${
            isDark ? "text-[var(--text)]" : "text-[var(--text)]"
          }`}
        >
          {store_name}
        </h3>
      </div>

      {/* Vendor Info */}
      <div
        className={`space-y-2 text-lg ${
          isDark ? "text-[var(--text)]" : "text-[var(--text)]"
        }`}
      >
        <div className="flex items-center gap-2">
          <FaUserTie />
          <span>Vendor ID: {vendor_id}</span>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(status)}
          <span className="capitalize">{status}</span>
        </div>
        <div className="flex items-center gap-2">
          <MdStarRate className="text-yellow-400" />
          <span>Rate: {commission_rate}</span>
        </div>
        <div className="flex items-center gap-2">
          <MdEmail />
          <span>{contact_email || "No Email"}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaPhoneAlt />
          <span>{phone || "No Phone"}</span>
        </div>
      </div>

      {/* Products */}
      {products?.length > 0 && (
        <div
          className={`mt-4 pt-4 border-t ${
            isDark ? "border-[var(--border)]" : "border-[var(--border)]"
          }  `}
        >
          <h4 className="flex items-center font-semibold mb-2 gap-2 text-lg">
            <AiFillProduct />
            Products
          </h4>
          <ul className="space-y-3 max-h-64 overflow-y-auto pr-2 h-30">
            {products.map((product) => (
              <li
                key={product.product_id}
                className={`p-3 rounded-lg border ${
                  isDark
                    ? "border-[var(--border)] bg-[var(--bg)] text-[var(--text)]"
                    : "border-[var(--border)] bg-[var(--bg)] text-[var(--text)]"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{product.name}</span>
                  <span>${product.price}</span>
                </div>
                <div
                  className={`text-sm mt-1 ${
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
      <div className="absolute bottom-4 right-4 flex gap-2">
        {status === "pending" && (
          <>
            <button
              onClick={() => handleApprove(vendor_id)}
              className="px-3 py-1 rounded-md bg-[var(--button)] text-white hover:bg-[#265e46] transition-colors cursor-pointer"
            >
              Approve
            </button>
            <button
              onClick={() => handleReject(vendor_id)}
              className="px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer"
            >
              Reject
            </button>
          </>
        )}
        {status === "approved" && (
          <button
            onClick={() => handleReject(vendor_id)}
            className="px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer"
          >
            Reject
          </button>
        )}
        {status === "rejected" && (
          <button
            onClick={() => handleApprove(vendor_id)}
            className="px-3 py-1 rounded-md bg-[var(--button)] text-white hover:bg-[#265e46] transition-colors cursor-pointer"
          >
            Approve
          </button>
        )}
      </div>
    </div>
  );
}
