import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import appOfTheDayImage from "../assets/images/app-of-the-day.png";
import cardIconImage from "../assets/images/card-icon.png";
import appleLogoBlackImage from "../assets/images/apple-logo-black.png";
import paypalLogoImage from "../assets/images/paypal-logo.png";
import testimonialBeforeImage from "../assets/images/testimonial-before.png";
import testimonialAfterImage from "../assets/images/testimonial-after.png";
import fatBodyImage from "../assets/images/fat-body.png";
import skinnyBodyImage from "../assets/images/skinny-body.png";
import type {
  SubscriptionPlan,
  PaymentInfo,
  Testimonial,
  Country,
} from "../types";
import { apiService } from "../services/api";
import { trackPaymentEvent, trackPlanSelection } from "../services/analytics";
import { useAppState } from "../hooks/useAppState";
import {
  validateExpirationDate,
  formatCardNumber,
  formatExpirationDate,
  validateEmail,
} from "../utils/validation";
import { addLanguagePrefix } from "../utils/urlUtils";
import { SecureCheckout } from "./SecureCheckout";
import { ReviewSlider } from "./ReviewSlider";
import "./Paywall.css";

interface PaywallProps {
  onPaymentComplete: () => void;
  loading?: boolean;
  onSecureCheckoutToggle?: (show: boolean) => void;
}

/**
 * Paywall component with subscription plans and payment form
 * Displays pricing options and handles secure payment processing
 */
export const Paywall: React.FC<PaywallProps> = ({
  onPaymentComplete,
  loading = false,
  onSecureCheckoutToggle,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { appState, selectPlan, updatePaymentInfo } = useAppState();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [isSliderPaused, setIsSliderPaused] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<Partial<PaymentInfo>>({
    paymentMethod: "card",
    country: "turkey",
    ...appState.paymentInfo, // Initialize with any existing global payment info
  });
  const [expirationInput, setExpirationInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const [showSecureCheckout, setShowSecureCheckout] = useState(false);

  // Get selected plan from global state
  const selectedPlan = appState.selectedPlan;

  // Helper function to get testimonial image
  const getTestimonialImage = (imageName: string) => {
    switch (imageName) {
      case "testimonial-before.png":
        return testimonialBeforeImage;
      case "testimonial-after.png":
        return testimonialAfterImage;
      case "fat-body.png":
        return fatBodyImage;
      case "skinny-body.png":
        return skinnyBodyImage;
      default:
        return testimonialBeforeImage; // fallback
    }
  };

  // Function to get translated plan name and duration
  const getTranslatedPlanInfo = (plan: SubscriptionPlan) => {
    let planKey = "";

    // Map plan IDs to translation keys
    switch (plan.id) {
      case "free-trial":
        planKey = "freeTrial";
        break;
      case "3-months":
        planKey = "threeMonths";
        break;
      case "1-month":
        planKey = "oneMonth";
        break;
      default:
        planKey = plan.id.replace("-", "");
    }

    const nameKey = `paywall.plans.${planKey}Name`;
    const durationKey = `paywall.plans.${planKey}Duration`;

    return {
      name: t(nameKey, plan.name), // Fallback to original name if translation doesn't exist
      duration: t(durationKey, plan.duration), // Fallback to original duration if translation doesn't exist
    };
  };

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          return 0; // Stay at 00:00 when timer reaches zero
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Load subscription plans
  useEffect(() => {
    const loadPlans = async () => {
      const response = await apiService.getSubscriptionPlans();
      if (response.success && response.data) {
        setPlans(response.data);
        // Auto-select the free trial plan
        const freePlan = response.data.find((plan) => plan.isFree);
        if (freePlan) {
          selectPlan(freePlan);
        }
      }
    };

    loadPlans();
  }, [selectPlan]);

  // Load testimonials
  useEffect(() => {
    const loadTestimonials = async () => {
      const response = await apiService.getTestimonials();
      if (response.success && response.data) {
        setTestimonials(response.data);
      }
    };

    loadTestimonials();
  }, []);

  // Load countries
  useEffect(() => {
    const loadCountries = async () => {
      const response = await apiService.getCountries();
      if (response.success && response.data) {
        setCountries(response.data);
      }
    };

    loadCountries();
  }, []);

  // Auto-slide testimonials
  useEffect(() => {
    if (testimonials.length <= 1 || isSliderPaused) return;

    const slideInterval = setInterval(() => {
      setCurrentTestimonialIndex(
        (prevIndex) => (prevIndex + 1) % testimonials.length
      );
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(slideInterval);
  }, [testimonials.length, isSliderPaused]);

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    selectPlan(plan);
    trackPlanSelection(plan.id, plan.name);
    trackPaymentEvent("plan_selected", plan.id);
  };

  const handleInputChange = (field: keyof PaymentInfo, value: string) => {
    let formattedValue = value;

    // If payment method is changing, clear card-related fields
    if (field === "paymentMethod") {
      // Clear card-related fields when switching payment methods
      setPaymentInfo((prev) => ({
        ...prev,
        cardNumber: "",
        expirationMonth: "",
        expirationYear: "",
        cvc: "",
        [field]: formattedValue as "card" | "apple-pay" | "paypal",
      }));

      // Also clear global state for card fields
      updatePaymentInfo({
        cardNumber: "",
        expirationMonth: "",
        expirationYear: "",
        cvc: "",
        [field]: formattedValue as "card" | "apple-pay" | "paypal",
      });

      // Clear expiration input
      setExpirationInput("");

      // Clear card-related errors
      setErrors((prev) => ({
        ...prev,
        cardNumber: "",
        expiration: "",
        cvc: "",
      }));

      return;
    }

    // Format specific fields
    if (field === "cardNumber") {
      formattedValue = formatCardNumber(value);
    } else if (field === "expirationMonth") {
      // Handle expiration date formatting and validation
      const formatted = formatExpirationDate(value, expirationInput);
      setExpirationInput(formatted);

      const [month, year] = formatted.split("/");
      setPaymentInfo((prev) => ({
        ...prev,
        expirationMonth: month || "",
        expirationYear: year || "",
      }));

      // Also update global state for expiration
      updatePaymentInfo({
        expirationMonth: month || "",
        expirationYear: year || "",
      });

      // Clear expiration error when user types
      if (errors.expiration) {
        setErrors((prev) => ({ ...prev, expiration: "" }));
      }

      // Real-time validation for past dates
      if (month && year && month.length === 2 && year.length === 2) {
        if (!validateExpirationDate(month, year)) {
          setErrors((prev) => ({
            ...prev,
            expiration: t("paywall.errors.expirationPast"),
          }));
        }
      }

      return;
    }

    setPaymentInfo((prev) => ({
      ...prev,
      [field]: formattedValue,
    }));

    // Also update global state for all fields including email
    updatePaymentInfo({ [field]: formattedValue });

    // Debug: Log when email is updated
    if (field === "email") {
      // Store email separately for reliability
      localStorage.setItem("user_email", formattedValue);
    }

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Real-time email validation
    if (field === "email" && formattedValue.trim()) {
      if (!validateEmail(formattedValue)) {
        setErrors((prev) => ({
          ...prev,
          email: t("paywall.errors.emailInvalid"),
        }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!paymentInfo.email || paymentInfo.email.trim() === "") {
      newErrors.email = t("paywall.errors.emailRequired");
    } else if (!validateEmail(paymentInfo.email)) {
      newErrors.email = t("paywall.errors.emailInvalid");
    }

    if (paymentInfo.paymentMethod === "card") {
      // Only validate that fields are filled, not their validity
      if (!paymentInfo.cardNumber || paymentInfo.cardNumber.trim() === "") {
        newErrors.cardNumber = t("paywall.errors.cardNumberRequired");
      }

      if (
        !paymentInfo.expirationMonth ||
        !paymentInfo.expirationYear ||
        !validateExpirationDate(
          paymentInfo.expirationMonth,
          paymentInfo.expirationYear
        )
      ) {
        newErrors.expiration =
          paymentInfo.expirationMonth && paymentInfo.expirationYear
            ? t("paywall.errors.expirationPast")
            : t("paywall.errors.expirationRequired");
      }

      if (!paymentInfo.cvc || paymentInfo.cvc.trim() === "") {
        newErrors.cvc = t("paywall.errors.cvcRequired");
      }

      if (!paymentInfo.country) {
        newErrors.country = t("paywall.errors.countryRequired");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!selectedPlan) {
      setErrors({ general: t("paywall.errors.planRequired") });
      return;
    }

    if (!validateForm()) {
      trackPaymentEvent("validation_failed");
      return;
    }

    setIsProcessing(true);
    trackPaymentEvent("payment_initiated", selectedPlan.id);

    try {
      // For PayPal and Apple Pay, just redirect to success after email validation
      if (
        paymentInfo.paymentMethod === "paypal" ||
        paymentInfo.paymentMethod === "apple-pay"
      ) {
        trackPaymentEvent("payment_success", selectedPlan.id);
        onPaymentComplete();
        return;
      }

      // For card payments, always proceed to 3D Secure regardless of card validity
      if (paymentInfo.paymentMethod === "card") {
        setIsProcessing(false);
        setShowSecureCheckout(true);
        onSecureCheckoutToggle?.(true);
        return;
      }
    } catch {
      trackPaymentEvent("payment_error", selectedPlan.id);
      setErrors({ general: t("paywall.errors.paymentError") });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSecureCheckoutSuccess = () => {
    console.log(
      "handleSecureCheckoutSuccess called - navigating to success page"
    );
    setShowSecureCheckout(false);
    onSecureCheckoutToggle?.(false);
    // Navigate to payment success page on successful payment
    navigate(addLanguagePrefix("/payment/success", appState.language));
  };

  const handleSecureCheckoutCancel = () => {
    setShowSecureCheckout(false);
    onSecureCheckoutToggle?.(false);
    // Navigate to payment cancel page
    navigate(addLanguagePrefix("/payment/cancel", appState.language));
  };

  const handleSecureCheckoutError = (errorMessage?: string) => {
    setShowSecureCheckout(false);
    onSecureCheckoutToggle?.(false);
    // Log the error message for debugging
    console.log("Payment error:", errorMessage);
    // Navigate to payment failure page
    navigate(addLanguagePrefix("/payment/error", appState.language));
  };

  // Show 3D Secure checkout if needed
  if (showSecureCheckout && selectedPlan && paymentInfo) {
    return (
      <SecureCheckout
        paymentInfo={paymentInfo as PaymentInfo}
        plan={selectedPlan}
        onSuccess={handleSecureCheckoutSuccess}
        onCancel={handleSecureCheckoutCancel}
        onError={handleSecureCheckoutError}
      />
    );
  }

  return (
    <div className="paywall">
      <div className="content">
        {/* Progress comparison */}
        <motion.div
          className="progress-comparison"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="comparison-cards">
            <div className="comparison-card current">
              <div className="card-header">
                <span className="progress-label now">{t("paywall.now")}</span>
              </div>
              <div className="person-image current-image"></div>
              <div className="stats">
                <div className="stat">
                  <span className="stat-label">{t("paywall.bodyFat")}</span>
                  <span className="stat-value high">{t("paywall.high")}</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat">
                  <span className="stat-label">
                    {t("paywall.fastingLevel")}
                  </span>
                  <span className="stat-value">
                    {t("paywall.intermediate")}
                  </span>
                  <div className="progress-bars intermediate">
                    <div className="progress-bar filled"></div>
                    <div className="progress-bar filled"></div>
                    <div className="progress-bar empty"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="progress-arrows-container">
              <div className="progress-arrows">
                <div className="progress-arrow arrow-1">
                  <svg
                    width="5.45"
                    height="9.2"
                    viewBox="0 0 5.45 9.2"
                    fill="none"
                  >
                    <path
                      d="M1 1L4.45 4.6L1 8.2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="progress-arrow arrow-2">
                  <svg
                    width="5.45"
                    height="9.2"
                    viewBox="0 0 5.45 9.2"
                    fill="none"
                  >
                    <path
                      d="M1 1L4.45 4.6L1 8.2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="progress-arrow arrow-3">
                  <svg
                    width="5.45"
                    height="9.2"
                    viewBox="0 0 5.45 9.2"
                    fill="none"
                  >
                    <path
                      d="M1 1L4.45 4.6L1 8.2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="progress-arrow arrow-4">
                  <svg
                    width="5.45"
                    height="9.2"
                    viewBox="0 0 5.45 9.2"
                    fill="none"
                  >
                    <path
                      d="M1 1L4.45 4.6L1 8.2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="progress-arrow arrow-5">
                  <svg
                    width="5.45"
                    height="9.2"
                    viewBox="0 0 5.45 9.2"
                    fill="none"
                  >
                    <path
                      d="M1 1L4.45 4.6L1 8.2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="comparison-card goal">
              <div className="card-header">
                <span className="progress-label goal">
                  {t("paywall.yourGoal")}
                </span>
              </div>
              <div className="person-image goal-image"></div>
              <div className="stats">
                <div className="stat">
                  <span className="stat-label">{t("paywall.bodyFat")}</span>
                  <span className="stat-value normal">
                    {t("paywall.normal")}
                  </span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat">
                  <span className="stat-label">
                    {t("paywall.fastingLevel")}
                  </span>
                  <span className="stat-value">{t("paywall.advanced")}</span>
                  <div className="progress-bars advanced">
                    <div className="progress-bar filled"></div>
                    <div className="progress-bar filled"></div>
                    <div className="progress-bar filled"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Special offer timer */}
        <motion.div
          className="special-offer"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="offer-content">
            <span className="offer-icon">⏰</span>
            <span className="offer-text">
              {t("paywall.specialPrice")} {formatTime(timeLeft)}
            </span>
          </div>
        </motion.div>

        {/* Subscription plans */}
        <motion.div
          className="subscription-plans"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="limited-offer-badge">{t("paywall.limitedOffer")}</div>

          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              className={`plan-option ${
                selectedPlan?.id === plan.id ? "selected" : ""
              } ${plan.isFree ? "free-plan" : ""}`}
              data-price-digits={Math.floor(plan.price).toString().length}
              onClick={() => handlePlanSelect(plan)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="plan-content">
                <div className="plan-info">
                  <span
                    className={`selection-icon ${
                      selectedPlan?.id === plan.id ? "selected" : ""
                    } ${plan.isFree ? "free-type" : "paid-type"}`}
                  >
                    {selectedPlan?.id === plan.id ? "●" : "○"}
                  </span>
                  <div className="plan-name-container">
                    <span className="plan-name">
                      {getTranslatedPlanInfo(plan).name}
                    </span>
                    <span className="plan-duration">
                      {getTranslatedPlanInfo(plan).duration}
                    </span>
                  </div>
                </div>
                <div className="plan-price">
                  {selectedPlan?.id === plan.id ? (
                    <div className="price-tag">
                      <div className="price-container">
                        <span className="currency">$</span>
                        <span className="price-main">
                          {Math.floor(plan.price)}
                        </span>
                        <span className="price-decimal">
                          {(plan.price % 1).toFixed(2).slice(2)}
                        </span>
                        {!plan.isFree && (
                          <span className="price-period">
                            {t("paywall.perWeek")}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="price-container">
                      <span className="currency">$</span>
                      <span className="price-main">
                        {Math.floor(plan.price)}
                      </span>
                      <span className="price-decimal">
                        {(plan.price % 1).toFixed(2).slice(2)}
                      </span>
                      {!plan.isFree && (
                        <span className="price-period">
                          {t("paywall.perWeek")}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {plan.discount && (
                <div className="discount-badge">
                  {t("paywall.save")} {plan.discount}%
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Get my plan button after subscription plans */}
        <motion.div
          className="subscription-plans-footer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <button
            className="btn btn-primary subscription-plan-button"
            onClick={() => {
              const paymentSection = document.querySelector(".payment-section");
              paymentSection?.scrollIntoView({ behavior: "smooth" });
            }}
            disabled={!selectedPlan}
          >
            {t("paywall.getMyPlan")}
          </button>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          className="trust-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <p className="join-users">{t("paywall.joinUsers")}</p>

          <div className="app-rating">
            <div className="rating-badge">
              <img
                src={appOfTheDayImage}
                alt="App of the Day"
                width="199"
                height="66"
              />
            </div>
            <div className="rating-score">
              <span className="score">
                {appState.language === "ar" ? (
                  <>
                    <span className="score-total">5</span>
                    <span className="score-divider">/</span>
                    <span className="score-main">4.6</span>
                  </>
                ) : (
                  <>
                    <span className="score-main">4.6</span>
                    <span className="score-divider">/</span>
                    <span className="score-total">5</span>
                  </>
                )}
              </span>
              <div className="stars">
                <span className="star filled">★</span>
                <span className="star filled">★</span>
                <span className="star filled">★</span>
                <span className="star filled">★</span>
                <span className="star partial">★</span>
              </div>
              <span className="rating-count">{t("paywall.ratings")}</span>
            </div>
          </div>
        </motion.div>

        {/* Review slider */}
        <motion.div
          className="review-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <ReviewSlider />
        </motion.div>

        {/* Testimonials section */}
        <motion.div
          className="testimonials"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="testimonials-title">{t("paywall.proofTitle")}</h3>

          <div
            className="testimonials-slider"
            onMouseEnter={() => setIsSliderPaused(true)}
            onMouseLeave={() => setIsSliderPaused(false)}
          >
            {testimonials.length > 0 && (
              <motion.div
                key={currentTestimonialIndex}
                className="testimonial-card"
                initial={{ opacity: 0, x: 30, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -30, scale: 0.95 }}
                transition={{
                  duration: 0.6,
                  ease: [0.4, 0, 0.2, 1],
                  opacity: { duration: 0.4 },
                  scale: { duration: 0.5 },
                }}
              >
                <div className="testimonial-images">
                  <div
                    className="testimonial-image before-image"
                    style={{
                      backgroundImage: `url(${getTestimonialImage(testimonials[currentTestimonialIndex].beforeImage)})`,
                    }}
                  ></div>
                  <div
                    className="testimonial-image after-image"
                    style={{
                      backgroundImage: `url(${getTestimonialImage(testimonials[currentTestimonialIndex].afterImage)})`,
                    }}
                  ></div>
                  <div className="testimonial-name">
                    {(() => {
                      const fullName = t(
                        `paywall.testimonials.names.${testimonials[currentTestimonialIndex].id}`,
                        testimonials[currentTestimonialIndex].name
                      );
                      const parts = fullName.split(", ");
                      return (
                        <>
                          {parts[0]}
                          {parts[1] && (
                            <span style={{ color: "#59AC27" }}>
                              , {parts[1]}
                            </span>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
                <div className="testimonial-content">
                  <div className="testimonial-rating">
                    <span className="rating-title">
                      {t(
                        `paywall.testimonials.ratingTitles.${testimonials[currentTestimonialIndex].id}`,
                        testimonials[currentTestimonialIndex].ratingTitle
                      )}
                    </span>
                    <div className="stars">
                      {"★".repeat(testimonials[currentTestimonialIndex].stars)}
                    </div>
                  </div>
                  <p className="testimonial-text">
                    "
                    {t(
                      `paywall.testimonials.texts.${testimonials[currentTestimonialIndex].id}`,
                      testimonials[currentTestimonialIndex].text
                    )}
                    "
                  </p>
                </div>
              </motion.div>
            )}

            {/* Slider indicators */}
            <div className="slider-indicators">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`slider-indicator ${
                    index === currentTestimonialIndex ? "active" : ""
                  }`}
                  onClick={() => setCurrentTestimonialIndex(index)}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Payment form */}
        <motion.div
          className="payment-section"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3 className="payment-title">{t("paywall.paymentMethod")}</h3>

          <div className="payment-methods">
            <button
              className={`payment-method ${
                paymentInfo.paymentMethod === "card" ? "active" : ""
              }`}
              onClick={() => handleInputChange("paymentMethod", "card")}
            >
              <div className="payment-method-content">
                <span className="payment-icon">
                  <img src={cardIconImage} alt="Card" width="16" height="16" />
                </span>
                <span>{t("paywall.card")}</span>
              </div>
              <div className="radio-button">
                {paymentInfo.paymentMethod === "card" && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10 3L4.5 8.5L2 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </button>
          </div>

          {/* Email input for all payment methods */}
          <div className="email-form">
            <div className="form-group">
              <label>{t("paywall.email")}</label>
              <input
                type="email"
                className={`input ${errors.email ? "error" : ""}`}
                value={paymentInfo.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="example@email.com"
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>
          </div>

          {/* Card form - only show for card payment method */}
          {paymentInfo.paymentMethod === "card" && (
            <div className="card-form">
              <div className="form-group">
                <label>{t("paywall.cardNumberLabel")}</label>
                <input
                  type="text"
                  className={`input ${errors.cardNumber ? "error" : ""}`}
                  value={paymentInfo.cardNumber || ""}
                  onChange={(e) =>
                    handleInputChange("cardNumber", e.target.value)
                  }
                  placeholder={t("paywall.cardNumber")}
                  maxLength={19}
                />
                {errors.cardNumber && (
                  <span className="error-message">{errors.cardNumber}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t("paywall.expiration")}</label>
                  <input
                    type="text"
                    className={`input ${errors.expiration ? "error" : ""}`}
                    value={expirationInput}
                    onChange={(e) =>
                      handleInputChange("expirationMonth", e.target.value)
                    }
                    placeholder={t("paywall.expirationPlaceholder")}
                    maxLength={5}
                  />
                  {errors.expiration && (
                    <span className="error-message">{errors.expiration}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>{t("paywall.cvc")}</label>
                  <input
                    type="text"
                    className={`input ${errors.cvc ? "error" : ""}`}
                    value={paymentInfo.cvc || ""}
                    onChange={(e) => handleInputChange("cvc", e.target.value)}
                    placeholder={t("paywall.cvcPlaceholder")}
                    maxLength={4}
                  />
                  {errors.cvc && (
                    <span className="error-message">{errors.cvc}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>{t("paywall.country")}</label>
                <select
                  className="input"
                  value={paymentInfo.country || ""}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                >
                  {countries.map((country) => (
                    <option key={country.id} value={country.id}>
                      {t(country.nameKey, country.id)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="alternative-payments">
            <button
              className={`payment-method ${
                paymentInfo.paymentMethod === "apple-pay" ? "active" : ""
              }`}
              onClick={() => handleInputChange("paymentMethod", "apple-pay")}
            >
              <div className="payment-method-content">
                <span className="payment-icon">
                  <img
                    src={appleLogoBlackImage}
                    alt="Apple Pay"
                    width="16"
                    height="16"
                  />
                </span>
                <span>{t("paywall.applePay")}</span>
              </div>
              <div className="radio-button">
                {paymentInfo.paymentMethod === "apple-pay" && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10 3L4.5 8.5L2 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </button>

            <button
              className={`payment-method ${
                paymentInfo.paymentMethod === "paypal" ? "active" : ""
              }`}
              onClick={() => handleInputChange("paymentMethod", "paypal")}
            >
              <div className="payment-method-content">
                <span className="payment-icon">
                  <img
                    src={paypalLogoImage}
                    alt="PayPal"
                    width="16"
                    height="16"
                  />
                </span>
                <span>{t("paywall.paypal")}</span>
              </div>
              <div className="radio-button">
                {paymentInfo.paymentMethod === "paypal" && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10 3L4.5 8.5L2 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </button>
          </div>
        </motion.div>

        {errors.general && (
          <motion.div
            className="error-message general-error"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
          >
            {errors.general}
          </motion.div>
        )}
      </div>

      <motion.div
        className="footer"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <div className="footer-content">
          <button
            className="btn btn-primary payment-button"
            onClick={handlePayment}
            disabled={!selectedPlan || isProcessing || loading}
          >
            {isProcessing || loading ? (
              <span className="spinner" />
            ) : (
              t("paywall.getMyPlan")
            )}
          </button>

          <div className="legal-links">
            <a href="#" onClick={(e) => e.preventDefault()}>
              {t("paywall.termsConditions")}
            </a>
            <span>•</span>
            <a href="#" onClick={(e) => e.preventDefault()}>
              {t("paywall.privacyPolicy")}
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
