import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllCarts, createNewCart, deleteCart, fetchCurrentUser } from "../cartSlice";
import { useNavigate } from "react-router-dom";

const CartListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { allCarts, status, error, user } = useSelector((state) => state.cart);
  const themeMode = useSelector((state) => state.customerTheme.mode);

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
      <div className={`min-h-screen ${themeMode === 'dark' ? 'bg-[var(--bg)]' : 'bg-white'} flex items-center justify-center py-16`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--button)] mx-auto mb-4"></div>
          <p className={`${themeMode === 'dark' ? 'text-[var(--text)]' : 'text-gray-800'} text-lg`}>Loading carts...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className={`min-h-screen ${themeMode === 'dark' ? 'bg-[var(--bg)]' : 'bg-white'} flex items-center justify-center px-4 py-16`}>
        <div className="text-center max-w-md">
          <div className={`w-16 h-16 ${themeMode === 'dark' ? 'bg-[var(--error)]' : 'bg-red-500'} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className={`${themeMode === 'dark' ? 'text-[var(--error)]' : 'text-red-600'} text-xl font-semibold mb-2`}>Error Loading Carts</p>
          <p className={`${themeMode === 'dark' ? 'text-[var(--text)]' : 'text-gray-700'} opacity-80`}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-[var(--button)] text-white px-6 py-3 rounded-xl hover:bg-[#015c40] transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeMode === 'dark' ? 'bg-[var(--bg)]' : 'bg-white'} transition-colors duration-300`}>
      {/* Header Section - Full Width Gradient */}
      <div 
        className="w-full text-left pt-4" 
        style={{ 
          background: themeMode === 'dark' 
            ? `linear-gradient(to bottom, 
                rgba(0, 0, 0, 0.21) 0%, 
                var(--bg) 100%)`
            : `linear-gradient(to bottom, 
                rgba(113, 117, 116, 0.12) 0%, 
                var(--bg) 100%)`
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className={`text-4xl font-bold mb-3 pt-8 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Shopping Carts
          </h1>
          <p className={`${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'} max-w-2xl text-lg`}>
            Manage your shopping carts and items across all your sessions
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            {/* Stats Badge */}
            <div className={`px-4 py-2 rounded-2xl ${themeMode === 'dark' ? 'bg-[var(--div)]' : 'bg-gray-100'} shadow-lg border ${themeMode === 'dark' ? 'border-[var(--border)]' : 'border-gray-200'}`}>
              <span className={`font-semibold ${themeMode === 'dark' ? 'text-[var(--button)]' : 'text-[var(--button)]'}`}>
                {allCarts.length} {allCarts.length === 1 ? 'cart' : 'carts'}
              </span>
            </div>
          </div>
          
          {user || localStorage.getItem("token") ? (
            <button
              onClick={handleAddCart}
              className="bg-[var(--button)] text-white px-6 py-3 rounded-xl hover:bg-[#015c40] transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Cart
            </button>
          ) : null}
        </div>

        {/* Empty State */}
        {allCarts.length === 0 ? (
          <div className={`text-center py-20 rounded-3xl ${themeMode === 'dark' ? 'bg-[var(--div)]' : 'bg-gray-50'} shadow-2xl border-2 ${themeMode === 'dark' ? 'border-[var(--border)]' : 'border-gray-200'}`}>
            <div className="max-w-md mx-auto">
              <div className={`w-24 h-24 ${themeMode === 'dark' ? 'bg-[var(--button)]/10' : 'bg-[var(--button)]/5'} rounded-full flex items-center justify-center mx-auto mb-6`}>
                <svg className={`w-12 h-12 ${themeMode === 'dark' ? 'text-[var(--button)]' : 'text-[var(--button)]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className={`text-2xl font-bold mb-4 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                No Carts Found
              </h3>
              <p className={`text-lg mb-8 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Get started by creating your first shopping cart to organize your items
              </p>
              {user || localStorage.getItem("token") ? (
                <button
                  onClick={handleAddCart}
                  className="bg-[var(--button)] text-white px-8 py-4 rounded-xl hover:bg-[#015c40] transition-all duration-300 inline-flex items-center gap-3 font-semibold hover:scale-105 hover:shadow-2xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Your First Cart
                </button>
              ) : (
                <p className={`${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Please log in to create carts</p>
              )}
            </div>
          </div>
        ) : (
          /* Enhanced Carts Grid */
          <div className="space-y-4">
            {allCarts.map((cart) => {
              const totalItems = cart.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
              const totalPrice = cart.items?.reduce((sum, item) => sum + Number(item.price || 0) * (item.quantity || 0), 0) || 0;
              const lastItem = cart.items?.[cart.items.length - 1];
              const itemCount = cart.items?.length || 0;

              return (
                <div
                  key={cart.id || Math.random()}
                  className={`group rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 ${
                    themeMode === 'dark' 
                      ? 'bg-[var(--div)] border-[var(--border)] hover:border-[var(--button)]/50' 
                      : 'bg-white border-gray-200 hover:border-[var(--button)]/30 hover:bg-gray-50'
                  }`}
                  onClick={() => navigate(`/customer/cart/${cart.id}`)}
                >
                  <div className="flex items-center justify-between">
                    {/* Cart Info */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          {/* Cart Icon */}
                          <div className={`p-3 rounded-xl ${
                            themeMode === 'dark' 
                              ? 'bg-[var(--button)]/10 text-[var(--button)]' 
                              : 'bg-[var(--button)]/5 text-[var(--button)]'
                          }`}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>

                          {/* Cart Details */}
                          <div>
                            <h3 className={`text-xl font-bold mb-2 group-hover:text-[var(--button)] transition-colors ${
                              themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              Cart #{formatCartId(cart.id)}
                            </h3>
                            
                            <div className="flex items-center gap-4 text-sm">
                              {lastItem ? (
                                <span className={`flex items-center gap-2 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                  <span className="w-2 h-2 bg-[var(--success)] rounded-full"></span>
                                  Last: <span className="font-medium">{lastItem.name}</span> × {lastItem.quantity}
                                </span>
                              ) : (
                                <span className={`${themeMode === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Empty cart</span>
                              )}
                              
                              <span className={`${themeMode === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>•</span>
                              
                              <span className={`${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {itemCount} product{itemCount !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Price and Items Count */}
                        <div className="text-right mr-6">
                          <p className={`text-2xl font-bold mb-1 ${
                            themeMode === 'dark' ? 'text-[var(--button)]' : 'text-[var(--button)]'
                          }`}>
                            ${totalPrice.toFixed(2)}
                          </p>
                          <p className={`text-sm ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {totalItems} item{totalItems !== 1 ? 's' : ''} total
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                      {/* View Button */}
                      <button
                        onClick={() => navigate(`/customer/cart/${cart.id}`)}
                        className={`w-12 h-12 rounded-xl transition-all duration-300 flex items-center justify-center group/btn ${
                          themeMode === 'dark' 
                            ? 'bg-[var(--button)] text-white hover:bg-[#015c40] hover:scale-110' 
                            : 'bg-[var(--button)] text-white hover:bg-[#015c40] hover:scale-110'
                        } shadow-lg hover:shadow-xl`}
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
                        className={`w-12 h-12 rounded-xl transition-all duration-300 flex items-center justify-center group/btn ${
                          themeMode === 'dark' 
                            ? 'bg-[var(--error)]/20 text-[var(--error)] hover:bg-[var(--error)] hover:text-white' 
                            : 'bg-red-100 text-red-600 hover:bg-red-500 hover:text-white'
                        } hover:scale-110 border ${
                          themeMode === 'dark' ? 'border-[var(--error)]/30' : 'border-red-200'
                        } hover:border-transparent`}
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

        {/* Enhanced Stats Footer */}
        {allCarts.length > 0 && (
          <div className={`mt-12 p-8 rounded-2xl ${
            themeMode === 'dark' ? 'bg-[var(--div)]' : 'bg-gray-50'
          } shadow-lg border-2 ${themeMode === 'dark' ? 'border-[var(--border)]' : 'border-gray-200'}`}>
            <div className="flex flex-wrap gap-8 justify-center">
              <div className="text-center">
                <div className={`text-2xl font-bold mb-1 ${themeMode === 'dark' ? 'text-[var(--button)]' : 'text-[var(--button)]'}`}>
                  {allCarts.length}
                </div>
                <div className={`text-sm ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Carts
                </div>
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold mb-1 ${themeMode === 'dark' ? 'text-[var(--success)]' : 'text-green-600'}`}>
                  {allCarts.reduce((sum, cart) => sum + (cart.items?.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0) || 0), 0)}
                </div>
                <div className={`text-sm ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Items
                </div>
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold mb-1 ${themeMode === 'dark' ? 'text-[var(--primary)]' : 'text-blue-600'}`}>
                  ${allCarts.reduce((sum, cart) => sum + (cart.items?.reduce((priceSum, item) => priceSum + Number(item.price || 0) * (item.quantity || 0), 0) || 0), 0).toFixed(2)}
                </div>
                <div className={`text-sm ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Value
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartListPage;