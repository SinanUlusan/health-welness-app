import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type {
  AppState,
  OnboardingData,
  PaymentInfo,
  SubscriptionPlan,
} from "../types";
import { apiService } from "../services/api";
import { trackOnboardingStep, trackPageView } from "../services/analytics";
import {
  getLanguageFromPath,
  removeLanguagePrefix,
  addLanguagePrefix,
} from "../utils/urlUtils";

const INITIAL_STATE: AppState = {
  currentStep: 1,
  onboardingData: {},
  paymentInfo: {},
  language: "en",
  direction: "ltr",
};

/**
 * Custom hook for managing application state
 * Handles persistence, navigation, and state synchronization
 */
export const useAppState = () => {
  const [appState, setAppState] = useState<AppState>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();

  /**
   * Load persisted state on mount and detect language from URL
   */
  useEffect(() => {
    const loadPersistedState = () => {
      try {
        const storedState = localStorage.getItem("app_state");
        const storedOnboarding = apiService.getStoredOnboardingData();

        // Detect language from URL
        const urlLanguage = getLanguageFromPath(location.pathname);

        if (storedState) {
          const parsedState = JSON.parse(storedState);
          setAppState((prev) => ({
            ...prev,
            ...parsedState,
            language: urlLanguage, // Override with URL language
            direction: urlLanguage === "ar" ? "rtl" : "ltr",
            onboardingData: storedOnboarding,
          }));
        } else if (Object.keys(storedOnboarding).length > 0) {
          setAppState((prev) => ({
            ...prev,
            language: urlLanguage,
            direction: urlLanguage === "ar" ? "rtl" : "ltr",
            onboardingData: storedOnboarding,
          }));
        } else {
          // No stored state, use URL language
          setAppState((prev) => ({
            ...prev,
            language: urlLanguage,
            direction: urlLanguage === "ar" ? "rtl" : "ltr",
          }));
        }
      } catch (err) {
        console.error("Failed to load persisted state:", err);
      }
    };

    loadPersistedState();
  }, [location.pathname]);

  /**
   * Persist state changes
   */
  useEffect(() => {
    localStorage.setItem("app_state", JSON.stringify(appState));
  }, [appState]);

  /**
   * Track page views when location changes and update current step
   */
  useEffect(() => {
    // Extract path without language prefix for tracking
    const pathWithoutLang = removeLanguagePrefix(location.pathname);
    const pageName = pathWithoutLang.replace("/", "") || "home";
    trackPageView(pageName);

    // Update current step based on current route
    let step = 1;
    if (pathWithoutLang === "/onboarding-2") step = 2;
    else if (pathWithoutLang === "/paywall") step = 3;
    else if (pathWithoutLang === "/success") step = 4;

    if (appState.currentStep !== step) {
      setAppState((prev) => ({
        ...prev,
        currentStep: step,
      }));
    }
  }, [location, appState.currentStep]);

  /**
   * Update onboarding data and advance to next step
   */
  const updateOnboardingData = useCallback(
    async (stepData: Partial<OnboardingData>): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiService.submitOnboardingStep(
          appState.currentStep,
          stepData
        );

        if (response.success) {
          setAppState((prev) => ({
            ...prev,
            onboardingData: { ...prev.onboardingData, ...stepData },
            currentStep: prev.currentStep + 1,
          }));

          trackOnboardingStep(appState.currentStep, stepData);
          return true;
        } else {
          setError(response.error || "Failed to save data");
          return false;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [appState.currentStep]
  );

  /**
   * Update payment information
   */
  const updatePaymentInfo = useCallback((paymentData: Partial<PaymentInfo>) => {
    setAppState((prev) => ({
      ...prev,
      paymentInfo: { ...prev.paymentInfo, ...paymentData },
    }));

    // Also store email separately for reliability
    if (paymentData.email) {
      localStorage.setItem("user_email", paymentData.email);
    }
  }, []);

  /**
   * Select subscription plan
   */
  const selectPlan = useCallback((plan: SubscriptionPlan) => {
    setAppState((prev) => ({
      ...prev,
      selectedPlan: plan,
    }));
  }, []);

  /**
   * Switch language and direction
   */
  const switchLanguage = useCallback(
    (language: "en" | "ar") => {
      const direction = language === "ar" ? "rtl" : "ltr";
      setAppState((prev) => ({
        ...prev,
        language,
        direction,
      }));

      // Update document direction
      document.documentElement.dir = direction;
      document.documentElement.lang = language;

      // Change i18n language
      i18n.changeLanguage(language);

      // Navigate to the same page but with new language prefix
      const currentPath = removeLanguagePrefix(location.pathname);
      const newPath = addLanguagePrefix(currentPath, language);
      navigate(newPath);
    },
    [i18n, location, navigate]
  );

  /**
   * Navigate to specific step with language prefix
   */
  const navigateToStep = useCallback(
    (step: number) => {
      setAppState((prev) => ({
        ...prev,
        currentStep: step,
      }));

      // Map steps to routes with language prefix
      const routes = ["", "/onboarding-2", "/paywall", "/success"];
      if (routes[step - 1] !== undefined) {
        const route = addLanguagePrefix(routes[step - 1], appState.language);
        navigate(route);
      }
    },
    [navigate, appState.language]
  );

  /**
   * Go to next step
   */
  const nextStep = useCallback(() => {
    const newStep = appState.currentStep + 1;
    navigateToStep(newStep);
  }, [appState.currentStep, navigateToStep]);

  /**
   * Go to previous step
   */
  const previousStep = useCallback(() => {
    if (appState.currentStep > 1) {
      const newStep = appState.currentStep - 1;
      navigateToStep(newStep);
    }
  }, [appState.currentStep, navigateToStep]);

  /**
   * Update onboarding data locally without API call
   */
  const updateOnboardingDataLocal = useCallback(
    (stepData: Partial<OnboardingData>) => {
      setAppState((prev) => ({
        ...prev,
        onboardingData: { ...prev.onboardingData, ...stepData },
      }));
    },
    []
  );

  /**
   * Reset application state
   */
  const resetState = useCallback(() => {
    apiService.clearStoredData();
    // Also clear the separate email storage
    localStorage.removeItem("user_email");
    setAppState(INITIAL_STATE);
    navigate(`/${appState.language}`);
  }, [navigate, appState.language]);

  return {
    appState,
    loading,
    error,
    updateOnboardingData,
    updateOnboardingDataLocal,
    updatePaymentInfo,
    selectPlan,
    switchLanguage,
    navigateToStep,
    nextStep,
    previousStep,
    resetState,
    setError,
  };
};
