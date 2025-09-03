/**
 * Configuration utilities for environment-based settings
 */

/**
 * Get the appropriate base URL based on environment
 */
export const getBaseUrl = (): string => {
  const isDevelopment =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.includes("localhost");

  const isProduction =
    window.location.hostname === "health-welness-app.vercel.app" ||
    window.location.hostname.includes("vercel.app");

  if (isDevelopment) {
    return "http://localhost:3001";
  } else if (isProduction) {
    // Use the same domain for API calls in production
    return window.location.origin;
  } else {
    return "http://localhost:3001";
  }
};

/**
 * Check if we're running in development mode
 */
export const isDevelopment = (): boolean => {
  return (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.includes("localhost")
  );
};

/**
 * Check if we're running in production mode
 */
export const isProduction = (): boolean => {
  return (
    window.location.hostname === "health-welness-app.vercel.app" ||
    window.location.hostname.includes("vercel.app")
  );
};
