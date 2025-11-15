import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchStoreById,
  fetchStoreProducts,
  setProductPage,
} from "../storesSlice";
import ProductCard from "../components/ProductCard";
import { fetchCart, setCurrentCart } from "../cartSlice";
import ReviewSection from "../../review/ReviewSection";
import {
  addReviewThunk,
  fetchAverageRatingThunk,
  fetchReviewsThunk,
  fetchUserRatingThunk,
} from "../../review/reviewSlice";
import customerAPI from "../services/customerAPI";
import { MessageCircle, Star, ShoppingBag, Package, Phone, Mail, MapPin, Clock, Globe, Sparkles, Zap } from "lucide-react";

const StorePage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const themeMode = useSelector((state) => state.customerTheme.mode);
    const userId = useSelector((state) => state.cart.user?.id);
    const initialCartId = location.state?.cartId;
  const {
    selectedStore,
    storeProducts,
    loading,
    error,
    currentProductPage,
    productsPerPage,
  } = useSelector((state) => state.stores);

  const { user, currentCart, tempCartId } = useSelector(
    (state) => state.cart
  );
  const guestToken = localStorage.getItem("guest_token");

  const currentProducts = storeProducts || [];

  const totalProductPages = Math.ceil(storeProducts.length / productsPerPage);

  const handleProductPageChange = (pageNumber) => {
    dispatch(setProductPage(pageNumber));
  };

  const { reviews, averageRating } = useSelector((state) => state.reviews);
  const displayRating = averageRating || 0;
  const userRating = useSelector((state) => state.reviews.userRating);

  const uniqueReviewsCount = reviews.reduce(
    (acc, review) => {
      if (!acc.userIds.includes(review.user_id)) {
        acc.userIds.push(review.user_id);
        acc.count++;
      }
      return acc;
    },
    { userIds: [], count: 0 }
  ).count;

  useEffect(() => {
    if (!id) return;
    dispatch(fetchStoreById(id));
    dispatch(fetchStoreProducts(id));
    dispatch(fetchReviewsThunk(id));
    dispatch(fetchAverageRatingThunk(id));
    dispatch(fetchUserRatingThunk(id));
  }, [dispatch, id]);

  const handleAddToCart = async (product, quantity = 1) => {
  try {
    let cart = currentCart;
    const guestToken = tempCartId || localStorage.getItem("guest_token");

    console.log('🛒 Starting add to cart process...');
    console.log('📦 Product:', product.name);
    console.log('🛍️ Current Cart:', cart);
    console.log('👤 User ID:', userId);
    console.log('🎫 Guest Token:', guestToken);

    // إذا ما في cart، أنشئ واحد جديد
    if (!cart?.id) {
      console.log('🆕 No cart found, creating new cart...');
      cart = await customerAPI.getOrCreateCart(null, userId, guestToken);
      console.log('✅ New cart created:', cart);
      dispatch(setCurrentCart(cart));
    }

    console.log('➕ Adding item to cart:', cart.id);

    // أضف المنتج للـ cart
    await customerAPI.addItem({
      cartId: cart.id,
      product,
      quantity,
      variant: product.variant || {},
    });

    console.log('✅ Item added successfully, fetching updated cart...');

    // جلب الـ cart المحدث
    await dispatch(fetchCart(cart.id));

    // log interaction إذا user مسجل دخول
    if (token && userId) {
      await customerAPI.logInteraction(userId, product.id, "add_to_cart");
    }

    // عرض رسالة النجاح
    const event = new CustomEvent("showToast", {
      detail: {
        message: `${product.name} added to cart successfully!`,
        type: "success",
      },
    });
    window.dispatchEvent(event);

    console.log('🎉 Add to cart process completed successfully');

  } catch (err) {
    console.error('❌ Failed to add item:', err);
    
    // عرض رسالة الخطأ
    const event = new CustomEvent("showToast", {
      detail: {
        message: err.response?.data?.message || err.message || "Failed to add item to cart",
        type: "error",
      },
    });
    window.dispatchEvent(event);
  }
};

  const handleChatWithVendor = () => {
    if (!selectedStore?.user_id) return;
    navigate("/customer/chat", {
      state: {
        vendorId: selectedStore.user_id,
        vendorName: selectedStore.store_name || null,
      },
    });
  };

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
            Loading Store...
          </p>
        </div>
      </div>
    </div>
  );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${themeMode === "dark" ? "bg-[var(--bg)]" : "bg-white"} flex items-center justify-center relative overflow-hidden`}>
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-[var(--error)]/5 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/3 right-1/3 w-56 h-56 bg-[var(--button)]/5 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1.5s'}}></div>
        </div>

        <div className="text-center max-w-md relative z-10">
          <div className="w-28 h-28 bg-[var(--error)]/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform hover:scale-110 transition-all duration-300">
            <Zap className="w-14 h-14 text-[var(--error)]" />
          </div>
          <h3 className="text-3xl font-black mb-4 bg-gradient-to-r from-[var(--error)] to-red-600 bg-clip-text text-transparent">
            Oops! Error Loading
          </h3>
          <p className="text-[var(--text)]/80 text-lg mb-8 leading-relaxed">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate(-1)}
              className={`px-6 py-3 rounded-xl font-semibold border-2 transition-all duration-300 ${
                themeMode === "dark" 
                  ? "border-[var(--border)] text-[var(--text)] hover:bg-[var(--hover)]" 
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              } hover:scale-105`}
            >
              Go Back
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-[var(--button)] text-white px-6 py-3 rounded-xl hover:bg-[#015c40] transition-all duration-300 font-semibold hover:scale-105"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedStore) {
    return (
      <div className={`min-h-screen ${themeMode === "dark" ? "bg-[var(--bg)]" : "bg-white"} flex items-center justify-center relative overflow-hidden`}>
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-[var(--button)]/5 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/3 right-1/3 w-56 h-56 bg-[var(--primary)]/5 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1.5s'}}></div>
        </div>

        <div className="text-center max-w-md relative z-10">
          <div className="w-28 h-28 bg-[var(--div)]/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <span className="text-4xl">🏪</span>
          </div>
          <h3 className="text-3xl font-black mb-4 bg-gradient-to-r from-[var(--text)] to-[var(--light-gray)] bg-clip-text text-transparent">
            Store Not Found
          </h3>
          <p className="text-[var(--text)]/80 text-lg mb-8 leading-relaxed">
            The store you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/stores")}
            className="bg-[var(--button)] text-white px-8 py-4 rounded-xl hover:bg-[#015c40] transition-all duration-300 font-semibold hover:scale-105 hover:shadow-2xl flex items-center gap-3 mx-auto"
          >
            <ShoppingBag size={20} />
            Browse Stores
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeMode === "dark" ? "bg-[var(--bg)]" : "bg-gray-50"} transition-colors duration-300`}>
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--button)]/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[var(--primary)]/5 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Store Header - Enhanced Design */}
        <div className={`rounded-3xl p-8 mb-8 shadow-2xl border ${
          themeMode === "dark" 
            ? "bg-gradient-to-br from-[var(--div)] to-[var(--mid-dark)] border-[var(--border)]" 
            : "bg-gradient-to-br from-white to-gray-50 border-gray-200"
        } relative overflow-hidden group`}>
          
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--button)] rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[var(--primary)] rounded-full translate-y-24 -translate-x-24"></div>
          </div>

          <div className="relative flex items-start gap-8">
            {/* Store Logo with Enhanced Design */}
            <div className="flex-shrink-0 relative group/logo">
              <div className={`w-32 h-32 rounded-2xl ${
                themeMode === "dark" ? "bg-[var(--mid-dark)]" : "bg-white"
              } border-2 ${
                themeMode === "dark" ? "border-[var(--border)]" : "border-gray-200"
              } overflow-hidden shadow-2xl transform group-hover/logo:scale-105 transition-all duration-300 relative z-10`}>
                {selectedStore.store_logo ? (
                  <img
                    src={selectedStore.store_logo}
                    alt="Store Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl">🏪</span>
                  </div>
                )}
              </div>
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--button)] to-[var(--primary)] rounded-2xl blur-xl opacity-0 group-hover/logo:opacity-30 transition-opacity duration-300"></div>
            </div>

            {/* Store Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className={`text-5xl font-black mb-4 bg-gradient-to-r ${
                    themeMode === "dark" 
                      ? "from-white to-gray-300" 
                      : "from-gray-900 to-gray-700"
                  } bg-clip-text text-transparent`}>
                    {selectedStore.store_name}
                  </h1>
                  
                  <p className={`text-xl ${
                    themeMode === "dark" ? "text-gray-300" : "text-gray-600"
                  } mb-6 leading-relaxed max-w-3xl`}>
                    {selectedStore.description || "Explore our collection of quality products"}
                  </p>

                  {/* Enhanced Contact Information */}
                  <div className="flex flex-wrap gap-6 mb-6">
                    {selectedStore.address && (
                      <div className="flex items-center gap-3 group cursor-pointer transform hover:-translate-y-1 transition-all duration-300">
                        <div className={`w-10 h-10 rounded-xl ${
                          themeMode === "dark" ? "bg-[var(--button)]/20" : "bg-[var(--button)]/10"
                        } flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                          <MapPin size={18} className={themeMode === "dark" ? "text-[var(--button)]" : "text-[var(--button)]"} />
                        </div>
                        <span className={`text-lg font-medium ${
                          themeMode === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}>
                          {selectedStore.address}
                        </span>
                      </div>
                    )}
                    
                    {selectedStore.phone && (
                      <div className="flex items-center gap-3 group cursor-pointer transform hover:-translate-y-1 transition-all duration-300">
                        <div className={`w-10 h-10 rounded-xl ${
                          themeMode === "dark" ? "bg-[var(--button)]/20" : "bg-[var(--button)]/10"
                        } flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                          <Phone size={18} className={themeMode === "dark" ? "text-[var(--text)]" : "text-[var(--button)]"} />
                        </div>
                        <span className={`text-lg font-medium ${
                          themeMode === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}>
                          {selectedStore.phone}
                        </span>
                      </div>
                    )}
                    
                    {selectedStore.email && (
                      <div className="flex items-center gap-3 group cursor-pointer transform hover:-translate-y-1 transition-all duration-300">
                        <div className={`w-10 h-10 rounded-xl ${
                          themeMode === "dark" ? "bg-[var(--button)]/20" : "bg-[var(--button)]/10"
                        } flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                          <Mail size={18} className={themeMode === "dark" ? "text-[var(--button)]" : "text-[var(--button)]"} />
                        </div>
                        <span className={`text-lg font-medium ${
                          themeMode === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}>
                          {selectedStore.email}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Review Section */}
                  <div className="pt-6 border-t border-[var(--border)]/30">
                    {token ? (
                      <ReviewSection
                        userRating={userRating}
                        averageRating={displayRating}
                        totalReviews={uniqueReviewsCount}
                        readOnly={false}
                        compact={true}
                        onRate={(value) => {
                          if (!selectedStore?.store_id) return;
                          dispatch(
                            addReviewThunk({
                              vendor_id: selectedStore.store_id,
                              rating: value,
                            })
                          )
                            .unwrap()
                            .then(() => {
                              dispatch(fetchReviewsThunk(selectedStore.store_id));
                              dispatch(fetchAverageRatingThunk(selectedStore.store_id));
                              dispatch(fetchUserRatingThunk(selectedStore.store_id));
                            })
                            .catch((err) => console.error("Add review failed:", err));
                        }}
                      />
                    ) : (
                      <div className="flex items-center gap-4 group cursor-pointer transform hover:-translate-y-1 transition-all duration-300">
                        <div className={`w-14 h-14 rounded-2xl ${
                          themeMode === "dark" ? "bg-[var(--div)]" : "bg-white"
                        } flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                          <Star className="text-yellow-500" size={28} />
                        </div>
                        <div>
                          <p className={`font-bold text-xl ${
                            themeMode === "dark" ? "text-white" : "text-gray-900"
                          }`}>
                            Sign in to Rate this Store
                          </p>
                          <p className={`text-base ${
                            themeMode === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}>
                            Join our community and share your experience
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced Chat Button */}
                <button
                  onClick={handleChatWithVendor}
                  className="relative bg-gradient-to-r from-[var(--button)] to-[var(--primary)] text-white px-8 py-4 rounded-2xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 shadow-lg transform hover:scale-105 font-bold whitespace-nowrap ml-8 group/btn overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
                  <MessageCircle size={22} className="relative z-10" />
                  <span className="relative z-10">Contact Store</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section - Enhanced */}
        <div className={`rounded-3xl p-8 ${
          themeMode === "dark" 
            ? "bg-gradient-to-br from-[var(--div)] to-[var(--mid-dark)] border-[var(--border)]" 
            : "bg-gradient-to-br from-white to-gray-50 border-gray-200"
        } shadow-2xl border relative overflow-hidden`}>
          
          {/* Products Header */}
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h2 className={`text-4xl font-black mb-3 ${
                themeMode === "dark" ? "text-white" : "text-gray-900"
              }`}>
                Featured Products
              </h2>
              <p className={`text-lg ${
                themeMode === "dark" ? "text-gray-400" : "text-gray-600"
              }`}>
                Discover our exclusive collection
              </p>
            </div>
            
            {/* Enhanced Products Count */}
            <div className={`px-6 py-3 rounded-2xl ${
              themeMode === "dark" ? "bg-[var(--button)]/20" : "bg-[var(--button)]/10"
            } border ${
              themeMode === "dark" ? "border-[var(--button)]/30" : "border-[var(--button)]/20"
            } transform hover:scale-105 transition-all duration-300`}>
              <span className={`font-bold text-lg ${
                themeMode === "dark" ? "text-[var(--text)]" : "text-[var(--button)]"
              }`}>
                {currentProducts.length} {currentProducts.length === 1 ? 'product' : 'products'}
              </span>
            </div>
          </div>

          {currentProducts.length === 0 ? (
            <div className={`text-center py-20 rounded-2xl ${
              themeMode === "dark" ? "bg-[var(--mid-dark)]" : "bg-gray-50"
            } relative overflow-hidden group`}>
              <div className={`w-32 h-32 mx-auto mb-6 rounded-full ${
                themeMode === "dark" ? "bg-[var(--div)]" : "bg-white"
              } flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all duration-300 relative z-10`}>
                <Package className={themeMode === "dark" ? "text-gray-400" : "text-gray-500"} size={50} />
              </div>
              <h3 className={`text-3xl font-bold mb-4 ${
                themeMode === "dark" ? "text-white" : "text-gray-900"
              } relative z-10`}>
                No Products Available
              </h3>
              <p className={`text-xl ${
                themeMode === "dark" ? "text-gray-400" : "text-gray-600"
              } relative z-10`}>
                This store hasn't added any products yet.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
               {currentProducts.map((product, index) => {
              const productData = {
                ...product,
                id: product.id || product.product_id,
                image_url: product.images?.[0]?.image_url || null,
                images: product.images || [],
              };

  return (
    <div 
      key={productData.id}
      className="transform hover:-translate-y-2 transition-all duration-500"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <ProductCard
        product={productData}
        onAddToCart={handleAddToCart}
        compact={true}
      />
    </div>
  );
})}
              </div>

              {/* Enhanced Pagination */}
              {totalProductPages > 1 && (
                <div className="flex justify-center">
                  <div className="flex items-center space-x-3">
                    {Array.from({ length: totalProductPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handleProductPageChange(page)}
                        className={`min-w-[52px] h-14 rounded-xl font-bold text-lg transition-all duration-300 ${
                          currentProductPage === page
                            ? 'bg-gradient-to-r from-[var(--button)] to-[var(--primary)] text-white shadow-2xl scale-110'
                            : `${themeMode === "dark" ? "text-white border border-[var(--border)] hover:bg-[var(--hover)]" : "text-gray-700 border border-gray-300 hover:bg-gray-50"} hover:border-[var(--button)] hover:scale-105`
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default StorePage;