import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  usePaymentForm,
  useWeightForm,
  useLunchForm,
  useEmailForm,
  useTextInputForm,
  useAgeForm,
  useHeightForm,
} from "../useFormValidation";

// Mock i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("Form Validation Hooks", () => {
  describe("usePaymentForm", () => {
    it("should initialize with default values", () => {
      const { result } = renderHook(() => usePaymentForm(vi.fn(), {}));

      expect(result.current.control).toBeDefined();
      expect(result.current.handleSubmit).toBeDefined();
      expect(result.current.formState).toBeDefined();
    });

    it("should initialize with provided values", () => {
      const initialValues = {
        email: "test@example.com",
        paymentMethod: "card" as const,
        cardNumber: "4242424242424242",
        expirationDate: "12/25",
        cvc: "123",
        cardholderName: "John Doe",
      };

      const { result } = renderHook(() =>
        usePaymentForm(vi.fn(), initialValues)
      );

      expect(result.current.control).toBeDefined();
      expect(result.current.formState).toBeDefined();
    });
  });

  describe("useWeightForm", () => {
    it("should initialize with default values", () => {
      const { result } = renderHook(() => useWeightForm(vi.fn(), {}));

      expect(result.current.control).toBeDefined();
      expect(result.current.handleSubmit).toBeDefined();
      expect(result.current.formState).toBeDefined();
    });

    it("should initialize with provided values", () => {
      const initialValues = {
        weight: 70,
        unit: "kg" as const,
      };

      const { result } = renderHook(() =>
        useWeightForm(vi.fn(), initialValues)
      );

      expect(result.current.control).toBeDefined();
      expect(result.current.formState).toBeDefined();
    });
  });

  describe("useLunchForm", () => {
    it("should initialize with default values", () => {
      const { result } = renderHook(() => useLunchForm());

      expect(result.current.control).toBeDefined();
      expect(result.current.handleSubmit).toBeDefined();
      expect(result.current.formState).toBeDefined();
    });

    it("should initialize with provided values", () => {
      const initialValues = {
        lunchType: "sandwiches" as const,
      };

      const { result } = renderHook(() => useLunchForm(initialValues));

      expect(result.current.control).toBeDefined();
      expect(result.current.formState).toBeDefined();
    });
  });

  describe("useEmailForm", () => {
    it("should initialize with default values", () => {
      const { result } = renderHook(() => useEmailForm(vi.fn(), {}));

      expect(result.current.control).toBeDefined();
      expect(result.current.handleSubmit).toBeDefined();
      expect(result.current.formState).toBeDefined();
    });

    it("should initialize with provided values", () => {
      const initialValues = {
        email: "test@example.com",
      };

      const { result } = renderHook(() => useEmailForm(vi.fn(), initialValues));

      expect(result.current.control).toBeDefined();
      expect(result.current.formState).toBeDefined();
    });
  });

  describe("useTextInputForm", () => {
    it("should initialize with default values", () => {
      const { result } = renderHook(() => useTextInputForm(vi.fn(), {}));

      expect(result.current.control).toBeDefined();
      expect(result.current.handleSubmit).toBeDefined();
      expect(result.current.formState).toBeDefined();
    });

    it("should initialize with provided values", () => {
      const initialValues = {
        value: "test value",
      };

      const { result } = renderHook(() =>
        useTextInputForm(vi.fn(), initialValues)
      );

      expect(result.current.control).toBeDefined();
      expect(result.current.formState).toBeDefined();
    });
  });

  describe("useAgeForm", () => {
    it("should initialize with default values", () => {
      const { result } = renderHook(() => useAgeForm(vi.fn(), {}));

      expect(result.current.control).toBeDefined();
      expect(result.current.handleSubmit).toBeDefined();
      expect(result.current.formState).toBeDefined();
    });

    it("should initialize with provided values", () => {
      const initialValues = {
        age: 25,
      };

      const { result } = renderHook(() => useAgeForm(vi.fn(), initialValues));

      expect(result.current.control).toBeDefined();
      expect(result.current.formState).toBeDefined();
    });
  });

  describe("useHeightForm", () => {
    it("should initialize with default values", () => {
      const { result } = renderHook(() => useHeightForm(vi.fn(), {}));

      expect(result.current.control).toBeDefined();
      expect(result.current.handleSubmit).toBeDefined();
      expect(result.current.formState).toBeDefined();
    });

    it("should initialize with provided values", () => {
      const initialValues = {
        height: 170,
        unit: "cm" as const,
      };

      const { result } = renderHook(() =>
        useHeightForm(vi.fn(), initialValues)
      );

      expect(result.current.control).toBeDefined();
      expect(result.current.formState).toBeDefined();
    });
  });
});
