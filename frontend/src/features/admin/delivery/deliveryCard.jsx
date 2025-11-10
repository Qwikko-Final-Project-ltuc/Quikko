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
        return <FcApproval className="text-green-500 w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />;
      case "pending":
        return <MdOutlinePendingActions className="text-yellow-500 w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />;
      case "rejected":
        return <IoIosRemoveCircle className="text-red-500 w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />;
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
    <div
      className={`relative rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6 transition-all duration-300 min-h-[280px] sm:min-h-[300px] flex flex-col ${
        isDark
          ? "bg-[var(--bg)] text-[var(--text)] border border-[var(--border)]"
          : "bg-[var(--bg)] text-[var(--text)] border border-[var(--border)]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center mb-3 sm:mb-4 space-x-3 sm:space-x-4">
        <FaTruck
          className={`w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 ${
            isDark ? "text-[var(--text)]" : "text-[var(--text)]"
          }`}
        />
        <h3
          className={`text-xl sm:text-2xl font-bold truncate ${
            isDark ? "text-[var(--text)]" : "text-[var(--text)]"
          }`}
        >
          {company_name}
        </h3>
      </div>

      {/* Info */}
      <div
        className={`space-y-2 sm:space-y-3 text-base sm:text-lg mb-4 flex-1 ${
          isDark ? "text-[var(--text)]" : "text-[var(--text)]"
        }`}
      >
        <div className="flex items-center gap-2">
          <FaTruckLoading className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
          <span className="break-words">Company ID: {company_id}</span>
        </div>
        <div className="flex items-center gap-2">
          <PiMapPinAreaFill className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
          <span className="break-words line-clamp-2">
            Coverage Areas: {coverage_areas?.join(", ") || "Not specified"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(status)}
          <span className="capitalize">Status: {status}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="absolute bottom-4 right-6 flex gap-2">
        {status === "pending" && (
          <>
            <button
              onClick={() => handleApprove(company_id)}
              className="px-3 py-1 rounded-md bg-[var(--button)] text-white hover:bg-[#265e46] transition-colors cursor-pointer text-sm sm:text-base text-center"
            >
              Approve
            </button>
            <button
              onClick={() => handleReject(company_id)}
              className="px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer text-sm sm:text-base text-center"
            >
              Reject
            </button>
          </>
        )}
        {status === "approved" && (
          <button
            onClick={() => handleReject(company_id)}
            className="px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer text-sm sm:text-base text-center"
          >
            Reject
          </button>
        )}
        {status === "rejected" && (
          <button
            onClick={() => handleApprove(company_id)}
            className="px-3 py-1 rounded-md bg-[var(--button)] text-white hover:bg-[#265e46] transition-colors cursor-pointer text-sm sm:text-base text-center"
          >
            Approve
          </button>
        )}
      </div>
    </div>
  );
}
