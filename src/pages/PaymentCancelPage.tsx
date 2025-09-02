import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { trackPaymentEvent } from "../services/analytics";
import { useAppState } from "../hooks/useAppState";
import { addLanguagePrefix } from "../utils/urlUtils";

/**
 * Payment Cancel Page
 * Displays when user cancels payment and provides options to retry
 */
export const PaymentCancelPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { appState } = useAppState();

  useEffect(() => {
    // Track payment cancellation
    trackPaymentEvent("payment_cancelled", "user_action");
  }, []);

  const handleRetryPayment = () => {
    // Navigate back to paywall/payment page
    navigate(addLanguagePrefix("/paywall", appState.language));
  };

  const handleGoHome = () => {
    navigate(addLanguagePrefix("/", appState.language));
  };

  const handleContactSupport = () => {
    // You can implement support contact logic here
    window.open("mailto:support@yourapp.com?subject=Payment Issue", "_blank");
  };

  return (
    <div className="payment-status-page payment-cancel">
      <div className="container">
        <motion.div
          className="cancel-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Cancel Icon */}
          <motion.div
            className="cancel-icon"
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
              className="cancel-mark"
            >
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="#f59e0b"
                strokeWidth="4"
                fill="#fffbeb"
              />
              <motion.path
                d="M30 30L50 50M50 30L30 50"
                stroke="#f59e0b"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
            </svg>
          </motion.div>

          {/* Cancel Message */}
          <motion.div
            className="cancel-message"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h1 className="cancel-title">
              {t("payment.cancel.title", "Payment Cancelled")}
            </h1>
            <p className="cancel-description">
              {t(
                "payment.cancel.description",
                "Your payment was cancelled. No charges were made to your account."
              )}
            </p>
          </motion.div>

          {/* Information Box */}
          <motion.div
            className="info-box"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="info-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#3b82f6"
                  strokeWidth="2"
                />
                <path
                  d="M12 16v-4"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M12 8h.01"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="info-content">
              <h3>{t("payment.cancel.whatNext", "What happens next?")}</h3>
              <ul>
                <li>
                  {t("payment.cancel.noCharge", "No payment was processed")}
                </li>
                <li>
                  {t("payment.cancel.tryAgain", "You can try again anytime")}
                </li>
                <li>
                  {t(
                    "payment.cancel.support",
                    "Contact support if you need help"
                  )}
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="cancel-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <button className="btn btn-primary" onClick={handleRetryPayment}>
              {t("payment.cancel.retry", "Try Payment Again")}
            </button>

            <button className="btn btn-secondary" onClick={handleGoHome}>
              {t("payment.cancel.home", "Back to Home")}
            </button>

            <button className="btn btn-outline" onClick={handleContactSupport}>
              {t("payment.cancel.support", "Contact Support")}
            </button>
          </motion.div>

          {/* Reassurance Message */}
          <motion.div
            className="reassurance"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <p className="reassurance-text">
              {t(
                "payment.cancel.reassurance",
                "Your information is secure and we understand that sometimes you need to reconsider. Feel free to come back anytime!"
              )}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
