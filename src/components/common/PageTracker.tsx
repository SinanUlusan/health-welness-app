import { useEffect } from "react";
import { trackPageView } from "../../services/analytics";

interface PageTrackerProps {
  eventKey: string;
  additionalData?: Record<string, unknown>;
}

/**
 * PageTracker component for automatic page view tracking
 * Returns null - only handles analytics tracking
 */
export const PageTracker = ({ eventKey, additionalData }: PageTrackerProps) => {
  useEffect(() => {
    trackPageView(eventKey);

    // Log additional data in development
    if (additionalData && import.meta.env.DEV) {
      console.log(`PageTracker: ${eventKey}`, additionalData);
    }
  }, [eventKey, additionalData]);

  return null;
};
