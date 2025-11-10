// StoreDetails.jsx
import React from "react";
import { useSelector } from "react-redux";

const StoreDetails = ({ store }) => {
  const themeMode = useSelector((state) => state.customerTheme.mode);

  return (
    <div className="space-y-6">
      {/* Store Description */}
      <div className="relative group">
        <div className="absolute -inset-3 bg-gradient-to-r from-[var(--button)]/5 to-[var(--primary)]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm"></div>
        <p className="relative text-[var(--text)]/80 leading-relaxed text-lg bg-[var(--bg)]/50 backdrop-blur-sm p-6 rounded-xl border border-[var(--border)]/50 group-hover:border-[var(--button)]/30 transition-all duration-300">
          {store.description}
        </p>
      </div>
      
      {/* Store Information Cards */}
      <div className="space-y-4">
        {store.address && (
          <div className="flex items-start gap-4 group cursor-pointer transform hover:-translate-y-1 transition-all duration-300">
            <div className={`relative w-12 h-12 rounded-2xl ${
              themeMode === 'dark' ? 'bg-[var(--mid-dark)]' : 'bg-gray-100'
            } flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
              <span className="text-lg">📍</span>
              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--button)]/20 to-[var(--primary)]/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[var(--text)] text-lg mb-1 flex items-center gap-2">
                Address
                <div className="w-1 h-1 bg-[var(--button)] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </p>
              <p className="text-[var(--text)]/70 leading-relaxed">{store.address}</p>
            </div>
          </div>
        )}
        
        {store.phone && (
          <div className="flex items-start gap-4 group cursor-pointer transform hover:-translate-y-1 transition-all duration-300">
            <div className={`relative w-12 h-12 rounded-2xl ${
              themeMode === 'dark' ? 'bg-[var(--mid-dark)]' : 'bg-gray-100'
            } flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
              <span className="text-lg">📞</span>
              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--button)]/20 to-[var(--primary)]/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[var(--text)] text-lg mb-1 flex items-center gap-2">
                Phone
                <div className="w-1 h-1 bg-[var(--button)] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </p>
              <p className="text-[var(--text)]/70 leading-relaxed">{store.phone}</p>
            </div>
          </div>
        )}
        
        {store.contact_email && (
          <div className="flex items-start gap-4 group cursor-pointer transform hover:-translate-y-1 transition-all duration-300">
            <div className={`relative w-12 h-12 rounded-2xl ${
              themeMode === 'dark' ? 'bg-[var(--mid-dark)]' : 'bg-gray-100'
            } flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
              <span className="text-lg">✉️</span>
              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--button)]/20 to-[var(--primary)]/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[var(--text)] text-lg mb-1 flex items-center gap-2">
                Email
                <div className="w-1 h-1 bg-[var(--button)] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </p>
              <p className="text-[var(--text)]/70 leading-relaxed break-all">{store.contact_email}</p>
            </div>
          </div>
        )}
      </div>

      {/* Additional Store Info if available */}
      {(store.opening_hours || store.website) && (
        <div className="pt-4 border-t border-[var(--border)]/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {store.opening_hours && (
              <div className="group">
                <div className={`p-4 rounded-2xl ${
                  themeMode === 'dark' ? 'bg-[var(--mid-dark)]' : 'bg-gray-100'
                } transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-[var(--button)]/10 group-hover:to-[var(--primary)]/10`}>
                  <p className="font-semibold text-[var(--text)] mb-2 flex items-center gap-2">
                    <span className="text-lg">🕒</span>
                    Opening Hours
                  </p>
                  <p className="text-[var(--text)]/70 text-sm">{store.opening_hours}</p>
                </div>
              </div>
            )}
            
            {store.website && (
              <div className="group">
                <div className={`p-4 rounded-2xl ${
                  themeMode === 'dark' ? 'bg-[var(--mid-dark)]' : 'bg-gray-100'
                } transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-[var(--button)]/10 group-hover:to-[var(--primary)]/10`}>
                  <p className="font-semibold text-[var(--text)] mb-2 flex items-center gap-2">
                    <span className="text-lg">🌐</span>
                    Website
                  </p>
                  <a 
                    href={store.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[var(--button)] hover:text-[var(--primary)] transition-colors duration-300 text-sm break-all"
                  >
                    {store.website}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreDetails;