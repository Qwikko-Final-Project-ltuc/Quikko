// StorePage.jsx
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchStoreById,
  fetchStoreProducts,
  setProductPage,
} from "../storesSlice";
import StoreDetails from "../components/StoreDetails";
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
import { MessageCircle, ArrowLeft, Star, MapPin } from "lucide-react";

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
      <div
        className={`min-h-screen ${
          themeMode === "dark" ? "bg-[var(--bg)]" : "bg-gray-50"
        }`}
      >
        <div className="animate-pulse">
          <div
            className={`${
              themeMode === "dark" ? "bg-[var(--div)]" : "bg-white"
            } h-64`}
          ></div>
          <div className="container mx-auto px-4 max-w-7xl py-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`rounded-xl ${
                    themeMode === "dark"
                      ? "bg-[var(--div)]"
                      : "bg-white"
                  } p-3 shadow-sm`}
                >
                  <div
                    className={`h-40 rounded-lg ${
                      themeMode === "dark"
                        ? "bg-[var(--mid-dark)]"
                        : "bg-gray-300"
                    } mb-3`}
                  ></div>
                  <div
                    className={`h-4 rounded ${
                      themeMode === "dark"
                        ? "bg-[var(--mid-dark)]"
                        : "bg-gray-300"
                    } mb-2`}
                  ></div>
                  <div
                    className={`h-4 rounded ${
                      themeMode === "dark"
                        ? "bg-[var(--mid-dark)]"
                        : "bg-gray-300"
                    } w-3/4 mb-3`}
                  ></div>
                  <div
                    className={`h-8 rounded ${
                      themeMode === "dark"
                        ? "bg-[var(--mid-dark)]"
                        : "bg-gray-300"
                    }`}
                  ></div>
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
      <div
        className={`min-h-screen ${
          themeMode === "dark" ? "bg-[var(--bg)]" : "bg-gray-50"
        } flex items-center justify-center`}
      >
        <div className="text-center">
          <div
            className={`w-16 h-16 mx-auto mb-4 rounded-full ${
              themeMode === "dark"
                ? "bg-[var(--error)]/20"
                : "bg-red-100"
            } flex items-center justify-center`}
          >
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-[var(--text)]">
            Error Loading Store
          </h3>
          <p className="mb-6 text-[var(--text)]/70">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--button)] text-white rounded-lg hover:bg-green-700 transition-colors mx-auto"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!selectedStore) {
    return (
      <div
        className={`min-h-screen ${
          themeMode === "dark" ? "bg-[var(--bg)]" : "bg-gray-50"
        } flex items-center justify-center`}
      >
        <div className="text-center">
          <div
            className={`w-16 h-16 mx-auto mb-4 rounded-full ${
              themeMode === "dark"
                ? "bg-[var(--div)]"
                : "bg-gray-200"
            } flex items-center justify-center`}
          >
            <span className="text-2xl">🏪</span>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-[var(--text)]">
            Store Not Found
          </h3>
          <p className="mb-6 text-[var(--text)]/70">
            The store you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/stores")}
            className="px-6 py-3 bg-[var(--button)] text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Browse Stores
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        themeMode === "dark" ? "bg-[var(--bg)]" : "bg-[var(--bg)]"
      }`}
    >
      {/* Store Info Section with gradient */}
      <div
        className={` ${
          themeMode === "dark"
            ? "border-[var(--border)] bg-[linear-gradient(to_bottom,var(--hover)_0%,var(--bg)_100%)]"
            : "border-gray-200 bg-[linear-gradient(to_bottom,var(--div)_0%,var(--bg)_100%)]"
        }`}
      >
        {/* Store Cover Image */}
        <div className="h-64 relative w-full">
          {selectedStore.store_logo ? (
            <img
              src={selectedStore.store_logo}
              alt="Store Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className={`w-full h-full ${
                themeMode === "dark"
                  ? "bg-[var(--mid-dark)]"
                  : "bg-gray-200"
              } flex items-center justify-center`}
            >
              <span className="text-4xl">🏪</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/30"></div>

          <div className="absolute top-4 left-4">
            <button
              onClick={() => navigate(-1)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                themeMode === "dark"
                  ? "bg-[var(--div)] text-white hover:bg-black/70"
                  : "bg-white/90 text-[var(--text)] hover:bg-white"
              } shadow-lg ${
                themeMode === "dark"
                  ? "border-gray-600"
                  : "border-gray-300"
              } transition-colors backdrop-blur-sm`}
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>
          </div>

          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2 drop-shadow-lg text-white">
                  {selectedStore.store_name}
                </h1>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 bg-black/50 px-3 py-1.5 rounded-full text-white">
                    <Star
                      size={16}
                      className="fill-yellow-400 text-yellow-400"
                    />
                    <span>{displayRating.toFixed(1)}</span>
                    <span>({uniqueReviewsCount} reviews)</span>
                  </div>
                  {selectedStore.location && (
                    <div className="flex items-center gap-1 bg-black/50 px-3 py-1.5 rounded-full text-white">
                      <MapPin size={16} />
                      <span>{selectedStore.location}</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleChatWithVendor}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors shadow-lg font-semibold ${
                  themeMode === "dark"
                    ? "bg-[var(--button)] text-white hover:bg-green-700"
                    : "bg-[var(--button)] text-white hover:bg-green-700"
                }`}
              >
                <MessageCircle size={18} />
                <span>Chat with Store</span>
              </button>
            </div>
          </div>
        </div>

        {/* Store Details + Reviews */}
        <div className="container mx-auto px-4 max-w-7xl py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <StoreDetails store={selectedStore} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-[var(--text)] mb-4">
                Customer Reviews
              </h2>
              {token ? (
                <ReviewSection
                  userRating={userRating}
                  averageRating={displayRating}
                  totalReviews={uniqueReviewsCount}
                  readOnly={false}
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
                        dispatch(
                          fetchAverageRatingThunk(selectedStore.store_id)
                        );
                        dispatch(
                          fetchUserRatingThunk(selectedStore.store_id)
                        );
                      })
                      .catch((err) =>
                        console.error("Add review failed:", err)
                      );
                  }}
                />
              ) : (
                <div
                  className={`text-center py-8 rounded-xl ${
                    themeMode === "dark"
                      ? "bg-[var(--mid-dark)]"
                      : "bg-gray-100"
                  }`}
                >
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-full ${
                      themeMode === "dark"
                        ? "bg-[var(--div)]"
                        : "bg-white"
                    } flex items-center justify-center`}
                  >
                    <Star
                      className={
                        themeMode === "dark"
                          ? "text-yellow-400"
                          : "text-yellow-500"
                      }
                    />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-[var(--text)]">
                    Sign in to Rate
                  </h3>
                  <p className="text-[var(--text)]/70">
                    Please sign in to rate this store and see reviews
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 max-w-7xl py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[var(--text)]">
            Store Products
          </h2>
          <span
            className={`px-3 py-1 rounded-full text-sm ${
              themeMode === "dark"
                ? "bg-[var(--bg)] text-[var(--text)]"
                : "bg-[var(--bg)] text-[var(--text)]"
            }`}
          >
            {currentProducts.length} products
          </span>
        </div>

        {currentProducts.length === 0 ? (
          <div
            className={`rounded-2xl ${
              themeMode === "dark" ? "bg-[var(--div)]" : "bg-white"
            } shadow-sm border ${
              themeMode === "dark"
                ? "border-[var(--border)]"
                : "border-gray-200"
            } p-12 text-center`}
          >
            <div
              className={`w-20 h-20 mx-auto mb-6 rounded-full ${
                themeMode === "dark"
                  ? "bg-[var(--mid-dark)]"
                  : "bg-gray-100"
              } flex items-center justify-center`}
            >
              <span className="text-2xl">📦</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-[var(--text)]">
              No Products Available
            </h3>
            <p className="text-[var(--text)]/70">
              This store hasn't added any products yet.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              {currentProducts.map((product) => (
                <div
                  key={product.product_id}
                  className={`group relative rounded-xl ${
                    themeMode === "dark"
                      ? "bg-[var(--div)]"
                      : "bg-white"
                  } shadow-sm border ${
                    themeMode === "dark"
                      ? "border-[var(--border)]"
                      : "border-gray-200"
                  } hover:shadow-md transition-all duration-300 overflow-hidden`}
                >
                  <ProductCard
                    product={{
                      ...product,
                      id: product.product_id,
                      images: Array.isArray(product.images)
                        ? product.images
                        : [],
                    }}
                    onAddToCart={handleAddToCart}
                    compact={true}
                  />
                </div>
              ))}
            </div>

            {totalProductPages > 1 && (
              <div className="flex justify-center space-x-2">
                {Array.from({ length: totalProductPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handleProductPageChange(page)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentProductPage === page
                          ? "bg-[var(--button)] text-white"
                          : themeMode === "dark"
                          ? "bg-[var(--mid-dark)] text-[var(--text)] hover:bg-[var(--hover)]"
                          : "bg-gray-200 text-[var(--text)] hover:bg-gray-300"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StorePage;
