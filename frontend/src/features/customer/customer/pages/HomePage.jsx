import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProductCard from "../components/ProductCard"; 
import customerAPI from "../services/customerAPI";
import LandingPage from "./LandingPage"; 
import { fetchCart, setCurrentCart } from "../cartSlice";

const HomePage = () => {
  const [popularProducts, setPopularProducts] = useState([]);
  const [newestProducts, setNewestProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.cart.user?.id);
    const initialCartId = location.state?.cartId;
  // Cart info
  const currentCart = useSelector((state) => state.cart.currentCart);
  const tempCartId = useSelector((state) => state.cart.tempCartId);
  // const cartIdToUse = tempCartId || currentCart?.id;

  //Fetch Products 
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Most Popular
        const resPopular = await fetch(
          "http://localhost:3000/api/customers/products?sort=popular"
        );
        const dataPopular = await resPopular.json();
        setPopularProducts(dataPopular.items.slice(0, 4));

        // Newest Products
        const resNewest = await fetch(
          "http://localhost:3000/api/customers/products?sort=newest"
        );
        const dataNewest = await resNewest.json();
        setNewestProducts(dataNewest.items.slice(0, 4));
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
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
        // alert("Added to cart");
      } catch (err) {
        alert(err.response?.data?.message || err.message);
      }
    };

  if (loading)
    return <p className="text-center mt-20 text-gray-500">Loading...</p>;

  if (error)
    return <p className="text-center mt-20 text-red-500">Error: {error}</p>;

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      
      {/* Landing Section as component */}
      <LandingPage />

      {/* Most Popular Products */}
      <div className="max-w-6xl mx-auto my-12">
        <h2 className="text-2xl font-bold mb-6">Most Popular</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {popularProducts.map((p) => {
            const productWithImages = {
              ...p,
              images: Array.isArray(p.images) && p.images.length > 0
                ? p.images
                : p.image_url
                  ? [p.image_url]
                  : [],
            };
            return (
              <ProductCard
                key={p.id}
                product={productWithImages}
                onAddToCart={handleAddToCart}
              />
            );
          })}
        </div>
      </div>

      {/* Newest Products */}
      <div className="max-w-6xl mx-auto my-12">
        <h2 className="text-2xl font-bold mb-6">Newest Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {newestProducts.map((p) => {
            const productWithImages = {
              ...p,
              images: Array.isArray(p.images) && p.images.length > 0
                ? p.images
                : p.image_url
                  ? [p.image_url]
                  : [],
            };
            return (
              <ProductCard
                key={p.id}
                product={productWithImages}
                onAddToCart={handleAddToCart}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
