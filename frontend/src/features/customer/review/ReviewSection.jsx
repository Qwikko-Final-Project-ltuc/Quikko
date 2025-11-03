import React, { useState, useEffect } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

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

  const handleClick = (value) => {
    if (!readOnly && onRate) {
      setCurrentRating(value); 
      onRate(value);           
    }
  };

  // Function to render stars based on average rating for readOnly mode
  const renderAverageStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="text-yellow-400" />);
    }
    
    // Half star
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-yellow-400" />);
    }
    
    // Empty stars
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="text-yellow-400" />);
    }
    
    return stars;
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex">
        {readOnly ? (
          // Show average rating stars when readOnly
          renderAverageStars(averageRating)
        ) : (
          // Show interactive stars when not readOnly
          Array.from({ length: 5 }, (_, i) => {
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
          })
        )}
      </div>
      <span className="text-[var(--text)] text-sm">
        {averageRating.toFixed(1)} ({totalReviews})
      </span>
    </div>
  );
};

export default ReviewSection;