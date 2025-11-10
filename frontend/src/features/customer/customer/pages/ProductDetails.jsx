import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { useSelector, useDispatch } from "react-redux";
import customerAPI from "../services/customerAPI";
import { FaStar, FaStarHalfAlt, FaRegStar, FaShoppingCart, FaStore, FaArrowRight } from "react-icons/fa";
import ProductCard from "../components/ProductCard";
import { FiCheckCircle, FiAlertCircle, FiX, FiInfo } from "react-icons/fi";
import { fetchCart, setCurrentCart } from "../cartSlice";

// Toast Component
const Toast = ({ message, type = "info", onClose }) => {
  const bgColor = {
    success: "bg-green-500",
    error: "bg-red-500", 
    warning: "bg-yellow-500",
    info: "bg-blue-500"
  }[type];

  const icon = {
    success: <FiCheckCircle className="text-white" />,
    error: <FiAlertCircle className="text-white" />,
    warning: <FiAlertCircle className="text-white" />,
    info: <FiInfo className="text-white" />
  }[type];

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-4 rounded-xl shadow-2xl z-50 max-w-sm animate-fade-in-up backdrop-blur-sm`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="mr-3">{icon}</span>
          <span className="font-medium text-sm">{message}</span>
        </div>
        <button 
          onClick={onClose}
          className="ml-4 hover:bg-white/20 rounded-full p-1 transition-colors"
        >
          <FiX size={16} />
        </button>
      </div>
    </div>
  );
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [recLoading, setRecLoading] = useState(false);
  const [displayedIds, setDisplayedIds] = useState(new Set());
  const [toast, setToast] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [averageRating, setAverageRating] = useState(null);
  const [reviewsCount, setReviewsCount] = useState(0);

  const user = useSelector((state) => state.cart.user);
  const themeMode = useSelector((state) => state.customerTheme.mode);
  const currentCart = useSelector((state) => state.cart.currentCart);
  const tempCartId = useSelector((state) => state.cart.tempCartId);
  const token = localStorage.getItem("token");

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // دالة إضافة المنتج إلى السلة - نفس الطريقة المستخدمة في ProductsPage
  const handleAddToCart = async (productToAdd, quantity = 1) => {
    try {
      let cart = currentCart;
      const guestToken = tempCartId || localStorage.getItem("guest_token");

      if (!cart?.id) {
        cart = await customerAPI.getOrCreateCart(null, user?.id, guestToken);
        dispatch(setCurrentCart(cart));
      }

      await customerAPI.addItem({
        cartId: cart.id,
        product: productToAdd,
        quantity,
        variant: productToAdd.variant || {},
      });

      dispatch(fetchCart(cart.id));
      if (token) {
        await customerAPI.logInteraction(user?.id, productToAdd.id, "add_to_cart");
      }
      
      return true;
    } catch (err) {
      console.log(err.response?.data?.message || err.message);
      return false;
    }
  };

// دالة الأنيميشن فقط - مطابقة لـ ProductCard
const handleAddToCartWithAnimation = (e) => {
  e.stopPropagation();
  
  if (isAnimating) return;
  
  setIsAnimating(true);
  
  const buttonRect = e.target.getBoundingClientRect();
  const animationElement = document.createElement('div');
  
  const findCartButton = () => {
    const byDataAttr = document.querySelector('[data-cart-icon]');
    if (byDataAttr) return byDataAttr;
    
    const byClass = document.querySelector('.cart-icon-button');
    if (byClass) return byClass;
    
    const navButtons = document.querySelectorAll('nav button, nav .relative button');
    for (let btn of navButtons) {
      if (btn.innerHTML.includes('fa-shopping-cart') || 
          btn.innerHTML.includes('FaShoppingCart') ||
          btn.querySelector('svg')) {
        return btn;
      }
    }
    
    const allButtons = document.querySelectorAll('button');
    for (let btn of allButtons) {
      const btnText = btn.textContent?.toLowerCase() || '';
      const btnHTML = btn.innerHTML?.toLowerCase() || '';
      const onClick = btn.onclick?.toString() || '';
      
      if (btnText.includes('cart') || 
          btnHTML.includes('shopping-cart') ||
          onClick.includes('Cart') ||
          onClick.includes('cart')) {
        return btn;
      }
    }
    
    return null;
  };
  
  const cartButton = findCartButton();
  let finalLeft = '10%';
  let finalTop = '25px';
  
  if (cartButton) {
    const cartRect = cartButton.getBoundingClientRect();
    finalLeft = `${cartRect.left + cartRect.width / 2 - 20}px`;
    finalTop = `${cartRect.top + cartRect.height / 2}px`;
  }
  
  animationElement.style.position = 'fixed';
  animationElement.style.left = `${buttonRect.left + buttonRect.width / 2}px`;
  animationElement.style.top = `${buttonRect.top + buttonRect.height / 2}px`;
  animationElement.style.width = '50px';
  animationElement.style.height = '50px';
  animationElement.style.backgroundImage = `url(${product?.images?.[0] || ''})`;
  animationElement.style.backgroundSize = 'cover';
  animationElement.style.backgroundPosition = 'center';
  animationElement.style.borderRadius = '10px';
  animationElement.style.zIndex = '10000';
  animationElement.style.pointerEvents = 'none';
  animationElement.style.transition = 'all 0.7s linear';
  animationElement.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
  animationElement.style.border = '2px solid white';
  
  document.body.appendChild(animationElement);
  
  setTimeout(() => {
    animationElement.style.left = finalLeft;
    animationElement.style.top = finalTop;
    animationElement.style.transform = 'scale(0.15)';
    animationElement.style.opacity = '0.6';
  }, 10);
  
  setTimeout(() => {
    if (document.body.contains(animationElement)) {
      document.body.removeChild(animationElement);
    }
    setIsAnimating(false);
    
    // إضافة المنتج إلى السلة بعد الأنيميشن
    handleAddToCart(product).then(success => {
      if (success) {
        showToast(`${product?.name} added to cart!`, 'success');
      } else {
        showToast('Failed to add product to cart', 'error');
      }
    });
  }, 720);
};

  const handleAddToCartForRecommended = async (productToAdd, quantity = 1) => {
    try {
      const success = await handleAddToCart(productToAdd, quantity);
      if (success) {
        showToast(`${productToAdd.name} added to cart!`, "success");
      } else {
        showToast('Failed to add product to cart', "error");
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message, "error");
    }
  };

  useEffect(() => {
    let hasLoggedView = false;

    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/products/${id}`);
        setProduct(res.data);

        if (user?.id && !hasLoggedView) {
          hasLoggedView = true;
          await customerAPI.logInteraction(user.id, id, "view");
          console.log("✅ View interaction logged once");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        showToast("Error loading product details", "error");
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/products/review/${id}`);
        console.log("✅ Reviews API response:", res.data);

        // نقرأ المصفوفة والبيانات الأخرى بشكل صحيح
        const reviewsData = Array.isArray(res.data.reviews) ? res.data.reviews : [];
        setReviews(reviewsData);
        setAverageRating(res.data.average_rating);
        setReviewsCount(res.data.reviews_count);

        if (user?.id) {
          const userReview = reviewsData.find((review) => review.user_id === user.id);
          setHasUserReviewed(!!userReview);
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
        showToast("Error loading reviews", "error");
      }
    };

    fetchProduct();
    fetchReviews();

    return () => {
      hasLoggedView = true;
    };
  }, [id, user?.id]);

  // Fetch recommendations
  const fetchRecommendations = async () => {
    try {
      setRecLoading(true);
      let recs = [];
      
      // Add current product to excluded IDs
      const excludeIds = [...displayedIds];
      if (product?.id) {
        excludeIds.push(product.id);
      }

      if (token && user?.id) {
        recs = await customerAPI.getRecommendations({ excludeIds });
      }
      
      if (!token || !recs || recs.length === 0) {
        const res = await fetch("http://localhost:3000/api/customers/top-rated");
        if (res.ok) {
          const data = await res.json();
          recs = Array.isArray(data) ? data : [];
        }
      }
      
      if (!recs.length) {
        showToast("No more recommendations available", "info");
        return;
      }
      
      // Remove duplicates and normalize images
      const uniqueRecs = removeDuplicateProducts(recs);
      const normalizedRecs = uniqueRecs.slice(0, 4).map(normalizeProductImages);
      
      // Update displayed IDs
      const newDisplayedIds = new Set(displayedIds);
      normalizedRecs.forEach((r) => {
        const productId = r.id || r.product_id;
        if (productId) {
          newDisplayedIds.add(productId);
        }
      });
      setDisplayedIds(newDisplayedIds);
      
      setRecommendedProducts((prev) => {
        const combined = [...prev, ...normalizedRecs];
        return removeDuplicateProducts(combined);
      });
      
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
      showToast("Error loading recommendations", "error");
    } finally {
      setRecLoading(false);
    }
  };

  useEffect(() => {
    if (product?.id) {
      fetchRecommendations();
    }
  }, [product?.id]);

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

  const handleAddReview = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      showToast("Please select a rating before submitting your review", "warning");
      return;
    }

    if (!comment.trim()) {
      showToast("Please write a comment before submitting your review", "warning");
      return;
    }

    if (hasUserReviewed) {
      showToast("You have already reviewed this product", "warning");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3000/api/products/review",
        {
          product_id: id,
          rating,
          comment,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      showToast("Review added successfully!", "success");
      setRating(0);
      setComment("");
      setHasUserReviewed(true);

      // Refresh reviews
      const res = await axios.get(`http://localhost:3000/api/products/review/${id}`);
      setReviews(res.data.reviews || []);
      setAverageRating(res.data.average_rating);
      setReviewsCount(res.data.reviews_count);
    } catch (err) {
      console.error("Error adding review:", err);
      if (err.response?.status === 409) {
        showToast("You have already reviewed this product", "warning");
        setHasUserReviewed(true);
      } else {
        showToast(err.response?.data?.message || "Failed to add review", "error");
      }
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-yellow-400" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="text-yellow-400" />);
    }

    return stars;
  };

  const handleVendorClick = () => {
    if (product?.vendor_id) {
      navigate(`/customer/stores/${product.vendor_id}`);
    }
  };

  const ProductCardSkeleton = () => (
    <div className="animate-pulse bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-4 h-80 flex flex-col">
      <div className="bg-gray-300 dark:bg-gray-600 rounded-xl h-48 mb-4"></div>
      <div className="bg-gray-300 dark:bg-gray-600 rounded h-4 mb-2"></div>
      <div className="bg-gray-300 dark:bg-gray-600 rounded h-4 w-3/4 mb-2"></div>
      <div className="bg-gray-300 dark:bg-gray-600 rounded h-6 w-1/2 mt-auto"></div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--button)] border-t-transparent"></div>
          <p className="text-[var(--text)]">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--text)] text-lg">Product not found</p>
        </div>
      </div>
    );
  }

  const images = Array.isArray(product.images) ? product.images : [];

  return (
    <>
      {/* Toast Container
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )} */}


    <div className="min-h-screen bg-[var(--bg)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Product Details */}
        <div className="flex flex-col lg:flex-row gap-8 mb-4 p-12">
          {/* Product Images */}
          <div className="w-full lg:w-1/2">
            {images.length > 0 && (
              <>
                <div className="relative rounded-2xl overflow-hidden mb-4 bg-[var(--div)] p-4">
                  <img
                    src={images[currentImage]}
                    alt={product.name}
                    className="w-full h-96 object-contain rounded-2xl cursor-pointer"
                    onClick={() => setIsOpen(true)}
                  />
                </div>

                  {/* Thumbnail Images */}
                  {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {images.map((img, index) => (
                        <div key={index} className="bg-[var(--div)] p-2 rounded-lg">
                          <img
                            src={img}
                            alt={`${product.name} ${index + 1}`}
                            className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 ${
                              currentImage === index 
                                ? 'border-[var(--button)]' 
                                : 'border-transparent'
                            }`}
                            onClick={() => setCurrentImage(index)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
              <Lightbox
                open={isOpen}
                close={() => setIsOpen(false)}
                slides={images.map((img) => ({ src: img }))}
                index={currentImage}
                onIndexChange={setCurrentImage}
              />
            </div>

            {/* Product Info */}
            <div className="w-full lg:w-1/2">
              {/* Vendor Info */}
              {product.vendor_name && (
                <div 
                  onClick={handleVendorClick}
                  className="inline-flex items-center gap-3 mb-4 p-3 rounded-xl bg-gradient-to-r from-[var(--button)]/10 to-[var(--button)]/5 border border-[var(--button)]/20 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg group"
                >
                  <div className="p-2 bg-[var(--button)] rounded-lg">
                    <FaStore className="text-white text-sm" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[var(--light-gray)] mb-1">Sold by</p>
                    <p className="font-semibold text-[var(--text)] group-hover:text-[var(--button)]">
                      {product.vendor_name}
                    </p>
                  </div>
                  <FaArrowRight className="text-[var(--button)] transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              )}

              <h1 className="text-3xl font-bold text-[var(--text)] mb-4">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  {renderStars(averageRating)}
                  <span className="text-[var(--text)] text-sm">
                    ({reviews.length} reviews)
                  </span>
                </div>
              </div>

              <p className="text-[var(--light-gray)] text-lg mb-6 leading-relaxed">
                {product.description}
              </p>

              {/* Category */}
              {product.category_name && (
                <div className="mb-4">
                  <span className="text-sm text-[var(--light-gray)]">Category: </span>
                  <span className="px-2 py-1 bg-[var(--button)]/10 text-[var(--button)] rounded-full text-sm font-medium">
                    {product.category_name}
                  </span>
                </div>
              )}

              {/* Price Section مع Add to Cart على اليمين */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-[var(--text)]">
                    ${product.price}
                  </span>
                  {product.original_price && product.original_price > product.price && (
                    <span className="text-lg text-[var(--light-gray)] line-through">
                      ${product.original_price}
                    </span>
                  )}
                </div>
                
                <button 
                  onClick={handleAddToCartWithAnimation}
                  disabled={isAnimating}
                  className={`flex items-center gap-3 bg-[var(--button)] text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
                    isAnimating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-90'
                  }`}
                >
                  <FaShoppingCart className="text-lg" />
                  {isAnimating ? 'Adding...' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>

              <div className={`rounded-2xl overflow-hidden ${themeMode === "dark" ? "bg-[var(--div)]" : "bg-[var(--textbox)]"} shadow-sm`}>
  <div className="p-6">
    <h2 className="text-xl font-bold text-[var(--text)] mb-4">
      Customer Reviews ({reviewsCount})
    </h2>

    {averageRating && (
      <div className="mb-3">
        <h4 className="font-semibold text-lg">
          ⭐ Average Rating: {averageRating}
        </h4>
      </div>
    )}

    {reviews.length === 0 ? (
      <p className="text-[var(--light-gray)] text-center py-6">
        No reviews yet. Be the first to review this product!
      </p>
    ) : (
      <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="border-b border-[var(--border)] pb-4 last:border-b-0"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-[var(--button)] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {review.user_name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div>
                <span className="font-semibold text-[var(--text)] text-sm block">
                  {review.user_name || "Anonymous"}
                </span>
                <div className="flex items-center gap-2">
                  {renderStars(review.rating)}
                  <span className="text-xs text-[var(--light-gray)]">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-[var(--text)] text-sm leading-relaxed">
              {review.comment}
            </p>
          </div>
        ))}
      </div>
    )}
  </div>
</div>


              {/* Add Review Form */}
              <form onSubmit={handleAddReview} className="mt-6 pt-6 border-t border-[var(--border)]">
                <h3 className="text-lg font-bold text-[var(--text)] mb-3">
                  Add Your Review
                </h3>

                {hasUserReviewed && (
                  <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 rounded-lg">
                    <p className="text-yellow-700 text-sm">
                      You have already reviewed this product
                    </p>
                  </div>
                )}

                {/* Rating */}
                <div className="mb-4">
                  <label className="block text-sm text-[var(--text)] mb-2">Your Rating *</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        className={`text-xl transition-transform duration-200 hover:scale-110 ${
                          rating >= num ? "text-yellow-400" : "text-gray-300"
                        }`}
                        onClick={() => setRating(num)}
                        disabled={hasUserReviewed}
                      >
                        <FaStar />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Textarea */}
                <div className="mb-4">
                  <label className="block text-sm text-[var(--text)] mb-2">Your Review *</label>
                  <textarea
                    placeholder={hasUserReviewed ? 'Already Reviewed' : 'Share your thoughts about this product...'}
                    className={`w-full px-6 py-3 rounded-lg font-semibold transition-all duration-300 text-sm border ${
                      themeMode === "dark"
                        ? "bg-[var(--bg)] border-[var(--border)] text-[var(--light-gray)]"
                        : "bg-white border-gray-300 text-[var(--text)]"
                    } ${hasUserReviewed ? "opacity-50 cursor-not-allowed" : ""}`}
                    rows="3"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    disabled={hasUserReviewed}
                  />
                </div>

                {/* Submit Button */}
                {!hasUserReviewed && (
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-lg bg-[var(--button)] text-white font-semibold hover:bg-opacity-90 transition-all duration-300"
                  >
                    Submit Review
                  </button>
                )}
              </form>


          {/* Recommended Products Section */}
          <section className="max-w-7xl mx-auto px-6 py-20">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-[var(--button)] to-green-500 bg-clip-text text-transparent">
                You may also like
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
              {recommendedProducts.length > 0
                ? recommendedProducts.map((product) => (
                    <div
                      key={product.id || product.product_id}
                      className="product-card-container hover:scale-105 transform transition-all duration-500 cursor-pointer"
                    >
                      <ProductCard
                        product={product}
                        onAddToCart={handleAddToCartForRecommended}
                        isLoggedIn={!!token}
                      />
                    </div>
                  ))
                : Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
            <div className="flex justify-center mt-16">
              <button
                onClick={fetchRecommendations}
                disabled={recLoading}
                className="px-6 py-3 rounded-2xl font-bold text-lg bg-gradient-to-r from-[var(--button)] to-green-600  text-white hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-500 hover:scale-110 flex items-center "
              >
                {recLoading ? "Loading..." : "View More"}
              </button>
            </div>
          </section>

          {/* Empty Div with background color */}
          <div className="h-0 bg-[var(--bg)] w-full"></div>
        </div>

        {/* Custom Scrollbar Styles */}
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: ${themeMode === 'dark' ? 'var(--bg)' : '#f1f1f1'};
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: var(--button);
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #015c40;
          }
        `}</style>
      </div>
    </>
  );
};

export default ProductDetails;