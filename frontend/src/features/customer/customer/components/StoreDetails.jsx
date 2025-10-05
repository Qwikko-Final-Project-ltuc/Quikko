import React from "react";

const StoreDetails = ({ store }) => {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <img src={store.store_banner || "/banner-placeholder.png"} alt={store.store_name} className="w-full h-64 object-cover rounded-lg"/>
      <h1 className="text-3xl font-bold mt-4">{store.store_name}</h1>
      <p className="text-gray-700 mt-2">{store.description}</p>
      <div className="mt-4 space-y-2">
        {store.address && <p><strong>Address:</strong> {store.address}</p>}
        {store.phone && <p><strong>Phone:</strong> {store.phone}</p>}
        {store.contact_email && <p><strong>Email:</strong> {store.contact_email}</p>}
      </div>
    </div>
  );
};

export default StoreDetails;
