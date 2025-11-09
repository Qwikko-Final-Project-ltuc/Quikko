import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPayments, deletePayment } from "../paymentSlice";

const PaymentMethodsPanel = () => {
  const dispatch = useDispatch();
  const { payments, status, error: sliceError } = useSelector((state) => state.payment);
  const [loadingAction, setLoadingAction] = React.useState(false);

  // Pagination & Filtering
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 5;
  const [paymentFilter, setPaymentFilter] = React.useState("all"); // all, paypal, visa
    const theme = useSelector((state) => state.customerTheme.mode);
  useEffect(() => {
    dispatch(fetchPayments());
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    setLoadingAction(true);
    try {
      await dispatch(deletePayment(id)).unwrap();
    } catch (err) {
      console.log("Delete failed: " + err);
    } finally {
      setLoadingAction(false);
    }
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
        onClick={() => handleDelete(p.id)}
        disabled={loadingAction}
        className="mt-2 text-red-500 hover:text-red-700 font-semibold transition-colors duration-200"
      >
        Delete
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
    <div className="max-w-4xl mx-auto ">
      {status === "loading" && <p className="text-gray-500">Loading transactions...</p>}
      {sliceError && <p className="text-red-500">{sliceError}</p>}

      {/* Filter Buttons */}
      <div className="mb-6 flex flex-wrap gap-3 ">
        {["all", "paypal", "visa"].map((filter) => (
          <button
            key={filter}
            onClick={() => {
              setPaymentFilter(filter);
              setCurrentPage(1);
            }}
            className={`px-4 py-2  rounded-full font-medium transition-colors duration-200 ${
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
    </div>
  );
};

export default PaymentMethodsPanel;
