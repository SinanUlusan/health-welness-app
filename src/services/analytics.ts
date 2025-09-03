import type { AnalyticsEvent } from "../types";

// Google Analytics configuration
const GA_TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID;
const IS_PRODUCTION = import.meta.env.PROD;
const ENABLE_ANALYTICS_LOCAL =
  import.meta.env.VITE_ENABLE_ANALYTICS_LOCAL === "true";

/**
 * Initialize Google Analytics
 */
export const initializeAnalytics = (): void => {
  if (!IS_PRODUCTION && !ENABLE_ANALYTICS_LOCAL) {
    console.log("Google Analytics disabled in development mode");
    console.log(
      "To enable local testing, set VITE_ENABLE_ANALYTICS_LOCAL=true"
    );
    return;
  }

  // Check if GA is already initialized
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    return;
  }

  // Load Google Analytics script
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };

  window.gtag("js", new Date());
  window.gtag("config", GA_TRACKING_ID, {
    page_title: document.title,
    page_location: window.location.href,
    send_page_view: true,
    debug_mode: !IS_PRODUCTION,
  });

  console.log("Google Analytics initialized with ID:", GA_TRACKING_ID);
  if (!IS_PRODUCTION) {
    console.log(" Debug mode enabled - check browser console for GA events");
  }
};

/**
 * Track custom events
 */
export const trackEvent = (eventData: AnalyticsEvent): void => {
  if (!IS_PRODUCTION && !ENABLE_ANALYTICS_LOCAL) {
    console.log("Analytics event (development):", eventData);
    return;
  }

  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", eventData.action, {
      event_category: eventData.category,
      event_label: eventData.label,
      value: eventData.value,
      custom_parameter: eventData.event,
    });

    console.log("Analytics event tracked:", eventData);
  }
};

/**
 * Track page views
 */
export const trackPageView = (pageName: string): void => {
  trackEvent({
    event: "page_view",
    category: "navigation",
    action: "view_page",
    label: pageName,
  });
};

/**
 * Track onboarding steps
 */
export const trackOnboardingStep = (
  step: number,
  data?: Record<string, unknown>
): void => {
  trackEvent({
    event: "onboarding_step",
    category: "onboarding",
    action: `step_${step}`,
    label: data ? JSON.stringify(data) : undefined,
    value: step,
  });
};

/**
 * Track payment events
 */
export const trackPaymentEvent = (action: string, planId?: string): void => {
  trackEvent({
    event: "payment",
    category: "payment",
    action,
    label: planId,
  });
};

/**
 * Track user interactions
 */
export const trackUserInteraction = (element: string, action: string): void => {
  trackEvent({
    event: "user_interaction",
    category: "ui",
    action,
    label: element,
  });
};

/**
 * Track form submissions
 */
export const trackFormSubmission = (
  formName: string,
  success: boolean
): void => {
  trackEvent({
    event: "form_submission",
    category: "form",
    action: success ? "submit_success" : "submit_error",
    label: formName,
  });
};

/**
 * Track button clicks
 */
export const trackButtonClick = (buttonName: string, page?: string): void => {
  trackEvent({
    event: "button_click",
    category: "ui",
    action: "click",
    label: `${buttonName}${page ? `_${page}` : ""}`,
  });
};

/**
 * Track plan selection
 */
export const trackPlanSelection = (planId: string, planName: string): void => {
  trackEvent({
    event: "plan_selection",
    category: "subscription",
    action: "select_plan",
    label: `${planName} (${planId})`,
  });
};

/**
 * Track language change
 */
export const trackLanguageChange = (language: string): void => {
  trackEvent({
    event: "language_change",
    category: "settings",
    action: "change_language",
    label: language,
  });
};

/**
 * Track weight input
 */
export const trackWeightInput = (weight: number, unit: string): void => {
  trackEvent({
    event: "weight_input",
    category: "onboarding",
    action: "input_weight",
    label: `${weight}${unit}`,
    value: weight,
  });
};

/**
 * Track lunch type selection
 */
export const trackLunchSelection = (lunchType: string): void => {
  trackEvent({
    event: "lunch_selection",
    category: "onboarding",
    action: "select_lunch",
    label: lunchType,
  });
};

/**
 * Track payment method selection
 */
export const trackPaymentMethodSelection = (method: string): void => {
  trackEvent({
    event: "payment_method_selection",
    category: "payment",
    action: "select_method",
    label: method,
  });
};

/**
 * Track conversion events
 */
export const trackConversion = (
  conversionType: string,
  value?: number
): void => {
  trackEvent({
    event: "conversion",
    category: "conversion",
    action: conversionType,
    value,
  });
};
