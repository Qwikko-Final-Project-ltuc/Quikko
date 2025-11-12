import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllCarts, createNewCart, deleteCart, fetchCurrentUser } from "../cartSlice";
import { useNavigate } from "react-router-dom";

const CartListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { allCarts, status, error, user } = useSelector((state) => state.cart);
  const themeMode = useSelector((state) => state.customerTheme.mode);
  
  // State for delete confirmation modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    cartId: null,
    cartInfo: null
  });

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
    if (deleteModal.cartId) {
      await dispatch(deleteCart(deleteModal.cartId));
      closeDeleteModal();
    }
  };

  const openDeleteModal = (cartId, cartInfo) => {
    setDeleteModal({
      isOpen: true,
      cartId,
      cartInfo
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      cartId: null,
      cartInfo: null
    });
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

  // Loading State - أخف شادو فقط
  if (status === "loading") {
    return (
      <div className={`min-h-screen ${themeMode === 'dark' ? 'bg-[var(--bg)]' : 'bg-white'} relative overflow-hidden`}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--button)]/2 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-[var(--primary)]/2 rounded-full blur-xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-[var(--button)] to-[var(--primary)] rounded-xl flex items-center justify-center mx-auto mb-4 animate-spin">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div className="absolute inset-0 w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[var(--button)] to-[var(--primary)] rounded-xl blur-sm opacity-15 animate-ping"></div>
            </div>
            <p className="text-[var(--text)] text-lg font-medium">
              Loading Carts...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error State - Updated to match theme
  if (error) {
    return (
      <div className={`min-h-screen ${themeMode === 'dark' ? 'bg-[var(--bg)]' : 'bg-white'} flex items-center justify-center px-4 py-16`}>
        <div className="text-center max-w-md w-full">
          <div className={`w-20 h-20 ${themeMode === 'dark' ? 'bg-[var(--error)]/20' : 'bg-red-100'} rounded-full flex items-center justify-center mx-auto mb-6`}>
            <svg className={`w-10 h-10 ${themeMode === 'dark' ? 'text-[var(--error)]' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className={`text-xl font-semibold mb-3 ${themeMode === 'dark' ? 'text-[var(--error)]' : 'text-red-600'}`}>Error Loading Carts</h3>
          <p className={`mb-6 ${themeMode === 'dark' ? 'text-[var(--text)]' : 'text-gray-700'} opacity-80`}>{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className={`px-6 py-3 rounded-xl font-semibold border-2 transition-all duration-300 ${
                themeMode === 'dark' 
                  ? 'border-[var(--border)] text-[var(--text)] hover:bg-[var(--hover)]' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Go Back
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-[var(--button)] text-white px-6 py-3 rounded-xl hover:bg-[#015c40] transition-all duration-300 font-semibold"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeMode === 'dark' ? 'bg-[var(--bg)]' : 'bg-gray-50'}`}>
      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className={`p-6 rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 ${
            themeMode === 'dark' ? 'bg-[var(--div)]' : 'bg-white'
          }`}>
            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-xl ${
                themeMode === 'dark' ? 'bg-[var(--error)]/20' : 'bg-red-100'
              }`}>
                <svg className={`w-6 h-6 ${themeMode === 'dark' ? 'text-[var(--error)]' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className={`text-xl font-bold ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Delete Cart
              </h3>
            </div>

            {/* Modal Body */}
            <div className="mb-6">
              <p className={`mb-3 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Are you sure you want to delete this cart? This action cannot be undone.
              </p>
              {deleteModal.cartInfo && (
                <div className={`p-3 rounded-xl ${
                  themeMode === 'dark' ? 'bg-[var(--bg)]' : 'bg-gray-100'
                }`}>
                  <p className={`text-sm font-medium ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Cart #{formatCartId(deleteModal.cartInfo.id)}
                  </p>
                  <p className={`text-xs ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {deleteModal.cartInfo.items?.length || 0} products • {deleteModal.cartInfo.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0} items
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={closeDeleteModal}
                className={`px-6 py-2 rounded-xl font-semibold border-2 transition-all duration-300 ${
                  themeMode === 'dark' 
                    ? 'border-[var(--border)] text-[var(--text)] hover:bg-[var(--hover)]' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCart}
                className="bg-[var(--error)] text-white px-6 py-2 rounded-xl hover:bg-red-700 transition-all duration-300 font-semibold flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="h-6"></div>
      {/* Header Section */}
      <div className={`w-full pt-8 pb-12 ${themeMode === 'dark' ? 'bg[var(--bg)]' : 'bg[var(--bg)]'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className={`text-3xl sm:text-4xl font-bold mb-3 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Shopping Carts
              </h1>
              <p className={`text-base sm:text-lg max-w-2xl ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Manage your shopping carts and items across all your sessions
              </p>
            </div>
            
            {/* Stats Badge */}
            <div className={`px-4 py-2 rounded-2xl ${themeMode === 'dark' ? 'bg-[var(--div)]' : 'bg-white'} shadow-lg border ${themeMode === 'dark' ? 'border-[var(--border)]' : 'border-gray-200'}`}>
              <span className={`font-semibold ${themeMode === 'dark' ? 'text-[var(--text)]' : 'text-[var(--button)]'}`}>
                {allCarts.length} {allCarts.length === 1 ? 'cart' : 'carts'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8">
        {/* Create Cart Button */}
        {(user || localStorage.getItem("token")) && (
          <div className="flex justify-end mb-6">
            <button
              onClick={handleAddCart}
              className="bg-[var(--button)] text-white px-6 py-3 rounded-xl hover:bg-[#015c40] transition-all duration-300 flex items-center gap-3 shadow-lg font-semibold w-full sm:w-auto justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Cart
            </button>
          </div>
        )}

        {/* Empty State */}
        {allCarts.length === 0 ? (
          <div className={`text-center py-16 rounded-3xl ${themeMode === 'dark' ? 'bg-[var(--div)]' : 'bg-white'} shadow-2xl border-2 ${themeMode === 'dark' ? 'border-[var(--border)]' : 'border-gray-200'}`}>
            <div className="max-w-md mx-auto px-4">
              <div className={`w-20 h-20 ${themeMode === 'dark' ? 'bg-[var(--button)]/10' : 'bg-[var(--button)]/5'} rounded-full flex items-center justify-center mx-auto mb-6`}>
                <svg className={`w-10 h-10 ${themeMode === 'dark' ? 'text-[var(--button)]' : 'text-[var(--button)]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className={`text-2xl font-bold mb-4 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                No Carts Found
              </h3>
              <p className={`text-base mb-8 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Get started by creating your first shopping cart to organize your items
              </p>
              {(user || localStorage.getItem("token")) ? (
                <button
                  onClick={handleAddCart}
                  className="bg-[var(--button)] text-white px-8 py-4 rounded-xl hover:bg-[#015c40] transition-all duration-300 inline-flex items-center gap-3 font-semibold w-full sm:w-auto justify-center"
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
          <>
            {/* Carts Grid */}
            <div className="space-y-4 mb-8">
              {allCarts.map((cart) => {
                const totalItems = cart.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
                const totalPrice = cart.items?.reduce((sum, item) => sum + Number(item.price || 0) * (item.quantity || 0), 0) || 0;
                const lastItem = cart.items?.[cart.items.length - 1];
                const itemCount = cart.items?.length || 0;

                return (
                  <div
                    key={cart.id || Math.random()}
                    className={`group rounded-2xl p-4 sm:p-6 transition-all duration-300 cursor-pointer border-2 ${
                      themeMode === 'dark' 
                        ? 'bg-[var(--div)] border-[var(--border)] hover:border-[var(--button)]/50' 
                        : 'bg-white border-gray-200 hover:border-[var(--button)]/30'
                    }`}
                    onClick={() => navigate(`/customer/cart/${cart.id}`)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Cart Info */}
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          {/* Cart Icon */}
                          <div className={`p-3 rounded-xl flex-shrink-0 ${
                            themeMode === 'dark' 
                              ? 'bg-[var(--button)]/10 text-[var(--text)]' 
                              : 'bg-[var(--button)]/5 text-[var(--button)]'
                          }`}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>

                          {/* Cart Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className={`text-lg sm:text-xl font-bold mb-2 group-hover:text-[var(--button)] transition-colors ${
                              themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              Cart #{formatCartId(cart.id)}
                            </h3>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
                              {lastItem ? (
                                <span className={`flex items-center gap-2 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                  <span className="w-2 h-2 bg-[var(--success)] rounded-full flex-shrink-0"></span>
                                  Last: <span className="font-medium truncate">{lastItem.name}</span> × {lastItem.quantity}
                                </span>
                              ) : (
                                <span className={`${themeMode === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Empty cart</span>
                              )}
                              
                              <span className={`hidden sm:block ${themeMode === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>•</span>
                              
                              <span className={`${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {itemCount} product{itemCount !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Price and Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        {/* Price */}
                        <div className="text-right">
                          <p className={`text-xl sm:text-2xl font-bold mb-1 ${
                            themeMode === 'dark' ? 'text-[var(--text)]' : 'text-[var(--button)]'
                          }`}>
                            ${totalPrice.toFixed(2)}
                          </p>
                          <p className={`text-xs sm:text-sm ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {totalItems} item{totalItems !== 1 ? 's' : ''} total
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          {/* View Button */}
                          <button
                            onClick={() => navigate(`/customer/cart/${cart.id}`)}
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl transition-all duration-300 flex items-center justify-center ${
                              themeMode === 'dark' 
                                ? 'bg-[var(--button)] text-white hover:bg-[#015c40]' 
                                : 'bg-[var(--button)] text-white hover:bg-[#015c40]'
                            }`}
                            title="View Cart"
                          >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          
                          {/* Delete Button */}
                          <button
                            onClick={() => openDeleteModal(cart.id, cart)}
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl transition-all duration-300 flex items-center justify-center ${
                              themeMode === 'dark' 
                                ? 'bg-[var(--error)]/20 text-[var(--error)] hover:bg-[var(--error)] hover:text-white' 
                                : 'bg-red-100 text-red-600 hover:bg-red-500 hover:text-white'
                            } border ${
                              themeMode === 'dark' ? 'border-[var(--error)]/30' : 'border-red-200'
                            } hover:border-transparent`}
                            title="Delete Cart"
                          >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        
                      </div>
                      
                    </div>
                    
                  </div>
                  
                );
              })}
            </div>

            {/* Enhanced Stats Footer */}
            <div className={`p-6 rounded-2xl ${
              themeMode === 'dark' ? 'bg-[var(--div)]' : 'bg-white'
            } shadow-lg border-2 ${themeMode === 'dark' ? 'border-[var(--border)]' : 'border-gray-200'}`}>
              <div className="flex flex-wrap gap-6 sm:gap-8 justify-center">
                <div className="text-center">
                  <div className={`text-2xl font-bold mb-1 ${themeMode === 'dark' ? 'text-[var(--text)]' : 'text-[var(--button)]'}`}>
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
            <div className="h-6"></div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartListPage;