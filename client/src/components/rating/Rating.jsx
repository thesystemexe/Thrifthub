import React, { useState, useEffect } from "react";
import "./rating.css";

const Rating = ({ value = 0, onRatingChange, disabled = false }) => {
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(value);

  // Sync internal state if the value prop changes from parent
  useEffect(() => {
    setSelectedRating(value);
  }, [value]);

  const handleMouseEnter = (rating) => {
    if (!disabled) {
      setHoveredRating(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!disabled) {
      setHoveredRating(0);
    }
  };

  const handleClick = (rating) => {
    if (!disabled) {
      setSelectedRating(rating);
      if (onRatingChange) {
        onRatingChange(rating);
      }
    }
  };

  const renderStars = () => {
    const stars = [];
    const activeRating = hoveredRating || selectedRating;

    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= activeRating;

      stars.push(
        <button
          key={i}
          type="button"
          className={`rating-star ${isFilled ? "filled" : "empty"}`}
          onMouseEnter={() => handleMouseEnter(i)}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick(i)}
          disabled={disabled}
          aria-label={`Rate ${i} out of 5 stars`}
        >
          {isFilled ? "★" : "☆"}
        </button>,
      );
    }
    return stars;
  };

  return <div className="rating-container">{renderStars()}</div>;
};

export default Rating;
