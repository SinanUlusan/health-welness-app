import React, { useState, useEffect, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Header, Paywall } from "../components";
import { useAppState } from "../hooks/useAppState";
import { addLanguagePrefix } from "../utils/urlUtils";
import { trackPageView } from "../services/analytics";

// Loading fallback component
const PaywallLoading: React.FC = () => (
  <div className="paywall-loading">
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>Loading subscription plans...</p>
    </div>
  </div>
);

/**
 * Paywall Page - Subscription and Payment
 * Displays pricing plans and handles payment processing
 */
export const PaywallPage: React.FC = () => {
  const navigate = useNavigate();
  const { loading, previousStep, appState } = useAppState();
  const [showSecureCheckout, setShowSecureCheckout] = useState(false);

  // Track page view
  useEffect(() => {
    trackPageView("Paywall Page");
  }, []);

  const handlePaymentComplete = () => {
    navigate(addLanguagePrefix("/success", appState.language));
  };

  const handleBack = () => {
    previousStep();
    navigate(addLanguagePrefix("/onboarding-2", appState.language));
  };

  return (
    <>
      {!showSecureCheckout && <Header showBack onBack={handleBack} />}
      <Suspense fallback={<PaywallLoading />}>
        <Paywall
          onPaymentComplete={handlePaymentComplete}
          loading={loading}
          onSecureCheckoutToggle={setShowSecureCheckout}
        />
      </Suspense>
    </>
  );
};
