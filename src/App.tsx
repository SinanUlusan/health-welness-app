import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
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
import { ErrorBoundary, Loading, ErrorFallback } from "./components";
import { SentryErrorBoundary, withSentryRouting } from "./services/sentry";
import { runAllSentryTests } from "./services/sentry-utils";
import "./App.css";

// Make Sentry test function globally available for testing
if (import.meta.env.DEV) {
  (
    window as unknown as { runAllSentryTests: typeof runAllSentryTests }
  ).runAllSentryTests = runAllSentryTests;
}

/**
 * Language Router component that handles language-based routing
 */
const LanguageRouter: React.FC = () => {
  const { appState } = useAppState();

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

export default App;
