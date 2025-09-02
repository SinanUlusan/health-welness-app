import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  trackPaymentEvent,
  trackUserInteraction,
} from "../../services/analytics";
import type { PaymentInfo, SubscriptionPlan } from "../../types";
import "./SecureCheckout.css";

interface SecureCheckoutProps {
  paymentInfo: PaymentInfo;
  plan: SubscriptionPlan;
  onSuccess: () => void;
  onCancel: () => void;
  onError: (error: string) => void;
}

/**
 * 3D Secure authentication simulation component
 */
export const SecureCheckout: React.FC<SecureCheckoutProps> = ({
  paymentInfo,
  plan,
  onSuccess,
  onCancel,
  onError,
}) => {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState<"loading" | "auth" | "processing">(
    "loading"
  );
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isInitialized, setIsInitialized] = useState(false);

  // Use refs to store timer IDs
  const loadTimerRef = useRef<NodeJS.Timeout | null>(null);
  const authTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check if current language is RTL
  const isRTL = i18n.language === "ar";

  // Function to get translated plan name
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

    return {
      name: t(nameKey, plan.name), // Fallback to original name if translation doesn't exist
    };
  };

  // Initialize component on first render
  const initializeComponent = () => {
    if (!isInitialized) {
      trackUserInteraction("secure_checkout", "page_load");
      setIsInitialized(true);

      // Start loading timer
      loadTimerRef.current = setTimeout(() => {
        setStep("auth");
        startAuthTimer();
      }, 2000);
    }
  };

  // Start auth timer function
  const startAuthTimer = () => {
    authTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          if (authTimerRef.current) {
            clearInterval(authTimerRef.current);
          }
          onCancel(); // Redirect to cancel page when timer expires
          return 0;
        }
        return newTime;
      });
    }, 1000);
  };

  // Cleanup function
  const cleanupTimers = () => {
    if (loadTimerRef.current) {
      clearTimeout(loadTimerRef.current);
      loadTimerRef.current = null;
    }
    if (authTimerRef.current) {
      clearInterval(authTimerRef.current);
      authTimerRef.current = null;
    }
  };

  // Initialize on first render
  if (!isInitialized) {
    initializeComponent();
  }

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password input
    if (!password.trim()) {
      setError(t("paywall.secureCheckout.passwordRequired"));
      trackPaymentEvent("validation_failed", "secure_checkout");
      return;
    }

    setStep("processing");
    setError("");
    trackPaymentEvent("processing_started", plan.id);

    // Clear timer when processing starts
    cleanupTimers();

    // Simulate 3D Secure processing
    try {
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, 3000);
      });

      // Simulate payment failure for demonstration
      // In a real app, this would be based on actual payment processing result
      const cardNumber = paymentInfo.cardNumber?.replace(/\s/g, "") || "";

      // Check if both card number and password are correct
      const isCorrectCard = cardNumber === "4242424242424242";
      const isCorrectPassword = password === "123456";

      // Payment should succeed only if both card and password are correct
      const shouldFailPayment = !(isCorrectCard && isCorrectPassword);

      if (shouldFailPayment) {
        // Payment failed - navigate to error page
        console.log("Payment failed - redirecting to error page");
        console.log("Card number:", cardNumber, "Password:", password);
        console.log(
          "Correct card:",
          isCorrectCard,
          "Correct password:",
          isCorrectPassword
        );
        trackPaymentEvent("payment_failed", "secure_checkout");
        onError(t("paywall.secureCheckout.paymentFailed"));
      } else {
        // Payment succeeded - navigate to success page
        console.log("Payment succeeded - redirecting to success page");
        console.log("Card number:", cardNumber, "Password:", password);
        trackPaymentEvent("payment_success", plan.id);
        onSuccess();
      }
    } catch {
      // Handle processing error
      trackPaymentEvent("processing_error", "secure_checkout");
      onError(t("paywall.secureCheckout.processingError"));
    }
  };

  const handleCancel = () => {
    cleanupTimers();
    onCancel();
  };

  const maskedCardNumber =
    paymentInfo.cardNumber?.replace(/\d(?=\d{4})/g, "*") || "";

  // Format amount based on plan type
  const formatAmount = () => {
    if (plan.isFree) {
      return "0$";
    }
    return `$${plan.price}${t("paywall.perWeek")}`;
  };

  if (step === "loading") {
    return (
      <div className="secure-checkout-container">
        <div className={`secure-checkout ${isRTL ? "rtl" : ""}`}>
          <div className="secure-header">
            <div className="bank-logo">🏦</div>
            <h2>{t("paywall.secureCheckout.redirecting")}</h2>
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "processing") {
    return (
      <div className="secure-checkout-container">
        <div className={`secure-checkout ${isRTL ? "rtl" : ""}`}>
          <div className="secure-header">
            <div className="bank-logo">🏦</div>
            <h2>{t("paywall.secureCheckout.processing")}</h2>
            <div className="loading-spinner"></div>
            <p>{t("paywall.secureCheckout.doNotClose")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="secure-checkout-container">
      <motion.div
        className={`secure-checkout ${isRTL ? "rtl" : ""}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="secure-header">
          <div className="bank-logo">🏦</div>
          <h2>{t("paywall.secureCheckout.authRequired")}</h2>
          <div className="timer">
            {t("paywall.secureCheckout.timeRemaining")} {formatTime(timeLeft)}
          </div>
        </div>

        <div className="transaction-details">
          <h3>{t("paywall.secureCheckout.transactionDetails")}</h3>
          <div className="detail-row">
            <span>{t("paywall.secureCheckout.merchant")}</span>
            <span>{t("paywall.secureCheckout.merchantName")}</span>
          </div>
          <div className="detail-row">
            <span>{t("paywall.secureCheckout.plan")}</span>
            <span>{getTranslatedPlanInfo(plan).name}</span>
          </div>
          <div className="detail-row">
            <span>{t("paywall.secureCheckout.amount")}</span>
            <span>{formatAmount()}</span>
          </div>
          <div className="detail-row">
            <span>{t("paywall.secureCheckout.card")}</span>
            <span>{maskedCardNumber}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="password">
              {t("paywall.secureCheckout.passwordLabel")}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("paywall.secureCheckout.passwordPlaceholder")}
              className={error ? "error" : ""}
              autoComplete="current-password"
            />
            {error && <span className="error-message">{error}</span>}
          </div>

          <div className="security-notice">
            {t("paywall.secureCheckout.securityNotice")}
          </div>

          <div className="button-group">
            <button type="button" onClick={handleCancel} className="btn-cancel">
              {t("paywall.secureCheckout.cancel")}
            </button>
            <button type="submit" className="btn-submit">
              {t("paywall.secureCheckout.authenticate")}
            </button>
          </div>
        </form>

        <div className="help-text">
          <p>{t("paywall.secureCheckout.helpText")}</p>
        </div>
      </motion.div>
    </div>
  );
};
