// StoreDetails.jsx
import React from "react";
import { useSelector } from "react-redux";

const StoreDetails = ({ store }) => {
  const themeMode = useSelector((state) => state.customerTheme.mode);

  return (
    <div className="space-y-4">
      <p className="text-[var(--text)]/80 leading-relaxed">{store.description}</p>
      
      <div className="space-y-3">
        {store.address && (
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-lg ${
              themeMode === 'dark' ? 'bg-[var(--mid-dark)]' : 'bg-gray-100'
            } flex items-center justify-center flex-shrink-0`}>
              <span className="text-sm">📍</span>
            </div>
            <div>
              <p className="font-semibold text-[var(--text)]">Address</p>
              <p className="text-[var(--text)]/70">{store.address}</p>
            </div>
          </div>
        )}
        
        {store.phone && (
          <div className="flex items-start gap-3">

            <div>
              <p className="font-semibold text-[var(--text)]">Phone</p>
              <p className="text-[var(--text)]/70">{store.phone}</p>
            </div>
          </div>
        )}
        
        {store.contact_email && (
          <div className="flex items-start gap-3">
            <div>
              <p className="font-semibold text-[var(--text)]">Email</p>
              <p className="text-[var(--text)]/70">{store.contact_email}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreDetails;