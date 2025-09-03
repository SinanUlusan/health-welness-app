import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header, LunchSelection, EventTracker } from "../components";
import { useAppState } from "../hooks/useAppState";
import { addLanguagePrefix } from "../utils/urlUtils";

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
      <EventTracker eventKey="Onboarding Step 1" eventType="page_view" />
      <EventTracker
        eventKey="step_1"
        eventType="onboarding_step"
        stepNumber={1}
        additionalData={{ lunchType: selectedLunchType }}
      />
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
