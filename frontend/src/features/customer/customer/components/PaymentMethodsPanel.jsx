import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPayments, deletePayment } from "../paymentSlice";

const PaymentMethodsPanel = () => {
  const dispatch = useDispatch();
  const { payments, status, error: sliceError } = useSelector((state) => state.payment);
  const [loadingAction, setLoadingAction] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
    paymentMethod: "",
    amount: ""
  });

  // Pagination & Filtering
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [paymentFilter, setPaymentFilter] = useState("all");
  const theme = useSelector((state) => state.customerTheme.mode);

  useEffect(() => {
    dispatch(fetchPayments());
  }, [dispatch]);

  const handleDeleteClick = (id, paymentMethod, amount) => {
    setDeleteModal({
      isOpen: true,
      id,
      paymentMethod,
      amount
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.id) return;
    
    setLoadingAction(true);
    try {
      await dispatch(deletePayment(deleteModal.id)).unwrap();
      setDeleteModal({ isOpen: false, id: null, paymentMethod: "", amount: "" });
    } catch (err) {
      console.log("Delete failed: " + err);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, id: null, paymentMethod: "", amount: "" });
  };

  const PaymentItem = ({ p }) => (
    <div className={`flex flex-col md:flex-row md:justify-between items-start md:items-center ${
      theme === 'dark' ? 'bg-[var(--mid-dark)]' : 'bg-[var(--bg)]'
    } shadow-lg rounded-2xl p-5 mb-4 hover:shadow-2xl transition-shadow duration-200 `}>
      <div className="flex-1 space-y-1">
        <div className="font-semibold text-[var(--text)]">
          {p.payment_method === "paypal"
            ? `PayPal — ${p.transaction_id}`
            : `${p.card_brand || "Card"} ****${p.card_last4}` + (p.transaction_id ? ` — TX: ${p.transaction_id}` : "")}
        </div>
        <div className={`text-sm ${
          theme === 'dark' ? 'text-[var(--light-gray)]' : 'text-gray-500'
        }`}>
          {new Date(p.created_at).toLocaleString("en-US", { timeZone: "Asia/Amman" })}
        </div>
      </div>
      <div className="flex flex-col md:items-end mt-3 md:mt-0 gap-1">
        <div className="text-[var(--text)] font-medium">Amount Paid: ${parseFloat(p.amount || 0).toFixed(2)}</div>
        <div className={`text-sm ${
          theme === 'dark' ? 'text-[var(--light-gray)]' : 'text-gray-500'
        }`}>
          Order Total: ${parseFloat(p.order_total || 0).toFixed(2)} | Status: {p.status}
        </div>
        <button
          onClick={() => handleDeleteClick(p.id, p.payment_method, p.amount)}
          disabled={loadingAction}
          className="mt-2 text-red-500 hover:text-red-700 font-semibold transition-colors duration-200 disabled:opacity-50"
        >
          {loadingAction ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );

  // Filter
  const filteredPayments = payments.filter((p) => {
    if (paymentFilter === "all") return true;
    if (paymentFilter === "paypal") return p.payment_method === "paypal";
    if (paymentFilter === "visa")
      return p.payment_method?.toLowerCase().includes("card") && p.card_brand?.toLowerCase() === "visa";
    return true;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  return (
    <div className="max-w-4xl mx-auto">
      {status === "loading" && <p className="text-gray-500">Loading transactions...</p>}
      {sliceError && <p className="text-red-500">{sliceError}</p>}

      {/* Filter Buttons */}
      <div className="mb-6 flex flex-wrap gap-3">
        {["all", "paypal", "visa"].map((filter) => (
          <button
            key={filter}
            onClick={() => {
              setPaymentFilter(filter);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-full font-medium transition-colors duration-200 ${
              paymentFilter === filter
                ? "bg-[var(--button)] text-white shadow"
                : "bg-[var(--bg)] text-[var(--text)] hover:bg-[var(--hover)]"
            }`}
          >
            {filter === "all" ? "All" : filter === "paypal" ? "PayPal" : "Visa"}
          </button>
        ))}
      </div>

      {/* Payment List */}
      <div className="space-y-3">
        {currentPayments.length === 0 ? (
          <div className={`${
            theme === 'dark' ? 'text-[var(--text)] bg-[var(--div)]' : 'text-[var(--text)] bg-[var(--bg)]'
          } p-4 rounded-lg text-center border border-[var(--border)]`}>
            No transactions found
          </div>
        ) : (
          currentPayments.map((p) => <PaymentItem key={p.id} p={p} />)
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 rounded-full font-medium transition-colors duration-200 ${
                currentPage === page
                  ? "bg-[var(--button)] text-white shadow"
                  : "bg-[var(--textbox)] text-[var(--text)] hover:bg-[var(--hover)]"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className={`relative w-full max-w-md rounded-2xl shadow-xl transform transition-all ${
            theme === 'dark' 
              ? 'bg-[var(--mid-dark)] border border-[var(--border)]' 
              : 'bg-white border border-gray-200'
          }`}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                </div>
                <h3 className="text-lg font-bold text-[var(--text)]">Delete Transaction</h3>
              </div>
              <button
                onClick={handleDeleteCancel}
                className="p-2 hover:bg-[var(--hover)] rounded-lg transition-colors"
              >
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-[var(--text)] mb-2">
                Are you sure you want to delete this transaction?
              </p>
              <div className={`p-4 rounded-lg ${
                theme === 'dark' ? 'bg-[var(--dark)]' : 'bg-gray-50'
              }`}>
                <p className="font-medium text-[var(--text)]">
                  {deleteModal.paymentMethod === "paypal" ? "PayPal" : "Card"} Payment
                </p>
                <p className="text-[var(--light-gray)]">
                  Amount: ${parseFloat(deleteModal.amount || 0).toFixed(2)}
                </p>
              </div>
              <p className="text-red-500 text-sm mt-3">
                This action cannot be undone.
              </p>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t border-[var(--border)]">
              <button
                onClick={handleDeleteCancel}
                disabled={loadingAction}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  theme === 'dark' 
                    ? 'bg-[var(--dark)] text-[var(--text)] hover:bg-[var(--hover)]' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } disabled:opacity-50`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={loadingAction}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingAction ? (
                  <span className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </span>
                ) : (
                  "Delete Transaction"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodsPanel;
