import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import StoreCard from "../components/StoreCard";
import { fetchStoresWithReviews, setCurrentPage } from "../../review/reviewSlice";

const StoresPage = () => {
  const dispatch = useDispatch();
  const { allStores, loading, error, currentPage, itemsPerPage } = useSelector(state => state.reviews);

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
    <div className="min-h-screen bg-[var(--bg)] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="h-8 bg-[var(--div)] rounded-lg w-64 mx-auto mb-4 animate-pulse"></div>
          <div className="h-4 bg-[var(--div)] rounded w-48 mx-auto animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-[var(--div)] rounded-2xl h-48 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-[var(--div)] rounded w-3/4"></div>
                <div className="h-3 bg-[var(--div)] rounded w-1/2"></div>
                <div className="h-10 bg-[var(--div)] rounded-lg mt-4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Error State
  if (error) return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-[var(--error)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-[var(--error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-[var(--text)] mb-2">Error Occurred</h3>
        <p className="text-[var(--light-gray)] mb-6">{error}</p>
        <button 
          onClick={() => dispatch(fetchStoresWithReviews())}
          className="bg-[var(--button)] text-white px-6 py-3 rounded-lg hover:opacity-90 transition-all duration-200 font-medium"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Header Section with Vertical Gradient */}
      <div 
        className="py-16 relative overflow-hidden text-[var(--text)]"
        style={{
          background: `linear-gradient(to bottom, 
            rgba(2, 106, 75, 0.1) 0%, 
            var(--bg) 100%)`
        }}
      >
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10 text-[var(--text)] ">
          <h1 className="text-4xl font-bold  mb-4  text-[var(--text)] pt-6">
            Available Stores
          </h1>
          <p className="text-lg  max-w-2xl mx-auto">
            Discover the best stores in your area and enjoy a unique shopping experience
          </p>
        </div>
      </div>

      {/* Stores Grid */}
      <div className="max-w-7xl mx-auto p-6">
        {currentStores.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {currentStores.map(store => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center space-y-6">
                <div className="flex items-center space-x-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-3 rounded-xl border border-[var(--border)] transition-all duration-200 ${
                      currentPage === 1 
                        ? 'opacity-50 cursor-not-allowed text-[var(--light-gray)]' 
                        : 'text-[var(--text)] hover:bg-[var(--hover)] hover:border-[var(--button)] hover:shadow-md'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`min-w-[48px] h-12 rounded-xl font-medium transition-all duration-200 ${
                        currentPage === page
                          ? 'bg-[var(--button)] text-white shadow-lg scale-105'
                          : 'text-[var(--text)] border border-[var(--border)] hover:bg-[var(--hover)] hover:border-[var(--button)]'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  {/* Next Button */}
                  <button
                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-3 rounded-xl border border-[var(--border)] transition-all duration-200 ${
                      currentPage === totalPages
                        ? 'opacity-50 cursor-not-allowed text-[var(--light-gray)]'
                        : 'text-[var(--text)] hover:bg-[var(--hover)] hover:border-[var(--button)] hover:shadow-md'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Page Info */}
                <div className="text-center">
                  <p className="text-sm text-[var(--text)] bg-[var(--div)] px-4 py-2 rounded-lg">
                    Showing {indexOfFirstStore + 1}-{Math.min(indexOfLastStore, allStores.length)} of {allStores.length} stores
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          // Empty State
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-[var(--div)] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-[var(--light-gray)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-[var(--text)] mb-2">
              No Stores Available
            </h3>
            <p className="text-[var(--light-gray)]">
              No stores were found at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoresPage;