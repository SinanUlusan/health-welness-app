import * as Sentry from "@sentry/react";

// Sentry configuration
export const initSentry = () => {
  // Enable Sentry in production environment or when explicitly enabled
  if (
    import.meta.env.PROD ||
    import.meta.env.VITE_ENABLE_SENTRY_LOCAL === "true"
  ) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,

      // Performance monitoring
      tracesSampleRate: 0.2, // 20% sample rate

      // Error sampling
      replaysSessionSampleRate: 0.1, // 10% session replay
      replaysOnErrorSampleRate: 1.0, // 100% error replay

      // Environment information
      environment: import.meta.env.MODE,

      // Release information
      release: import.meta.env.VITE_APP_VERSION || "1.0.0",

      // Debug mode (in development)
      debug: import.meta.env.DEV,

      // Before send hook - filter sensitive information
      beforeSend(event) {
        // Clean sensitive information
        if (event.request?.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
        }

        // Clean sensitive parameters from URLs
        if (event.request?.url) {
          const url = new URL(event.request.url);
          url.searchParams.delete("token");
          url.searchParams.delete("api_key");
          event.request.url = url.toString();
        }

        return event;
      },
    });
  }
};

// Sentry wrapper for error boundary
export const SentryErrorBoundary = Sentry.ErrorBoundary;

// Performance monitoring exports
export const captureException = Sentry.captureException;
export const captureMessage = Sentry.captureMessage;
export const setUser = Sentry.setUser;
export const setTag = Sentry.setTag;
export const setExtra = Sentry.setExtra;

// Sentry wrapper for React Router
export const withSentryRouting = Sentry.withSentryReactRouterV6Routing;
