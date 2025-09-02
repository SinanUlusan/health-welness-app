/// <reference types="vite/client" />

// Google Analytics types
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

export {};
