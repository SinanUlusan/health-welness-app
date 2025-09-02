import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { handlePaymentCallback } from "../services/stripe";
import { trackPaymentEvent } from "../services/analytics";
import { useAppState } from "../hooks/useAppState";
import { addLanguagePrefix } from "../utils/urlUtils";

/**
 * Payment Error Page
 * Displays error messages and provides recovery options
 */
export const PaymentErrorPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { appState } = useAppState();
  const [errorInfo, setErrorInfo] = useState<{
    message?: string;
    code?: string;
  }>({});

  useEffect(() => {
    // Handle payment callback to get error details
    const result = handlePaymentCallback();
    if (result.status === "error") {
      setErrorInfo({
        message: result.message,
        code: "payment_failed",
      });

      // Track payment error
      trackPaymentEvent("payment_failed", result.message || "unknown_error");
    }
  }, []);

  const handleRetryPayment = () => {
    // Navigate back to paywall/payment page
    navigate(addLanguagePrefix("/paywall", appState.language));
  };

  const handleGoHome = () => {
    navigate(addLanguagePrefix("/", appState.language));
  };

  const handleContactSupport = () => {
    // Include error details in support email
    const subject = encodeURIComponent(t("payment.error.supportEmailSubject"));
    const errorMessage = errorInfo.message || t("payment.error.unknownError");
    const body = encodeURIComponent(
      t("payment.error.supportEmailBody")
        .replace("{error}", errorMessage)
        .replace("{time}", new Date().toISOString())
    );
    window.open(
      `mailto:support@yourapp.com?subject=${subject}&body=${body}`,
      "_blank"
    );
  };

  const getErrorSuggestions = (message?: string) => {
    const suggestions = [];

    if (!message) {
      return [
        t(
          "payment.error.suggestions.generic1",
          "Check your internet connection"
        ),
        t("payment.error.suggestions.generic2", "Try refreshing the page"),
        t(
          "payment.error.suggestions.generic3",
          "Contact support if the issue persists"
        ),
      ];
    }

    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("card") || lowerMessage.includes("declined")) {
      suggestions.push(
        t(
          "payment.error.suggestions.card1",
          "Check your card details are correct"
        ),
        t(
          "payment.error.suggestions.card2",
          "Ensure your card has sufficient funds"
        ),
        t("payment.error.suggestions.card3", "Try a different payment method")
      );
    } else if (
      lowerMessage.includes("network") ||
      lowerMessage.includes("connection")
    ) {
      suggestions.push(
        t(
          "payment.error.suggestions.network1",
          "Check your internet connection"
        ),
        t("payment.error.suggestions.network2", "Try again in a few moments"),
        t(
          "payment.error.suggestions.network3",
          "Switch to a different network if possible"
        )
      );
    } else {
      suggestions.push(
        t("payment.error.suggestions.generic1", "Try refreshing the page"),
        t("payment.error.suggestions.generic2", "Clear your browser cache"),
        t("payment.error.suggestions.generic3", "Try using a different browser")
      );
    }

    return suggestions;
  };

  return (
    <div className="payment-status-page payment-error">
      <div className="container">
        <motion.div
          className="error-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Error Icon */}
          <motion.div
            className="error-icon"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.2,
              type: "spring",
              stiffness: 200,
            }}
          >
            <svg
              width="80"
              height="80"
              viewBox="0 0 80 80"
              fill="none"
              className="error-mark"
            >
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="#ef4444"
                strokeWidth="4"
                fill="#fef2f2"
              />
              <motion.path
                d="M40 25v20"
                stroke="#ef4444"
                strokeWidth="4"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
              <motion.circle
                cx="40"
                cy="55"
                r="2"
                fill="#ef4444"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 1.2 }}
              />
            </svg>
          </motion.div>

          {/* Error Message */}
          <motion.div
            className="error-message error-message-payment-error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h1 className="error-title">
              {t("payment.error.title", "Payment Failed")}
            </h1>
            <p className="error-description">
              {t(
                "payment.error.description",
                "We encountered an issue processing your payment. Please try again."
              )}
            </p>
          </motion.div>

          {/* Error Details */}
          {errorInfo.message && (
            <motion.div
              className="error-details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="detail-box">
                <h3>{t("payment.error.details", "Error Details")}</h3>
                <p className="error-text">{t("payment.error.description")}</p>
                <p className="error-time">
                  {t("payment.error.time", "Time:")}{" "}
                  {new Date().toLocaleString()}
                </p>
              </div>
            </motion.div>
          )}

          {/* Suggestions */}
          <motion.div
            className="suggestions-box"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <div className="suggestions-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 12l2 2 4-4"
                  stroke="#22c55e"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.12 0 4.07.74 5.61 1.98"
                  stroke="#22c55e"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="suggestions-content">
              <h3>
                {t("payment.error.suggestions.title", "What you can try:")}
              </h3>
              <ul>
                {getErrorSuggestions(errorInfo.message).map(
                  (suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  )
                )}
              </ul>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="error-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <button className="btn btn-primary" onClick={handleRetryPayment}>
              {t("payment.error.retry", "Try Again")}
            </button>

            <button className="btn btn-secondary" onClick={handleGoHome}>
              {t("payment.error.home", "Back to Home")}
            </button>

            <button className="btn btn-outline" onClick={handleContactSupport}>
              {t("payment.error.support", "Contact Support")}
            </button>
          </motion.div>

          {/* Support Message */}
          <motion.div
            className="support-message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            <p className="support-text">
              {t(
                "payment.error.supportMessage",
                "If you continue to experience issues, our support team is here to help. We typically respond within 24 hours."
              )}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
