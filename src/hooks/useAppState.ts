import { useReducer, useCallback, useRef, useMemo } from "react";
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

// Action types
type AppAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "INITIALIZE_STATE"; payload: Partial<AppState> }
  | { type: "UPDATE_ONBOARDING_DATA"; payload: Partial<OnboardingData> }
  | { type: "UPDATE_PAYMENT_INFO"; payload: Partial<PaymentInfo> }
  | { type: "SELECT_PLAN"; payload: SubscriptionPlan }
  | {
      type: "SWITCH_LANGUAGE";
      payload: { language: "en" | "ar"; direction: "ltr" | "rtl" };
    }
  | { type: "SET_CURRENT_STEP"; payload: number }
  | { type: "RESET_STATE" };

// Reducer function
const appReducer = (
  state: AppState & { loading: boolean; error: string | null },
  action: AppAction
) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "INITIALIZE_STATE":
      return { ...state, ...action.payload };

    case "UPDATE_ONBOARDING_DATA":
      return {
        ...state,
        onboardingData: { ...state.onboardingData, ...action.payload },
      };

    case "UPDATE_PAYMENT_INFO":
      return {
        ...state,
        paymentInfo: { ...state.paymentInfo, ...action.payload },
      };

    case "SELECT_PLAN":
      return { ...state, selectedPlan: action.payload };

    case "SWITCH_LANGUAGE":
      return {
        ...state,
        language: action.payload.language,
        direction: action.payload.direction,
      };

    case "SET_CURRENT_STEP":
      return { ...state, currentStep: action.payload };

    case "RESET_STATE":
      return { ...INITIAL_STATE, loading: false, error: null };

    default:
      return state;
  }
};

/**
 * Custom hook for managing application state using useReducer
 * Handles persistence, navigation, and state synchronization
 * FIXED: Removed all useEffect to prevent memory leaks and re-renders
 */
export const useAppState = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();
  const isInitialized = useRef(false);
  const prevPath = useRef(location.pathname);

  // Initialize state only once during first render
  const getInitialState = (): Partial<AppState> => {
    if (isInitialized.current) {
      return {};
    }

    try {
      const storedState = localStorage.getItem("app_state");
      const storedOnboarding = apiService.getStoredOnboardingData();
      const urlLanguage = getLanguageFromPath(location.pathname);

      let initialState: Partial<AppState> = {
        language: urlLanguage,
        direction: urlLanguage === "ar" ? "rtl" : "ltr",
      };

      if (storedState) {
        const parsedState = JSON.parse(storedState);
        initialState = { ...parsedState, ...initialState };
      }

      if (Object.keys(storedOnboarding).length > 0) {
        initialState.onboardingData = storedOnboarding;
      }

      isInitialized.current = true;
      return initialState;
    } catch (err) {
      console.error("Failed to load persisted state:", err);
      return {};
    }
  };

  const [state, dispatch] = useReducer(appReducer, {
    ...INITIAL_STATE,
    ...getInitialState(),
    loading: false,
    error: null,
  });

  // Track page view and update step when path changes - only when path actually changes
  useMemo(() => {
    if (prevPath.current !== location.pathname) {
      const pathWithoutLang = removeLanguagePrefix(location.pathname);
      const pageName = pathWithoutLang.replace("/", "") || "home";
      trackPageView(pageName);

      let step = 1;
      if (pathWithoutLang === "/onboarding-2") step = 2;
      else if (pathWithoutLang === "/paywall") step = 3;
      else if (pathWithoutLang === "/success") step = 4;

      if (state.currentStep !== step) {
        dispatch({ type: "SET_CURRENT_STEP", payload: step });
      }

      prevPath.current = location.pathname;
    }
  }, [location.pathname, state.currentStep]);

  /**

  /**
   * Update onboarding data and advance to next step
   */

  /**
   * Update onboarding data and advance to next step
   */
  const updateOnboardingData = useCallback(
    async (stepData: Partial<OnboardingData>): Promise<boolean> => {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      try {
        const response = await apiService.submitOnboardingStep(
          state.currentStep,
          stepData
        );

        if (response.success) {
          dispatch({ type: "UPDATE_ONBOARDING_DATA", payload: stepData });
          dispatch({
            type: "SET_CURRENT_STEP",
            payload: state.currentStep + 1,
          });

          trackOnboardingStep(state.currentStep, stepData);
          return true;
        } else {
          dispatch({
            type: "SET_ERROR",
            payload: response.error || "Failed to save data",
          });
          return false;
        }
      } catch (err) {
        dispatch({
          type: "SET_ERROR",
          payload: err instanceof Error ? err.message : "Unknown error",
        });
        return false;
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [state.currentStep]
  );

  /**
   * Update payment information
   */
  const updatePaymentInfo = useCallback((paymentData: Partial<PaymentInfo>) => {
    dispatch({ type: "UPDATE_PAYMENT_INFO", payload: paymentData });

    // Store email separately for reliability
    if (paymentData.email) {
      localStorage.setItem("user_email", paymentData.email);
    }
  }, []);

  /**
   * Select subscription plan
   */
  const selectPlan = useCallback((plan: SubscriptionPlan) => {
    dispatch({ type: "SELECT_PLAN", payload: plan });
  }, []);

  /**
   * Switch language and direction
   */
  const switchLanguage = useCallback(
    (language: "en" | "ar") => {
      const direction = language === "ar" ? "rtl" : "ltr";

      dispatch({ type: "SWITCH_LANGUAGE", payload: { language, direction } });

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
      dispatch({ type: "SET_CURRENT_STEP", payload: step });

      const routes = ["", "/onboarding-2", "/paywall", "/success"];
      if (routes[step - 1] !== undefined) {
        const route = addLanguagePrefix(routes[step - 1], state.language);
        navigate(route);
      }
    },
    [navigate, state.language]
  );

  /**
   * Go to next step
   */
  const nextStep = useCallback(() => {
    const newStep = state.currentStep + 1;
    navigateToStep(newStep);
  }, [state.currentStep, navigateToStep]);

  /**
   * Go to previous step
   */
  const previousStep = useCallback(() => {
    if (state.currentStep > 1) {
      const newStep = state.currentStep - 1;
      navigateToStep(newStep);
    }
  }, [state.currentStep, navigateToStep]);

  /**
   * Update onboarding data locally without API call
   */
  const updateOnboardingDataLocal = useCallback(
    (stepData: Partial<OnboardingData>) => {
      dispatch({ type: "UPDATE_ONBOARDING_DATA", payload: stepData });
    },
    []
  );

  /**
   * Reset application state
   */
  const resetState = useCallback(() => {
    apiService.clearStoredData();
    localStorage.removeItem("user_email");
    dispatch({ type: "RESET_STATE" });
    isInitialized.current = false;
    navigate(`/${state.language}`);
  }, [navigate, state.language]);

  /**
   * Set error manually
   */
  const setError = useCallback((error: string | null) => {
    dispatch({ type: "SET_ERROR", payload: error });
  }, []);

  return {
    appState: state,
    loading: state.loading,
    error: state.error,
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
