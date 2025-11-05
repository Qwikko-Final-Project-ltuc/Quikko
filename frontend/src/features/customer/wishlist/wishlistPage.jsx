import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProductCard from "../customer/components/ProductCard";
import { fetchCart, setCurrentCart } from "../customer/cartSlice";
import customerAPI from "../customer/services/customerAPI";
import { GetWishlist, RemoveWishlist } from "../wishlist/wishlistApi";
import { Heart, Trash2, ArrowLeft, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function WishlistPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const themeMode = useSelector((state) => state.customerTheme.mode);

  const { currentCart, tempCartId } = useSelector((state) => state.cart);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingItems, setRemovingItems] = useState(new Set());

  // Fetch wishlist
  useEffect(() => {
    const fetchWishlistData = async () => {
      try {
        setLoading(true);
        const data = await GetWishlist();
        setWishlist(
          data.map((item) => ({
            ...item,
            isInWishlist: true,
          }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlistData();
  }, []);

  // Add to cart
  const handleAddToCart = async (product, quantity = 1) => {
    try {
      let cart = currentCart;
      const guestToken = tempCartId || localStorage.getItem("guest_token");

      if (!cart?.id) {
        cart = await customerAPI.getOrCreateCart(null, null, guestToken);
        dispatch(setCurrentCart(cart));
      }

      await customerAPI.addItem({
        cartId: cart.id,
        product: { ...product, id: product.product_id }, 
        quantity,
        variant: product.variant || {},
      });

      dispatch(fetchCart(cart.id));

      if (token) {
        const userId = JSON.parse(atob(token.split(".")[1])).id; 
        const productId = product.product_id || product.id; 
        if (productId) {
          await customerAPI.logInteraction(userId, productId, "add_to_cart");
          console.log("Interaction logged for product:", productId);
        } else {
          console.warn("No valid product ID found for interaction");
        }
      }

      // Show success feedback
      const event = new CustomEvent('showToast', {
        detail: { 
          message: 'Added to cart successfully!', 
          type: 'success' 
        }
      });
      window.dispatchEvent(event);
      
    } catch (err) {
      console.error("Error in handleAddToCart:", err);
      const event = new CustomEvent('showToast', {
        detail: { 
          message: err.response?.data?.message || err.message, 
          type: 'error' 
        }
      });
      window.dispatchEvent(event);
    }
  };

  // Remove from wishlist
  const handleRemoveFromWishlist = async (productId, wishlistId) => {
    try {
      setRemovingItems(prev => new Set(prev).add(productId));
      await RemoveWishlist(wishlistId);
      setWishlist(prev => prev.filter(item => item.product_id !== productId));
      
      const event = new CustomEvent('showToast', {
        detail: { 
          message: 'Removed from wishlist', 
          type: 'success' 
        }
      });
      window.dispatchEvent(event);
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      const event = new CustomEvent('showToast', {
        detail: { 
          message: 'Error occurred while removing', 
          type: 'error' 
        }
      });
      window.dispatchEvent(event);
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  // Remove all items
  const handleRemoveAll = async () => {
    if (wishlist.length === 0) return;
    
    try {
      setLoading(true);
      // Remove all items sequentially
      for (const item of wishlist) {
        if (item.wishlist_id) {
          await RemoveWishlist(item.wishlist_id);
        }
      }
      setWishlist([]);
      
      const event = new CustomEvent('showToast', {
        detail: { 
          message: 'All items removed from wishlist', 
          type: 'success' 
        }
      });
      window.dispatchEvent(event);
    } catch (err) {
      console.error("Error removing all items:", err);
      const event = new CustomEvent('showToast', {
        detail: { 
          message: 'Error occurred while removing items', 
          type: 'error' 
        }
      });
      window.dispatchEvent(event);
    } finally {
      setLoading(false);
    }
  };

  // Toggle wishlist
  const handleToggleWishlist = (productId, added, wishlist_id = null) => {
    setWishlist((prev) => {
      if (added) {
        return [...prev, { product_id: productId, wishlist_id, isInWishlist: true }];
      } else {
        return prev.filter((w) => w.product_id !== productId);
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--button)] mx-auto mb-4"></div>
          <p className="text-[var(--text)] text-lg">Loading Wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeMode === 'dark' ? 'bg-[var(--bg)]' : 'bg-gray-50'}`}>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ">
        {/* Header Actions */}
        <div className="flex p-8 flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ">
          <div className="flex items-center gap-4">
            {/* <button
              onClick={() => navigate(-1)}
              className={`p-3 rounded-xl ${
                themeMode === 'dark' 
                  ? 'bg-[var(--div)] text-[var(--text)] hover:bg-[var(--hover)]' 
                  : 'bg-white text-[var(--text)] hover:bg-gray-100'
              } shadow-lg border-2 ${
                themeMode === 'dark' ? 'border-[var(--border)]' : 'border-gray-200'
              } transition-all duration-300 hover:scale-105`}
            >
              <ArrowLeft size={20} />
            </button> */}
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-[var(--text)]">
                  Wishlist Items
                </h2>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  themeMode === 'dark' 
                    ? 'bg-[var(--button)]/20 text-[var(--button)]' 
                    : 'bg-[var(--button)]/10 text-[var(--button)]'
                }`}>
                  {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <p className={`mt-1 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Products you've saved for later
              </p>
            </div>
          </div>

          {wishlist.length > 0 && (
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/customer/products')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 ${
                  themeMode === 'dark' 
                    ? 'border-[var(--button)] text-[var(--button)] hover:bg-[var(--button)]/10' 
                    : 'border-[var(--button)] text-[var(--button)] hover:bg-[var(--button)]/5'
                } transition-all duration-300 hover:scale-105 font-semibold`}
              >
                <ShoppingBag size={18} />
                <span>Continue Shopping</span>
              </button>
              <button
                onClick={handleRemoveAll}
                disabled={loading}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 ${
                  themeMode === 'dark' 
                    ? 'border-[var(--error)] text-[var(--error)] hover:bg-red-950/20' 
                    : 'border-red-500 text-red-500 hover:bg-red-50'
                } disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 font-semibold`}
              >
                <Trash2 size={18} />
                <span>Remove All</span>
              </button>
            </div>
          )}
        </div>

        {/* Empty State */}
        {wishlist.length === 0 && (
          <div className={`rounded-2xl ${
            themeMode === 'dark' ? 'bg-gradient-to-br from-[var(--div)] to-[var(--mid-dark)]' : 'bg-white'
          } shadow-2xl border-2 ${
            themeMode === 'dark' ? 'border-[var(--border)]' : 'border-gray-200'
          } p-16 text-center transition-all duration-300 hover:shadow-3xl`}>
            <div className="max-w-md mx-auto">
              <div className={`w-24 h-24 mx-auto mb-8 rounded-full ${
                themeMode === 'dark' ? 'bg-[var(--button)]/10' : 'bg-[var(--button)]/5'
              } flex items-center justify-center`}>
                <Heart size={40} className={themeMode === 'dark' ? 'text-[var(--button)]' : 'text-[var(--button)]'} />
              </div>
              <h3 className={`text-2xl font-bold mb-4 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                Your wishlist is empty
              </h3>
              <p className={`mb-8 text-lg ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                You haven't added any products to your wishlist yet. Start browsing the store and add your favorite products.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate(-1)}
                  className={`px-8 py-4 rounded-xl font-semibold border-2 transition-all duration-300 hover:scale-105 ${
                    themeMode === 'dark' 
                      ? 'border-[var(--border)] text-[var(--text)] hover:bg-[var(--hover)]' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Go Back
                </button>
                <button
                  onClick={() => navigate('/customer/products')}
                  className="px-8 py-4 bg-[var(--button)] text-white rounded-xl font-semibold hover:bg-[#015c40] transition-all duration-300 hover:scale-105 hover:shadow-2xl flex items-center gap-3"
                >
                  <ShoppingBag size={20} />
                  Browse Store
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Wishlist Grid */}
        {wishlist.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {wishlist.map((product) => (
              <div
                key={product.wishlist_id || product.product_id}
                className={`group relative rounded-2xl ${
                  themeMode === 'dark' ? 'bg-gradient-to-br from-[var(--div)] to-[var(--mid-dark)]' : 'bg-white'
                } shadow-lg border-2 ${
                  themeMode === 'dark' ? 'border-[var(--border)]' : 'border-gray-200'
                } hover:shadow-2xl transition-all duration-300 overflow-hidden hover:border-[var(--button)]/50`}
              >
                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveFromWishlist(product.product_id, product.wishlist_id)}
                  disabled={removingItems.has(product.product_id)}
                  className={`absolute top-3 right-3 z-10 p-2 rounded-xl ${
                    themeMode === 'dark' 
                      ? 'bg-[var(--mid-dark)] text-[var(--error)] hover:bg-red-950/30' 
                      : 'bg-white text-red-500 hover:bg-red-50 shadow-lg'
                  } disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-110 border ${
                    themeMode === 'dark' ? 'border-[var(--border)]' : 'border-gray-200'
                  }`}
                >
                  <Trash2 size={16} />
                </button>

                {/* Product Card */}
                <div className="p-4">
                  <ProductCard
                    product={{
                      ...product,
                      isInWishlist: !!product.isInWishlist,
                      wishlist_id: product.wishlist_id || null,
                    }}
                    onAddToCart={handleAddToCart}
                    onToggleWishlistFromPage={handleToggleWishlist}
                    isLoggedIn={!!token}
                    compact={true}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions Footer */}
        {wishlist.length > 0 && (
          <div className={`mt-12 p-6 rounded-2xl ${
            themeMode === 'dark' ? 'bg-gradient-to-br from-[var(--div)] to-[var(--mid-dark)]' : 'bg-white'
          } shadow-lg border-2 ${themeMode === 'dark' ? 'border-[var(--border)]' : 'border-gray-200'} text-center`}>
            <h3 className={`text-lg font-semibold mb-3 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
              Found everything you need?
            </h3>
            <p className={`mb-6 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Add these items to your cart or continue shopping for more great products.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/customer/products')}
                className="px-8 py-3 bg-[var(--button)] text-white rounded-xl font-semibold hover:bg-[#015c40] transition-all duration-300 hover:scale-105 hover:shadow-2xl flex items-center gap-3 justify-center"
              >
                <ShoppingBag size={18} />
                Continue Shopping
              </button>
              <button
                onClick={handleRemoveAll}
                className={`px-8 py-3 rounded-xl font-semibold border-2 transition-all duration-300 hover:scale-105 ${
                  themeMode === 'dark' 
                    ? 'border-[var(--error)] text-[var(--error)] hover:bg-red-950/20' 
                    : 'border-red-500 text-red-500 hover:bg-red-50'
                } flex items-center gap-3 justify-center`}
              >
                <Trash2 size={18} />
                Clear Wishlist
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}