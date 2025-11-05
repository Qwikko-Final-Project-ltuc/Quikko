import React, { useEffect,useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProducts,
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
  const themeMode = useSelector((state) => state.customerTheme.mode);

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

  // Fetch products & categories - الرجوع للكود القديم
  useEffect(() => {
    const params = {
      page: currentPage,
      categoryId: selectedCategories.length ? selectedCategories : undefined,
      search: searchQuery || undefined,
    };

    dispatch(fetchProducts(params)); 
    dispatch(fetchCategories());
  }, [dispatch, searchQuery, currentPage, selectedCategories]);

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
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  // Category toggle - الرجوع للكود القديم
  const handleToggleCategory = (category) => {
    dispatch(toggleCategory(category));
    dispatch(setCurrentPage(1));
  };

  //  Pagination
  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page));
  };

  // wishlist
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
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--button)] mx-auto mb-4"></div>
          <p className="text-[var(--text)] text-lg">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <div className="w-16 h-16 bg-[var(--error)] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">!</span>
          </div>
          <p className="text-[var(--error)] text-lg mb-4">Error loading products: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-[var(--button)] text-white rounded-lg hover:bg-opacity-90 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  //  UI
  return (
    <div className="min-h-screen pt-0 bg-[light:var(--textbox)] dark:bg-[var(--bg)]">
      {/* Header Section - Full Width */}
      <div 
        className="w-full text-center mb-8 pt-4" 
        style={{ 
          color: themeMode === 'dark' ? 'var(--text)' : 'var(--text)',
          background:themeMode === 'dark' ? `linear-gradient(to bottom, 
            rgba(0, 0, 0, 0.21) 0%, 
            var(--bg) 100%)`:`linear-gradient(to bottom, 
            rgba(113, 117, 116, 0.12) 0%, 
            var(--bg) 100%)`
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-3 pt-8">
            Our Products {searchQuery && <span>(Results for "{searchQuery}")</span>}
          </h1>
          <p className="text-[var(--light-gray)] max-w-2xl mx-auto">
            Discover our amazing collection of products tailored just for you
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Compact Controls Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          {/* Categories - Left Side */}
          <div className="w-full lg:w-auto">
            <CategoryList
              categories={categories}
              selectedCategories={selectedCategories}
              onToggle={handleToggleCategory}
            />
          </div>

          {/* Sorting and Results - Right Side */}
          <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  className=" border border-[var(--border)] text-[var(--text)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--button)] focus:border-transparent transition-all cursor-pointer w-48"
                  value={sortBy}
                  onChange={handleSortChange}
                >
                  <option value="default">Recommended</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="most_sold">Most Popular</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {displayedProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[var(--div)] rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🔍</span>
            </div>
            <p className="text-[var(--light-gray)] mb-2">No products found</p>
            <p className="text-[var(--light-gray)] text-sm">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <>
            {/* Products Grid with increased spacing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8 mb-8">             
              {displayedProducts.map((product) => {
                const wishlistItem = wishlist.find((w) => w.product_id === product.id);
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
                    isLoggedIn={!!token}
                  />
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pb-8">
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="flex items-center gap-1 px-4 py-2 bg-[var(--div)] text-[var(--text)] rounded-lg border border-[var(--border)] hover:bg-[var(--hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium min-w-[80px] justify-center"
                >
                  <span>←</span>
                  Prev
                </button>

                <div className="flex gap-1 mx-2">
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      className={`min-w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                        currentPage === idx + 1
                          ? "bg-[var(--button)] text-white shadow-md"
                          : "bg-[var(--div)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--hover)]"
                      }`}
                      onClick={() => handlePageChange(idx + 1)}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="flex items-center gap-1 px-4 py-2 bg-[var(--div)] text-[var(--text)] rounded-lg border border-[var(--border)] hover:bg-[var(--hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium min-w-[80px] justify-center"
                >
                  Next
                  <span>→</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;