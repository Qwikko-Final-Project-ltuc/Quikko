import React from "react";
import { Link } from "react-router-dom";
import ReviewStatic from "../../review/ReviewStatic";

const StoreCard = ({ store }) => {
  const handleImageError = (e) => {
    e.target.style.display = 'none';
  };

  const renderImagePlaceholder = () => {
    return (
      <div className="w-full h-full bg-gradient-to-br from-[var(--button)]/20 to-[var(--border)]/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-2 bg-[var(--button)]/30 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-[var(--button)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Link 
      to={`/customer/stores/${store.id}`} 
      className="group block bg-[var(--bg)] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:transform hover:-translate-y-2"
    >
      {/* Store Image */}
      <div className="relative h-48 overflow-hidden">
        {store.store_logo ? (
          <>
            <img 
              src={store.store_logo} 
              alt={store.store_name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={handleImageError}
            />
            {/* Fallback placeholder that shows if image fails to load */}
            <div className="absolute inset-0 image-fallback hidden">
              {renderImagePlaceholder()}
            </div>
          </>
        ) : (
          // Show placeholder directly if no image URL
          renderImagePlaceholder()
        )}
        
        {/* Overlay Gradient - Only show when there's an actual image */}
        {store.store_logo && (
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        )}
        
        {/* Category Badge */}
        {store.category && (
          <div className="absolute top-3 left-3">
            <span className="bg-[var(--button)] text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
              {store.category}
            </span>
          </div>
        )}
      </div>

      {/* Store Content */}
      <div className="p-5">
        {/* Store Name and Rating */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-[var(--text)] line-clamp-1 flex-1 mr-2">
            {store.store_name}
          </h3>
          {store.average_rating && (
            <div className="flex items-center space-x-1 rtl:space-x-reverse px-2 py-1 rounded-lg min-w-12 text-[var(--text)]">
              <svg className="w-4 h-4 text-[var(--warning)]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <span className="text-sm font-bold">
                {parseFloat(store.average_rating).toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Store Description */}
        <p className="text-[var(--light-gray)] text-sm mb-4 line-clamp-2 leading-relaxed">
          {store.description?.slice(0, 80)}...
        </p>

        {/* Reviews and CTA Section */}
        <div className="flex items-center justify-between">
          {/* Reviews Section */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <ReviewStatic 
              averageRating={store.average_rating} 
              totalReviews={store.total_reviews} 
            />
            
            {/* Status Indicator */}
            {store.is_open !== undefined && (
              <div className={`flex items-center space-x-1 rtl:space-x-reverse ${
                store.is_open ? 'text-[var(--success)]' : 'text-[var(--error)]'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  store.is_open ? 'bg-[var(--success)]' : 'bg-[var(--error)]'
                }`}></div>
                <span className="text-xs font-medium">
                  {store.is_open ? 'مفتوح' : 'مغلق'}
                </span>
              </div>
            )}
          </div>

          {/* CTA Button */}
          <div className="bg-[var(--button)] text-white px-4 py-2 rounded-lg text-sm font-medium group-hover:bg-[var(--button)]/90 transition-colors duration-200 flex items-center space-x-1 rtl:space-x-reverse">
            <span>Visit Store</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
          </div>
        </div>

        {/* Location/Distance */}
        {(store.distance || store.location) && (
          <div className="flex items-center space-x-1 rtl:space-x-reverse text-[var(--light-gray)] mt-3 pt-3 border-t border-[var(--border)]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span className="text-xs">
              {store.distance ? `${store.distance} KM` : store.location}
            </span>
          </div>
        )}
      </div>

      <style jsx>{`
        .image-fallback {
          display: none;
        }
        img:not([src]), img[src=""] {
          display: none;
        }
        img:not([src]) + .image-fallback,
        img[src=""] + .image-fallback {
          display: block;
        }
      `}</style>
    </Link>
  );
};

export default StoreCard;