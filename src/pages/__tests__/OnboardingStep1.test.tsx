import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { OnboardingStep1 } from "../OnboardingStep1";

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
      currentStep: "onboarding-step-1",
      onboardingData: {},
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

describe("OnboardingStep1 Page", () => {
  it("should render onboarding step 1 page", () => {
    renderWithRouter(<OnboardingStep1 />);

    // Check if the page renders without crashing
    expect(screen.getByText("common.kompanion")).toBeInTheDocument();
  });

  it("should render lunch selection component", () => {
    renderWithRouter(<OnboardingStep1 />);

    // Check if lunch selection content is rendered
    expect(screen.getByText("onboarding.lunchQuestion")).toBeInTheDocument();
  });

  it("should render next button", () => {
    renderWithRouter(<OnboardingStep1 />);

    // Check if next button is rendered
    expect(screen.getByText("common.next")).toBeInTheDocument();
  });
});
