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
  
  // جلب حالة الثيم من الـ Redux
  const themeMode = useSelector((state) => state.customerTheme.mode);

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
      let recs = [];

      if (token) {
        recs = await customerAPI.getRecommendations({
          excludeIds: Array.from(displayedIds.current),
        });
      }

      if (!token || !recs || recs.length === 0) {
        console.log("⚠️ No token or empty recommendations — fetching top-rated products instead.");

        const res = await fetch("http://localhost:3000/api/customers/top-rated");
        const data = await res.json();
        recs = Array.isArray(data) ? data.slice(0, 4) : [];
      }

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--button)] mx-auto mb-4"></div>
          <p className="text-[var(--text)] text-lg">Loading...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <div className="w-16 h-16 bg-[var(--error)] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">!</span>
          </div>
          <p className="text-[var(--error)] text-lg">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-[var(--button)] text-white rounded-lg hover:bg-opacity-90 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Landing Section */}
      <LandingPage />

      {/* Most Popular Products */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className={`text-3xl font-bold mb-4 ${
            themeMode === 'dark' 
              ? "text-[var(--textbox)]" 
              : "text-[var(--text)]"
          }`}>
            Most Popular
          </h2>
          <p className={`max-w-2xl mx-auto ${
            themeMode === 'dark' 
              ? "text-gray-400" 
              : "text-[var(--light-gray)]"
          }`}>
            Discover our best-selling products loved by customers worldwide
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
      </section>

      {/* Newest Products */}
      <section className={`max-w-7xl mx-auto px-6 py-16 rounded-3xl mx-6 mb-16 ${
        themeMode === 'dark' ? "bg-[var(--div)]" : "bg-[var(--textbox)]"
      }`}>
        <div className="text-center mb-12">
          <h2 className={`text-3xl font-bold mb-4 ${
            themeMode === 'dark' 
              ? "text-[var(--textbox)]" 
              : "text-[var(--text)]"
          }`}>
            New Arrivals
          </h2>
          <p className={`max-w-2xl mx-auto ${
            themeMode === 'dark' 
              ? "text-gray-400" 
              : "text-[var(--light-gray)]"
          }`}>
            Fresh products just added to our collection
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
      </section>

      {/* Recommendations Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className={`text-3xl font-bold mb-4 ${
            themeMode === 'dark' 
              ? "text-[var(--textbox)]" 
              : "text-[var(--text)]"
          }`}>
            Recommended For You
          </h2>
          <p className={`max-w-2xl mx-auto ${
            themeMode === 'dark' 
              ? "text-gray-400" 
              : "text-[var(--light-gray)]"
          }`}>
            Personalized recommendations based on your preferences
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
        <div className="flex justify-center mt-12">
          <button
            onClick={fetchRecommendations}
            disabled={recLoading}
            className={`group relative px-8 py-4 rounded-xl font-semibold 
                     hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed 
                     transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-3 ${
                       themeMode === 'dark'
                         ? "bg-[var(--textbox)] text-[var(--button)]"
                         : "bg-[var(--button)] text-white"
                     }`}
          >
            {recLoading ? (
              <>
                <div className={`animate-spin rounded-full h-5 w-5 border-b-2 ${
                  themeMode === 'dark' ? "border-[var(--button)]" : "border-white"
                }`}></div>
                Loading...
              </>
            ) : (
              <>
                Load More 
                <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* CTA Section */}
<section className={`py-20 ${
  themeMode === 'dark' 
    ? "bg-gradient-to-r from-[var(--button)] to-gray-700 text-[var(--textbox)]" 
    : "bg-[var(--button)] text-[var(--textbox)]" 
}`}>
  <div className="max-w-4xl mx-auto text-center px-6">
    <h3 className="text-4xl font-bold mb-6">Ready to Explore More?</h3>
    <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
      Discover our complete collection and find exactly what you're looking for
    </p>
    <button className={`px-8 py-4 rounded-xl font-semibold 
      hover:bg-opacity-90 transition-all duration-300 hover:scale-105 ${
        themeMode === 'dark'
          ? "bg-[var(--textbox)] text-[var(--button)]"
          : "bg-white text-[var(--button)]"
      }`}>
      Browse All Products
    </button>
  </div>
</section>
<div className={`h-8 ${themeMode === 'dark' ? 'bg-[var(--bg)]' : 'bg-[var(--bg)]'}`}></div>
    </div>
  );
};

export default HomePage;