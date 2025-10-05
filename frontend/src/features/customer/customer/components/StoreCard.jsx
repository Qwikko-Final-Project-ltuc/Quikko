import React from "react";
import { Link } from "react-router-dom";
import ReviewSection from "../../review/ReviewSection";

const StoreCard = ({ store }) => {
  return (
    <Link to={`/stores/${store.id}`} className="block border rounded-lg overflow-hidden shadow hover:shadow-lg transition duration-300">
      <img src={store.store_logo || "/placeholder.png"} alt={store.store_name} className="w-full h-48 object-cover"/>
      <div className="p-4">
        <h3 className="text-lg font-bold">{store.store_name}</h3>
        <p className="text-sm text-gray-500">{store.description?.slice(0, 60)}...</p>
        <ReviewSection rating={store.average_rating} totalReviews={store.total_reviews} />
      </div>
    </Link>
  );
};

export default StoreCard;
