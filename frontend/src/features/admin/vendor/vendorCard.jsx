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
      className={`p-6 rounded-xl shadow-md transition-transform duration-300 hover:scale-105 ${
        isDark
          ? "bg-[#333] text-white border border-gray-600"
          : "bg-white text-gray-900 border border-gray-200"
      }`}
    >
      {/* Header */}
      <div className="flex items-center mb-4 space-x-4">
        <IoStorefront
          className={`w-12 h-12 ${isDark ? "text-white" : "text-gray-800"}`}
        />
        <h3 className="text-2xl font-bold">{store_name}</h3>
      </div>

      {/* Vendor Info */}
      <div className="space-y-2 text-sm">
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
          <span>{contact_email}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaPhoneAlt />
          <span>{phone}</span>
        </div>
      </div>

      {/* Products */}
      {products?.length > 0 && (
        <div
          className={`mt-4 pt-4 border-t ${
            isDark ? "border-gray-600" : "border-gray-300"
          }  `}
        >
          <h4 className="flex items-center font-semibold mb-2 gap-2">
            <AiFillProduct />
            Products
          </h4>
          <ul className="text-sm space-y-1">
            {products.map((product) => (
              <li key={product.product_id}>
                {product.name} - ${product.price} (Stock:{" "}
                {product.stock_quantity})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-4 flex-wrap">
        {status === "pending" && (
          <>
            <button
              onClick={() => handleApprove(vendor_id)}
              className="px-3 py-1 rounded-md bg-[#307A59] text-white hover:bg-[#265e46] transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => handleReject(vendor_id)}
              className="px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              Reject
            </button>
          </>
        )}
        {status === "approved" && (
          <button
            onClick={() => handleReject(vendor_id)}
            className="px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            Reject
          </button>
        )}
        {status === "rejected" && (
          <button
            onClick={() => handleApprove(vendor_id)}
            className="px-3 py-1 rounded-md bg-[#307A59] text-white hover:bg-[#265e46] transition-colors"
          >
            Approve
          </button>
        )}
      </div>
    </div>
  );
}
