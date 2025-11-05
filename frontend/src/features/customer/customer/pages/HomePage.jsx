import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ProductCard from "../components/ProductCard";
import LandingPage from "./LandingPage";
import customerAPI from "../services/customerAPI";
import { fetchCart, setCurrentCart } from "../cartSlice";

const HomePage = () => {
  const [popularProducts, setPopularProducts] = useState([]);
  const [newestProducts, setNewestProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recLoading, setRecLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userId = useSelector((state) => state.cart.user?.id);
  const currentCart = useSelector((state) => state.cart.currentCart);
  const tempCartId = useSelector((state) => state.cart.tempCartId);
  const themeMode = useSelector((state) => state.customerTheme.mode);
  const displayedIds = useRef(new Set());

  // Scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.pageYOffset / totalHeight) * 100;
      setScrollProgress(progress);
      setShowScrollTop(window.pageYOffset > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Function to remove duplicate images from array
  const removeDuplicateImages = (images) => {
    if (!Array.isArray(images)) return [];
    
    const seenUrls = new Set();
    const uniqueImages = [];
    
    images.forEach(image => {
      if (image && !seenUrls.has(image)) {
        seenUrls.add(image);
        uniqueImages.push(image);
      }
    });
    
    return uniqueImages;
  };

  // Function to normalize product images and remove duplicates
  const normalizeProductImages = (product) => {
    let images = [];
    
    // Handle different image formats
    if (Array.isArray(product.images) && product.images.length > 0) {
      images = removeDuplicateImages(product.images);
    } else if (product.image_url) {
      images = [product.image_url];
    } else if (product.image) {
      images = [product.image];
    }
    
    return {
      ...product,
      images: images
    };
  };

  // Function to remove duplicate products
  const removeDuplicateProducts = (products) => {
    const seenIds = new Set();
    const uniqueProducts = [];
    
    products.forEach(product => {
      const productId = product.id || product.product_id;
      if (productId && !seenIds.has(productId)) {
        seenIds.add(productId);
        uniqueProducts.push(product);
      }
    });
    
    return uniqueProducts;
  };

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [resPopular, resNewest] = await Promise.all([
          fetch("http://localhost:3000/api/customers/most-popular"),
          fetch("http://localhost:3000/api/customers/newest"),
        ]);
        
        if (!resPopular.ok || !resNewest.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const [dataPopular, dataNewest] = await Promise.all([
          resPopular.json(), 
          resNewest.json()
        ]);
        
        console.log('Raw Popular Data:', dataPopular);
        console.log('Raw Newest Data:', dataNewest);
        
        // Remove duplicates and normalize images
        const normalizedPopular = Array.isArray(dataPopular) 
          ? removeDuplicateProducts(dataPopular).slice(0, 4).map(normalizeProductImages)
          : [];
        const normalizedNewest = Array.isArray(dataNewest) 
          ? removeDuplicateProducts(dataNewest).slice(0, 4).map(normalizeProductImages)
          : [];
          
        console.log('Normalized Popular Products:', normalizedPopular);
        console.log('Normalized Newest Products:', normalizedNewest);
          
        setPopularProducts(normalizedPopular);
        setNewestProducts(normalizedNewest);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Fetch recommendations
  const fetchRecommendations = async () => {
    try {
      setRecLoading(true);
      let recs = [];
      if (token) {
        recs = await customerAPI.getRecommendations({ excludeIds: Array.from(displayedIds.current) });
      }
      if (!token || !recs || recs.length === 0) {
        const res = await fetch("http://localhost:3000/api/customers/top-rated");
        if (res.ok) {
          const data = await res.json();
          recs = Array.isArray(data) ? data : [];
        }
      }
      if (!recs.length) return;
      
      // Remove duplicates and normalize images
      const uniqueRecs = removeDuplicateProducts(recs);
      const normalizedRecs = uniqueRecs.slice(0, 4).map(normalizeProductImages);
      
      normalizedRecs.forEach((r) => {
        const productId = r.id || r.product_id;
        if (productId) {
          displayedIds.current.add(productId);
        }
      });
      
      setRecommendedProducts((prev) => {
        const combined = [...prev, ...normalizedRecs];
        return removeDuplicateProducts(combined);
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

  const handleAddToCart = async (product, quantity = 1) => {
    try {
      let cart = currentCart;
      const guestToken = tempCartId || localStorage.getItem("guest_token");
      if (!cart?.id) {
        cart = await customerAPI.getOrCreateCart(null, userId, guestToken);
        dispatch(setCurrentCart(cart));
      }
      await customerAPI.addItem({ cartId: cart.id, product, quantity, variant: product.variant || {} });
      dispatch(fetchCart(cart.id));
      if (token) {
        await customerAPI.logInteraction(userId, product.id, "add_to_cart");
      }
      alert("Added to cart!");
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const ProductCardSkeleton = () => (
    <div className="animate-pulse bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-4 h-80 flex flex-col">
      <div className="bg-gray-300 dark:bg-gray-600 rounded-xl h-48 mb-4"></div>
      <div className="bg-gray-300 dark:bg-gray-600 rounded h-4 mb-2"></div>
      <div className="bg-gray-300 dark:bg-gray-600 rounded h-4 w-3/4 mb-2"></div>
      <div className="bg-gray-300 dark:bg-gray-600 rounded h-6 w-1/2 mt-auto"></div>
    </div>
  );

  const titleVariant = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[var(--button)]"></div>
          <p className="text-[var(--text)]">Loading product details...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Error: {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-[var(--bg)] transition-colors duration-500">
      {/* Scroll Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 z-50 transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Landing Section */}
      <div className="cursor-pointer transform transition-all duration-500 hover:shadow-2xl">
        <LandingPage />
      </div>

      {/* Product Sections */}
      {[
        { title: "Most Popular", products: popularProducts },
        { title: "New Arrivals", products: newestProducts },
        { title: "Recommended For You", products: recommendedProducts },
      ].map((section, idx) => (
        <section className="max-w-7xl mx-auto px-6 py-20" key={idx}>
          <motion.div
            variants={titleVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              {section.title}
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            {section.products.length > 0
              ? section.products.map((product) => (
                  <div
                    key={product.id || product.product_id}
                    className="product-card-container hover:scale-105 transform transition-all duration-500 cursor-pointer"
                  >
                    <ProductCard
                      product={product}
                      onAddToCart={handleAddToCart}
                      isLoggedIn={!!token}
                    />
                  </div>
                ))
              : Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
          {section.title === "Recommended For You" && (
            <div className="flex justify-center mt-16">
              <button
                onClick={fetchRecommendations}
                disabled={recLoading}
                className="px-10 py-5 rounded-2xl font-bold text-lg bg-gradient-to-r to-gray-900 from-[var(--button)] text-white hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-500 hover:scale-110 flex items-center gap-4"
              >
                {recLoading ? "Loading..." : "Load More Recommendations"}
              </button>
            </div>
          )}
        </section>
      ))}

      {/* CTA Section */}
      <section className={`py-24 relative overflow-hidden transition-all duration-500 ${
        themeMode === 'dark' 
          ? "bg-gradient-to-br from-[var(--button)] to-gray-900 text-white" 
          : "bg-gradient-to-br from-[var(--button)] to-gray-900 text-white" 
      }`}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-bounce"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-yellow-300 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-green-300 rounded-full animate-bounce" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="max-w-4xl mx-auto text-center px-6 relative z-10">
          <h3 className="text-5xl font-bold mb-8 bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
            Ready to Explore More?
          </h3>
          <p className="text-2xl opacity-90 mb-12 max-w-2xl mx-auto leading-relaxed">
            Discover our complete collection and find exactly what you're looking for
          </p>
          <button 
            onClick={() => navigate("/customer/products")}
            className="px-12 py-6 rounded-2xl font-bold text-xl transition-all duration-300
            hover:shadow-2xl transform hover:scale-110 bg-white text-gray-900 hover:bg-gray-100"
          >
             Browse All Products
          </button>
        </div>
      </section>

      {/* Footer Spacer */}
      <div className={`h-12 transition-colors duration-500 ${
        themeMode === 'dark' ? 'bg-[var(--bg)]' : 'bg-gray-50'
      }`}></div>
    
    </div>
  );
};

export default HomePage;