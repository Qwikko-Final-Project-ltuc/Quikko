import React, { useState } from "react";
import "yet-another-react-lightbox/styles.css";
import Lightbox from "yet-another-react-lightbox";
import { ImHeart } from "react-icons/im";
import { useSelector } from "react-redux";
import { AddWishlist, RemoveWishlist } from "../../wishlist/wishlistApi";
import customerAPI from "../services/customerAPI";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product, onAddToCart, onToggleWishlistFromPage, isLoggedIn }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [wishlist, setWishlist] = useState(product.isInWishlist || false);
  const [wishlistId, setWishlistId] = useState(product.wishlist_id || null);
  const [loading, setLoading] = useState(false);
  const userId = useSelector((state) => state.cart.user?.id);
  const navigate = useNavigate();

  const images = Array.isArray(product.images)
    ? product.images
    : typeof product.images === "string"
    ? JSON.parse(product.images)
    : [];

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length);


  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

  const openLightbox = () => setIsOpen(true);

  const onToggleWishlist = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const productId = product.id || product.product_id;
      if (!productId) throw new Error("Product ID not found");

      if (wishlist) {
        // حذف المنتج من wishlist
        if (!wishlistId) throw new Error("Cannot remove wishlist: wishlistId not found");

        const removed = await RemoveWishlist(wishlistId);
        setWishlist(false);
        setWishlistId(null);
        onToggleWishlistFromPage?.(wishlistId, productId, false);
        if (isLoggedIn && userId) await customerAPI.logInteraction(userId, productId, "unlike");


        onToggleWishlistFromPage && onToggleWishlistFromPage(productId, false, wishlistId);

        if (isLoggedIn && userId) {
          await customerAPI.logInteraction(userId, productId, "unlike");
        }
      } else {
        const added = await AddWishlist(productId);
        setWishlist(true);
        setWishlistId(added.id);
        onToggleWishlistFromPage?.(productId, true, added.id);
        if (isLoggedIn && userId) await customerAPI.logInteraction(userId, productId, "like");

        onToggleWishlistFromPage && onToggleWishlistFromPage(productId, true, added.id);

        if (isLoggedIn && userId) {
          await customerAPI.logInteraction(userId, productId, "like");
        }
      }
    } catch (err) {
      console.error("Wishlist toggle error:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
  className="p-4 border rounded shadow hover:shadow-lg transition flex flex-col justify-between cursor-pointer"
  onClick={(e) => {
    if (!["BUTTON", "svg", "path"].includes(e.target.tagName)) {
      const productId = product.id || product.product_id; // هذا الجديد
      if (productId) {
        navigate(`/customer/product/${productId}`);
      } else {
        console.warn("No valid product ID found for navigation");
      }
    }
  }}
>

    <div className="p-4 border rounded shadow hover:shadow-lg transition flex flex-col justify-between">
      {/* صور المنتج */}
      <div className="h-48 w-full mb-2 overflow-hidden rounded relative cursor-pointer">
        {images.length > 0 ? (
          <>
            <Link to={`/customer/product/${product.id}`}>
              <div className="h-48 w-full mb-2 overflow-hidden rounded relative flex items-center justify-center bg-gray-100">
                <img
                  src={images[currentImage]}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </Link>

      <div className="h-48 w-full mb-2 overflow-hidden rounded relative flex items-center justify-center bg-gray-100">
        {images.length > 0 ? (
          <img
            src={images[currentImage]}
            alt={product.name}
            className="max-h-full max-w-full object-contain"
            onClick={openLightbox}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            No Image
          </div>
        )}

        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-700 text-white px-2 py-1 rounded opacity-50 hover:opacity-100"
            >
              ‹
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-700 text-white px-2 py-1 rounded opacity-50 hover:opacity-100"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* بيانات المنتج */}
      <div>
        <h3 className="text-lg font-bold">{product.name}</h3>
        <p className="text-gray-600">{product.description}</p>
        <p className="text-blue-600 font-semibold">${product.price}</p>
      </div>

      {/* زر wishlist */}
      {isLoggedIn && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist();
          }}
          className="mt-2 text-2xl flex justify-end"
          style={{ color: wishlist ? "red" : "gray" }}
          disabled={loading}
        >
          <ImHeart />
        </button>
      )}

      {/* زر إضافة للسلة */}
      <button
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        onClick={(e) => {
          e.stopPropagation();
          onAddToCart?.(product);
        }}
      >
        Add to Cart
      </button>

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
  );
};

export default ProductCard;
