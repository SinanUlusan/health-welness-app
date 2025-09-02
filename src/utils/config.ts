/**
 * Configuration utilities for environment-based settings
 */

/**
 * Get the appropriate base URL based on environment
 */
export const getBaseUrl = (): string => {
  // Check if we're in development (localhost) or production (Vercel)
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
    // In production, return an invalid URL to trigger fallback behavior
    // This will make the API service use its fallback methods instead of trying to call non-existent endpoints
    return "https://invalid-api-url-for-production";
  } else {
    // Fallback to localhost for other environments
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
