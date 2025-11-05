// StorePage.jsx
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
import { MessageCircle, Star, ShoppingBag, Package, Phone, Mail } from "lucide-react";

const StorePage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const themeMode = useSelector((state) => state.customerTheme.mode);

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

  const currentProducts = selectedStore?.products || [];
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
      const userId = user?.id;
      const token = tempCartId || guestToken;

      if (!cart) {
        cart = await customerAPI.getOrCreateCart(null, userId, token);
        dispatch(setCurrentCart(cart));
      }

      if (!cart?.id) {
        console.error("No cart ID found!");
        return;
      }

      await customerAPI.addItem({
        cartId: cart.id,
        product,
        quantity,
        variant: product.variant || {},
      });

      dispatch(fetchCart(cart.id));

      const event = new CustomEvent("showToast", {
        detail: {
          message: "Added to cart successfully!",
          type: "success",
        },
      });
      window.dispatchEvent(event);
    } catch (err) {
      console.error("Failed to add item:", err);
      const event = new CustomEvent("showToast", {
        detail: {
          message: err.response?.data?.message || err.message,
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
      <div className={`min-h-screen ${themeMode === "dark" ? "bg-[var(--bg)]" : "bg-gray-50"}`}>
        <div className="animate-pulse">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`rounded-2xl ${themeMode === "dark" ? "bg-[var(--div)]" : "bg-white"} p-4 shadow-lg border-2 ${themeMode === "dark" ? "border-[var(--border)]" : "border-gray-200"}`}
                >
                  <div className={`h-48 rounded-xl ${themeMode === "dark" ? "bg-[var(--mid-dark)]" : "bg-gray-300"} mb-4`}></div>
                  <div className={`h-4 rounded ${themeMode === "dark" ? "bg-[var(--mid-dark)]" : "bg-gray-300"} mb-3`}></div>
                  <div className={`h-4 rounded ${themeMode === "dark" ? "bg-[var(--mid-dark)]" : "bg-gray-300"} w-3/4 mb-4`}></div>
                  <div className={`h-10 rounded-lg ${themeMode === "dark" ? "bg-[var(--mid-dark)]" : "bg-gray-300"}`}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${themeMode === "dark" ? "bg-[var(--bg)]" : "bg-gray-50"} flex items-center justify-center px-4 py-16`}>
        <div className="text-center max-w-md">
          <div className={`w-20 h-20 ${themeMode === "dark" ? "bg-[var(--error)]/20" : "bg-red-100"} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <svg className={`w-10 h-10 ${themeMode === "dark" ? "text-[var(--error)]" : "text-red-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className={`text-xl font-semibold ${themeMode === "dark" ? "text-[var(--error)]" : "text-red-600"} mb-2`}>Error Loading Store</h3>
          <p className={`${themeMode === "dark" ? "text-[var(--text)]" : "text-gray-700"} opacity-80 mb-6`}>{error}</p>
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
      <div className={`min-h-screen ${themeMode === "dark" ? "bg-[var(--bg)]" : "bg-gray-50"} flex items-center justify-center px-4 py-16`}>
        <div className="text-center max-w-md">
          <div className={`w-24 h-24 ${themeMode === "dark" ? "bg-[var(--div)]" : "bg-gray-200"} rounded-full flex items-center justify-center mx-auto mb-6`}>
            <span className="text-3xl">🏪</span>
          </div>
          <h3 className={`text-2xl font-bold mb-4 ${themeMode === "dark" ? "text-white" : "text-gray-900"}`}>Store Not Found</h3>
          <p className={`text-lg mb-8 ${themeMode === "dark" ? "text-gray-400" : "text-gray-600"}`}>
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
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Store Header - Direct on Page */}
        <div className="flex items-start gap-8  p-10">
          {/* Store Logo */}
          <div className="flex-shrink-0">
            <div className={`w-32 h-32 rounded-2xl ${themeMode === "dark" ? "bg-[var(--mid-dark)]" : "bg-gray-100"} border-2 ${themeMode === "dark" ? "border-[var(--border)]" : "border-gray-200"} overflow-hidden shadow-2xl`}>
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
          </div>

          {/* Store Info - Direct on Page */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className={`text-4xl font-bold mb-4 ${themeMode === "dark" ? "text-white" : "text-gray-900"}`}>
                  {selectedStore.store_name}
                </h1>
                
                <p className={`text-xl ${themeMode === "dark" ? "text-gray-300" : "text-gray-600"} mb-6 leading-relaxed`}>
                  {selectedStore.description || "Explore our collection of quality products"}
                </p>

                {/* Contact Information - Direct on Page */}
                <div className="flex items-center gap-8 mb-4">
                  {selectedStore.phone && (
                    <div className="flex items-center gap-3">
                      <Phone size={20} className={`${themeMode === "dark" ? "text-gray-400" : "text-gray-600"}`} />
                      <span className={`text-lg ${themeMode === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                        {selectedStore.phone}
                      </span>
                    </div>
                  )}
                  
                  {selectedStore.email && (
                    <div className="flex items-center gap-3">
                      <Mail size={20} className={`${themeMode === "dark" ? "text-gray-400" : "text-gray-600"}`} />
                      <span className={`text-lg ${themeMode === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                        {selectedStore.email}
                      </span>
                    </div>
                  )}
                </div>

            {/* Review Section - Direct on Page */}
            <div className="pt-6">
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
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full ${themeMode === "dark" ? "bg-[var(--div)]" : "bg-white"} flex items-center justify-center shadow-lg`}>
                    <Star className={themeMode === "dark" ? "text-yellow-400" : "text-yellow-500"} size={24} />
                  </div>
                  <div>
                    <p className={`font-semibold text-lg ${themeMode === "dark" ? "text-white" : "text-gray-900"}`}>
                      Sign in to Rate this Store
                    </p>
                    <p className={`text-sm ${themeMode === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      Join our community and share your experience
                    </p>
                  </div>
                </div>
              )}
            </div>
              </div>

              {/* Chat Button - Far Right */}
              <button
                onClick={handleChatWithVendor}
                className="bg-[var(--button)] text-white px-8 py-4 rounded-xl hover:bg-[#015c40] transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold whitespace-nowrap ml-8"
              >
                <MessageCircle size={20} />
                Contact Store
              </button>
            </div>


            
          </div>
        </div>

        {/* Products Section */}
        <div className={`rounded-2xl p-8 ${themeMode === "dark" ? "bg-[var(--div)]" : "bg-white"} shadow-xl border ${themeMode === "dark" ? "border-[var(--border)]" : "border-gray-200"}`}>
          {/* Products Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className={`text-3xl font-bold mb-3 ${themeMode === "dark" ? "text-white" : "text-gray-900"}`}>
                Products
              </h2>
              <p className={`text-lg ${themeMode === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Browse our collection
              </p>
            </div>
            
            {/* Products Count - Top Right */}
            <div className={`px-6 py-3 rounded-xl ${themeMode === "dark" ? "bg-[var(--button)]/20" : "bg-[var(--button)]/10"} border ${themeMode === "dark" ? "border-[var(--button)]/30" : "border-[var(--button)]/20"}`}>
              <span className={`font-semibold text-lg ${themeMode === "dark" ? "text-[var(--button)]" : "text-[var(--button)]"}`}>
                {currentProducts.length} {currentProducts.length === 1 ? 'product' : 'products'}
              </span>
            </div>
          </div>

          {currentProducts.length === 0 ? (
            <div className={`text-center py-20 rounded-xl ${themeMode === "dark" ? "bg-[var(--mid-dark)]" : "bg-gray-50"}`}>
              <div className={`w-28 h-28 mx-auto mb-6 rounded-full ${themeMode === "dark" ? "bg-[var(--div)]" : "bg-white"} flex items-center justify-center shadow-2xl`}>
                <Package className={themeMode === "dark" ? "text-gray-400" : "text-gray-500"} size={40} />
              </div>
              <h3 className={`text-2xl font-semibold mb-4 ${themeMode === "dark" ? "text-white" : "text-gray-900"}`}>
                No Products Available
              </h3>
              <p className={`text-lg ${themeMode === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                This store hasn't added any products yet.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
                {currentProducts.map((product) => (
                  <div
                    key={product.product_id}
                    className={`group relative rounded-3xl ${themeMode === "dark" ? "bg-[var(--mid-dark)]" : "bg-white"} shadow-2xl border ${themeMode === "dark" ? "border-[var(--border)]" : "border-gray-200"} hover:shadow-3xl transition-all duration-300 overflow-hidden hover:border-[var(--button)]/50 transform hover:-translate-y-2`}
                  >
                    <ProductCard
                      product={{
                        ...product,
                        id: product.product_id,
                        images: Array.isArray(product.images) ? product.images : [],
                      }}
                      onAddToCart={handleAddToCart}
                      compact={true}
                    />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalProductPages > 1 && (
                <div className="flex justify-center">
                  <div className="flex items-center space-x-3">
                    {Array.from({ length: totalProductPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handleProductPageChange(page)}
                        className={`min-w-[52px] h-14 rounded-xl font-semibold text-lg transition-all duration-300 ${
                          currentProductPage === page
                            ? 'bg-[var(--button)] text-white shadow-2xl scale-110'
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
    </div>
  );
};

export default StorePage;