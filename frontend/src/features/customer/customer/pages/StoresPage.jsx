import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import StoreCard from "../components/StoreCard";
import { fetchStoresWithReviews, setCurrentPage } from "../../review/reviewSlice";
import { Sparkles, Zap, TrendingUp, Search, X } from "lucide-react";

const StoresPage = () => {
  const dispatch = useDispatch();
  const { allStores, loading, error, currentPage, itemsPerPage } = useSelector(state => state.reviews);
  const themeMode = useSelector((state) => state.customerTheme?.mode || 'light');
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStores, setFilteredStores] = useState([]);

  useEffect(() => {
    dispatch(fetchStoresWithReviews());
  }, [dispatch]);

  // Filter stores based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredStores(allStores);
    } else {
      const filtered = allStores.filter(store =>
        store.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStores(filtered);
    }
    // Reset to first page when search changes
    dispatch(setCurrentPage(1));
  }, [searchQuery, allStores, dispatch]);

  const indexOfLastStore = currentPage * itemsPerPage;
  const indexOfFirstStore = indexOfLastStore - itemsPerPage;
  const currentStores = filteredStores.slice(indexOfFirstStore, indexOfLastStore);

  const totalPages = Math.ceil(filteredStores.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    dispatch(setCurrentPage(pageNumber));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  // Pagination logic - show only 5 pages max (same as products page)
  const getVisiblePages = () => {
    const visiblePages = [];
    const totalVisible = 5;
    
    if (totalPages <= totalVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + totalVisible - 1);
    
    if (end - start + 1 < totalVisible) {
      start = Math.max(1, end - totalVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      visiblePages.push(i);
    }
    
    return visiblePages;
  };

  const visiblePages = getVisiblePages();

  // Loading State - Same as products page
  if (loading) {
    return (
      <div className={`min-h-screen ${themeMode === 'dark' ? 'bg-[var(--bg)]' : 'bg-white'} relative overflow-hidden`}>
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--button)]/5 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[var(--primary)]/5 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-[var(--button)] to-[var(--primary)] rounded-2xl flex items-center justify-center mx-auto mb-6 animate-spin">
                <Sparkles className="text-white" size={32} />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--button)] to-[var(--primary)] rounded-2xl blur-lg opacity-50 animate-ping"></div>
            </div>
            <p className="text-[var(--text)] text-xl font-semibold bg-gradient-to-r from-[var(--text)] to-[var(--light-gray)] bg-clip-text text-transparent">
              Loading Amazing Stores...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error State - Same as products page
  if (error) {
    return (
      <div className={`min-h-screen ${themeMode === 'dark' ? 'bg-[var(--bg)]' : 'bg-white'} flex items-center justify-center relative overflow-hidden`}>
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-[var(--error)]/5 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/3 right-1/3 w-56 h-56 bg-[var(--button)]/5 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1.5s'}}></div>
        </div>

        <div className="text-center max-w-md relative z-10">
          <div className="w-28 h-28 bg-[var(--error)]/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform hover:scale-110 transition-all duration-300">
            <Zap className="w-14 h-14 text-[var(--error)]" />
          </div>
          <h3 className="text-3xl font-black mb-4 bg-gradient-to-r from-[var(--error)] to-red-600 bg-clip-text text-transparent">
            Oops! Error Loading
          </h3>
          <p className="text-[var(--text)]/80 text-lg mb-8 leading-relaxed">{error}</p>
          <button 
            onClick={() => dispatch(fetchStoresWithReviews())}
            className="relative bg-gradient-to-r from-[var(--button)] to-[var(--primary)] text-white px-8 py-4 rounded-2xl hover:shadow-2xl transition-all duration-300 font-bold shadow-lg transform hover:scale-105 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <span className="relative z-10 flex items-center gap-3">
              <Sparkles size={20} />
              Try Again
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeMode === 'dark' ? 'bg-[var(--bg)]' : 'bg-white'} transition-all duration-500`}>
      {/* Empty Div for Top Padding */}
      <div className="h-6"></div>

      {/* Animated Background - Same as products page */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--button)]/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[var(--primary)]/5 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[var(--success)]/3 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      {/* Enhanced Header Section - Same as products page */}
      <div className="relative overflow-hidden">
        <div className="pt-16 pb-6 relative">
          {/* Animated Floating Circles */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 left-10 w-6 h-6 bg-[var(--button)]/20 rounded-full animate-float"></div>
            <div className="absolute top-20 right-20 w-4 h-4 bg-[var(--primary)]/20 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-20 left-20 w-5 h-5 bg-[var(--success)]/20 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
            <div className="absolute bottom-10 right-10 w-3 h-3 bg-[var(--warning)]/20 rounded-full animate-float" style={{animationDelay: '1.5s'}}></div>
            <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-[var(--button)]/15 rounded-full animate-float" style={{animationDelay: '0.5s'}}></div>
            <div className="absolute top-1/3 right-1/3 w-5 h-5 bg-[var(--primary)]/15 rounded-full animate-float" style={{animationDelay: '2.5s'}}></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <h3 className="text-4xl sm:text-5xl md:text-5xl font-black mb-2 tracking-tight bg-gradient-to-r from-[var(--text)] via-[var(--button)] to-[var(--primary)] bg-clip-text text-transparent animate-gradient-x-slow">
              {searchQuery ? `"${searchQuery}"` : "Our Stores"}
            </h3>
            <p className={`text-lg sm:text-xl md:text-2xl font-medium mb-8 leading-relaxed max-w-3xl mx-auto ${themeMode === 'dark' ? 'text-[var(--light-gray)]' : 'text-gray-600'}`}>
              {searchQuery 
                ? "Discover amazing results for your search"
                : "Explore our premium collection of curated stores"
              }
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        {/* Enhanced Controls Section - With Search */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
          {/* Search Bar - Same style as products page controls */}
          <div className="w-full lg:w-auto">
            <div className="relative group">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <Search size={20} className="text-[var(--button)]" />
              </div>
              <input
                type="text"
                placeholder="Search stores by name, description, or location..."
                value={searchQuery}
                onChange={handleSearchChange}
                className={`w-full lg:w-80 border-2 border-[var(--border)] text-[var(--text)] rounded-xl pl-12 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--button)]/30 focus:border-[var(--button)] transition-all font-medium shadow-sm hover:shadow-md ${
                  themeMode === 'dark' ? 'bg-[var(--div)]' : 'bg-white'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--light-gray)] hover:text-[var(--text)] transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
            <div className="flex items-center gap-3">
              <div className={`text-sm ${themeMode === 'dark' ? 'text-[var(--light-gray)]' : 'text-gray-600'}`}>
                {filteredStores.length} {filteredStores.length === 1 ? 'store' : 'stores'} found
                {searchQuery && ` for "${searchQuery}"`}
              </div>
            </div>
          </div>
        </div>

        {/* Stores Grid - Same responsive layout as products page */}
        {currentStores.length === 0 ? (
          <div className={`text-center py-24 rounded-3xl border-2 border-[var(--border)] relative overflow-hidden group ${
            themeMode === 'dark' 
              ? 'bg-gradient-to-br from-[var(--div)] to-[var(--mid-dark)] shadow-3xl' 
              : 'bg-gradient-to-br from-gray-50 to-gray-100 shadow-xl'
          }`}>
            {/* Background Animation */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[var(--button)] rounded-full animate-ping"></div>
              <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-[var(--primary)] rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
            </div>

            <div className="max-w-md mx-auto relative z-10">
              <div className="w-40 h-40 mx-auto mb-8 rounded-3xl bg-[var(--button)]/10 flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all duration-500 border-2 border-[var(--button)]/20">
                <Search className="w-20 h-20 text-[var(--button)]" />
              </div>
              <h3 className="text-4xl font-black mb-6 bg-gradient-to-r from-[var(--text)] to-[var(--light-gray)] bg-clip-text text-transparent">
                {searchQuery ? "No Stores Found" : "No Stores Available"}
              </h3>
              <p className={`text-xl mb-10 leading-relaxed ${
                themeMode === 'dark' ? 'text-[var(--light-gray)]' : 'text-gray-600'
              }`}>
                {searchQuery 
                  ? `No results found for "${searchQuery}". Try different keywords.`
                  : "We're curating amazing stores for you. Check back soon!"
                }
              </p>
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="relative bg-gradient-to-r from-[var(--button)] to-[var(--primary)] text-white px-8 py-4 rounded-2xl hover:shadow-2xl transition-all duration-300 font-bold shadow-lg transform hover:scale-105 group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <span className="relative z-10 flex items-center gap-3">
                    <X size={20} />
                    Clear Search
                  </span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Enhanced Stores Grid with same responsive layout as products */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 md:gap-6 lg:gap-7 xl:gap-8 mb-16">
              {currentStores.map((store, index) => (
                <div 
                  key={store.id}
                  className="transform hover:-translate-y-2 transition-all duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <StoreCard store={store} />
                </div>
              ))}
            </div>

            {/* Enhanced Pagination - Show only 5 pages max (same as products page) */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center space-y-8">
                <div className="flex items-center space-x-2 sm:space-x-4">
                  {/* Previous Button */}
                  <button
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 group ${
                      currentPage === 1 
                        ? `opacity-50 cursor-not-allowed ${themeMode === 'dark' ? 'text-gray-600 border-[var(--border)]' : 'text-gray-400 border-gray-300'}`
                        : `${themeMode === 'dark' ? 'text-white border-[var(--border)] hover:border-[var(--button)] hover:bg-[var(--button)]/10' : 'text-gray-700 border-gray-300 hover:border-[var(--button)] hover:bg-[var(--button)]/5'} hover:scale-110 hover:shadow-xl`
                    }`}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Page Numbers - Show only 5 pages max */}
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    {visiblePages.map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`min-w-[32px] sm:min-w-[40px] h-8 sm:h-10 rounded-lg font-bold text-xs sm:text-sm transition-all duration-300 transform hover:scale-110 ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-[var(--button)] to-[var(--primary)] text-white shadow-xl scale-110'
                            : `${themeMode === 'dark' ? 'text-white border border-[var(--border)] hover:border-[var(--button)] hover:bg-[var(--hover)]' : 'text-gray-700 border border-gray-300 hover:border-[var(--button)] hover:bg-gray-50'} hover:shadow-lg`
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 group ${
                      currentPage === totalPages
                        ? `opacity-50 cursor-not-allowed ${themeMode === 'dark' ? 'text-gray-600 border-[var(--border)]' : 'text-gray-400 border-gray-300'}`
                        : `${themeMode === 'dark' ? 'text-white border-[var(--border)] hover:border-[var(--button)] hover:bg-[var(--button)]/10' : 'text-gray-700 border-gray-300 hover:border-[var(--button)] hover:bg-[var(--button)]/5'} hover:scale-110 hover:shadow-xl`
                    }`}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                
                {/* Page Info */}
                <div className={`text-sm ${themeMode === 'dark' ? 'text-[var(--light-gray)]' : 'text-gray-600'}`}>
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) rotate(0deg); 
            opacity: 0.7;
          }
          33% { 
            transform: translateY(-20px) translateX(10px) rotate(120deg); 
            opacity: 1;
          }
          66% { 
            transform: translateY(10px) translateX(-15px) rotate(240deg); 
            opacity: 0.8;
          }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
        @keyframes gradient-x-slow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x-slow { 
          background-size: 200% 200%; 
          animation: gradient-x-slow 8s ease infinite; 
        }
        .animate-gradient-x { 
          background-size: 200% 200%; 
          animation: gradient-x 3s ease infinite; 
        }
        .animate-float { 
          animation: float 8s ease-in-out infinite; 
        }
        .animate-pulse-slow { 
          animation: pulse-slow 4s ease-in-out infinite; 
        }
      `}</style>
    </div>
  );
};

export default StoresPage;