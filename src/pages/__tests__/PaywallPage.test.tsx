import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { PaywallPage } from "../PaywallPage";

// Mock dependencies
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("../hooks/useAppState", () => ({
  useAppState: () => ({
    appState: {
      language: "en",
      direction: "ltr",
      currentStep: "paywall",
      onboardingData: {
        lunchType: "light",
        weight: 70,
        weightUnit: "kg",
      },
    },
    updatePaymentInfo: vi.fn(),
    selectPlan: vi.fn(),
    navigate: vi.fn(),
  }),
}));

vi.mock("../services/analytics", () => ({
  trackPageView: vi.fn(),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("PaywallPage", () => {
  it("should render paywall page", () => {
    renderWithRouter(<PaywallPage />);

    // Check if the page renders without crashing
    expect(screen.getByText("common.kompanion")).toBeInTheDocument();
  });

  it("should render paywall component", () => {
    renderWithRouter(<PaywallPage />);

    // Check if paywall content is rendered
    expect(screen.getByText("paywall.now")).toBeInTheDocument();
  });
});
