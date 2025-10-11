import React from "react";
import { FaStar } from "react-icons/fa";

const ReviewStatic = ({ averageRating = 0, totalReviews = 0 }) => {
  const rating = Number(averageRating) || 0;

  return (
    <div className="flex items-center space-x-2">
      <div className="flex">
        <FaStar className="text-yellow-400" />
      </div>
      <span className="text-gray-600 text-sm">
        {rating.toFixed(1)} ⭐ ({totalReviews || 0})
      </span>
    </div>
  );
};

export default ReviewStatic;
