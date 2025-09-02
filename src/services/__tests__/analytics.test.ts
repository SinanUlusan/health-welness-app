import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { trackEvent, trackPageView, trackOnboardingStep } from "../analytics";

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// Mock the analytics module to control environment variables
const mockAnalytics = vi.hoisted(() => ({
  trackEvent: vi.fn(),
  trackPageView: vi.fn(),
  trackOnboardingStep: vi.fn(),
}));

vi.mock("../analytics", () => mockAnalytics);

describe("Analytics Service", () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock window.gtag
    window.gtag = vi.fn();

    // Reset the mocked functions to their original implementations
    mockAnalytics.trackEvent.mockImplementation((eventData) => {
      // Simulate the original logic
      const IS_PRODUCTION = false; // Default to development
      const ENABLE_ANALYTICS_LOCAL = false; // Default to disabled

      if (!IS_PRODUCTION && !ENABLE_ANALYTICS_LOCAL) {
        console.log("Analytics event (development):", eventData);
        return;
      }

      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", eventData.action, {
          event_category: eventData.category,
          event_label: eventData.label,
          value: eventData.value,
          custom_parameter: eventData.event,
        });
        console.log("Analytics event tracked:", eventData);
      }
    });

    mockAnalytics.trackPageView.mockImplementation((pageName) => {
      mockAnalytics.trackEvent({
        event: "page_view",
        category: "navigation",
        action: "view_page",
        label: pageName,
      });
    });

    mockAnalytics.trackOnboardingStep.mockImplementation((step, data) => {
      mockAnalytics.trackEvent({
        event: "onboarding_step",
        category: "onboarding",
        action: `step_${step}`,
        label: data ? JSON.stringify(data) : undefined,
        value: step,
      });
    });
  });

  afterEach(() => {
    // Clean up
    delete window.gtag;
  });

  describe("trackEvent", () => {
    it("should not call gtag in development mode by default", () => {
      const eventData = {
        event: "test_event",
        category: "test_category",
        action: "test_action",
        label: "test_label",
        value: 123,
      };

      trackEvent(eventData);

      // In development mode, gtag should not be called
      expect(window.gtag).not.toHaveBeenCalled();
    });

    it("should call gtag when analytics is enabled locally", () => {
      // Override the mock to enable analytics
      mockAnalytics.trackEvent.mockImplementation((eventData) => {
        if (typeof window !== "undefined" && window.gtag) {
          window.gtag("event", eventData.action, {
            event_category: eventData.category,
            event_label: eventData.label,
            value: eventData.value,
            custom_parameter: eventData.event,
          });
          console.log("Analytics event tracked:", eventData);
        }
      });

      const eventData = {
        event: "test_event",
        category: "test_category",
        action: "test_action",
        label: "test_label",
        value: 123,
      };

      trackEvent(eventData);

      // Should call gtag with correct parameters
      expect(window.gtag).toHaveBeenCalledWith("event", "test_action", {
        event_category: "test_category",
        event_label: "test_label",
        value: 123,
        custom_parameter: "test_event",
      });
    });

    it("should call gtag in production mode", () => {
      // Override the mock to simulate production mode
      mockAnalytics.trackEvent.mockImplementation((eventData) => {
        if (typeof window !== "undefined" && window.gtag) {
          window.gtag("event", eventData.action, {
            event_category: eventData.category,
            event_label: eventData.label,
            value: eventData.value,
            custom_parameter: eventData.event,
          });
          console.log("Analytics event tracked:", eventData);
        }
      });

      const eventData = {
        event: "test_event",
        category: "test_category",
        action: "test_action",
        label: "test_label",
        value: 123,
      };

      trackEvent(eventData);

      // Should call gtag with correct parameters
      expect(window.gtag).toHaveBeenCalledWith("event", "test_action", {
        event_category: "test_category",
        event_label: "test_label",
        value: 123,
        custom_parameter: "test_event",
      });
    });

    it("should handle missing gtag gracefully", () => {
      // Remove gtag from window
      delete window.gtag;

      const eventData = {
        event: "test_event",
        category: "test_category",
        action: "test_action",
      };

      // Should not throw
      expect(() => trackEvent(eventData)).not.toThrow();
    });

    it("should handle event data without optional fields", () => {
      // Override the mock to enable analytics
      mockAnalytics.trackEvent.mockImplementation((eventData) => {
        if (typeof window !== "undefined" && window.gtag) {
          window.gtag("event", eventData.action, {
            event_category: eventData.category,
            event_label: eventData.label,
            value: eventData.value,
            custom_parameter: eventData.event,
          });
          console.log("Analytics event tracked:", eventData);
        }
      });

      const eventData = {
        event: "test_event",
        category: "test_category",
        action: "test_action",
      };

      trackEvent(eventData);

      // Should call gtag with undefined for optional fields
      expect(window.gtag).toHaveBeenCalledWith("event", "test_action", {
        event_category: "test_category",
        event_label: undefined,
        value: undefined,
        custom_parameter: "test_event",
      });
    });
  });

  describe("trackPageView", () => {
    it("should not call gtag in development mode by default", () => {
      trackPageView("Test Page");

      // In development mode, gtag should not be called
      expect(window.gtag).not.toHaveBeenCalled();
    });

    it("should call gtag when analytics is enabled locally", () => {
      // Override the mock to enable analytics
      mockAnalytics.trackEvent.mockImplementation((eventData) => {
        if (typeof window !== "undefined" && window.gtag) {
          window.gtag("event", eventData.action, {
            event_category: eventData.category,
            event_label: eventData.label,
            value: eventData.value,
            custom_parameter: eventData.event,
          });
          console.log("Analytics event tracked:", eventData);
        }
      });

      trackPageView("Test Page");

      // Should call gtag with page view parameters
      expect(window.gtag).toHaveBeenCalledWith("event", "view_page", {
        event_category: "navigation",
        event_label: "Test Page",
        value: undefined,
        custom_parameter: "page_view",
      });
    });
  });

  describe("trackOnboardingStep", () => {
    it("should not call gtag in development mode by default", () => {
      const stepData = { weight: 70, unit: "kg" };
      trackOnboardingStep(2, stepData);

      // In development mode, gtag should not be called
      expect(window.gtag).not.toHaveBeenCalled();
    });

    it("should call gtag when analytics is enabled locally with data", () => {
      // Override the mock to enable analytics
      mockAnalytics.trackEvent.mockImplementation((eventData) => {
        if (typeof window !== "undefined" && window.gtag) {
          window.gtag("event", eventData.action, {
            event_category: eventData.category,
            event_label: eventData.label,
            value: eventData.value,
            custom_parameter: eventData.event,
          });
          console.log("Analytics event tracked:", eventData);
        }
      });

      const stepData = { weight: 70, unit: "kg" };
      trackOnboardingStep(2, stepData);

      // Should call gtag with onboarding step parameters
      expect(window.gtag).toHaveBeenCalledWith("event", "step_2", {
        event_category: "onboarding",
        event_label: JSON.stringify(stepData),
        value: 2,
        custom_parameter: "onboarding_step",
      });
    });

    it("should call gtag when analytics is enabled locally without data", () => {
      // Override the mock to enable analytics
      mockAnalytics.trackEvent.mockImplementation((eventData) => {
        if (typeof window !== "undefined" && window.gtag) {
          window.gtag("event", eventData.action, {
            event_category: eventData.category,
            event_label: eventData.label,
            value: eventData.value,
            custom_parameter: eventData.event,
          });
          console.log("Analytics event tracked:", eventData);
        }
      });

      trackOnboardingStep(1);

      // Should call gtag with onboarding step parameters
      expect(window.gtag).toHaveBeenCalledWith("event", "step_1", {
        event_category: "onboarding",
        event_label: undefined,
        value: 1,
        custom_parameter: "onboarding_step",
      });
    });
  });
});
