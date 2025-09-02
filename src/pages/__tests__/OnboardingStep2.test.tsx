import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { OnboardingStep2 } from "../OnboardingStep2";

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
      currentStep: "onboarding-step-2",
      onboardingData: {
        lunchType: "light",
      },
    },
    updateOnboardingData: vi.fn(),
    navigate: vi.fn(),
  }),
}));

vi.mock("../services/analytics", () => ({
  trackPageView: vi.fn(),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("OnboardingStep2 Page", () => {
  it("should render onboarding step 2 page", () => {
    renderWithRouter(<OnboardingStep2 />);

    // Check if the page renders without crashing
    expect(screen.getByText("common.kompanion")).toBeInTheDocument();
  });

  it("should render weight input component", () => {
    renderWithRouter(<OnboardingStep2 />);

    // Check if weight input content is rendered
    expect(screen.getByText("onboarding.weightQuestion")).toBeInTheDocument();
  });

  it("should render next button", () => {
    renderWithRouter(<OnboardingStep2 />);

    // Check if continue button is rendered
    expect(screen.getByText("common.continue")).toBeInTheDocument();
  });
});
