import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart, setTempCartId } from "../cartSlice";
import CartItem from "../components/CartItem";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const CartDetailPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { id: cartId } = useParams();
  const { currentCart } = useSelector((state) => state.cart);
  const theme = useSelector((state) => state.customerTheme.mode);
  const [groupedItems, setGroupedItems] = useState({});
  const token = localStorage.getItem("token");

  // Fetch cart from server
  useEffect(() => {
    if (cartId) {
      dispatch(fetchCart(cartId));
    }
  }, [cartId, dispatch]);

  // Group items by vendor whenever currentCart changes
  useEffect(() => {
    if (currentCart?.items?.length) {
      const grouped = currentCart.items.reduce((acc, item) => {
        const vendor = item.vendor_name || "Unknown Vendor";
        if (!acc[vendor]) {
          acc[vendor] = {
            items: []
          };
        }
        acc[vendor].items.push(item);
        return acc;
      }, {});
      setGroupedItems(grouped);
    } else {
      setGroupedItems({});
    }
  }, [currentCart]);

  const handleAddProduct = () => {
    if (currentCart?.id) {
      dispatch(setTempCartId(currentCart.id));
      navigate("/customer/products", { state: { cartId: currentCart.id } });
    }
  };

  const total = currentCart?.items?.reduce(
    (sum, item) => sum + Number(item.price || 0) * (item.quantity || 0),
    0
  ) || 0;

  const totalItemsCount = currentCart?.items?.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  ) || 0;

  const handleCheckout = async () => {
    try {
      if (!token) {
        alert("Please log in to proceed to checkout.");
        return navigate("/customer/login");
      }
      if (!currentCart?.id) return alert("Cart not loaded yet");
      navigate(`/customer/order-details/${currentCart.id}`, { state: { cartId: currentCart.id } });
    } catch (err) {
      console.error("Checkout failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] py-8">
      <div className="w-full px-4 sm:px-6 lg:px-8 p-4">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl font-bold text-[var(--text)] mb-2">Shopping Cart</h1>
              <p className="text-[var(--text)] opacity-70">Review your items and proceed to checkout</p>
            </div>
            
            <button
              onClick={handleAddProduct}
              className="bg-[var(--button)] text-white px-6 py-3 rounded-lg hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full lg:w-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add More Products
            </button>
          </div>

          {/* Cart Stats */}
          {currentCart?.items?.length > 0 && (
            <div className="bg-[var(--textbox)] dark:bg-[var(--div)] rounded-lg p-4 mb-6">
              <div className="flex flex-wrap gap-4 sm:gap-6 justify-center text-sm text-[var(--text)]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[var(--button)] rounded-full"></div>
                  <span>{currentCart.items.length} product{currentCart.items.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[var(--success)] rounded-full"></div>
                  <span>Total items: {totalItemsCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[var(--primary)] rounded-full"></div>
                  <span>{Object.keys(groupedItems).length} vendor{Object.keys(groupedItems).length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {Object.keys(groupedItems).length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-[var(--div)] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-[var(--text)] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-[var(--text)] mb-2">Your Cart is Empty</h3>
            <p className="text-[var(--text)] opacity-70 mb-6">Start adding products to your cart</p>
            <button
              onClick={handleAddProduct}
              className="bg-[var(--button)] text-white px-8 py-3 rounded-lg hover:opacity-90 transition-all duration-200 inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Browse Products
            </button>
          </div>
        ) : (
          /* Cart Content */
          <div className="space-y-6">
            {/* Vendors Sections */}
            {Object.entries(groupedItems).map(([vendor, vendorData]) => (
              <div key={vendor} className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-4 sm:p-6 shadow-sm">
                {/* Vendor Header */}
                <div className="flex items-center gap-3 mb-4 sm:mb-6 pb-4 border-b border-[var(--border)]">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl font-semibold text-[var(--text)] truncate">{vendor}</h2>
                    <p className="text-[var(--text)] opacity-70 text-sm">
                      {vendorData.items.length} product{vendorData.items.length !== 1 ? 's' : ''} • {vendorData.items.reduce((sum, item) => sum + (item.quantity || 0), 0)} items
                    </p>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-3 sm:space-y-4">
                  {vendorData.items.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>
              </div>
            ))}

            {/* Checkout Section */}
            <div className="bg-[var(--bg)]rounded-xl p-4 sm:p-6 sticky bottom-4">
              <div className="flex flex-col items-end gap-4">
                {/* Total on top right */}
                <div className="text-right w-full pr-42">
                  <p className="text-2xl sm:text-3xl font-bold text-[var(--button)] mb-1">${total.toFixed(2)}</p>
                  <p className="text-[var(--text)] opacity-70 text-sm">Total amount for {totalItemsCount} item{totalItemsCount !== 1 ? 's' : ''}</p>
                </div>

                {/* Buttons under total */}
                <div className="flex flex-col sm:flex-row gap-3 justify-end w-full">
                  <button
                    onClick={handleAddProduct}
                    className="px-6 py-3 border border-[var(--text)] text-[var(--text)] dark:border-[var(--text)] dark:text-[var(--text)] rounded-lg hover:bg-[var(--hover)] transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add More Items
                  </button>
                  
                  <button
                    onClick={handleCheckout}
                    className="bg-[var(--button)] text-white px-6 sm:px-8 py-3 rounded-lg hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDetailPage;