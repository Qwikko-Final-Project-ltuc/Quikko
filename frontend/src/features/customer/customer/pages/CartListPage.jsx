import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllCarts, createNewCart, deleteCart, fetchCurrentUser } from "../cartSlice";
import { useNavigate } from "react-router-dom";

const CartListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { allCarts, status, error, user } = useSelector((state) => state.cart);
  const theme = useSelector((state) => state.customerTheme.mode);

  useEffect(() => {
    const loadData = async () => {
      try {
        await dispatch(fetchCurrentUser());
        await dispatch(fetchAllCarts()).unwrap();
      } catch (err) {
        console.error("Failed to load data:", err);
        await dispatch(fetchAllCarts());
      }
    };
    loadData();
  }, [dispatch]);

  const handleAddCart = async () => {
    if (!user) return console.warn("No user found");

    try {
      await dispatch(createNewCart()).unwrap();
    } catch (err) {
      console.error("Failed to create cart:", err);
    }
  };

  const handleDeleteCart = async (cartId) => {
    if (!window.confirm("Are you sure you want to delete this cart?")) return;
    await dispatch(deleteCart(cartId));
  };

  const formatCartId = (id) => {
    if (!id) return 'N/A';
    
    if (typeof id === 'string') {
      return id.slice(-8);
    }
    
    if (typeof id === 'number') {
      return id.toString().slice(-8);
    }
    
    return String(id).slice(-8);
  };

  // Loading State
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--button)] mx-auto mb-4"></div>
          <p className="text-[var(--text)] text-lg">Loading carts...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-[var(--error)] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[var(--error)] text-xl font-semibold mb-2">Error Loading Carts</p>
          <p className="text-[var(--text)] opacity-80">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-[var(--button)] text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className=" p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[var(--text)] mb-2">Shopping Carts</h1>
              <p className="text-[var(--text)] opacity-70">Manage your shopping carts and items</p>
            </div>
            
            {user || localStorage.getItem("token") ? (
              <button
                onClick={handleAddCart}
                className="bg-[var(--button)] text-white px-6 py-3 rounded-lg hover:opacity-90 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Cart
              </button>
            ) : null}
          </div>
        </div>

        {/* Empty State */}
        {allCarts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-[var(--div)] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-[var(--text)] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-[var(--text)] mb-2">No Carts Found</h3>
            <p className="text-[var(--text)] opacity-70 mb-6">Get started by creating your first shopping cart</p>
            {user || localStorage.getItem("token") ? (
              <button
                onClick={handleAddCart}
                className="bg-[var(--button)] text-white px-8 py-3 rounded-lg hover:opacity-90 transition-all duration-200 inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Cart
              </button>
            ) : (
              <p className="text-[var(--text)] opacity-60">Please log in to create carts</p>
            )}
          </div>
        ) : (
          /* Carts Grid - Full Width */
          <div className="grid gap-4">
            {allCarts.map((cart) => {
              const totalItems = cart.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
              const totalPrice = cart.items?.reduce((sum, item) => sum + Number(item.price || 0) * (item.quantity || 0), 0) || 0;
              const lastItem = cart.items?.[cart.items.length - 1];

              return (
                <div
                  key={cart.id || Math.random()}
                  className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-6 hover:shadow-lg transition-all duration-200 group cursor-pointer"
                  onClick={() => navigate(`/customer/cart/${cart.id}`)}
                >
                  <div className="flex items-center justify-between">
                    {/* Cart Info - Full Width Clickable */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          {/* Cart Details */}
                          <div>
                            <h3 className="text-xl font-semibold text-[var(--text)] mb-1 group-hover:text-[var(--button)] transition-colors">
                              Cart #{formatCartId(cart.id)}
                            </h3>
                            
                            {lastItem ? (
                              <p className="text-[var(--text)] opacity-80 flex items-center gap-2">
                                <span className="w-2 h-2 bg-[var(--success)] rounded-full"></span>
                                Last: <span className="font-medium">{lastItem.name}</span> × {lastItem.quantity}
                              </p>
                            ) : (
                              <p className="text-[var(--text)] opacity-60">Empty cart</p>
                            )}
                          </div>
                        </div>

                        {/* Price and Items Count */}
                        <div className="text-right mr-4">
                          <p className="text-2xl font-bold text-[var(--button)] mb-1">
                            ${totalPrice.toFixed(2)}
                          </p>
                          <p className="text-[var(--text)] opacity-70 text-sm">
                            {totalItems} item{totalItems !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons - Icons Only */}
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {/* View Button - Using --button color */}
                      <button
                        onClick={() => navigate(`/customer/cart/${cart.id}`)}
                        className="w-10 h-10 bg-[var(--button)] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center"
                        title="View Cart"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteCart(cart.id)}
                        className="w-10 h-10 bg-[var(--error)] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center"
                        title="Delete Cart"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats Footer */}
        {allCarts.length > 0 && (
          <div className="mt-12 p-8 border-t border-[var(--border)]">
            <div className="flex flex-wrap gap-6 justify-center text-sm text-[var(--text)] opacity-70">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[var(--button)] rounded-full"></div>
                <span>Total Carts: {allCarts.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[var(--success)] rounded-full"></div>
                <span>
                  Total Items: {allCarts.reduce((sum, cart) => sum + (cart.items?.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0) || 0), 0)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[var(--primary)] rounded-full"></div>
                <span>
                  Total Value: ${allCarts.reduce((sum, cart) => sum + (cart.items?.reduce((priceSum, item) => priceSum + Number(item.price || 0) * (item.quantity || 0), 0) || 0), 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartListPage;