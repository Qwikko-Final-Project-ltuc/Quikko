import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import StoreCard from "../components/StoreCard";
import { fetchStoresWithReviews, setCurrentPage } from "../../review/reviewSlice";

const StoresPage = () => {
  const dispatch = useDispatch();
  const { allStores, loading, error, currentPage, itemsPerPage } = useSelector(state => state.reviews);
  const themeMode = useSelector((state) => state.customerTheme?.mode || 'light');

  useEffect(() => {
    dispatch(fetchStoresWithReviews());
  }, [dispatch]);

  const indexOfLastStore = currentPage * itemsPerPage;
  const indexOfFirstStore = indexOfLastStore - itemsPerPage;
  const currentStores = allStores.slice(indexOfFirstStore, indexOfLastStore);

  const totalPages = Math.ceil(allStores.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    dispatch(setCurrentPage(pageNumber));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading State
  if (loading) return (
    <div className={`min-h-screen ${themeMode === 'dark' ? 'bg-[var(--bg)]' : 'bg-gray-50'} p-6`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className={`h-8 ${themeMode === 'dark' ? 'bg-[var(--div)]' : 'bg-white'} rounded-lg w-64 mx-auto mb-4 animate-pulse`}></div>
          <div className={`h-4 ${themeMode === 'dark' ? 'bg-[var(--div)]' : 'bg-white'} rounded w-48 mx-auto animate-pulse`}></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className={`${themeMode === 'dark' ? 'bg-[var(--div)]' : 'bg-white'} rounded-2xl h-48 mb-4 shadow-lg border ${themeMode === 'dark' ? 'border-[var(--border)]' : 'border-gray-200'}`}></div>
              <div className="space-y-3">
                <div className={`h-4 ${themeMode === 'dark' ? 'bg-[var(--div)]' : 'bg-white'} rounded w-3/4`}></div>
                <div className={`h-3 ${themeMode === 'dark' ? 'bg-[var(--div)]' : 'bg-white'} rounded w-1/2`}></div>
                <div className={`h-10 ${themeMode === 'dark' ? 'bg-[var(--div)]' : 'bg-white'} rounded-lg mt-4 shadow-lg`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Error State
  if (error) return (
    <div className={`min-h-screen ${themeMode === 'dark' ? 'bg-[var(--bg)]' : 'bg-gray-50'} flex items-center justify-center p-6`}>
      <div className="text-center max-w-md">
        <div className={`w-20 h-20 ${themeMode === 'dark' ? 'bg-[var(--error)]/20' : 'bg-red-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <svg className={`w-10 h-10 ${themeMode === 'dark' ? 'text-[var(--error)]' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className={`text-xl font-semibold ${themeMode === 'dark' ? 'text-[var(--text)]' : 'text-gray-800'} mb-2`}>Error Occurred</h3>
        <p className={`${themeMode === 'dark' ? 'text-[var(--light-gray)]' : 'text-gray-600'} mb-6`}>{error}</p>
        <button 
          onClick={() => dispatch(fetchStoresWithReviews())}
          className="bg-[var(--button)] text-white px-6 py-3 rounded-xl hover:bg-[#015c40] transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${themeMode === 'dark' ? 'bg-[var(--bg)]' : 'bg-gray-50'}`}>
      {/* Header Section with Professional Gradient */}
      <div 
        className="pt-8 relative overflow-hidden"
        style={{
          background: themeMode === 'dark' 
          ? `linear-gradient(to bottom, 
              rgba(12, 12, 12, 0.3) 0%, 
              var(--bg) 100%)`
          : `linear-gradient(to bottom, 
              rgba(83, 85, 84, 0.1) 0%, 
              rgba(249, 250, 251, 1) 100%)`
                }}
              >
        {/* Subtle Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23026a4b' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 pt-8">
          <h1 className={`text-4xl font-bold  ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'} tracking-tight`}>
            Discover Stores
          </h1>
          <p className={`text-xl ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto leading-relaxed`}>
            Explore curated stores with exceptional products and customer experiences
          </p>
        </div>
      </div>

      {/* Stores Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {currentStores.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
              {currentStores.map(store => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center space-y-8">
                {/* Page Info */}

                <div className="flex items-center space-x-3">
                  {/* Previous Button */}
                  <button
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                      currentPage === 1 
                        ? `opacity-50 cursor-not-allowed ${themeMode === 'dark' ? 'text-gray-600 border-[var(--border)]' : 'text-gray-400 border-gray-300'}`
                        : `${themeMode === 'dark' ? 'text-white border-[var(--border)] hover:border-[var(--button)] hover:bg-[var(--button)]/10' : 'text-gray-700 border-gray-300 hover:border-[var(--button)] hover:bg-[var(--button)]/5'} hover:scale-105 hover:shadow-lg`
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center space-x-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`min-w-[52px] h-12 rounded-xl font-semibold transition-all duration-300 ${
                          currentPage === page
                            ? 'bg-[var(--button)] text-white shadow-xl scale-105'
                            : `${themeMode === 'dark' ? 'text-white border border-[var(--border)] hover:bg-[var(--hover)]' : 'text-gray-700 border border-gray-300 hover:bg-gray-50'} hover:border-[var(--button)] hover:scale-105`
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
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                      currentPage === totalPages
                        ? `opacity-50 cursor-not-allowed ${themeMode === 'dark' ? 'text-gray-600 border-[var(--border)]' : 'text-gray-400 border-gray-300'}`
                        : `${themeMode === 'dark' ? 'text-white border-[var(--border)] hover:border-[var(--button)] hover:bg-[var(--button)]/10' : 'text-gray-700 border-gray-300 hover:border-[var(--button)] hover:bg-[var(--button)]/5'} hover:scale-105 hover:shadow-lg`
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                </div>
                <div className="text-center">
                  <p className={`text-sm ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'} bg-gradient-to-r ${themeMode === 'dark' ? 'from-[var(--div)] to-[var(--mid-dark)]' : 'from-white to-gray-50'} px-6 py-3 rounded-2xl border ${themeMode === 'dark' ? 'border-[var(--border)]' : 'border-gray-200'} shadow-lg`}>
                    Showing <span className="font-semibold text-[var(--button)]">{indexOfFirstStore + 1}-{Math.min(indexOfLastStore, allStores.length)}</span> of <span className="font-semibold">{allStores.length}</span> stores
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          // Enhanced Empty State
          <div className={`text-center py-20 ${themeMode === 'dark' ? 'bg-gradient-to-br from-[var(--div)] to-[var(--mid-dark)]' : 'bg-white'} rounded-3xl shadow-2xl border-2 ${themeMode === 'dark' ? 'border-[var(--border)]' : 'border-gray-200'}`}>
            <div className="max-w-md mx-auto">
              <div className={`w-32 h-32 mx-auto mb-8 rounded-full ${themeMode === 'dark' ? 'bg-[var(--button)]/10' : 'bg-[var(--button)]/5'} flex items-center justify-center`}>
                <svg className={`w-16 h-16 ${themeMode === 'dark' ? 'text-[var(--button)]' : 'text-[var(--button)]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className={`text-3xl font-bold mb-4 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                No Stores Available
              </h3>
              <p className={`text-lg mb-8 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                We're working on adding new stores to enhance your shopping experience.
              </p>
              <button
                onClick={() => dispatch(fetchStoresWithReviews())}
                className="bg-[var(--button)] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#015c40] transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                Refresh Stores
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoresPage;