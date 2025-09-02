import React, { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { WeightInput } from "../components/WeightInput";
import { useAppState } from "../hooks/useAppState";
import { addLanguagePrefix } from "../utils/urlUtils";
import { trackPageView, trackOnboardingStep } from "../services/analytics";

/**
 * Onboarding Step 2 Page - Weight Input
 * Second step in the user onboarding flow
 */
export const OnboardingStep2: React.FC = () => {
  const navigate = useNavigate();
  const {
    appState,
    updateOnboardingData,
    updateOnboardingDataLocal,
    loading,
    previousStep,
  } = useAppState();

  // Track page view and onboarding step
  useEffect(() => {
    trackPageView("Onboarding Step 2");
    trackOnboardingStep(2, {
      weight: appState.onboardingData.weight,
      weightUnit: appState.onboardingData.weightUnit,
    });
  }, [appState.onboardingData.weight, appState.onboardingData.weightUnit]);

  const handleWeightChange = useCallback(
    (weight: number, unit: "kg" | "lbs") => {
      // Only update if the values are actually different to prevent infinite loops
      if (
        appState.onboardingData.weight !== weight ||
        appState.onboardingData.weightUnit !== unit
      ) {
        updateOnboardingDataLocal({ weight, weightUnit: unit });
      }
    },
    [
      appState.onboardingData.weight,
      appState.onboardingData.weightUnit,
      updateOnboardingDataLocal,
    ]
  );

  const handleNext = async () => {
    // Send all onboarding data including lunchType from step 1
    const success = await updateOnboardingData({
      ...appState.onboardingData,
      weight: appState.onboardingData.weight,
      weightUnit: appState.onboardingData.weightUnit,
    });

    if (success) {
      navigate(addLanguagePrefix("/paywall", appState.language));
    }
  };

  const handleBack = () => {
    previousStep();
    navigate(addLanguagePrefix("/", appState.language));
  };

  return (
    <>
      <Header showBack onBack={handleBack} />
      <WeightInput
        weight={appState.onboardingData.weight}
        weightUnit={appState.onboardingData.weightUnit || "kg"}
        onWeightChange={handleWeightChange}
        onNext={handleNext}
        loading={loading}
      />
    </>
  );
};
