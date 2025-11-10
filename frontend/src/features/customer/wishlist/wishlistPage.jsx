import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProductCard from "../customer/components/ProductCard";
import { fetchCart, setCurrentCart } from "../customer/cartSlice";
import customerAPI from "../customer/services/customerAPI";
import { GetWishlist, RemoveWishlist } from "../wishlist/wishlistApi";
import { Heart, Trash2, ArrowLeft, ShoppingBag, Sparkles } from "lucide-react";
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

  // Loading State - Same as other pages
  if (loading) {
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
            Loading Wishlist...
          </p>
        </div>
      </div>
    </div>
  );
  }

  return (
    <div className={`min-h-screen ${themeMode === 'dark' ? 'bg-[var(--bg)]' : 'bg-gray-50'} transition-all duration-500 relative overflow-hidden`}>
      
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--button)]/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[var(--primary)]/5 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[var(--success)]/3 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Actions */}
        <div className="flex p-8 flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-[var(--text)]">
                  Wishlist Items
                </h2>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  themeMode === 'dark' 
                    ? 'bg-[var(--button)]/20 text-[var(--text)]' 
                    : 'bg-[var(--button)]/10 text-[var(--button)]'
                }`}>
                  {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <p className={`mt-1 ${themeMode === 'dark' ? 'text-[var(--light-gray)]' : 'text-gray-600'}`}>
                Products you've saved for later
              </p>
            </div>
          </div>

          {wishlist.length > 0 && (
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/customer/products')}
                className="relative bg-gradient-to-r from-[var(--button)] to-[var(--primary)] text-white px-6 py-3 rounded-2xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 shadow-lg transform hover:scale-105 font-semibold group/btn overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
                <ShoppingBag size={18} className="relative z-10" />
                <span className="relative z-10">Continue Shopping</span>
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
              } flex items-center justify-center transform hover:scale-110 transition-all duration-300`}>
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
                  className="relative bg-gradient-to-r from-[var(--button)] to-[var(--primary)] text-white px-8 py-4 rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 group/btn overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
                  <ShoppingBag size={20} className="relative z-10" />
                  <span className="relative z-10">Browse Store</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Wishlist Grid */}
        {wishlist.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {wishlist.map((product, index) => (
              <div
                key={product.wishlist_id || product.product_id}
                className={`group relative rounded-2xl ${
                  themeMode === 'dark' ? 'bg-gradient-to-br from-[var(--div)] to-[var(--mid-dark)]' : 'bg-white'
                } shadow-lg border-2 ${
                  themeMode === 'dark' ? 'border-[var(--border)]' : 'border-gray-200'
                } hover:shadow-2xl transition-all duration-300 overflow-hidden hover:border-[var(--button)]/50 transform hover:-translate-y-2`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveFromWishlist(product.product_id, product.wishlist_id)}
                  disabled={removingItems.has(product.product_id)}
                  className={`absolute top-3 right-3 z-10 p-2 rounded-xl ${
                    themeMode === 'dark' 
                      ? 'bg-[var(--mid-dark)] text-[var(--error)] hover:bg-red-950/30' 
                      : 'bg-white text-red-500 hover:bg-red-50 shadow-lg'
                  } disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-110 border-2 ${
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
                className="relative bg-gradient-to-r from-[var(--button)] to-[var(--primary)] text-white px-8 py-3 rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 justify-center group/btn overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
                <ShoppingBag size={18} className="relative z-10" />
                <span className="relative z-10">Continue Shopping</span>
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

      <style jsx>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) rotate(0deg); 
            opacity: 0.7;
          }
          33% { 
            transform: translateY(-20px) translateX(10px) rotate(120deg); 
            opacity: 1;
          }
          66% { 
            transform: translateY(10px) translateX(-15px) rotate(240deg); 
            opacity: 0.8;
          }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
        .animate-float { 
          animation: float 8s ease-in-out infinite; 
        }
        .animate-pulse-slow { 
          animation: pulse-slow 4s ease-in-out infinite; 
        }
      `}</style>
    </div>
  );
}