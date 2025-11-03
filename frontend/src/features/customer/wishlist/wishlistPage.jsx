import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProductCard from "../customer/components/ProductCard";
import { fetchCart, setCurrentCart } from "../customer/cartSlice";
import customerAPI from "../customer/services/customerAPI";
import { GetWishlist, RemoveWishlist } from "../wishlist/wishlistApi";
import { Heart, Trash2, ArrowLeft } from "lucide-react";
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
      <div className={`min-h-screen ${themeMode === 'dark' ? 'bg-[var(--bg)]' : 'bg-gray-50'} py-8`}>
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className={`h-8 w-64 rounded-lg ${themeMode === 'dark' ? 'bg-[var(--div)]' : 'bg-gray-300'} mb-8 mx-auto`}></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className={`rounded-xl ${themeMode === 'dark' ? 'bg-[var(--div)]' : 'bg-white'} p-3 shadow-sm`}>
                  <div className={`h-40 rounded-lg ${themeMode === 'dark' ? 'bg-[var(--mid-dark)]' : 'bg-gray-300'} mb-3`}></div>
                  <div className={`h-4 rounded ${themeMode === 'dark' ? 'bg-[var(--mid-dark)]' : 'bg-gray-300'} mb-2`}></div>
                  <div className={`h-4 rounded ${themeMode === 'dark' ? 'bg-[var(--mid-dark)]' : 'bg-gray-300'} w-3/4 mb-3`}></div>
                  <div className={`h-8 rounded ${themeMode === 'dark' ? 'bg-[var(--mid-dark)]' : 'bg-gray-300'}`}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeMode === 'dark' ? 'bg-[var(--bg)]' : 'bg-gray-50'} py-8`}>
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between  p-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className={`p-2 rounded-full ${
                themeMode === 'dark' 
                  ? 'bg-[var(--div)] text-[var(--text)] hover:bg-[var(--hover)]' 
                  : 'bg-white text-[var(--text)] hover:bg-gray-100'
              } shadow-sm border ${
                themeMode === 'dark' ? 'border-[var(--border)]' : 'border-gray-200'
              }`}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[var(--text)]">
                My Wishlist
              </h1>
              <p className={`mt-1 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>

          {wishlist.length > 0 && (
            <div className="flex gap-3">
              <button
                onClick={handleRemoveAll}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                  themeMode === 'dark' 
                    ? 'border-[var(--error)] text-[var(--error)] hover:bg-red-950/20' 
                    : 'border-red-500 text-red-500 hover:bg-red-50'
                } disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
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
            themeMode === 'dark' ? 'bg-[var(--div)]' : 'bg-white'
          } shadow-sm border ${
            themeMode === 'dark' ? 'border-[var(--border)]' : 'border-gray-200'
          } p-12 text-center`}>
            <div className="max-w-md mx-auto">
              <div className={`w-20 h-20 mx-auto mb-6 rounded-full ${
                themeMode === 'dark' ? 'bg-[var(--mid-dark)]' : 'bg-gray-100'
              } flex items-center justify-center`}>
                <Heart size={32} className={themeMode === 'dark' ? 'text-gray-400' : 'text-gray-400'} />
              </div>
              <h3 className={`text-xl font-semibold mb-3 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                Your wishlist is empty
              </h3>
              <p className={`mb-8 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                You haven't added any products to your wishlist yet. Start browsing the store and add your favorite products.
              </p>
              <button
                onClick={() => navigate('/products')}
                className="px-6 py-3 bg-[var(--button)] text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Browse Store
              </button>
            </div>
          </div>
        )}

        {/* Wishlist Grid - 3 sizes only: 2, 3, 5 cards */}
        {wishlist.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {wishlist.map((product) => (
              <div
                key={product.wishlist_id || product.product_id}
                className={`group relative rounded-xl ${
                  themeMode === 'dark' ? 'bg-[var(--div)]' : 'bg-white'
                } shadow-sm border ${
                  themeMode === 'dark' ? 'border-[var(--border)]' : 'border-gray-200'
                } hover:shadow-md transition-all duration-300 overflow-hidden`}
              >
                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveFromWishlist(product.product_id, product.wishlist_id)}
                  disabled={removingItems.has(product.product_id)}
                  className={`absolute top-2 right-2 z-10 p-1.5 rounded-full ${
                    themeMode === 'dark' 
                      ? 'bg-[var(--mid-dark)] text-[var(--error)] hover:bg-red-950/30' 
                      : 'bg-white text-red-500 hover:bg-red-50 shadow-sm'
                  } disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                >
                  <Trash2 size={14} />
                </button>

                {/* Product Card */}
                <div className="p-3">
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
      </div>
    </div>
  );
}