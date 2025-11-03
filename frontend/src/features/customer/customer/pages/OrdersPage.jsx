import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrders,
  reorderOrder,
  setCurrentPage,
  setPaymentFilter,
} from "../ordersSlice";
import { useNavigate } from "react-router-dom";

const OrdersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    list: items = [],
    loading,
    error,
    currentPage,
    itemsPerPage,
    paymentFilter,
  } = useSelector((state) => state.orders);

  const themeMode = useSelector((state) => state.customerTheme.mode);
  const [searchTx, setSearchTx] = useState("");

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--button)] mx-auto mb-4"></div>
          <p className="text-[var(--text)] text-lg">Loading orders...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <div className="w-16 h-16 bg-[var(--error)] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">!</span>
          </div>
          <p className="text-[var(--error)] text-lg">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-[var(--button)] text-white rounded-lg hover:bg-opacity-90 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  const filteredItems = (items || []).filter((order) => {
    const payments = order.payments || [];

    if (paymentFilter !== "all") {
      let isMatch = false;
      if (payments.length > 0) {
        isMatch = payments.some(
          (p) => p.status?.toLowerCase() === paymentFilter.toLowerCase()
        );
      } else {
        isMatch =
          order.payment_status?.toLowerCase() === paymentFilter.toLowerCase();
      }
      if (!isMatch) return false;
    }

    if (searchTx) {
      const matchTx = payments.some((p) =>
        p.transaction_id?.toLowerCase().includes(searchTx.toLowerCase())
      );
      if (!matchTx) return false;
    }

    return true;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    dispatch(setCurrentPage(pageNumber));
  };

  const handleFilterClick = (filter) => {
    dispatch(setPaymentFilter(filter));
    dispatch(setCurrentPage(1));
  };

  return (
    <div className={`min-h-screen bg-[var(--bg)]  text-[var(--text)] transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 py-8 ">
        {/* Header */}
        <div className="p-4" >
          <h1 className={`text-3xl font-bold mb-4 ${
            themeMode === 'dark' 
              ? "text-[var(--textbox)]" 
              : "text-[var(--text)]"
          }`
          }
          >
            Your Orders
          </h1>
        </div>

        {/* Search and Filters */}
        <div className={`mb-8 p-6 rounded-lg ${
          themeMode === 'dark' ? "bg-[var(--div)]" : "bg-[var(--textbox)]"
        }`}>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by Transaction ID..."
                value={searchTx}
                onChange={(e) => setSearchTx(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-1 transition-all ${
                  themeMode === 'dark'
                    ? "bg-[var(--bg)] border-[var(--border)] text-[var(--text)] focus:ring-[var(--textbox)] placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-800 focus:ring-[var(--button)] placeholder-gray-500"
                }`}
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              {["all", "paid", "pending"].map((filter) => (
                <button
                  key={filter}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    paymentFilter === filter
                      ? "bg-[var(--button)] text-white"
                      : `${
                          themeMode === 'dark' 
                            ? "bg-[var(--bg)] text-[var(--text)] hover:bg-[var(--hover)]" 
                            : "bg-white text-gray-700 hover:bg-gray-100"
                        } border border-[var(--border)]`
                  }`}
                  onClick={() => handleFilterClick(filter)}
                >
                  {filter === "all" ? "All Orders" : filter === "paid" ? "Paid" : "Unpaid"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredItems.length === 0 ? (
          <div className={`text-center py-16 rounded-lg ${
            themeMode === 'dark' ? "bg-[var(--div)]" : "bg-[var(--textbox)]"
          }`}>
            <div className="text-6xl mb-4">📦</div>
            <p className={`text-xl font-medium ${
              themeMode === 'dark' ? "text-gray-400" : "text-gray-600"
            }`}>
              No orders found
            </p>
            <p className={`mt-2 ${
              themeMode === 'dark' ? "text-gray-500" : "text-gray-500"
            }`}>
              {searchTx || paymentFilter !== "all" 
                ? "Try adjusting your search or filters" 
                : "Start shopping to see your orders here"
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {currentOrders.map((order) => {
              const shippingAddress = order.shipping_address
                ? JSON.parse(order.shipping_address)
                : null;

              return (
                <div
                  key={order.id}
                  className={`border border-[var(--border)] rounded-lg p-6 bg-transparent w-full`}
                >
                  {/* Order Header - Full width with equal distribution */}
                  <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 mb-6 items-center">
                    {/* Order ID - First */}
                    <div className="text-center">
                      <div className="text-sm font-medium text-[var(--light-gray)]">Order ID</div>
                      <div className={`text-lg font-bold ${
                        themeMode === 'dark' ? "text-[var(--textbox)]" : "text-gray-800"
                      }`}>
                        #{order.id}
                      </div>
                    </div>

                    {/* Order Date */}
                    <div className="text-center">
                      <div className="text-sm font-medium text-[var(--light-gray)]">Order Date</div>
                      <div className="text-[var(--text)] font-medium">
                        {new Date(order.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>

                    {/* Total Amount */}
                    <div className="text-center">
                      <div className="text-sm font-medium text-[var(--light-gray)]">Total Amount</div>
                      <div className="text-lg font-bold text-[var(--text)]">
                        ${order.total_amount}
                      </div>
                    </div>

                    {/* Ship To */}
                    <div className="text-center">
                      <div className="text-sm font-medium text-[var(--light-gray)]">Ship To</div>
                      <div className="text-[var(--text)] font-medium">
                        {shippingAddress ? 
                          `${shippingAddress.city}` 
                          : 'N/A'
                        }
                      </div>
                    </div>

                    {/* Order Status */}
                    <div className="text-center">
                      <div className="text-sm font-medium text-[var(--light-gray)]">Order Status</div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        order.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    {/* Payment Status */}
                    <div className="text-center">
                      <div className="text-sm font-medium text-[var(--light-gray)]">Payment</div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        order.payment_status === 'paid' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {order.payment_status}
                      </span>
                    </div>

                    {/* Action Buttons - Last on the right */}
                    <div className="text-center">
                      <div className="text-sm font-medium text-[var(--light-gray)] mb-2">Actions</div>
                      <div className="flex justify-center gap-2">
                        <button
                          className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                            themeMode === 'dark'
                              ? "bg-[var(--button)] text-white hover:bg-opacity-90"
                              : "bg-[var(--button)] text-white hover:bg-opacity-90"
                          }`}
                          onClick={() => navigate(`/customer/track-order/${order.id}`)}
                        >
                          Track
                        </button>
                        <button
                          className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                            themeMode === 'dark'
                              ? "bg-[var(--textbox)] text-[var(--button)] hover:bg-opacity-90"
                              : "bg-white text-[var(--button)] border border-[var(--button)] hover:bg-[var(--button)] hover:text-white"
                          }`}
                          onClick={async () => {
                            try {
                              const action = await dispatch(
                                reorderOrder(order.id)
                              ).unwrap();
                              navigate(`/customer/order-details/${action.id}`, {
                                state: { reorder: true },
                              });
                            } catch (err) {
                              alert("Failed to reorder: " + err.message);
                            }
                          }}
                        >
                          Reorder
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Order Items with Images */}
                  <div className="border-t border-[var(--border)] pt-4">
                    <h3 className={`font-semibold mb-3 ${
                      themeMode === 'dark' ? "text-[var(--textbox)]" : "text-gray-700"
                    }`}>
                      Order Items
                    </h3>
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div
                          key={item.product_id}
                          className="flex items-center gap-4 py-3 border-b border-[var(--border)] last:border-b-0"
                        >
                          {/* Product Image */}
                          <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                            {item.image ? (
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-300 rounded-lg">
                                <span className="text-gray-500 text-xs">No Image</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Product Details */}
                          <div className="flex-1 flex justify-between items-center">
                            <div>
                              <span className={`font-bold block ${
                                themeMode === 'dark' ? "text-[var(--text)]" : "text-gray-800"
                              }`}>
                                {item.name}
                              </span>
                              <span className={`text-sm ${
                                themeMode === 'dark' ? "text-gray-400" : "text-gray-500"
                              }`}>
                                Quantity: {item.quantity} × ${item.price}
                              </span>
                            </div>
                            <span className={`font-bold ${
                              themeMode === 'dark' ? "text-[var(--textbox)]" : "text-gray-700"
                            }`}>
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Details */}
                  {order.payments && order.payments.length > 0 && (
                    <div className="border-t border-[var(--border)] pt-4 mt-4">
                      <h3 className={`font-semibold mb-3 ${
                        themeMode === 'dark' ? "text-[var(--textbox)]" : "text-gray-700"
                      }`}>
                        Payment Details
                      </h3>
                      {order.payments.map((payment) => (
                        <div key={payment.id} className={`text-sm ${
                          themeMode === 'dark' ? "text-gray-400" : "text-gray-600"
                        }`}>
                          💳 {payment.payment_method} • ${payment.amount} • {payment.status}
                          {payment.card_last4 &&
                            ` • Card: ****${payment.card_last4}`}
                          {payment.transaction_id &&
                            ` • TX: ${payment.transaction_id}`}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Pagination and Continue Shopping Button in same row */}
            <div className="flex items-center justify-between mt-8">
              {/* Pagination - takes 70% when exists */}
              {totalPages > 1 ? (
                <div className="w-[70%] flex justify-center">
                  <div className="flex space-x-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          currentPage === page
                            ? "bg-[var(--button)] text-white"
                            : `${
                                themeMode === 'dark' 
                                  ? "bg-[var(--bg)] text-[var(--text)] hover:bg-[var(--hover)]" 
                                  : "bg-white text-gray-700 hover:bg-gray-100"
                              } border border-[var(--border)]`
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="w-[70%]"></div> 
              )}
              
              {/* Continue Shopping Button - always takes 30% and stays on the right */}
              <div className="w-[30%] flex justify-end">
                <button
                  onClick={() => navigate("/customer/products")}
                  className={`px-8 py-3 rounded-lg font-medium transition-all ${
                    themeMode === 'dark'
                      ? "bg-[var(--button)] text-white hover:bg-opacity-90"
                      : "bg-[var(--button)] text-white hover:bg-opacity-90"
                  }`}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;