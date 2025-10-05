import { useEffect, useState } from "react";
import { GetWishlist, RemoveWishlist } from "../wishlist/wishlistApi";
import ProductCard from "../customer/components/ProductCard";

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const data = await GetWishlist();
        const wishlistWithFlag = data.map((item) => ({
          ...item,
          isInWishlist: true,
        }));
        setWishlist(wishlistWithFlag);
      } catch (err) {
        console.error(err);
      }
    };
    fetchWishlist();
  }, []);

  const handleToggleWishlist = async (wishlistId, productId, isAdding) => {
    try {
      if (!isAdding) {
        await RemoveWishlist(wishlistId);
        
        setWishlist((prev) => prev.filter((p) => p.wishlist_id !== wishlistId));
      } else {
        setWishlist((prev) => [
          ...prev,
          {
            product_id: productId,
            wishlist_id: wishlistId,
            isInWishlist: true,
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">My Wishlist</h2>

      {wishlist.length === 0 ? (
        <p>No products in wishlist</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {wishlist.map((product) => (
            <ProductCard
              key={product.wishlist_id || product.product_id}
              product={product}
              onAddToCart={() => {}}
              onToggleWishlistFromPage={(wishlistId, productId, isAdding) =>
                handleToggleWishlist(wishlistId, productId, isAdding)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
