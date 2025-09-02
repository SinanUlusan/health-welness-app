import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Success } from "../Success";

// Mock dependencies
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<"div">) => (
      <div {...props}>{children}</div>
    ),
    button: ({ children, ...props }: React.ComponentProps<"button">) => (
      <button {...props}>{children}</button>
    ),
  },
}));

vi.mock("../services/analytics", () => ({
  trackUserInteraction: vi.fn(),
}));

describe("Success Component", () => {
  it("should render success message", () => {
    render(<Success />);

    // Check if success content is rendered
    expect(screen.getByText("success.allSet")).toBeInTheDocument();
    expect(screen.getByText("success.planReady")).toBeInTheDocument();
  });

  it("should render success icon", () => {
    render(<Success />);

    const icon = screen.getByAltText("Success");
    expect(icon).toBeInTheDocument();
  });

  it("should render continue button", () => {
    render(<Success />);

    // Check if homepage button is rendered
    expect(screen.getByText("success.backToHome")).toBeInTheDocument();
  });
});
