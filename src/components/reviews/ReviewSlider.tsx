import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { trackUserInteraction } from "../../services/analytics";
import type { Review } from "../../types";
import { apiService } from "../../services/api";
import "./ReviewSlider.css";

interface ReviewSliderProps {
  className?: string;
}

// Loading fallback component
const ReviewSliderLoading: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <div className={`review-slider ${className}`}>
    <div className="review-slider-container">
      <div className="review-cards-wrapper">
        <div className="review-card loading">
          <div className="review-card-content">
            <div className="review-header">
              <span className="review-emoji">⏳</span>
              <h4 className="review-title">Loading reviews...</h4>
            </div>
            <div className="review-stars">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className="star empty">
                  ★
                </span>
              ))}
            </div>
            <p className="review-content">
              Please wait while we load the latest reviews...
            </p>
            <div className="review-footer">
              <span className="reviewer-name">Loading...</span>
              <span className="review-date">• Now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Main ReviewSlider component with traditional data fetching
const ReviewSliderContent: React.FC<ReviewSliderProps> = ({
  className = "",
}) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const sliderRef = useRef<HTMLDivElement>(null);

  // Traditional data fetching with useEffect
  useEffect(() => {
    const loadReviews = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.getReviews();
        if (response.success && response.data) {
          setReviews(response.data);
        } else {
          console.error("Failed to load reviews");
        }
      } catch (error) {
        console.error("Error loading reviews:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReviews();
  }, []);

  // Show loading state while data is being fetched
  if (isLoading) {
    return <ReviewSliderLoading className={className} />;
  }

  // Get translated review data
  const getTranslatedReview = (review: Review) => {
    return {
      title: t(`paywall.reviews.titles.${review.id}`, review.title),
      content: t(`paywall.reviews.contents.${review.id}`, review.content),
      reviewer: t(`paywall.reviews.reviewers.${review.id}`, review.reviewer),
      reviewDate: t(`paywall.reviews.dates.${review.id}`, review.reviewDate),
    };
  };

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
    setDragOffset(0);
  };

  // Handle drag move with bounds checking
  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - startX;
    const isRTL = document.documentElement.dir === "rtl";

    // Limit drag offset based on current position
    let limitedDeltaX = deltaX;

    // If at first slide and trying to go back, limit the drag
    if (currentIndex === 0 && (isRTL ? deltaX < 0 : deltaX > 0)) {
      limitedDeltaX = deltaX * 0.3; // Allow some resistance
    }

    // If at last slide and trying to go forward, limit the drag
    if (
      currentIndex === reviews.length - 1 &&
      (isRTL ? deltaX > 0 : deltaX < 0)
    ) {
      limitedDeltaX = deltaX * 0.3; // Allow some resistance
    }

    setDragOffset(limitedDeltaX);
  };

  // Handle drag end
  const handleDragEnd = () => {
    if (!isDragging) return;

    setIsDragging(false);
    const threshold = 50; // Minimum drag distance to trigger slide change
    const isRTL = document.documentElement.dir === "rtl";

    if (Math.abs(dragOffset) > threshold) {
      if ((isRTL ? dragOffset < 0 : dragOffset > 0) && currentIndex > 0) {
        // Swipe right (LTR) or left (RTL) - go to previous
        setCurrentIndex(currentIndex - 1);
        trackUserInteraction("review_slider", "swipe_previous");
      } else if (
        (isRTL ? dragOffset > 0 : dragOffset < 0) &&
        currentIndex < reviews.length - 1
      ) {
        // Swipe left (LTR) or right (RTL) - go to next
        setCurrentIndex(currentIndex + 1);
        trackUserInteraction("review_slider", "swipe_next");
      }
    }

    setDragOffset(0);
  };

  // Handle click on card
  const handleCardClick = (index: number) => {
    if (!isDragging) {
      setCurrentIndex(index);
      trackUserInteraction("review_card", `click_review_${index + 1}`);
    }
  };

  // Calculate card width based on screen size
  const getCardWidth = () => {
    if (window.innerWidth <= 768) {
      return 282; // 270px card + 12px gap
    }
    return 282; // 270px card + 12px gap
  };

  const cardWidth = getCardWidth();

  // Calculate the transform offset to center the active card
  const getTransformOffset = () => {
    return 0; // No padding, start from the very left
  };

  const transformOffset = getTransformOffset();

  // Check if RTL
  const isRTL = document.documentElement.dir === "rtl";

  // Calculate transform based on direction
  const getTransformValue = () => {
    if (isRTL) {
      // In RTL, we need to reverse the direction
      return `${transformOffset + currentIndex * cardWidth + dragOffset}px`;
    }
    return `${transformOffset - currentIndex * cardWidth + dragOffset}px`;
  };

  return (
    <div className={`review-slider ${className}`}>
      <div
        className="review-slider-container"
        ref={sliderRef}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        <div
          className="review-cards-wrapper"
          style={{
            transform: `translateX(${getTransformValue()})`,
            transition: isDragging ? "none" : "transform 0.3s ease",
          }}
        >
          {(isRTL ? [...reviews].reverse() : reviews).map((review, index) => {
            const actualIndex = isRTL ? reviews.length - 1 - index : index;
            const translatedReview = getTranslatedReview(review);
            const isActive = actualIndex === currentIndex;

            return (
              <motion.div
                key={review.id}
                className={`review-card ${isActive ? "active" : ""}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{
                  opacity: 1,
                  scale: isActive ? 1 : 0.9,
                }}
                transition={{
                  duration: 0.6,
                  ease: [0.4, 0, 0.2, 1],
                  opacity: { duration: 0.4 },
                  scale: { duration: 0.5 },
                }}
                onClick={() => handleCardClick(actualIndex)}
                style={{ pointerEvents: isDragging ? "none" : "auto" }}
              >
                <div className="review-card-content">
                  <div className="review-header">
                    <span className="review-emoji">{review.emoji}</span>
                    <h4 className="review-title">{translatedReview.title}</h4>
                  </div>

                  <div className="review-stars">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span
                        key={i}
                        className={`star ${i < review.stars ? "filled" : "empty"}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  <p className="review-content">{translatedReview.content}</p>

                  <div className="review-footer">
                    <span className="reviewer-name">
                      {translatedReview.reviewer}
                    </span>
                    <span className="review-date">
                      {isRTL
                        ? `${translatedReview.reviewDate} •`
                        : `• ${translatedReview.reviewDate}`}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Main exported component
export const ReviewSlider: React.FC<ReviewSliderProps> = (props) => {
  return <ReviewSliderContent {...props} />;
};
