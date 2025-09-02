import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  type WeightWithUnitFormData,
  type EmailFormData,
  type PaymentFormData,
  type LunchSelectionFormData,
  type TextInputFormData,
  type AgeInputFormData,
  type HeightInputFormData,
  lunchFormSchema,
} from "../schemas/validation";

/**
 * Luhn algorithm implementation for credit card validation
 */
const luhnCheck = (cardNumber: string): boolean => {
  let sum = 0;
  let isEven = false;

  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

/**
 * Custom Zod refinement for credit card validation
 */
const creditCardRefinement = (cardNumber: string) => {
  const cleanNumber = cardNumber.replace(/\D/g, "");

  if (cleanNumber.length < 13 || cleanNumber.length > 19) {
    return false;
  }

  // Test card number is always valid
  if (cleanNumber === "4242424242424242") {
    return true;
  }

  return luhnCheck(cleanNumber);
};

/**
 * Custom Zod refinement for expiration date validation
 */
const expirationDateRefinement = (expiration: string) => {
  const [month, year] = expiration.split("/");
  const monthNum = parseInt(month);
  const yearNum = parseInt(year);

  if (monthNum < 1 || monthNum > 12) {
    return false;
  }

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
  const currentMonth = currentDate.getMonth() + 1;

  if (yearNum < currentYear) {
    return false;
  }

  if (yearNum === currentYear && monthNum < currentMonth) {
    return false;
  }

  return true;
};

/**
 * Hook for weight input form validation
 */
export const useWeightForm = (
  t: (key: string) => string,
  defaultValues?: Partial<WeightWithUnitFormData>
) => {
  const weightWithUnitSchema = z
    .object({
      weight: z.number().min(1, t("paywall.validation.weightGreaterThanZero")),
      unit: z.enum(["kg", "lbs"]),
    })
    .refine(
      (data) => {
        if (data.unit === "kg") {
          return data.weight >= 20 && data.weight <= 300;
        } else {
          return data.weight >= 44 && data.weight <= 660;
        }
      },
      {
        message: t("paywall.validation.validWeightForUnit"),
        path: ["weight"],
      }
    );

  return useForm<WeightWithUnitFormData>({
    resolver: zodResolver(weightWithUnitSchema),
    defaultValues: {
      weight: defaultValues?.weight || 0,
      unit: defaultValues?.unit || "kg",
    },
    mode: "onChange", // Validate on change for immediate feedback
  });
};

/**
 * Hook for email form validation
 */
export const useEmailForm = (
  t: (key: string) => string,
  defaultValues?: Partial<EmailFormData>
) => {
  const emailSchema = z.object({
    email: z
      .string()
      .min(1, t("paywall.validation.emailRequired"))
      .email(t("paywall.validation.validEmail"))
      .transform((email) => email.trim().toLowerCase()),
  });

  return useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: defaultValues?.email || "",
    },
    mode: "onChange",
  });
};

/**
 * Hook for payment form validation
 */
export const usePaymentForm = (
  t: (key: string) => string,
  defaultValues?: Partial<PaymentFormData>
) => {
  const paymentFormSchema = z
    .object({
      email: z
        .string()
        .min(1, t("paywall.validation.emailRequired"))
        .email(t("paywall.validation.validEmail"))
        .transform((email) => email.trim().toLowerCase()),
      paymentMethod: z.enum(["card", "paypal", "apple_pay"]),
      // Card details are optional but validated when paymentMethod is "card"
      cardNumber: z.string().optional(),
      expirationDate: z.string().optional(),
      cvc: z.string().optional(),
      cardholderName: z.string().optional(),
    })
    .refine(
      (data) => {
        if (data.paymentMethod === "card") {
          return (
            data.cardNumber &&
            data.expirationDate &&
            data.cvc &&
            data.cardholderName
          );
        }
        return true;
      },
      {
        message: t("paywall.validation.allCardDetailsRequired"),
        path: ["cardNumber"],
      }
    )
    .refine(
      (data) => {
        if (data.paymentMethod === "card" && data.cardNumber) {
          return creditCardRefinement(data.cardNumber);
        }
        return true;
      },
      {
        message: t("paywall.validation.validCardNumber"),
        path: ["cardNumber"],
      }
    )
    .refine(
      (data) => {
        if (data.paymentMethod === "card" && data.expirationDate) {
          return (
            /^\d{2}\/\d{2}$/.test(data.expirationDate) &&
            expirationDateRefinement(data.expirationDate)
          );
        }
        return true;
      },
      {
        message: t("paywall.validation.validExpiration"),
        path: ["expirationDate"],
      }
    )
    .refine(
      (data) => {
        if (data.paymentMethod === "card" && data.cvc) {
          const cleanCVC = data.cvc.replace(/\D/g, "");
          return cleanCVC.length >= 3 && cleanCVC.length <= 4;
        }
        return true;
      },
      {
        message: t("paywall.validation.cvcLength"),
        path: ["cvc"],
      }
    );

  return useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      email: defaultValues?.email || "",
      paymentMethod: defaultValues?.paymentMethod || "card",
      cardNumber: defaultValues?.cardNumber || "",
      expirationDate: defaultValues?.expirationDate || "",
      cvc: defaultValues?.cvc || "",
      cardholderName: defaultValues?.cardholderName || "",
    },
    mode: "onChange",
  });
};

/**
 * Hook for lunch selection form validation
 */
export const useLunchForm = (
  defaultValues?: Partial<LunchSelectionFormData>
) => {
  return useForm<LunchSelectionFormData>({
    resolver: zodResolver(lunchFormSchema),
    defaultValues: {
      lunchType: defaultValues?.lunchType || undefined,
    },
    mode: "onChange",
  });
};

/**
 * Hook for text input form validation
 */
export const useTextInputForm = (
  t: (key: string) => string,
  defaultValues?: Partial<TextInputFormData>
) => {
  const textInputSchema = z.object({
    value: z
      .string()
      .min(1, t("paywall.validation.fieldRequired"))
      .transform((value) => value.trim())
      .refine((value) => value.length > 0, {
        message: t("paywall.validation.fieldCannotBeEmpty"),
      }),
  });

  return useForm<TextInputFormData>({
    resolver: zodResolver(textInputSchema),
    defaultValues: {
      value: defaultValues?.value || "",
    },
    mode: "onChange",
  });
};

/**
 * Hook for age input form validation
 */
export const useAgeForm = (
  t: (key: string) => string,
  defaultValues?: Partial<AgeInputFormData>
) => {
  const ageInputSchema = z.object({
    age: z
      .number()
      .min(13, t("paywall.validation.ageMinimum"))
      .max(120, t("paywall.validation.ageMaximum"))
      .int(t("paywall.validation.ageWholeNumber")),
  });

  return useForm<AgeInputFormData>({
    resolver: zodResolver(ageInputSchema),
    defaultValues: {
      age: defaultValues?.age || 0,
    },
    mode: "onChange",
  });
};

/**
 * Hook for height input form validation
 */
export const useHeightForm = (
  t: (key: string) => string,
  defaultValues?: Partial<HeightInputFormData>
) => {
  const heightInputSchema = z
    .object({
      height: z.number().min(1, t("paywall.validation.heightGreaterThanZero")),
      unit: z.enum(["cm", "ft"]),
    })
    .refine(
      (data) => {
        if (data.unit === "cm") {
          return data.height >= 100 && data.height <= 250;
        } else {
          // For feet, we'll expect decimal values (e.g., 5.5 for 5'6")
          return data.height >= 3 && data.height <= 8;
        }
      },
      {
        message: t("paywall.validation.validHeightForUnit"),
        path: ["height"],
      }
    );

  return useForm<HeightInputFormData>({
    resolver: zodResolver(heightInputSchema),
    defaultValues: {
      height: defaultValues?.height || 0,
      unit: defaultValues?.unit || "cm",
    },
    mode: "onChange",
  });
};

/**
 * Hook for form field formatting utilities
 */
export const useFormFormatters = () => {
  const formatCardNumber = (value: string): string => {
    const cleanNumber = value.replace(/\D/g, "");
    const groups = cleanNumber.match(/.{1,4}/g) || [];
    return groups.join(" ").substring(0, 19); // Max 16 digits + 3 spaces
  };

  const formatExpirationDate = (value: string): string => {
    const cleanValue = value.replace(/\D/g, "");
    if (cleanValue.length >= 2) {
      return `${cleanValue.substring(0, 2)}/${cleanValue.substring(2, 4)}`;
    }
    return cleanValue;
  };

  const formatCVC = (value: string): string => {
    return value.replace(/\D/g, "").substring(0, 4);
  };

  const formatWeight = (value: string): string => {
    const cleanValue = value.replace(/\D/g, "");
    return cleanValue.substring(0, 3); // Max 3 digits
  };

  const formatCardholderName = (value: string): string => {
    return value.replace(/[^a-zA-Z\s]/g, "").substring(0, 50);
  };

  return {
    formatCardNumber,
    formatExpirationDate,
    formatCVC,
    formatWeight,
    formatCardholderName,
  };
};

/**
 * Hook for form validation states and helpers
 */
export const useFormHelpers = () => {
  const getFieldError = (
    errors: Record<string, { message?: string }>,
    fieldName: string
  ): string | undefined => {
    return errors[fieldName]?.message;
  };

  const hasFieldError = (
    errors: Record<string, unknown>,
    fieldName: string
  ): boolean => {
    return !!errors[fieldName];
  };

  const isFieldTouched = (
    touchedFields: Record<string, boolean>,
    fieldName: string
  ): boolean => {
    return !!touchedFields[fieldName];
  };

  const getFieldClasses = (
    errors: Record<string, unknown>,
    touchedFields: Record<string, boolean>,
    fieldName: string,
    baseClass: string = "input"
  ): string => {
    const hasError = hasFieldError(errors, fieldName);
    const isTouched = isFieldTouched(touchedFields, fieldName);

    let classes = baseClass;
    if (hasError) {
      classes += " error";
    } else if (isTouched) {
      classes += " valid";
    }

    return classes;
  };

  return {
    getFieldError,
    hasFieldError,
    isFieldTouched,
    getFieldClasses,
  };
};
