import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./i18n"; // Initialize i18n
import "./index.css";
import "./styles/payment-status.css";
import "./styles/stripe-form.css";
import { initializeAnalytics } from "./services/analytics";
import { initSentry } from "./services/sentry";

// Initialize Sentry
initSentry();

// Initialize Google Analytics
initializeAnalytics();

// ... existing code ...

// Get root element
const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element not found");
}

// Create root and render app
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
