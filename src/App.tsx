import React, { useEffect, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { OnboardingStep1 } from "./pages/OnboardingStep1";
import { OnboardingStep2 } from "./pages/OnboardingStep2";
import { PaywallPage } from "./pages/PaywallPage";
import { SuccessPage } from "./pages/SuccessPage";
import {
  PaymentSuccessPage,
  PaymentCancelPage,
  PaymentErrorPage,
} from "./pages";
import { useAppState } from "./hooks/useAppState";
import { initializeAnalytics, trackEvent } from "./services/analytics";
import {
  SentryErrorBoundary,
  captureException,
  withSentryRouting,
} from "./services/sentry";
import { runAllSentryTests } from "./services/sentry-utils";
import "./App.css";

// Make Sentry test function globally available for testing
if (import.meta.env.DEV) {
  (
    window as unknown as { runAllSentryTests: typeof runAllSentryTests }
  ).runAllSentryTests = runAllSentryTests;
}

/**
 * Loading component for Suspense fallback
 */
const Loading: React.FC = () => (
  <div className="loading-container">
    <div className="spinner" />
    <p>Loading...</p>
  </div>
);

/**
 * Error Boundary component for catching React errors
 */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);

    // Track error with analytics service
    trackEvent({
      event: "error_boundary",
      category: "error",
      action: "catch_error",
      label: error.message,
    });

    // Capture error with Sentry
    captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Oops! Something went wrong</h2>
          <p>
            We're sorry for the inconvenience. Please refresh the page and try
            again.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Language Router component that handles language-based routing
 */
const LanguageRouter: React.FC = () => {
  const { appState } = useAppState();
  const { i18n } = useTranslation();

  useEffect(() => {
    // Initialize analytics
    initializeAnalytics();
  }, []);

  useEffect(() => {
    // Set language and direction when appState changes
    document.documentElement.lang = appState.language;
    document.documentElement.dir = appState.direction;
    i18n.changeLanguage(appState.language);
  }, [appState.language, appState.direction, i18n]);

  return (
    <div className="app" dir={appState.direction}>
      <Suspense fallback={<Loading />}>
        <AnimatePresence mode="wait">
          <Routes>
            {/* Language-specific routes */}
            <Route path="/en" element={<OnboardingStep1 />} />
            <Route path="/en/onboarding-2" element={<OnboardingStep2 />} />
            <Route path="/en/paywall" element={<PaywallPage />} />
            <Route path="/en/success" element={<SuccessPage />} />
            <Route
              path="/en/payment/success"
              element={<PaymentSuccessPage />}
            />
            <Route path="/en/payment/cancel" element={<PaymentCancelPage />} />
            <Route path="/en/payment/error" element={<PaymentErrorPage />} />

            <Route path="/ar" element={<OnboardingStep1 />} />
            <Route path="/ar/onboarding-2" element={<OnboardingStep2 />} />
            <Route path="/ar/paywall" element={<PaywallPage />} />
            <Route path="/ar/success" element={<SuccessPage />} />
            <Route
              path="/ar/payment/success"
              element={<PaymentSuccessPage />}
            />
            <Route path="/ar/payment/cancel" element={<PaymentCancelPage />} />
            <Route path="/ar/payment/error" element={<PaymentErrorPage />} />

            {/* Legacy routes - redirect to current language */}
            <Route
              path="/"
              element={<Navigate to={`/${appState.language}`} replace />}
            />
            <Route
              path="/onboarding-2"
              element={
                <Navigate to={`/${appState.language}/onboarding-2`} replace />
              }
            />
            <Route
              path="/paywall"
              element={
                <Navigate to={`/${appState.language}/paywall`} replace />
              }
            />
            <Route
              path="/success"
              element={
                <Navigate to={`/${appState.language}/success`} replace />
              }
            />
            <Route
              path="/payment/success"
              element={
                <Navigate
                  to={`/${appState.language}/payment/success`}
                  replace
                />
              }
            />
            <Route
              path="/payment/cancel"
              element={
                <Navigate to={`/${appState.language}/payment/cancel`} replace />
              }
            />
            <Route
              path="/payment/error"
              element={
                <Navigate to={`/${appState.language}/payment/error`} replace />
              }
            />

            {/* Redirect unknown routes to current language home */}
            <Route
              path="*"
              element={<Navigate to={`/${appState.language}`} replace />}
            />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </div>
  );
};

/**
 * Main App component
 * Handles routing, internationalization, and global state management
 */
function App() {
  const SentryRouter = withSentryRouting(Router);

  return (
    <SentryErrorBoundary fallback={<ErrorFallback />}>
      <ErrorBoundary>
        <SentryRouter>
          <LanguageRouter />
        </SentryRouter>
      </ErrorBoundary>
    </SentryErrorBoundary>
  );
}

/**
 * Error fallback component for Sentry
 */
const ErrorFallback: React.FC = () => (
  <div className="error-boundary">
    <h2>Something went wrong</h2>
    <p>We've been notified and are working to fix the issue.</p>
    <button
      className="btn btn-primary"
      onClick={() => window.location.reload()}
    >
      Refresh Page
    </button>
  </div>
);

export default App;
