import React, {
  useReducer,
  useMemo,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import appOfTheDayImage from "../../assets/images/app-of-the-day.png";
import cardIconImage from "../../assets/images/card-icon.png";
import appleLogoBlackImage from "../../assets/images/apple-logo-black.png";
import paypalLogoImage from "../../assets/images/paypal-logo.png";
import testimonialBeforeImage from "../../assets/images/testimonial-before.png";
import testimonialAfterImage from "../../assets/images/testimonial-after.png";
import fatBodyImage from "../../assets/images/fat-body.png";
import skinnyBodyImage from "../../assets/images/skinny-body.png";
import type {
  SubscriptionPlan,
  PaymentInfo,
  Testimonial,
  Country,
} from "../../types";
import { apiService } from "../../services/api";
import {
  trackPaymentEvent,
  trackPlanSelection,
} from "../../services/analytics";
import { useAppState, useInterval } from "../../hooks";
import {
  validateExpirationDate,
  formatCardNumber,
  formatExpirationDate,
  validateEmail,
} from "../../utils/validation";
import { addLanguagePrefix } from "../../utils/urlUtils";
import { SecureCheckout } from "../payment/SecureCheckout";
import { ReviewSlider } from "../reviews/ReviewSlider";
import "./Paywall.css";

interface PaywallProps {
  onPaymentComplete: () => void;
  loading?: boolean;
  onSecureCheckoutToggle?: (show: boolean) => void;
}

// Combined state interfaces
interface UIState {
  currentTestimonialIndex: number;
  isSliderPaused: boolean;
  showSecureCheckout: boolean;
}

interface FormState {
  paymentInfo: Partial<PaymentInfo>;
  expirationInput: string;
  errors: Record<string, string>;
}

interface ProcessingState {
  isProcessing: boolean;
  timeLeft: number;
}

// Action types for useReducer
type UIAction =
  | { type: "SET_TESTIMONIAL_INDEX"; payload: number }
  | { type: "SET_SLIDER_PAUSED"; payload: boolean }
  | { type: "SET_SHOW_SECURE_CHECKOUT"; payload: boolean };

type FormAction =
  | { type: "UPDATE_PAYMENT_INFO"; payload: Partial<PaymentInfo> }
  | { type: "SET_EXPIRATION_INPUT"; payload: string }
  | { type: "SET_ERRORS"; payload: Record<string, string> }
  | { type: "CLEAR_ERROR"; payload: string }
  | { type: "CLEAR_CARD_ERRORS" };

type ProcessingAction =
  | { type: "SET_PROCESSING"; payload: boolean }
  | { type: "DECREMENT_TIME" }
  | { type: "SET_TIME"; payload: number };

// Reducers

const uiReducer = (state: UIState, action: UIAction): UIState => {
  switch (action.type) {
    case "SET_TESTIMONIAL_INDEX":
      return { ...state, currentTestimonialIndex: action.payload };
    case "SET_SLIDER_PAUSED":
      return { ...state, isSliderPaused: action.payload };
    case "SET_SHOW_SECURE_CHECKOUT":
      return { ...state, showSecureCheckout: action.payload };
    default:
      return state;
  }
};

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case "UPDATE_PAYMENT_INFO":
      return {
        ...state,
        paymentInfo: { ...state.paymentInfo, ...action.payload },
      };
    case "SET_EXPIRATION_INPUT":
      return { ...state, expirationInput: action.payload };
    case "SET_ERRORS":
      return { ...state, errors: action.payload };
    case "CLEAR_ERROR": {
      const newErrors = { ...state.errors };
      delete newErrors[action.payload];
      return { ...state, errors: newErrors };
    }
    case "CLEAR_CARD_ERRORS": {
      const clearedErrors = { ...state.errors };
      delete clearedErrors.cardNumber;
      delete clearedErrors.expiration;
      delete clearedErrors.cvc;
      return { ...state, errors: clearedErrors };
    }
    default:
      return state;
  }
};

const processingReducer = (
  state: ProcessingState,
  action: ProcessingAction
): ProcessingState => {
  switch (action.type) {
    case "SET_PROCESSING":
      return { ...state, isProcessing: action.payload };
    case "DECREMENT_TIME":
      return {
        ...state,
        timeLeft: state.timeLeft <= 0 ? 0 : state.timeLeft - 1,
      };
    case "SET_TIME":
      return { ...state, timeLeft: action.payload };
    default:
      return state;
  }
};

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

  // Combined state management using useReducer
  const [uiState, uiDispatch] = useReducer(uiReducer, {
    currentTestimonialIndex: 0,
    isSliderPaused: false,
    showSecureCheckout: false,
  });

  const [formState, formDispatch] = useReducer(formReducer, {
    paymentInfo: {
      paymentMethod: "card",
      country: "turkey",
      ...appState.paymentInfo,
    },
    expirationInput: "",
    errors: {},
  });

  const [processingState, processingDispatch] = useReducer(processingReducer, {
    isProcessing: false,
    timeLeft: 15 * 60, // 15 minutes in seconds
  });

  // Get selected plan from global state
  const selectedPlan = appState.selectedPlan;

  // Data loading with traditional useEffect approach to avoid hook order issues
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [plansRes, testimonialsRes, countriesRes] = await Promise.all([
          apiService.getSubscriptionPlans(),
          apiService.getTestimonials(),
          apiService.getCountries(),
        ]);

        setPlans(plansRes.data || []);
        setTestimonials(testimonialsRes.data || []);
        setCountries(countriesRes.data || []);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Auto-select free trial plan when plans are loaded
  // Using useMemo for computed selection logic
  useMemo(() => {
    const freePlan = plans.find((plan: SubscriptionPlan) => plan.isFree);
    if (freePlan && !selectedPlan) {
      selectPlan(freePlan);
    }
  }, [plans, selectedPlan, selectPlan]);

  // Timer with custom hook - use useCallback to prevent re-renders
  const decrementTimer = useCallback(() => {
    processingDispatch({ type: "DECREMENT_TIME" });
  }, []);

  useInterval(decrementTimer, processingState.timeLeft > 0 ? 1000 : null);

  // Auto-slide testimonials with custom hook - use useCallback to prevent re-renders
  const nextTestimonial = useCallback(() => {
    if (testimonials.length <= 1 || uiState.isSliderPaused) return;
    uiDispatch({
      type: "SET_TESTIMONIAL_INDEX",
      payload: (uiState.currentTestimonialIndex + 1) % testimonials.length,
    });
  }, [
    testimonials.length,
    uiState.isSliderPaused,
    uiState.currentTestimonialIndex,
  ]);

  useInterval(
    nextTestimonial,
    testimonials.length > 1 && !uiState.isSliderPaused ? 4000 : null
  );

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

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

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
      formDispatch({
        type: "UPDATE_PAYMENT_INFO",
        payload: {
          cardNumber: "",
          expirationMonth: "",
          expirationYear: "",
          cvc: "",
          [field]: formattedValue as "card" | "apple-pay" | "paypal",
        },
      });

      // Also clear global state for card fields
      updatePaymentInfo({
        cardNumber: "",
        expirationMonth: "",
        expirationYear: "",
        cvc: "",
        [field]: formattedValue as "card" | "apple-pay" | "paypal",
      });

      // Clear expiration input
      formDispatch({ type: "SET_EXPIRATION_INPUT", payload: "" });

      // Clear card-related errors
      formDispatch({ type: "CLEAR_CARD_ERRORS" });

      return;
    }

    // Format specific fields
    if (field === "cardNumber") {
      formattedValue = formatCardNumber(value);
    } else if (field === "expirationMonth") {
      // Handle expiration date formatting and validation
      const formatted = formatExpirationDate(value, formState.expirationInput);
      formDispatch({ type: "SET_EXPIRATION_INPUT", payload: formatted });

      const [month, year] = formatted.split("/");
      formDispatch({
        type: "UPDATE_PAYMENT_INFO",
        payload: {
          expirationMonth: month || "",
          expirationYear: year || "",
        },
      });

      // Also update global state for expiration
      updatePaymentInfo({
        expirationMonth: month || "",
        expirationYear: year || "",
      });

      // Clear expiration error when user types
      if (formState.errors.expiration) {
        formDispatch({ type: "CLEAR_ERROR", payload: "expiration" });
      }

      // Real-time validation for past dates
      if (month && year && month.length === 2 && year.length === 2) {
        if (!validateExpirationDate(month, year)) {
          formDispatch({
            type: "SET_ERRORS",
            payload: {
              ...formState.errors,
              expiration: t("paywall.errors.expirationPast"),
            },
          });
        }
      }

      return;
    }

    formDispatch({
      type: "UPDATE_PAYMENT_INFO",
      payload: { [field]: formattedValue },
    });

    // Also update global state for all fields including email
    updatePaymentInfo({ [field]: formattedValue });

    // Debug: Log when email is updated
    if (field === "email") {
      // Store email separately for reliability
      localStorage.setItem("user_email", formattedValue);
    }

    // Clear error for this field
    if (formState.errors[field]) {
      formDispatch({ type: "CLEAR_ERROR", payload: field });
    }

    // Real-time email validation
    if (field === "email" && formattedValue.trim()) {
      if (!validateEmail(formattedValue)) {
        formDispatch({
          type: "SET_ERRORS",
          payload: {
            ...formState.errors,
            email: t("paywall.errors.emailInvalid"),
          },
        });
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (
      !formState.paymentInfo.email ||
      formState.paymentInfo.email.trim() === ""
    ) {
      newErrors.email = t("paywall.errors.emailRequired");
    } else if (!validateEmail(formState.paymentInfo.email)) {
      newErrors.email = t("paywall.errors.emailInvalid");
    }

    if (formState.paymentInfo.paymentMethod === "card") {
      // Only validate that fields are filled, not their validity
      if (
        !formState.paymentInfo.cardNumber ||
        formState.paymentInfo.cardNumber.trim() === ""
      ) {
        newErrors.cardNumber = t("paywall.errors.cardNumberRequired");
      }

      if (
        !formState.paymentInfo.expirationMonth ||
        !formState.paymentInfo.expirationYear ||
        !validateExpirationDate(
          formState.paymentInfo.expirationMonth,
          formState.paymentInfo.expirationYear
        )
      ) {
        newErrors.expiration =
          formState.paymentInfo.expirationMonth &&
          formState.paymentInfo.expirationYear
            ? t("paywall.errors.expirationPast")
            : t("paywall.errors.expirationRequired");
      }

      if (
        !formState.paymentInfo.cvc ||
        formState.paymentInfo.cvc.trim() === ""
      ) {
        newErrors.cvc = t("paywall.errors.cvcRequired");
      }

      if (!formState.paymentInfo.country) {
        newErrors.country = t("paywall.errors.countryRequired");
      }
    }

    formDispatch({ type: "SET_ERRORS", payload: newErrors });
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!selectedPlan) {
      formDispatch({
        type: "SET_ERRORS",
        payload: { general: t("paywall.errors.planRequired") },
      });
      return;
    }

    if (!validateForm()) {
      trackPaymentEvent("validation_failed");
      return;
    }

    processingDispatch({ type: "SET_PROCESSING", payload: true });
    trackPaymentEvent("payment_initiated", selectedPlan.id);

    try {
      // For PayPal and Apple Pay, just redirect to success after email validation
      if (
        formState.paymentInfo.paymentMethod === "paypal" ||
        formState.paymentInfo.paymentMethod === "apple-pay"
      ) {
        trackPaymentEvent("payment_success", selectedPlan.id);
        onPaymentComplete();
        return;
      }

      // For card payments, always proceed to 3D Secure regardless of card validity
      if (formState.paymentInfo.paymentMethod === "card") {
        processingDispatch({ type: "SET_PROCESSING", payload: false });
        uiDispatch({ type: "SET_SHOW_SECURE_CHECKOUT", payload: true });
        onSecureCheckoutToggle?.(true);
        return;
      }
    } catch {
      trackPaymentEvent("payment_error", selectedPlan.id);
      formDispatch({
        type: "SET_ERRORS",
        payload: { general: t("paywall.errors.paymentError") },
      });
    } finally {
      processingDispatch({ type: "SET_PROCESSING", payload: false });
    }
  };

  const handleSecureCheckoutSuccess = () => {
    console.log(
      "handleSecureCheckoutSuccess called - navigating to success page"
    );
    uiDispatch({ type: "SET_SHOW_SECURE_CHECKOUT", payload: false });
    onSecureCheckoutToggle?.(false);
    // Navigate to payment success page on successful payment
    navigate(addLanguagePrefix("/payment/success", appState.language));
  };

  const handleSecureCheckoutCancel = () => {
    uiDispatch({ type: "SET_SHOW_SECURE_CHECKOUT", payload: false });
    onSecureCheckoutToggle?.(false);
    // Navigate to payment cancel page
    navigate(addLanguagePrefix("/payment/cancel", appState.language));
  };

  const handleSecureCheckoutError = (errorMessage?: string) => {
    uiDispatch({ type: "SET_SHOW_SECURE_CHECKOUT", payload: false });
    onSecureCheckoutToggle?.(false);
    // Log the error message for debugging
    console.log("Payment error:", errorMessage);
    // Navigate to payment failure page
    navigate(addLanguagePrefix("/payment/error", appState.language));
  };

  // Show 3D Secure checkout if needed
  if (uiState.showSecureCheckout && selectedPlan && formState.paymentInfo) {
    return (
      <SecureCheckout
        paymentInfo={formState.paymentInfo as PaymentInfo}
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
              {t("paywall.specialPrice")} {formatTime(processingState.timeLeft)}
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
            onMouseEnter={() =>
              uiDispatch({ type: "SET_SLIDER_PAUSED", payload: true })
            }
            onMouseLeave={() =>
              uiDispatch({ type: "SET_SLIDER_PAUSED", payload: false })
            }
          >
            {testimonials.length > 0 && (
              <motion.div
                key={uiState.currentTestimonialIndex}
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
                      backgroundImage: `url(${getTestimonialImage(testimonials[uiState.currentTestimonialIndex].beforeImage)})`,
                    }}
                  ></div>
                  <div
                    className="testimonial-image after-image"
                    style={{
                      backgroundImage: `url(${getTestimonialImage(testimonials[uiState.currentTestimonialIndex].afterImage)})`,
                    }}
                  ></div>
                  <div className="testimonial-name">
                    {(() => {
                      const fullName = String(
                        t(
                          `paywall.testimonials.names.${testimonials[uiState.currentTestimonialIndex].id}`,
                          testimonials[uiState.currentTestimonialIndex].name
                        )
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
                      {String(
                        t(
                          `paywall.testimonials.ratingTitles.${testimonials[uiState.currentTestimonialIndex].id}`,
                          testimonials[uiState.currentTestimonialIndex]
                            .ratingTitle
                        )
                      )}
                    </span>
                    <div className="stars">
                      {"★".repeat(
                        testimonials[uiState.currentTestimonialIndex].stars
                      )}
                    </div>
                  </div>
                  <p className="testimonial-text">
                    "
                    {String(
                      t(
                        `paywall.testimonials.texts.${testimonials[uiState.currentTestimonialIndex].id}`,
                        testimonials[uiState.currentTestimonialIndex].text
                      )
                    )}
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
                    index === uiState.currentTestimonialIndex ? "active" : ""
                  }`}
                  onClick={() =>
                    uiDispatch({
                      type: "SET_TESTIMONIAL_INDEX",
                      payload: index,
                    })
                  }
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
                formState.paymentInfo.paymentMethod === "card" ? "active" : ""
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
                {formState.paymentInfo.paymentMethod === "card" && (
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
                className={`input ${formState.errors.email ? "error" : ""}`}
                value={formState.paymentInfo.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="example@email.com"
              />
              {formState.errors.email && (
                <span className="error-message">{formState.errors.email}</span>
              )}
            </div>
          </div>

          {/* Card form - only show for card payment method */}
          {formState.paymentInfo.paymentMethod === "card" && (
            <div className="card-form">
              <div className="form-group">
                <label>{t("paywall.cardNumberLabel")}</label>
                <input
                  type="text"
                  className={`input ${formState.errors.cardNumber ? "error" : ""}`}
                  value={formState.paymentInfo.cardNumber || ""}
                  onChange={(e) =>
                    handleInputChange("cardNumber", e.target.value)
                  }
                  placeholder={t("paywall.cardNumber")}
                  maxLength={19}
                />
                {formState.errors.cardNumber && (
                  <span className="error-message">
                    {formState.errors.cardNumber}
                  </span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t("paywall.expiration")}</label>
                  <input
                    type="text"
                    className={`input ${formState.errors.expiration ? "error" : ""}`}
                    value={formState.expirationInput}
                    onChange={(e) =>
                      handleInputChange("expirationMonth", e.target.value)
                    }
                    placeholder={t("paywall.expirationPlaceholder")}
                    maxLength={5}
                  />
                  {formState.errors.expiration && (
                    <span className="error-message">
                      {formState.errors.expiration}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label>{t("paywall.cvc")}</label>
                  <input
                    type="text"
                    className={`input ${formState.errors.cvc ? "error" : ""}`}
                    value={formState.paymentInfo.cvc || ""}
                    onChange={(e) => handleInputChange("cvc", e.target.value)}
                    placeholder={t("paywall.cvcPlaceholder")}
                    maxLength={4}
                  />
                  {formState.errors.cvc && (
                    <span className="error-message">
                      {formState.errors.cvc}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>{t("paywall.country")}</label>
                <select
                  className="input"
                  value={formState.paymentInfo.country || ""}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                >
                  {countries.map((country) => (
                    <option key={country.id} value={country.id}>
                      {String(t(country.nameKey, country.id))}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="alternative-payments">
            <button
              className={`payment-method ${
                formState.paymentInfo.paymentMethod === "apple-pay"
                  ? "active"
                  : ""
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
                {formState.paymentInfo.paymentMethod === "apple-pay" && (
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
                formState.paymentInfo.paymentMethod === "paypal" ? "active" : ""
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
                {formState.paymentInfo.paymentMethod === "paypal" && (
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

        {formState.errors.general && (
          <motion.div
            className="error-message general-error"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
          >
            {formState.errors.general}
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
            disabled={!selectedPlan || processingState.isProcessing || loading}
          >
            {processingState.isProcessing || loading ? (
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
