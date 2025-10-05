// src/features/customer/customer/pages/OrdersPage.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders, reorderOrder, setCurrentPage, setPaymentFilter } from "../ordersSlice";
import { useNavigate } from "react-router-dom";

const OrdersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: items, loading, error, currentPage, itemsPerPage, paymentFilter } = useSelector(
    (state) => state.orders
  );

  const [searchTx, setSearchTx] = useState("");

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading orders...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">Error: {error}</p>;

  // فلترة الأوردرات
  const filteredItems = items.filter((order) => {
    const payments = order.payments || [];

    // ===== فلترة حسب حالة الدفع =====
    if (paymentFilter !== "all") {
      let isMatch = false;
      if (payments.length > 0) {
        isMatch = payments.some(
          (p) => p.status?.toLowerCase() === paymentFilter.toLowerCase()
        );
      } else {
        isMatch = order.payment_status?.toLowerCase() === paymentFilter.toLowerCase();
      }
      if (!isMatch) return false;
    }

    // ===== فلترة حسب Transaction ID =====
    if (searchTx) {
      const matchTx = payments.some((p) =>
        p.transaction_id?.toLowerCase().includes(searchTx.toLowerCase())
      );
      if (!matchTx) return false;
    }

    return true;
  });

  // ===== Pagination =====
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    dispatch(setCurrentPage(pageNumber));
  };

  const handleFilterClick = (filter) => {
    dispatch(setPaymentFilter(filter));
    dispatch(setCurrentPage(1)); // reset to first page on filter change
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-4">Your Orders</h1>

      {/* بحث حسب Transaction ID */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by Transaction ID..."
          value={searchTx}
          onChange={(e) => setSearchTx(e.target.value)}
          className="border rounded px-3 py-2 w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* فلترة حسب حالة الدفع */}
      <div className="mb-4 flex space-x-2">
        {["all", "paid", "pending"].map((filter) => (
          <button
            key={filter}
            className={`px-4 py-2 rounded ${
              paymentFilter === filter ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => handleFilterClick(filter)}
          >
            {filter === "all" ? "All" : filter === "paid" ? "Paid" : "Unpaid"}
          </button>
        ))}
      </div>

      {/* عرض الأوردرات */}
      {filteredItems.length === 0 ? (
        <p className="text-gray-500">No orders found</p>
      ) : (
        <div className="space-y-6">
          {currentOrders.map((order) => (
            <div
              key={order.id}
              className="border p-4 rounded shadow hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold mb-2">
                Order #{order.id} - {order.status}
              </h2>
              <p className="text-gray-600 mb-2">
                Payment: {order.payment_status} | Total: ${order.total_amount}
              </p>
              <p className="text-gray-600 mb-2">Shipping: {order.shipping_address}</p>

              <div className="border-t pt-2">
                {order.items.map((item) => (
                  <div key={item.product_id} className="flex justify-between mb-1">
                    <span>
                      {item.name} x {item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* تفاصيل الدفع لكل Order */}
              {order.payments && order.payments.length > 0 && (
                <div className="mt-2 border-t pt-2">
                  <h3 className="font-semibold mb-1">Payment Details:</h3>
                  {order.payments.map((payment) => (
                    <div key={payment.id} className="text-gray-700 mb-1">
                      Method: {payment.payment_method} | Amount: ${payment.amount} | Status: {payment.status}
                      {payment.card_last4 && ` | Card: **** **** **** ${payment.card_last4} (${payment.card_brand})`}
                      {payment.transaction_id && ` | Transaction: ${payment.transaction_id}`}
                    </div>
                  ))}
                </div>
              )}

              {/* أزرار الأوردر */}
              <button
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={() => navigate(`/track-order/${order.id}`)}
              >
                Track Order
              </button>
              <button
                className="ml-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                onClick={async () => {
                  try {
                    const action = await dispatch(reorderOrder(order.id)).unwrap();
                    navigate(`/order-details/${action.id}`, { state: { reorder: true } });
                  } catch (err) {
                    alert("Failed to reorder: " + err.message);
                  }
                }}
              >
                Reorder
              </button>
            </div>
          ))}

          {/* زر العودة للتسوق */}
          <button
            onClick={() => navigate("/products")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300"
          >
            Continue Shopping
          </button>

          {/* Pagination */}
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded ${
                  currentPage === page ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
