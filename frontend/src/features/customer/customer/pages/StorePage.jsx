import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchStoreById, fetchStoreProducts, setProductPage } from "../storesSlice";
import StoreDetails from "../components/StoreDetails";
import ProductCard from "../components/ProductCard";
import { fetchCart, setCurrentCart } from "../cartSlice";
import ReviewSection from "../../review/ReviewSection";
import { addReviewThunk, fetchAverageRatingThunk, fetchReviewsThunk, fetchUserRatingThunk } from "../../review/reviewSlice";
import customerAPI from "../services/customerAPI";
import { setSelectedConversation, fetchMessages, setConversationsRead } from "../chatSlice";
import ReviewStatic from "../../review/ReviewStatic";

const StorePage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const { selectedStore, storeProducts, loading, error, currentProductPage, productsPerPage } = useSelector(
    (state) => state.stores
  );

  const { user, currentCart, tempCartId } = useSelector((state) => state.cart);
  const guestToken = localStorage.getItem("guest_token");

  // const indexOfLastProduct = currentProductPage * productsPerPage;
  // const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
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
        console.error(" No cart ID found!");
        return;
      }

      await customerAPI.addItem({
        cartId: cart.id,
        product,
        quantity,
        variant: product.variant || {},
      });

      dispatch(fetchCart(cart.id));
      // console.log(" Item added to cart!");
    } catch (err) {
      console.error("Failed to add item:", err);
      alert(err.response?.data?.message || err.message);
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


  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!selectedStore) return <p className="text-center mt-10">Store not found</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center">
        <StoreDetails store={selectedStore} />
        <button
          onClick={handleChatWithVendor}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Chat with Store
        </button>
      </div>

      {token ? (
        <ReviewSection
          userRating={userRating}
          averageRating={displayRating}
          totalReviews={uniqueReviewsCount}
          readOnly={false}
          onRate={(value) => {
            if (!selectedStore?.store_id) return;
            dispatch(addReviewThunk({
              vendor_id: selectedStore.store_id,
              rating: value,
            }))
            .unwrap()
            .then(() => {
              dispatch(fetchReviewsThunk(selectedStore.store_id));
              dispatch(fetchAverageRatingThunk(selectedStore.store_id));
              dispatch(fetchUserRatingThunk(selectedStore.store_id));
            })
            .catch(err => console.error("Add review failed:", err));
          }}
        />
        ) : (
        <ReviewStatic
          averageRating={displayRating}
          totalReviews={uniqueReviewsCount}
        />
      )}

      <h2 className="text-2xl font-bold mt-8 mb-4">Products</h2>
      {storeProducts.length === 0 ? (
        <p>No products available</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {currentProducts.map((product) => (
              <ProductCard
                key={product.product_id}
                product={{
                  ...product,
                  id: product.product_id, 
                  images: Array.isArray(product.images) ? product.images : [],
                }}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>

          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: totalProductPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handleProductPageChange(page)}
                className={`px-3 py-1 rounded ${currentProductPage === page ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                {page}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default StorePage;
