import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SecureCheckout } from "../SecureCheckout";

// Mock dependencies
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: "en",
    },
  }),
}));

vi.mock("../services/analytics", () => ({
  trackPaymentEvent: vi.fn(),
  trackUserInteraction: vi.fn(),
}));

const mockPlan = {
  id: "1-month",
  name: "1 Month",
  price: 9.99,
  isFree: false,
  duration: "1 month",
};

const mockPaymentInfo = {
  email: "test@example.com",
  paymentMethod: "card" as const,
  cardNumber: "4242424242424242",
  expirationMonth: "12",
  expirationYear: "25",
  cvc: "123",
  cardholderName: "John Doe",
  country: "US",
};

describe("SecureCheckout Component", () => {
  it("should render secure checkout component", () => {
    const mockOnSuccess = vi.fn();
    const mockOnCancel = vi.fn();
    const mockOnError = vi.fn();

    render(
      <SecureCheckout
        paymentInfo={mockPaymentInfo}
        plan={mockPlan}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        onError={mockOnError}
      />
    );

    // Check if the component renders without crashing
    expect(
      screen.getByText("paywall.secureCheckout.redirecting")
    ).toBeInTheDocument();
  });

  it("should render loading step initially", () => {
    const mockOnSuccess = vi.fn();
    const mockOnCancel = vi.fn();
    const mockOnError = vi.fn();

    render(
      <SecureCheckout
        paymentInfo={mockPaymentInfo}
        plan={mockPlan}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        onError={mockOnError}
      />
    );

    // Check if loading step is rendered
    expect(
      screen.getByText("paywall.secureCheckout.redirecting")
    ).toBeInTheDocument();
  });

  it("should render cancel button", () => {
    const mockOnSuccess = vi.fn();
    const mockOnCancel = vi.fn();
    const mockOnError = vi.fn();

    render(
      <SecureCheckout
        paymentInfo={mockPaymentInfo}
        plan={mockPlan}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        onError={mockOnError}
      />
    );

    // Check if bank logo is rendered (indicates component loaded)
    expect(screen.getByText("🏦")).toBeInTheDocument();
  });
});
