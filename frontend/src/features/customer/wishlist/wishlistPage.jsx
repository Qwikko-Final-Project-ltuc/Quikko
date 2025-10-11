import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProductCard from "../customer/components/ProductCard";
import { fetchCart, setCurrentCart } from "../customer/cartSlice";
import customerAPI from "../customer/services/customerAPI";
import { GetWishlist, RemoveWishlist } from "../wishlist/wishlistApi";

export default function WishlistPage() {
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");

  const { currentCart, tempCartId } = useSelector((state) => state.cart);
  const [wishlist, setWishlist] = useState([]);

  // Fetch wishlist
  useEffect(() => {
    const fetchWishlistData = async () => {
      try {
        const data = await GetWishlist();
        setWishlist(
          data.map((item) => ({
            ...item,
            isInWishlist: true,
          }))
        );
      } catch (err) {
        console.error(err);
      }
    };
    fetchWishlistData();
  }, []);

  // Add to cart
  const handleAddToCart = async (product, quantity = 1) => {
    try {
      let cart = currentCart;
      const guestToken = tempCartId || localStorage.getItem("guest_token");

      if (!cart?.id) {
        cart = await customerAPI.getOrCreateCart(null, null, guestToken);
        dispatch(setCurrentCart(cart));
      }

      await customerAPI.addItem({
        cartId: cart.id,
        product: { ...product, id: product.product_id }, 
        quantity,
        variant: product.variant || {},
      });

      dispatch(fetchCart(cart.id));
      alert("Product added to cart");
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  // Toggle wishlist
  const handleToggleWishlist = (productId, added, wishlist_id = null) => {
    setWishlist((prev) => {
      if (added) {
        return [...prev, { product_id: productId, wishlist_id, isInWishlist: true }];
      } else {
        return prev.filter((w) => w.product_id !== productId);
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-xl font-bold mb-6 text-center">My Wishlist</h2>

      {wishlist.length === 0 ? (
        <p className="text-center text-gray-600">No products in wishlist</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <ProductCard
              key={product.wishlist_id || product.product_id}
              product={{
                ...product,
                isInWishlist: !!product.isInWishlist,
                wishlist_id: product.wishlist_id || null,
              }}
              onAddToCart={handleAddToCart}
              onToggleWishlistFromPage={handleToggleWishlist}
              isLoggedIn={!!token}
            />
          ))}
        </div>
      )}
    </div>
  );
}
