import React, { useState, useEffect } from "react";
import "yet-another-react-lightbox/styles.css";
import Lightbox from "yet-another-react-lightbox";
import { ImHeart } from "react-icons/im";
import { FaShoppingCart } from "react-icons/fa";
import { FaStar } from "react-icons/fa";
import { useSelector } from "react-redux";
import { AddWishlist, RemoveWishlist } from "../../wishlist/wishlistApi";
import customerAPI from "../services/customerAPI";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";

const ProductCard = ({ product, onAddToCart, onToggleWishlistFromPage, isLoggedIn }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [wishlist, setWishlist] = useState(product.isInWishlist || false);
  const [wishlistId, setWishlistId] = useState(product.wishlist_id || null);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [heartAnimation, setHeartAnimation] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [toast, setToast] = useState(null);
  const userId = useSelector((state) => state.cart.user?.id);
  const navigate = useNavigate();
  const themeMode = useSelector((state) => state.customerTheme.mode); 
  const [averageRating, setAverageRating] = useState(null);
const [reviewsCount, setReviewsCount] = useState(0);

useEffect(() => {
  const fetchAverageRating = async () => {
    try {
      const productId = product.id || product.product_id;
      if (!productId) return;

      const response = await fetch(`http://localhost:3000/api/products/review/average/${productId}`);
      if (!response.ok) throw new Error("Failed to fetch average rating");

      const data = await response.json();
      setAverageRating(parseFloat(data.average_rating));
      setReviewsCount(data.reviews_count);
    } catch (error) {
      console.error("Error fetching average rating:", error);
    }
  };

  fetchAverageRating();
}, [product.id]);


  const images = Array.isArray(product.images)
    ? product.images
    : typeof product.images === "string"
    ? JSON.parse(product.images)
    : [];

  const MAX_DOTS = 5;
  const totalImages = images.length;
  
  const getVisibleDots = () => {
    if (totalImages <= MAX_DOTS) {
      return Array.from({ length: totalImages }, (_, i) => i);
    }
    
    const dots = [];
    const halfMax = Math.floor(MAX_DOTS / 2);
    
    if (currentImage <= halfMax) {
      for (let i = 0; i < MAX_DOTS - 1; i++) {
        dots.push(i);
      }
      dots.push(totalImages - 1); // النقطة الأخيرة
    } else if (currentImage >= totalImages - 1 - halfMax) {
      dots.push(0); // النقطة الأولى
      for (let i = totalImages - MAX_DOTS + 1; i < totalImages; i++) {
        dots.push(i);
      }
    } else {
      dots.push(0); // النقطة الأولى
      for (let i = currentImage - 1; i <= currentImage + 1; i++) {
        if (i > 0 && i < totalImages - 1) {
          dots.push(i);
        }
      }
      dots.push(totalImages - 1); // النقطة الأخيرة
    }
    
    return dots;
  };

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % totalImages);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + totalImages) % totalImages);
  const openLightbox = () => setIsOpen(true);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleAddToCart = (e) => {
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
      finalLeft = `${cartRect.left + cartRect.width / 2- 20}px`;
      finalTop = `${cartRect.top + cartRect.height / 2}px`;
    }
    
    animationElement.style.position = 'fixed';
    animationElement.style.left = `${buttonRect.left + buttonRect.width / 2}px`;
    animationElement.style.top = `${buttonRect.top + buttonRect.height / 2}px`;
    animationElement.style.width = '50px';
    animationElement.style.height = '50px';
    animationElement.style.backgroundImage = `url(${images[0] || ''})`;
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
      onAddToCart?.(product);
      showToast(`${product.name} added to cart!`, 'success');
    }, 720);
  };

  // Toggle wishlist
  const onToggleWishlist = async () => {
    if (loading) return;
    setLoading(true);
    setHeartAnimation(true);

    try {
      const productId = product.id || product.product_id;
      if (!productId) throw new Error("Product ID not found");

      if (wishlist) {
        if (!wishlistId) throw new Error("Cannot remove wishlist: wishlistId not found");
        await RemoveWishlist(wishlistId);
        setWishlist(false);
        setWishlistId(null);
        onToggleWishlistFromPage?.(productId, false, wishlistId);
        if (isLoggedIn && userId) await customerAPI.logInteraction(userId, productId, "unlike");
        showToast('Removed from wishlist', 'info');
      } else {
        const added = await AddWishlist(productId);
        setWishlist(true);
        setWishlistId(added.id);
        onToggleWishlistFromPage?.(productId, true, added.id);
        if (isLoggedIn && userId) await customerAPI.logInteraction(userId, productId, "like");
        showToast('Added to wishlist!', 'success');
      }
    } catch (err) {
      console.error("Wishlist toggle error:", err);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
      setTimeout(() => setHeartAnimation(false), 600);
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // تحديد إذا كانت النقطة تمثل مجموعة
  const isDotGroup = (dotIndex) => {
    return totalImages > MAX_DOTS && 
           dotIndex === MAX_DOTS - 1 && 
           currentImage < totalImages - 2;
  };

  return (
    <>
      <div
        className="group bg-transparent flex flex-col justify-between cursor-pointer overflow-hidden"
        onClick={(e) => {
          if (!["BUTTON", "svg", "path"].includes(e.target.tagName)) {
            const productId = product.id || product.product_id;
            if (productId) navigate(`/customer/product/${productId}`);
          }
        }}
      >
        {/* صور المنتج */}
        <div className="h-48 w-full overflow-hidden relative flex items-center justify-center bg-gradient-to-br from-[var(--div)] to-[var(--bg)] rounded-xl">
          {images.length > 0 ? (
            <>
              {imageLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-xl flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-[var(--button)] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <img
                src={images[currentImage]}
                alt={product.name}
                loading="lazy"
                className={`max-h-full max-w-full object-contain transition-opacity duration-300 ${
                  imageLoading ? "opacity-0" : "opacity-100"
                }`}
                onClick={openLightbox}
                onLoad={handleImageLoad}
              />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[var(--div)] to-[var(--bg)] flex items-center justify-center text-[var(--light-gray)] rounded-xl">
              No Image
            </div>
          )}

          {/* أزرار التنقل بين الصور - دائماً ظاهرة عندما يوجد أكثر من صورة */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white w-8 h-8 rounded-full opacity-80 hover:opacity-100 transition-all duration-300 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 shadow-lg"
              >
                ‹
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white w-8 h-8 rounded-full opacity-80 hover:opacity-100 transition-all duration-300 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 shadow-lg"
              >
                ›
              </button>
            </>
          )}

          {/* مؤشر الصور الذكي */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
              {getVisibleDots().map((dotIndex) => (
                <button
                  key={dotIndex}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImage(dotIndex);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    dotIndex === currentImage 
                      ? "bg-[var(--button)] scale-125" 
                      : "bg-white/60 hover:bg-white/80"
                  } ${
                    isDotGroup(dotIndex) ? "w-3 rounded-sm" : ""
                  }`}
                  title={isDotGroup(dotIndex) ? `More images...` : `Image ${dotIndex + 1}`}
                />
              ))}
              
              {/* عرض العدد الإجمالي إذا كان هناك أكثر من 5 صور */}
              {totalImages > MAX_DOTS && (
                <span className="text-white text-xs ml-1 px-1 bg-black/40 rounded">
                  {currentImage + 1}/{totalImages}
                </span>
              )}
            </div>
          )}
        </div>

        {/* بيانات المنتج */}
        <div className="p-4 flex-1 flex flex-col bg-transparent">
          <div className="flex items-start justify-between mb-2">
            <h3 
              className="text-lg font-bold line-clamp-2 flex-1"
              style={{
                color: themeMode === 'dark' ? 'var(--textbox)' : 'var(--button)'
              }}
            >
              {product.name}
            </h3>
            {/* زر اللايك بجانب الاسم */}
            {isLoggedIn && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWishlist();
                }}
                className={`ml-2 p-2 transition-all duration-300 ${
                  wishlist 
                    ? "text-red-500" 
                    : "text-[var(--light-gray)] hover:text-red-500"
                } ${loading ? "opacity-50" : ""} ${
                  heartAnimation ? "scale-125" : "scale-100"
                }`}
                disabled={loading}
              >
                <ImHeart 
                  className={`text-lg transition-all duration-300 ${
                    wishlist ? "fill-current" : ""
                  } ${
                    heartAnimation ? "scale-110" : "scale-100"
                  }`} 
                />
              </button>
            )}
          </div>
          
          {product.description && (
            <p className="text-[var(--light-gray)] text-sm mb-3 line-clamp-2 flex-1">
              {product.description}
            </p>
          )}
          {/* عرض التقييم بالنجوم */}
          {averageRating !== null && (
            <div className="flex items-center space-x-1 mb-3">
              <FaStar className="text-yellow-500" />
              <span className="text-sm text-[var(--light-gray)]">
                {averageRating.toFixed(1)} ({reviewsCount})
              </span>
            </div>
          )}

          <div className="flex items-center justify-between mt-auto">
            <p 
              className="font-bold text-lg"
              style={{
                color: themeMode === 'dark' ? 'var(--textbox)' : 'var(--button)'
              }}
            >
              ${product.price}
            </p>
            
            {/* زر إضافة للسلة كأيقونة */}
            <div className="relative">
              <button
                className={`text-[var(--button)] hover:text-[var(--button)]/80 transition-all duration-300 flex items-center justify-center group/cart ${
                  isAnimating ? 'opacity-50 pointer-events-none' : ''
                }`}
                onClick={handleAddToCart}
                disabled={isAnimating}
              >
                <FaShoppingCart className={`text-xl  ${themeMode === 'dark' ? 'text-[var(--text)]' : 'text-[var(--button)]'}  `}/>
              </button>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover/cart:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
                Add to Cart
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Lightbox */}
        {isOpen && (
          <Lightbox
            open={isOpen}
            close={() => setIsOpen(false)}
            slides={images.map((img) => ({ src: img }))}
            index={currentImage}
            onIndexChange={setCurrentImage}
          />
        )}
      </div>
      {/* {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )} */}
    </>
  );
};

export default ProductCard;