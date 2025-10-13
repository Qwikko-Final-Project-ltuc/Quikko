import React, { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";

const ReviewSection = ({
  userRating = 0,      
  averageRating = 0,    
  totalReviews = 0,    
  readOnly = true,
  onRate,
}) => {
  const [hover, setHover] = useState(null);
  const [currentRating, setCurrentRating] = useState(userRating);

  useEffect(() => {
    setCurrentRating(userRating);
  }, [userRating]);

//   useEffect(() => {
//   // console.log("reviews:", totalReviews);
//   // console.log("averageRating:", averageRating);
//   // console.log("currentRating:", currentRating);
// }, [totalReviews, averageRating,currentRating]);

  const handleClick = (value) => {
    if (!readOnly && onRate) {
      setCurrentRating(value); 
      onRate(value);           
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex">
        {Array.from({ length: 5 }, (_, i) => {
          const value = i + 1;
          return (
            <FaStar
              key={i}
              className={`cursor-pointer transition-colors duration-200 ${
                value <= (hover || currentRating)
                  ? "text-yellow-400"
                  : "text-gray-300"
              }`}
              onMouseEnter={() => !readOnly && setHover(value)}
              onMouseLeave={() => !readOnly && setHover(null)}
              onClick={() => handleClick(value)}
            />
          );
        })}
      </div>
      <span className="text-gray-600 text-sm">
        {averageRating.toFixed(1)} ⭐ ({totalReviews})
      </span>
    </div>
  );
};

export default ReviewSection;
