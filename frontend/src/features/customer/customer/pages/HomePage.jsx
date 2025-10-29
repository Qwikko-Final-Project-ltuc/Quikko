// HomePage.jsx
import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProductCard from "../components/ProductCard";
import customerAPI from "../services/customerAPI";
import LandingPage from "./LandingPage";
import { fetchCart, setCurrentCart } from "../cartSlice";

const HomePage = () => {
  const [popularProducts, setPopularProducts] = useState([]);
  const [newestProducts, setNewestProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [recLoading, setRecLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();
  const userId = useSelector((state) => state.cart.user?.id);
  const initialCartId = location.state?.cartId;
  const currentCart = useSelector((state) => state.cart.currentCart);
  const tempCartId = useSelector((state) => state.cart.tempCartId);
  const token = localStorage.getItem("token");

  // IDs already displayed to avoid duplicates across renders
  const displayedIds = useRef(new Set());

  // Fetch Popular & Newest Products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const resPopular = await fetch(
          "http://localhost:3000/api/customers/most-popular"
        );
        const dataPopular = await resPopular.json();
        setPopularProducts(Array.isArray(dataPopular) ? dataPopular.slice(0, 4) : []);


        const resNewest = await fetch(
          "http://localhost:3000/api/customers/newest"
        );
        const dataNewest = await resNewest.json();
        setNewestProducts(Array.isArray(dataNewest) ? dataNewest.slice(0, 4) : []);


      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Fetch Recommendations (4 each time, no duplicates)
  const fetchRecommendations = async () => {
    try {
      setRecLoading(true);

      const recs = await customerAPI.getRecommendations({
        excludeIds: Array.from(displayedIds.current),
      });

      if (!recs.length) return;

      const recSlice = recs.slice(0, 4);
      recSlice.forEach((r) => displayedIds.current.add(r.id));

      setRecommendedProducts((prev) => {
        const combined = [...prev, ...recSlice];
        const uniqueProducts = [];
        const seenIds = new Set();

        combined.forEach((p) => {
          if (!seenIds.has(p.id)) {
            seenIds.add(p.id);
            uniqueProducts.push({
              ...p,
              images:
                Array.isArray(p.images) && p.images.length > 0
                  ? p.images
                  : p.image_url
                  ? [p.image_url]
                  : [],
            });
          }
        });

        return uniqueProducts;
      });
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
    } finally {
      setRecLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  // Add to cart
  const handleAddToCart = async (product, quantity = 1) => {
    try {
      let cart = currentCart;
      const guestToken = tempCartId || localStorage.getItem("guest_token");

      if (!cart?.id) {
        cart = await customerAPI.getOrCreateCart(initialCartId, userId, guestToken);
        dispatch(setCurrentCart(cart));
      }

      await customerAPI.addItem({
        cartId: cart.id,
        product,
        quantity,
        variant: product.variant || {},
      });

      dispatch(fetchCart(cart.id));

      if (token) {
        await customerAPI.logInteraction(userId, product.id, "add_to_cart");
      }

      alert("Added to cart!");
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  if (loading)
    return <p className="text-center mt-20 text-gray-500">Loading...</p>;

  if (error)
    return <p className="text-center mt-20 text-red-500">Error: {error}</p>;

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {/* Landing Section */}
      <LandingPage />

      {/* Most Popular Products */}
      <div className="max-w-6xl mx-auto my-12">
        <h2 className="text-2xl font-bold mb-6">Most Popular</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {popularProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={{
                ...p,
                images:
                  Array.isArray(p.images) && p.images.length > 0
                    ? p.images
                    : p.image_url
                    ? [p.image_url]
                    : [],
              }}
              onAddToCart={handleAddToCart}
              isLoggedIn={!!token}
            />
          ))}
        </div>
      </div>

      {/* Newest Products */}
      <div className="max-w-6xl mx-auto my-12">
        <h2 className="text-2xl font-bold mb-6">Newest Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {newestProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={{
                ...p,
                images:
                  Array.isArray(p.images) && p.images.length > 0
                    ? p.images
                    : p.image_url
                    ? [p.image_url]
                    : [],
              }}
              onAddToCart={handleAddToCart}
              isLoggedIn={!!token}
            />
          ))}
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="max-w-6xl mx-auto my-12">
        <h2 className="text-2xl font-bold mb-6">Recommended For You</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {recommendedProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={{
                ...p,
                images:
                  Array.isArray(p.images) && p.images.length > 0
                    ? p.images
                    : p.image_url
                    ? [p.image_url]
                    : [],
                price: p.price,
                description: p.description,
              }}
              onAddToCart={handleAddToCart}
              isLoggedIn={!!token}
            />
          ))}
        </div>

        {/* Load More Button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={fetchRecommendations}
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 flex items-center gap-2"
            disabled={recLoading}
          >
            {recLoading ? "Loading..." : <>Load More <span>➡️</span></>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
