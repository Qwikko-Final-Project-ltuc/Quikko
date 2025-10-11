import React, { useState } from "react";
import "yet-another-react-lightbox/styles.css";
import Lightbox from "yet-another-react-lightbox";
import { ImHeart } from "react-icons/im";
import { AddWishlist, RemoveWishlist } from "../../wishlist/wishlistApi";

const ProductCard = ({ product, onAddToCart, onToggleWishlistFromPage, isLoggedIn }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isOpen, setIsOpen] = useState(false); 
  const images = Array.isArray(product.images) ? product.images : [];
  const [wishlist, setWishlist] = useState(product.isInWishlist || false);
  const [wishlistId, setWishlistId] = useState(product.wishlist_id || null);
  const [loading, setLoading] = useState(false);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const openLightbox = () => {
    setIsOpen(true);
  };

  const onToggleWishlist = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (wishlist) {
        await RemoveWishlist(wishlistId);
        setWishlist(false);
        setWishlistId(null);
        onToggleWishlistFromPage &&
          onToggleWishlistFromPage(wishlistId, product.product_id, false);
        window.location.reload();

      } else {
        const added = await AddWishlist(product.id);
        setWishlist(true);
        setWishlistId(added.id);
        onToggleWishlistFromPage &&
          onToggleWishlistFromPage(added.id, product.id, true);
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded shadow hover:shadow-lg transition flex flex-col justify-between">
      <div className="h-48 w-full mb-2 overflow-hidden rounded relative cursor-pointer">
        {images.length > 0 ? (
          <>
            <div className="h-48 w-full mb-2 overflow-hidden rounded relative flex items-center justify-center bg-gray-100">
              <img
                src={images[currentImage]}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
                onClick={openLightbox}
              />
            </div>

            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-700 text-white px-2 py-1 rounded opacity-50 hover:opacity-100"
                >
                  ‹
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-700 text-white px-2 py-1 rounded opacity-50 hover:opacity-100"
                >
                  ›
                </button>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            No Image
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-bold">{product.name}</h3>
        <p className="text-gray-600">{product.description}</p>
        <p className="text-blue-600 font-semibold">${product.price}</p>
      </div>

      {isLoggedIn && (
        <button
          onClick={onToggleWishlist}
          className="mt-2 text-2xl flex justify-end"
          style={{ color: wishlist ? "red" : "gray" }}
        >
          <ImHeart />
        </button>
      )}


      <button
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        onClick={() => onAddToCart && onAddToCart(product)}
      >
        Add to Cart
      </button>

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
  );
};

export default ProductCard;
