import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { Paywall } from "../components/Paywall";
import { useAppState } from "../hooks/useAppState";
import { addLanguagePrefix } from "../utils/urlUtils";
import { trackPageView } from "../services/analytics";

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
      <Paywall
        onPaymentComplete={handlePaymentComplete}
        loading={loading}
        onSecureCheckoutToggle={setShowSecureCheckout}
      />
    </>
  );
};
