import React from "react";
import { Header, Success, EventTracker } from "../components";
import { useAppState } from "../hooks/useAppState";

/**
 * Success Page - Completion and Next Steps
 * Final page showing successful completion and download instructions
 */
export const SuccessPage: React.FC = () => {
  const { appState, resetState } = useAppState();

  // Get email with multiple fallback mechanisms

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
      <EventTracker eventKey="Success Page" eventType="page_view" />
      <EventTracker
        eventKey="onboarding_complete"
        eventType="conversion"
        conversionType="onboarding_complete"
        conversionValue={1}
      />
      <Header />
      <Success userEmail={userEmail} onGoHome={handleGoHome} />
    </>
  );
};
