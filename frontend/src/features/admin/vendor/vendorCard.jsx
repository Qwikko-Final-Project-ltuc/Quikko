import { FcApproval } from "react-icons/fc";
import { MdOutlinePendingActions, MdStarRate, MdEmail } from "react-icons/md";
import { IoIosRemoveCircle } from "react-icons/io";
import { IoStorefront } from "react-icons/io5";
import { FaUserTie, FaPhoneAlt } from "react-icons/fa";
import { AiFillProduct } from "react-icons/ai";
import { ApproveVendors, RejectVendors } from "./vendorApi";
import { useDispatch } from "react-redux";
import { approveVendorLocal, rejectVendorLocal } from "./vendorSlice";

export default function VendorCard({ vendor }) {
  const dispatch = useDispatch();
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
    <div className="bg-white rounded-lg shadow-md p-6 max-w-sm w-full transition-transform transform hover:scale-105">
      <div className="flex items-center mb-4">
        <IoStorefront className="text-4xl text-gray-700 mr-4 w-10 h-10" />
        <h3 className="text-2xl font-bold text-gray-800">{store_name}</h3>
      </div>
      <div className="space-y-3 text-gray-600">
        <div className="flex items-center">
          <FaUserTie className="w-5 h-5 mr-2" />
          <span>Vendor ID: {vendor_id}</span>
        </div>
        <div className="flex items-center">
          {getStatusIcon(status)}
          <span className="capitalize ml-2">Status: {status}</span>
        </div>
        <div className="flex items-center">
          <MdStarRate className="w-5 h-5 mr-2 text-yellow-500" />
          <span>Rate: {commission_rate}</span>
        </div>
        <div className="flex items-center">
          <MdEmail className="w-5 h-5 mr-2" />
          <span>Email: {contact_email}</span>
        </div>
        <div className="flex items-center">
          <FaPhoneAlt className="w-5 h-5 mr-2" />
          <span>Phone: {phone}</span>
        </div>
      </div>
      {products && products.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-700 flex items-center mb-2">
            <AiFillProduct className="w-5 h-5 mr-2" />
            Products:
          </h4>
          <ul className="text-sm text-gray-500 space-y-1">
            {products.map((product) => (
              <li key={product.product_id}>
                {product.name} - ${product.price} (Stock:{" "}
                {product.stock_quantity})
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-2 mt-2">
        {vendor.status === "pending" && (
          <>
            <button
              onClick={() => handleApprove(vendor.vendor_id)}
              className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
            >
              Approve
            </button>
            <button
              onClick={() => handleReject(vendor.vendor_id)}
              className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
            >
              Reject
            </button>
          </>
        )}
        {vendor.status === "approved" && (
          <button
            onClick={() => handleReject(vendor.vendor_id)}
            className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
          >
            Reject
          </button>
        )}
        {vendor.status === "rejected" && (
          <button
            onClick={() => handleApprove(vendor.vendor_id)}
            className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
          >
            Approve
          </button>
        )}
      </div>
    </div>
  );
}
