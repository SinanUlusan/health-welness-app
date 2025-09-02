import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Header } from "../Header";

// Mock dependencies
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: "en",
      changeLanguage: vi.fn(),
    },
  }),
}));

vi.mock("../../hooks/useAppState", () => ({
  useAppState: () => ({
    appState: {
      language: "en",
      direction: "ltr",
    },
    switchLanguage: vi.fn(),
    previousStep: vi.fn(),
  }),
}));

vi.mock("../../services/analytics", () => ({
  trackUserInteraction: vi.fn(),
  trackLanguageChange: vi.fn(),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("Header Component", () => {
  it("should render header with back button when showBack is true", () => {
    const mockOnBack = vi.fn();
    renderWithRouter(<Header showBack={true} onBack={mockOnBack} />);

    // Check if back button is rendered
    expect(screen.getByLabelText("common.back")).toBeInTheDocument();
  });

  it("should render header without back button when showBack is false", () => {
    renderWithRouter(<Header showBack={false} />);

    // Check if back button is not rendered
    expect(screen.queryByLabelText("common.back")).not.toBeInTheDocument();
  });

  it("should render language toggle button", () => {
    renderWithRouter(<Header />);

    // Check if language toggle is rendered
    expect(screen.getByLabelText("Switch to Arabic")).toBeInTheDocument();
  });
});
