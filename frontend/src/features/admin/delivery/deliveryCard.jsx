import { MdOutlinePendingActions } from "react-icons/md";
import { FcApproval } from "react-icons/fc";
import { IoIosRemoveCircle } from "react-icons/io";
import { FaTruckLoading, FaTruck } from "react-icons/fa";
import { PiMapPinAreaFill } from "react-icons/pi";
import {
  ApproveDeliveryCompanies,
  RejectDeliveryCompanies,
} from "./deliveryApi";
import { useDispatch } from "react-redux";
import { approveDeliveryLocal, rejectDeliveryLocal } from "./deliverySlice";

export default function DeliveryCard({ delivery }) {
  const dispatch = useDispatch();
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
    <div className="bg-white rounded-lg shadow-md p-6 max-w-sm w-full transition-transform transform hover:scale-105">
      <div className="flex items-center mb-4">
        <FaTruck className="text-4xl text-gray-700 mr-4 w-10 h-10" />
        <h3 className="text-2xl font-bold text-gray-800">{company_name}</h3>
      </div>
      <div className="space-y-3 text-gray-600">
        <div className="flex items-center">
          <FaTruckLoading className="w-5 h-5 mr-2" />
          <span>Company ID: {company_id}</span>
        </div>
        <div className="flex items-center">
          <PiMapPinAreaFill className="w-5 h-5 mr-2" />
          <span>
            Coverage Areas:{" "}
            {coverage_areas ? coverage_areas.join(", ") : "Not specified"}
          </span>
        </div>
        <div className="flex items-center">
          {getStatusIcon(status)}
          <span className="capitalize ml-2">Status: {status}</span>
        </div>
      </div>

      <div className="flex gap-2 mt-2">
        {delivery.status === "pending" && (
          <>
            <button
              onClick={() => handleApprove(delivery.company_id)}
              className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
            >
              Approve
            </button>
            <button
              onClick={() => handleReject(delivery.company_id)}
              className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
            >
              Reject
            </button>
          </>
        )}
        {delivery.status === "approved" && (
          <button
            onClick={() => handleReject(delivery.company_id)}
            className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
          >
            Reject
          </button>
        )}
        {delivery.status === "rejected" && (
          <button
            onClick={() => handleApprove(delivery.company_id)}
            className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
          >
            Approve
          </button>
        )}
      </div>
    </div>
  );
}
