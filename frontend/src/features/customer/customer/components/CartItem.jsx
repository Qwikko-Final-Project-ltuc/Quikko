import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { deleteItem, updateItemQuantity } from "../cartSlice";
import customerAPI from "../services/customerAPI";

const CartItem = ({ item }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentCart } = useSelector((state) => state.cart);
  const themeMode = useSelector((state) => state.customerTheme.mode);

  const firstImage =
    Array.isArray(item.images) && item.images.length > 0
      ? item.images[0]
      : null;

  const handleProductClick = async () => {
    try {
      // البحث عن المنتج بالاسم للحصول على الـ ID
      const productsResponse = await customerAPI.getProducts({ search: item.name });
      const products = Array.isArray(productsResponse)
        ? productsResponse
        : productsResponse.items || [];

      const product = products.find(p => p.name === item.name);

      if (product?.id) {
        navigate(`/customer/product/${product.id}`);
      } else {
        console.warn("Product not found by name:", item.name);
        // إذا ما لقينا المنتج، نروح لصفحة البحث
        navigate(`/customer/products?search=${encodeURIComponent(item.name)}`);
      }
    } catch (error) {
      console.error("Error searching for product:", error);
      navigate(`/customer/products?search=${encodeURIComponent(item.name)}`);
    }
  };

  const handleRemove = async (e) => {
    e.stopPropagation(); // منع انتشار الحدث إلى العنصر الأب
    if (!currentCart?.id) {
      console.error("No currentCart.id, cannot delete item", item.id);
      return;
    }

    try {
      const productsResponse = await customerAPI.getProducts({ search: item.name });

      const products = Array.isArray(productsResponse)
        ? productsResponse
        : productsResponse.items || [];

      const product = products.find(p => p.name === item.name);

      if (!product?.id) {
        console.warn("Product ID not found for interaction");
      } else {
        const userId = currentCart.user_id || localStorage.getItem("token");
        await customerAPI.logInteraction(userId, product.id, "remove_from_cart");
        console.log("Interaction logged for product:", product.id);
      }

      dispatch(deleteItem({ cartId: currentCart.id, itemId: item.id }));

    } catch (err) {
      console.error("Error removing item or logging interaction", err);
    }
  };

  const handleDecrease = (e) => {
    e.stopPropagation(); // منع انتشار الحدث إلى العنصر الأب
    if (!currentCart?.id) return;
    if (item.quantity > 1) {
      dispatch(
        updateItemQuantity({
          cartId: currentCart.id,
          itemId: item.id,
          quantity: item.quantity - 1,
        })
      );
    } else {
      handleRemove(e);
    }
  };

  const handleIncrease = (e) => {
    e.stopPropagation(); // منع انتشار الحدث إلى العنصر الأب
    if (!currentCart?.id) return;
    dispatch(
      updateItemQuantity({
        cartId: currentCart.id,
        itemId: item.id,
        quantity: item.quantity + 1,
      })
    );
  };

  const subtotal = Number(item.price || 0) * (item.quantity || 0);

  return (
    <div 
      className={`flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-all duration-200 group cursor-pointer ${
        themeMode === 'dark' 
          ? 'bg-[var(--div)] border-[var(--border)]' 
          : 'bg-[var(--textbox)] border-gray-200'
      }`}
      onClick={handleProductClick}
    >
      {/* Product Image */}
      <div className="flex-shrink-0 w-20 h-20 bg-[var(--div)] rounded-lg overflow-hidden flex items-center justify-center">
        {firstImage ? (
          <img 
            src={firstImage} 
            alt={item.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-[var(--div)] flex items-center justify-center">
            <svg className="w-8 h-8 text-[var(--text)] opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Product Details - Main Content */}
      <div className="flex-1 min-w-0 flex items-center justify-between gap-6">
        
        {/* Left Section - Product Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[var(--text)] text-lg mb-1 truncate">
            {item.name}
          </h3>
          <p className="text-[var(--text)] opacity-70 text-sm">
            ${Number(item.price || 0).toFixed(2)} each
          </p>
          
          {/* Vendor Name */}
          {item.vendor_name && (
            <p className="text-xs text-[var(--text)] opacity-50 mt-1">
              Vendor: {item.vendor_name}
            </p>
          )}
        </div>

        {/* Middle Section - Quantity Counter (Centered) */}
        <div className="flex flex-col items-center gap-2">
          <div 
            className="bg-[var(--bg)] dark:bg-[var(--bg)] rounded-lg p-2"
            onClick={(e) => e.stopPropagation()} // منع النقر على العداد من التوجيه
          >
            <div className="flex items-center gap-3">
              <button
                onClick={handleDecrease}
                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[var(--hover)] transition-colors text-[var(--text)]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              
              <span className="min-w-8 text-center font-medium text-[var(--text)] text-lg">
                {item.quantity}
              </span>
              
              <button
                onClick={handleIncrease}
                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[var(--hover)] transition-colors text-[var(--text)]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right Section - Total Price and Remove Button */}
        <div 
          className="flex items-center gap-4"
          onClick={(e) => e.stopPropagation()} // منع النقر على هذا القسم من التوجيه
        >
          {/* Total Price - Left of remove button */}
          <div className="text-right">
            <p className="text-2xl font-bold text-[var(--text)]">
              ${subtotal.toFixed(2)}
            </p>
          </div>

          {/* Remove Button */}
          <button
            onClick={handleRemove}
            className="w-10 h-10 bg-[var(--error)] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center flex-shrink-0"
            title="Remove item"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;