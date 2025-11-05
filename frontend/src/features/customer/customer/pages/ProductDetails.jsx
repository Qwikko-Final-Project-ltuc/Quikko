import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { useSelector } from "react-redux";
import customerAPI from "../services/customerAPI";
import { FaStar, FaStarHalfAlt, FaRegStar, FaShoppingCart, FaStore, FaArrowRight } from "react-icons/fa";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);

  const user = useSelector((state) => state.cart.user);
  const themeMode = useSelector((state) => state.customerTheme.mode);

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
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/products/review/${id}`);
        setReviews(res.data);
        
        // Check if current user has already reviewed this product
        if (user?.id) {
          const userReview = res.data.find(review => review.user_id === user.id);
          setHasUserReviewed(!!userReview);
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    };

    fetchProduct();
    fetchReviews();

    return () => {
      hasLoggedView = true;
    };
  }, [id, user?.id]);

  const handleAddReview = async (e) => {
    e.preventDefault();
    
    // Validation
    if (rating === 0) {
      alert("Please select a rating before submitting your review");
      return;
    }
    
    if (!comment.trim()) {
      alert("Please write a comment before submitting your review");
      return;
    }

    if (hasUserReviewed) {
      alert("You have already reviewed this product");
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

      alert("Review added successfully!");
      setRating(0);
      setComment("");
      setHasUserReviewed(true);

      // Refresh reviews
      const res = await axios.get(`http://localhost:3000/api/products/review/${id}`);
      setReviews(res.data);
    } catch (err) {
      console.error("Error adding review:", err);
      if (err.response?.status === 409) {
        alert("You have already reviewed this product");
        setHasUserReviewed(true);
      } else {
        alert(err.response?.data?.message || "Failed to add review");
      }
    }
  };

  // Function to render stars
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
  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length 
    : 0;

  return (
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
              
              <button className="flex items-center gap-3 bg-[var(--button)] text-white px-8 py-4 rounded-xl font-semibold hover:bg-opacity-90 transition-all duration-300 hover:scale-105">
                <FaShoppingCart className="text-lg" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section مع سكرول أقصر */}
        <div className={`rounded-2xl overflow-hidden ${
          themeMode === 'dark' ? 'bg-[var(--div)]' : 'bg-[var(--textbox)]'
        } shadow-sm`}>
          <div className="p-6">
            <h2 className="text-xl font-bold text-[var(--text)] mb-4">
              Customer Reviews ({reviews.length})
            </h2>

            {reviews.length === 0 ? (
              <p className="text-[var(--light-gray)] text-center py-6">
                No reviews yet. Be the first to review this product!
              </p>
            ) : (
              <div className="space-y-4 max-h-34 overflow-y-auto pr-2 custom-scrollbar">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-[var(--border)] pb-4 last:border-b-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-[var(--button)] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {review.user_name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <span className="font-semibold text-[var(--text)] text-sm block">
                          {review.user_name || 'Anonymous'}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {renderStars(review.rating)}
                          </div>
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

              <div className="mb-4">
                <label className="block text-sm text-[var(--text)] mb-2">Your Review *</label>
                <textarea
                  placeholder="Share your thoughts about this product..."
                  className={`w-full rounded-lg p-3 border transition-all duration-200 focus:ring-2 focus:ring-[var(--button)] focus:border-transparent text-[var(--light-gray)] text-sm ${
                    themeMode === 'dark' 
                      ? 'bg-[var(--bg)] border-[var(--border)]' 
                      : 'bg-white border-gray-300'
                  } ${hasUserReviewed ? 'opacity-50 cursor-not-allowed' : ''}`}
                  rows="3"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                  disabled={hasUserReviewed}
                />
              </div>

              <button
                type="submit"
                disabled={hasUserReviewed}
                className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 text-sm ${
                  hasUserReviewed 
                    ? 'bg-gray-400 cursor-not-allowed text-white' 
                    : 'bg-[var(--button)] text-white hover:bg-opacity-90'
                }`}
              >
                {hasUserReviewed ? 'Already Reviewed' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
        <div className="h-20 bg-[var(--bg)]"></div>
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
  );
};

export default ProductDetails;