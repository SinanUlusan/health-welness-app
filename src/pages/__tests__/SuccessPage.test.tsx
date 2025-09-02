import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { SuccessPage } from "../SuccessPage";

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
      currentStep: "success",
    },
    navigate: vi.fn(),
  }),
}));

vi.mock("../services/analytics", () => ({
  trackPageView: vi.fn(),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("SuccessPage", () => {
  it("should render success page", () => {
    renderWithRouter(<SuccessPage />);

    // Check if the page renders without crashing
    expect(screen.getByText("common.kompanion")).toBeInTheDocument();
  });

  it("should render success component", () => {
    renderWithRouter(<SuccessPage />);

    // Check if success content is rendered
    expect(screen.getByText("success.allSet")).toBeInTheDocument();
  });
});
