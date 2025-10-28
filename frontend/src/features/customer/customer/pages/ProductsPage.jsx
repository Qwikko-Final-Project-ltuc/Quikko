import React, { useEffect,useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProducts,
  // fetchProductsWithSorting,
  setSortBy,
  setCurrentPage,
} from "../productsSlice";
import { fetchCart, setCurrentCart } from "../cartSlice";
import { fetchCategories, toggleCategory } from "../categoriesSlice";
import CategoryList from "../components/CategoryList";
import ProductCard from "../components/ProductCard";
import customerAPI from "../services/customerAPI";
import { useLocation } from "react-router-dom";
import { GetWishlist } from "../../wishlist/wishlistApi";

const ProductsPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const token = localStorage.getItem("token");


  //  Cart data
  const currentCart = useSelector((state) => state.cart.currentCart);
  const tempCartId = useSelector((state) => state.cart.tempCartId);
  const userId = useSelector((state) => state.cart.user?.id);
  const initialCartId = location.state?.cartId;

  //  Products & Categories state
  const {
    items: products = [],
    totalPages = 1,
    status,
    error,
    searchQuery,
    sortBy,
    currentPage,
  } = useSelector((state) => state.products);

  const { items: categories = [], selectedCategories = [] } = useSelector(
    (state) => state.categories
  );

  // Fetch products & categories
  useEffect(() => {
    
    const params = {
      page: currentPage,
      categoryId: selectedCategories.length ? selectedCategories : undefined,
      search: searchQuery || undefined,
    };
    // console.log("Fetching products with params:", params);


    dispatch(fetchProducts(params)); 
    dispatch(fetchCategories());
  }, [dispatch,searchQuery,  currentPage, selectedCategories]);

  // Sorting
  const handleSortChange = (e) => {
    dispatch(setSortBy(e.target.value));
    dispatch(setCurrentPage(1));
  };
  const sortProducts = (products) => {
    if (sortBy === "price_asc") return [...products].sort((a, b) => a.price - b.price);
    if (sortBy === "price_desc") return [...products].sort((a, b) => b.price - a.price);
    if (sortBy === "most_sold") return [...products].sort((a, b) => (b.total_sold || 0) - (a.total_sold || 0));
    return products; // default
  };
  const displayedProducts = sortProducts(products);


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
    if (token) {
      await customerAPI.logInteraction(userId, product.id, "add_to_cart");
    }

    alert("Added to cart!");
      // alert("Added to cart");
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  // Category toggle
  const handleToggleCategory = (category) => {
    dispatch(toggleCategory(category));
    dispatch(setCurrentPage(1));

  };

  //  Pagination
  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page));
  };

  //wishlist
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

  //  Loading & error
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

  //  UI
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

      {/* Products Grid */}
      {displayedProducts.length === 0 ? (
        <p className="text-center text-gray-600 mt-10">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayedProducts.map((product) => {
            const wishlistItem = wishlist.find(
              (w) => w.product_id === product.id);
              return(
                <ProductCard
                key={product.id}
                product={{
                  ...product,
                  isInWishlist: !!wishlistItem,
                  wishlist_id: wishlistItem?.wishlist_id || null,
                }}
                onAddToCart={handleAddToCart}
                onToggleWishlistFromPage={handleToggleWishlist}
                isLoggedIn={!!token}
              />
              );
              })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              className={`px-3 py-1 border rounded transition ${
                currentPage === idx + 1
                  ? "bg-gray-800 text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
              onClick={() => handlePageChange(idx + 1)}
            >
              {idx + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
