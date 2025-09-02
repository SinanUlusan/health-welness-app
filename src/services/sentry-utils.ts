import {
  captureException,
  captureMessage,
  setUser,
  setTag,
  setExtra,
} from "../services/sentry";

/**
 * Sentry test functions
 * These functions are used to test if Sentry is working in development environment
 */

// Send test error
export const testSentryError = () => {
  try {
    throw new Error("Test Sentry Error - This is a test error");
  } catch (error) {
    captureException(error as Error, {
      tags: {
        test: "sentry_error",
        environment: "development",
      },
      extra: {
        testData: "This is test data",
        timestamp: new Date().toISOString(),
      },
    });
  }
};

// Send test message
export const testSentryMessage = (message: string) => {
  captureMessage(message, {
    level: "info",
    tags: {
      test: "sentry_message",
      environment: "development",
    },
  });
};

// Set test user information
export const testSentryUser = (userId: string, email?: string) => {
  setUser({
    id: userId,
    email: email || "test@example.com",
    username: `test_user_${userId}`,
  });
};

// Set test tag
export const testSentryTag = (key: string, value: string) => {
  setTag(key, value);
};

// Set test extra data
export const testSentryExtra = (key: string, value: unknown) => {
  setExtra(key, value as Record<string, unknown>);
};

// Run all Sentry tests for test panel
export const runAllSentryTests = () => {
  console.log("Starting Sentry tests...");

  // Test user
  testSentryUser("test_user_123", "test@example.com");

  // Test tags
  testSentryTag("test_category", "sentry_integration");
  testSentryTag("test_environment", "development");

  // Test extra data
  testSentryExtra("test_config", {
    version: "1.0.0",
    environment: "development",
    timestamp: new Date().toISOString(),
  });

  // Test message
  testSentryMessage("Sentry integration successfully tested");

  // Test error (last)
  setTimeout(() => {
    testSentryError();
  }, 1000);

  console.log("Sentry tests completed. Check Sentry dashboard.");
};
