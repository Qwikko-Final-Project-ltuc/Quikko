import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProducts,
  fetchProductsWithSorting,
  setSortBy,
} from "../productsSlice";
import { fetchCart } from "../cartSlice";
import { fetchCategories, toggleCategory } from "../categoriesSlice";
import CategoryList from "../components/CategoryList";
import ProductCard from "../components/ProductCard";
import customerAPI from "../services/customerAPI";
import { GetWishlist } from "../../wishlist/wishlistApi";

const ProductsPage = () => {
  const dispatch = useDispatch();
  const currentCart = useSelector((state) => state.cart.currentCart);
  const tempCartId = useSelector((state) => state.cart.tempCartId);
  const cartIdToUse = tempCartId || currentCart?.id;

  const {
    items: products = [],
    status,
    error,
    searchQuery,
    sortBy,
  } = useSelector((state) => state.products);
  const { items: categories = [], selectedCategories = [] } = useSelector(
    (state) => state.categories
  );

  const [wishlist, setWishlist] = useState([]);

  const handleToggleWishlist = (productId, added, wishlist_id = null) => {
    setWishlist((prev) => {
      if (added) {
        return [...prev, { product_id: productId, wishlist_id }];
      } else {
        return prev.filter((w) => w.product_id !== productId);
      }
    });
  };

  useEffect(() => {
    const fetchWishlistData = async () => {
      try {
        const data = await GetWishlist();
        setWishlist(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchWishlistData();
  }, []);

  useEffect(() => {
    if (sortBy && sortBy !== "default") {
      dispatch(fetchProductsWithSorting({ sort: sortBy }));
    } else {
      dispatch(fetchProducts());
    }
    // dispatch(fetchCart());
    dispatch(fetchCategories());
  }, [dispatch, sortBy]);

  const handleSortChange = (e) => {
    const selectedSort = e.target.value;
    dispatch(setSortBy(selectedSort));
    dispatch(fetchProductsWithSorting({ sort: selectedSort }));
  };

  const handleAddToCart = async (product, quantity = 1) => {
    try {
      const cart = await customerAPI.getOrCreateCart(cartIdToUse);
      const cartId = cart?.id || cart?.data?.id;
      if (!cartId) {
        console.error("No cart ID found or created!");
        return;
      }

      // ✅ Add item always, backend يتأكد إذا كان موجود أو لا
      await customerAPI.addItem({
        cartId,
        product,
        quantity,
        variant: product.variant || {},
      });

      dispatch(fetchCart(cartId));
      alert("added to cart");
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      alert(msg);
    }
  };

  const handleToggleCategory = (category) => {
    dispatch(toggleCategory(category));
  };

  // فلترة المنتجات حسب الكاتيجوريز و search query
  const filteredProducts = products
    .filter((p) => p.quantity > 0)
    .filter((p) =>
      selectedCategories.length === 0
        ? true
        : selectedCategories.some((c) => c.id === p.category_id)
    )
    .filter((p) =>
      searchQuery ? p.name.toLowerCase().includes(searchQuery) : true
    );

  if (status === "loading") {
    return (
      <p className="text-center mt-10 text-gray-500 animate-pulse">
        Loading products...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-center mt-10 text-red-500">
        Error loading products: {error}
      </p>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
        Our Products {searchQuery && `(Results for "${searchQuery}")`}
      </h1>

      {/* Sorting dropdown */}
      <div className="flex justify-end mb-4">
        <select
          className="border p-2 rounded"
          value={sortBy}
          onChange={handleSortChange}
        >
          <option value="default">Default</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="most_sold">Most Ordered</option>
        </select>
      </div>

      <CategoryList
        categories={categories}
        selectedCategories={selectedCategories}
        onToggle={handleToggleCategory}
      />

      {filteredProducts.length === 0 ? (
        <p className="text-center text-gray-600 mt-10">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const wishlistItem = wishlist.find(
              (w) => w.product_id === product.id
            );
            return (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  isInWishlist: !!wishlistItem,
                  wishlist_id: wishlistItem?.wishlist_id || null,
                }}
                onAddToCart={handleAddToCart}
                onToggleWishlistFromPage={handleToggleWishlist}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
export default ProductsPage;
