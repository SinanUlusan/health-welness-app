import { useEffect } from "react";
import {
  trackEvent,
  trackOnboardingStep,
  trackConversion,
  trackPageView,
} from "../../services/analytics";

interface EventTrackerProps {
  eventKey: string;
  eventType?: "page_view" | "onboarding_step" | "conversion" | "custom";
  additionalData?: Record<string, unknown>;
  stepNumber?: number;
  conversionType?: string;
  conversionValue?: number;
}

/**
 * EventTracker component for automatic event tracking
 * Returns null - only handles analytics tracking
 */
export const EventTracker = ({
  eventKey,
  eventType = "page_view",
  additionalData,
  stepNumber,
  conversionType,
  conversionValue,
}: EventTrackerProps) => {
  useEffect(() => {
    switch (eventType) {
      case "page_view":
        trackPageView(eventKey);
        break;

      case "onboarding_step":
        if (stepNumber) {
          trackOnboardingStep(stepNumber, additionalData);
        }
        break;

      case "conversion":
        if (conversionType) {
          trackConversion(conversionType, conversionValue);
        }
        break;

      case "custom":
        // For custom events, eventKey should be the action
        if (additionalData) {
          trackEvent({
            event: (additionalData.event as string) || "custom_event",
            category: (additionalData.category as string) || "custom",
            action: eventKey,
            label: additionalData.label as string,
            value: additionalData.value as number,
          });
        }
        break;
    }

    // Log in development
    if (import.meta.env.DEV) {
      console.log(`EventTracker: ${eventType} - ${eventKey}`, {
        additionalData,
        stepNumber,
        conversionType,
        conversionValue,
      });
    }
  }, [
    eventKey,
    eventType,
    additionalData,
    stepNumber,
    conversionType,
    conversionValue,
  ]);

  return null;
};
