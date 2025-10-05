import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProducts,
  fetchProductsWithSorting,
  setSortBy,
  setCurrentPage,
} from "../productsSlice";
import { fetchCart, setCurrentCart } from "../cartSlice";
import { fetchCategories, toggleCategory } from "../categoriesSlice";
import CategoryList from "../components/CategoryList";
import ProductCard from "../components/ProductCard";
import customerAPI from "../services/customerAPI";
import { useLocation } from "react-router-dom";

const ProductsPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const currentCart = useSelector((state) => state.cart.currentCart);
  const tempCartId = useSelector((state) => state.cart.tempCartId);
  const userId = useSelector((state) => state.cart.user?.id);

  const initialCartId = location.state?.cartId;

  const {
    items: products = [],
    status,
    error,
    searchQuery,
    sortBy,
    currentPage,
    itemsPerPage,
  } = useSelector((state) => state.products);

  const { items: categories = [], selectedCategories = [] } = useSelector(
    (state) => state.categories
  );

  // Fetch products and categories
  useEffect(() => {
    if (sortBy && sortBy !== "default") {
      dispatch(fetchProductsWithSorting({ sort: sortBy }));
    } else {
      dispatch(fetchProducts());
    }
    dispatch(fetchCategories());
  }, [dispatch, sortBy, searchQuery]);

  const handleSortChange = (e) => {
    const selectedSort = e.target.value;
    dispatch(setSortBy(selectedSort));
    dispatch(fetchProductsWithSorting({ sort: selectedSort }));
  };

  const handleAddToCart = async (product, quantity = 1) => {
    try {
      let cart = currentCart;
      const guestToken = tempCartId || localStorage.getItem("guest_token");

      // جرب cart الحالي
      if (!cart) {
        cart = await customerAPI.getOrCreateCart(initialCartId, userId, guestToken);
        dispatch(setCurrentCart(cart));
      }

      // إذا ما في cart، أنشئ جديد
      if (!cart?.id) {
        cart = await customerAPI.getOrCreateCart(null, userId, guestToken);
        dispatch(setCurrentCart(cart));
      }

      // أضف المنتج
      await customerAPI.addItem({
        cartId: cart.id,
        product,
        quantity,
        variant: product.variant || {},
      });

      dispatch(fetchCart(cart.id));
      alert("✅ Added to cart");
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      alert(msg);
    }
  };

  const handleToggleCategory = (category) => {
    dispatch(toggleCategory(category));
    dispatch(setCurrentPage(1));
  };

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

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

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

      {/* Sorting */}
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

      {/* Categories */}
      <CategoryList
        categories={categories}
        selectedCategories={selectedCategories}
        onToggle={handleToggleCategory}
      />

      {/* Products grid */}
      {paginatedProducts.length === 0 ? (
        <p className="text-center text-gray-600 mt-10">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {paginatedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              className={`px-3 py-1 border rounded ${
                currentPage === idx + 1 ? "bg-gray-300" : ""
              }`}
              onClick={() => dispatch(setCurrentPage(idx + 1))}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
