import { MdOutlinePendingActions } from "react-icons/md";
import { FcApproval } from "react-icons/fc";
import { IoIosRemoveCircle } from "react-icons/io";
import { FaTruckLoading, FaTruck } from "react-icons/fa";
import { PiMapPinAreaFill } from "react-icons/pi";
import {
  ApproveDeliveryCompanies,
  RejectDeliveryCompanies,
} from "./deliveryApi";
import { useDispatch, useSelector } from "react-redux";
import { approveDeliveryLocal, rejectDeliveryLocal } from "./deliverySlice";

export default function DeliveryCard({ delivery }) {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);
  const isDark = mode === "dark";

  const { company_id, company_name, coverage_areas, status } = delivery;

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
      await ApproveDeliveryCompanies(id);
      dispatch(approveDeliveryLocal(id));
    } catch (err) {
      alert("Failed to approve delivery company");
    }
  };

  const handleReject = async (id) => {
    try {
      await RejectDeliveryCompanies(id);
      dispatch(rejectDeliveryLocal(id));
    } catch (err) {
      alert("Failed to reject delivery company");
    }
  };

  return (
    <div className={`rounded-xl shadow-md p-6 max-w-sm w-full transition-transform transform hover:scale-105 ${
      isDark ? "bg-[#333] text-white border border-gray-600" : "bg-white text-gray-800 border border-gray-300"
    }`}>
      {/* Header */}
      <div className="flex items-center mb-4">
        <FaTruck className={`w-10 h-10 mr-4 ${isDark ? "text-white" : "text-gray-700"}`} />
        <h3 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>{company_name}</h3>
      </div>

      {/* Info */}
      <div className={`space-y-2 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
        <div className="flex items-center gap-2">
          <FaTruckLoading className="w-5 h-5" />
          <span>Company ID: {company_id}</span>
        </div>
        <div className="flex items-center gap-2">
          <PiMapPinAreaFill className="w-5 h-5" />
          <span>Coverage Areas: {coverage_areas?.join(", ") || "Not specified"}</span>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(status)}
          <span className="capitalize ml-1">Status: {status}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4 flex-wrap">
        {status === "pending" && (
          <>
            <button
              onClick={() => handleApprove(company_id)}
              className="px-3 py-1 rounded-md bg-[#307A59] text-white hover:bg-[#265e46] transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => handleReject(company_id)}
              className="px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              Reject
            </button>
          </>
        )}
        {status === "approved" && (
          <button
            onClick={() => handleReject(company_id)}
            className="px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            Reject
          </button>
        )}
        {status === "rejected" && (
          <button
            onClick={() => handleApprove(company_id)}
            className="px-3 py-1 rounded-md bg-[#307A59] text-white hover:bg-[#265e46] transition-colors"
          >
            Approve
          </button>
        )}
      </div>
    </div>
  );
}
