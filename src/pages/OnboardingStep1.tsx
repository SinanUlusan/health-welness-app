import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { LunchSelection } from "../components/LunchSelection";
import { useAppState } from "../hooks/useAppState";
import { addLanguagePrefix } from "../utils/urlUtils";
import { trackPageView, trackOnboardingStep } from "../services/analytics";

/**
 * Onboarding Step 1 Page - Lunch Type Selection
 * First step in the user onboarding flow
 */
export const OnboardingStep1: React.FC = () => {
  const navigate = useNavigate();
  const { appState, updateOnboardingData, loading } = useAppState();
  const [selectedLunchType, setSelectedLunchType] = useState(
    appState.onboardingData.lunchType || ""
  );

  // Track page view and onboarding step
  useEffect(() => {
    trackPageView("Onboarding Step 1");
    trackOnboardingStep(1, { lunchType: selectedLunchType });
  }, [selectedLunchType]);

  const handleNext = async () => {
    if (selectedLunchType) {
      const success = await updateOnboardingData({
        lunchType: selectedLunchType,
      });

      if (success) {
        navigate(addLanguagePrefix("/onboarding-2", appState.language));
      }
    }
  };

  const handleLunchChange = (lunchType: string) => {
    // Only update local state, don't call updateOnboardingData yet
    setSelectedLunchType(lunchType);
  };

  return (
    <>
      <Header />
      <LunchSelection
        selectedLunch={selectedLunchType}
        onSelect={handleLunchChange}
        onNext={handleNext}
        loading={loading}
      />
    </>
  );
};
