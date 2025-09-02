import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { FormActions } from "../FormActions";
import { trackUserInteraction } from "../../../services/analytics";

// Mock analytics service
vi.mock("../../../services/analytics", () => ({
  trackUserInteraction: vi.fn(),
}));

// Mock i18n
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Test schema
const testSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

type TestFormData = z.infer<typeof testSchema>;

// Test wrapper component
const TestWrapper: React.FC<{
  defaultValues?: Partial<TestFormData>;
  onSubmit?: (data: TestFormData) => void;
  loading?: boolean;
  disabled?: boolean;
  buttonText?: string;
  trackingEvent?: string;
}> = ({
  defaultValues = {},
  onSubmit = vi.fn(),
  loading = false,
  disabled = false,
  buttonText,
  trackingEvent,
}) => {
  const form = useForm<TestFormData>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      name: "",
      email: "",
      ...defaultValues,
    },
    mode: "onChange",
  });

  return (
    <div>
      <input
        data-testid="name-input"
        {...form.register("name")}
        placeholder="Name"
      />
      <input
        data-testid="email-input"
        {...form.register("email")}
        placeholder="Email"
      />
      <FormActions
        form={form}
        onSubmit={onSubmit}
        loading={loading}
        disabled={disabled}
        buttonText={buttonText}
        trackingEvent={trackingEvent}
      />
    </div>
  );
};

describe("FormActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Button States", () => {
    it("should render button with default text", () => {
      render(<TestWrapper />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("common.next");
    });

    it("should render button with custom text", () => {
      render(<TestWrapper buttonText="Custom Button" />);

      const button = screen.getByRole("button");
      expect(button).toHaveTextContent("Custom Button");
    });

    it("should show loading spinner when loading", () => {
      render(<TestWrapper loading={true} />);

      const button = screen.getByRole("button");
      const spinner = button.querySelector(".spinner");
      expect(spinner).toBeInTheDocument();
    });

    it("should be disabled when form is invalid", () => {
      render(<TestWrapper />);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it("should be disabled when loading", () => {
      render(
        <TestWrapper
          loading={true}
          defaultValues={{ name: "Test", email: "test@test.com" }}
        />
      );

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it("should be disabled when explicitly disabled", () => {
      render(
        <TestWrapper
          disabled={true}
          defaultValues={{ name: "Test", email: "test@test.com" }}
        />
      );

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it("should be enabled when form is valid", async () => {
      render(
        <TestWrapper defaultValues={{ name: "Test", email: "test@test.com" }} />
      );

      const button = screen.getByRole("button");
      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe("Form Submission", () => {
    it("should call onSubmit when form is valid and button is clicked", async () => {
      const mockOnSubmit = vi.fn();
      render(
        <TestWrapper
          defaultValues={{ name: "Test", email: "test@test.com" }}
          onSubmit={mockOnSubmit}
        />
      );

      const button = screen.getByRole("button");
      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });

      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      });
    });

    it("should not call onSubmit when form is invalid", () => {
      const mockOnSubmit = vi.fn();
      render(<TestWrapper onSubmit={mockOnSubmit} />);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();

      fireEvent.click(button);
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("should track user interaction on form submission", async () => {
      const mockOnSubmit = vi.fn();
      render(
        <TestWrapper
          defaultValues={{ name: "Test", email: "test@test.com" }}
          onSubmit={mockOnSubmit}
          trackingEvent="test_event"
        />
      );

      const button = screen.getByRole("button");
      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });

      fireEvent.click(button);

      await waitFor(() => {
        expect(trackUserInteraction).toHaveBeenCalledWith(
          "test_event",
          "form_submit"
        );
      });
    });

    it("should use default tracking event when not provided", async () => {
      const mockOnSubmit = vi.fn();
      render(
        <TestWrapper
          defaultValues={{ name: "Test", email: "test@test.com" }}
          onSubmit={mockOnSubmit}
        />
      );

      const button = screen.getByRole("button");
      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });

      fireEvent.click(button);

      await waitFor(() => {
        expect(trackUserInteraction).toHaveBeenCalledWith(
          "next_button",
          "form_submit"
        );
      });
    });
  });

  describe("Form Validation", () => {
    it("should be disabled when form has validation errors", async () => {
      render(
        <TestWrapper defaultValues={{ name: "Test", email: "invalid-email" }} />
      );

      const button = screen.getByRole("button");
      await waitFor(() => {
        expect(button).toBeDisabled();
      });
    });

    it("should be enabled when form becomes valid", async () => {
      render(<TestWrapper />);

      const nameInput = screen.getByTestId("name-input");
      const emailInput = screen.getByTestId("email-input");
      const button = screen.getByRole("button");

      // Initially disabled
      expect(button).toBeDisabled();

      // Fill in valid data
      fireEvent.change(nameInput, { target: { value: "Test Name" } });
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });

      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper button role", () => {
      render(<TestWrapper />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("should have proper disabled state", () => {
      render(<TestWrapper />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("disabled");
    });
  });

  describe("Styling", () => {
    it("should apply disabled class when button is disabled", () => {
      render(<TestWrapper />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("disabled");
    });

    it("should not apply disabled class when button is enabled", async () => {
      render(
        <TestWrapper defaultValues={{ name: "Test", email: "test@test.com" }} />
      );

      const button = screen.getByRole("button");
      await waitFor(() => {
        expect(button).not.toHaveClass("disabled");
      });
    });

    it("should have proper CSS classes", () => {
      render(<TestWrapper />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("btn", "btn-primary", "next-button");
    });
  });
});
