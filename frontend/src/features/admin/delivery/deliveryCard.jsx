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
    <div className={`relative rounded-xl shadow-md p-6 transition-transform duration-300 h-[300px] ${
      isDark ? "bg-[var(--bg)] text-[var(--text)] border border-[var(--border)]" : "bg-[var(--bg)] text-[var(--text)] border border-[var(--border)]"
    }`}>
      {/* Header */}
      <div className="flex items-center mb-4 space-x-4">
        <FaTruck className={`w-12 h-12 ${isDark ? "text-[var(--text)]" : "text-[var(--text)]"}`} />
        <h3 className={`text-2xl font-bold ${isDark ? "text-[var(--text)]" : "text-[var(--text)]"}`}>{company_name}</h3>
      </div>

      {/* Info */}
      <div className={`space-y-2 text-lg ${isDark ? "text-[var(--text)]" : "text-[var(--text)]"}`}>
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
          <span className="capitalize">Status: {status}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        {status === "pending" && (
          <>
            <button
              onClick={() => handleApprove(company_id)}
              className="px-3 py-1 rounded-md bg-[var(--button)] text-white hover:bg-[#265e46] transition-colors cursor-pointer"
            >
              Approve
            </button>
            <button
              onClick={() => handleReject(company_id)}
              className="px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer"
            >
              Reject
            </button>
          </>
        )}
        {status === "approved" && (
          <button
            onClick={() => handleReject(company_id)}
            className="px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer"
          >
            Reject
          </button>
        )}
        {status === "rejected" && (
          <button
            onClick={() => handleApprove(company_id)}
            className="px-3 py-1 rounded-md bg-[var(--button)] text-white hover:bg-[#265e46] transition-colors cursor-pointer"
          >
            Approve
          </button>
        )}
      </div>
    </div>
  );
}
