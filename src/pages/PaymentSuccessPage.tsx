import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { handlePaymentCallback } from "../services/stripe";
import { trackPaymentEvent } from "../services/analytics";
import { useAppState } from "../hooks/useAppState";
import { addLanguagePrefix } from "../utils/urlUtils";

/**
 * Payment Success Page - Redirects to main Success Page
 * Handles payment callback and then redirects to the existing success page
 */
export const PaymentSuccessPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { appState } = useAppState();

  useEffect(() => {
    // Handle payment callback from Stripe
    const result = handlePaymentCallback();

    // Track successful payment
    if (result.status === "success") {
      trackPaymentEvent(
        "payment_completed",
        result.paymentIntentId || "unknown"
      );

      // Redirect to existing success page after short delay
      setTimeout(() => {
        navigate(addLanguagePrefix("/success", appState.language), {
          replace: true,
        });
      }, 1000);
    } else if (result.status === "cancel") {
      navigate(addLanguagePrefix("/payment/cancel", appState.language), {
        replace: true,
      });
    } else if (result.status === "error") {
      navigate(addLanguagePrefix("/payment/error", appState.language), {
        replace: true,
      });
    }
  }, [navigate, appState.language]);

  // Show loading while processing
  return (
    <div className="payment-status-page">
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>{t("payment.processing", "Processing payment result...")}</p>
      </div>
    </div>
  );
};
