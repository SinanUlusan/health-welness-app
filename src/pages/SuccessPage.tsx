import React, { useEffect } from "react";
import { Header } from "../components/Header";
import { Success } from "../components/Success";
import { useAppState } from "../hooks/useAppState";
import { trackPageView, trackConversion } from "../services/analytics";

/**
 * Success Page - Completion and Next Steps
 * Final page showing successful completion and download instructions
 */
export const SuccessPage: React.FC = () => {
  const { appState, resetState } = useAppState();

  // Track page view and conversion
  useEffect(() => {
    trackPageView("Success Page");
    trackConversion("onboarding_complete", 1);
  }, []);

  // Get email with multiple fallback mechanisms
  let userEmail = appState.paymentInfo.email;

  // Fallback 1: Try to get email from separate localStorage key
  if (!userEmail) {
    userEmail = localStorage.getItem("user_email") || undefined;
  }

  // Fallback 2: Try to get email from app_state localStorage if not available in appState
  if (!userEmail) {
    try {
      const storedState = localStorage.getItem("app_state");
      if (storedState) {
        const parsedState = JSON.parse(storedState);
        userEmail = parsedState.paymentInfo?.email;
      }
    } catch (error) {
      console.error("Failed to parse stored state:", error);
    }
  }

  const handleGoHome = () => {
    // Reset app state to start fresh and navigate to homepage
    resetState();
  };

  return (
    <>
      <Header />
      <Success userEmail={userEmail} onGoHome={handleGoHome} />
    </>
  );
};
