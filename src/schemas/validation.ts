import { z } from "zod";

// Validation schemas
export const paymentFormSchema = z
  .object({
    email: z.string().email("Invalid email format"),
    paymentMethod: z.enum(["card", "paypal", "apple_pay"]),
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
      message: "Card details are required for card payment method",
    }
  );

export const weightFormSchema = z.object({
  weight: z
    .number()
    .min(20, "Weight must be at least 20")
    .max(300, "Weight must be at most 300"),
  unit: z.enum(["kg", "lbs"]),
});

export const lunchFormSchema = z.object({
  lunchType: z.enum(["sandwiches", "soups", "fastfood", "other"]),
});

// Individual validation functions
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateCardNumber = (cardNumber: string): boolean => {
  // Luhn algorithm for card validation
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i]);

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

export const validateExpirationDate = (
  month: string,
  year: string
): boolean => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;

  const expMonth = parseInt(month);
  const expYear = parseInt(year);

  if (expMonth < 1 || expMonth > 12) return false;
  if (expYear < currentYear) return false;
  if (expYear === currentYear && expMonth < currentMonth) return false;

  return true;
};

export const validateCVC = (cvc: string): boolean => {
  const cvcRegex = /^\d{3,4}$/;
  return cvcRegex.test(cvc);
};

export const validateCardholderName = (name: string): boolean => {
  return name.length >= 2 && /^[a-zA-Z\s]+$/.test(name);
};

export const validateWeight = (weight: number): boolean => {
  return weight >= 20 && weight <= 300;
};

export const validateWeightUnit = (unit: string): boolean => {
  return unit === "kg" || unit === "lbs";
};

export const validateLunchType = (type: string): boolean => {
  return ["sandwiches", "soups", "fastfood", "other"].includes(type);
};

// Form validation helper types - these are just for TypeScript inference
export type WeightWithUnitFormData = z.infer<typeof weightFormSchema>;
export type PaymentFormData = z.infer<typeof paymentFormSchema>;
export type LunchSelectionFormData = z.infer<typeof lunchFormSchema>;

export type EmailFormData = z.infer<
  z.ZodType<{
    email: string;
  }>
>;

export type TextInputFormData = z.infer<
  z.ZodType<{
    value: string;
  }>
>;

export type AgeInputFormData = z.infer<
  z.ZodType<{
    age: number;
  }>
>;

export type HeightInputFormData = z.infer<
  z.ZodType<{
    height: number;
    unit: "cm" | "ft";
  }>
>;
