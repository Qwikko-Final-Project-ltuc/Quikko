import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { useSelector } from "react-redux";
import customerAPI from "../services/customerAPI";
import { FaStar, FaStarHalfAlt, FaRegStar, FaShoppingCart } from "react-icons/fa";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [loading, setLoading] = useState(true);

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

      const res = await axios.get(`http://localhost:3000/api/products/review/${id}`);
      setReviews(res.data);
    } catch (err) {
      console.error("Error adding review:", err);
      alert(err.response?.data?.message || "Failed to add review");
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
      <div className="w-full px-4">
        {/* Product Details Section */}
        <div className={`rounded-2xl overflow-hidden mb-8 ${
          themeMode === 'dark' ? 'bg-[var(--div)]' : 'bg-[var(--textbox)]'
        } shadow-sm`}>
          <div className="flex flex-col lg:flex-row gap-8 p-6">
            {/* Product Images */}
            <div className="w-full lg:w-1/2">
              {images.length > 0 && (
                <>
                  <div className="relative rounded-lg overflow-hidden mb-4">
                    <img
                      src={images[currentImage]}
                      alt={product.name}
                      className="w-full h-96 object-contain rounded-lg cursor-pointer bg-white"
                      onClick={() => setIsOpen(true)}
                    />
                  </div>
                  
                  {/* Thumbnail Images */}
                  {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {images.map((img, index) => (
                        <img
                          key={index}
                          src={img}
                          alt={`${product.name} ${index + 1}`}
                          className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 ${
                            currentImage === index 
                              ? 'border-[var(--button)]' 
                              : 'border-transparent'
                          }`}
                          onClick={() => setCurrentImage(index)}
                        />
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

              <div className="flex items-center gap-4 mb-6">
                <span className="text-2xl font-bold text-[var(--button)]">
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

        {/* Reviews Section */}
        <div className={`rounded-2xl overflow-hidden ${
          themeMode === 'dark' ? 'bg-[var(--div)]' : 'bg-[var(--textbox)]'
        } shadow-sm`}>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-6">
              Customer Reviews ({reviews.length})
            </h2>

            {reviews.length === 0 ? (
              <p className="text-[var(--light-gray)] text-center py-8">
                No reviews yet. Be the first to review this product!
              </p>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-[var(--border)] pb-6 last:border-b-0">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-10 h-10 bg-[var(--button)] rounded-full flex items-center justify-center text-white font-semibold">
                        {review.user_name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <span className="font-semibold text-[var(--text)] block">
                          {review.user_name || 'Anonymous'}
                        </span>
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          <span className="text-sm text-[var(--light-gray)]">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-[var(--text)] leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Add Review Form */}
            <form onSubmit={handleAddReview} className="mt-8 pt-8 border-t border-[var(--border)]">
              <h3 className="text-xl font-bold text-[var(--text)] mb-4">
                Add Your Review
              </h3>

              <div className="mb-6">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      className={`text-2xl transition-transform duration-200 hover:scale-110 ${
                        rating >= num ? "text-yellow-400" : "text-gray-300"
                      }`}
                      onClick={() => setRating(num)}
                    >
                      <FaStar />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <textarea
                  placeholder="Share your thoughts about this product..."
                  className={`w-full rounded-xl p-4 border transition-all duration-200 focus:ring-2 focus:ring-[var(--button)] focus:border-transparent text-[var(--light-gray)] ${
                    themeMode === 'dark' 
                      ? 'bg-[var(--bg)] border-[var(--border)]' 
                      : 'bg-white border-gray-300'
                  }`}
                  rows="4"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="bg-[var(--button)] text-white px-8 py-3 rounded-xl font-semibold hover:bg-opacity-90 transition-all duration-300 hover:scale-105"
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;