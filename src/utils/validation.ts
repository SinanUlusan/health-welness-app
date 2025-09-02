/**
 * Validation utilities for form inputs and data
 */

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validate credit card number using Luhn algorithm
 */
export const validateCardNumber = (cardNumber: string): boolean => {
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
 * Luhn algorithm implementation
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
 * Validate CVC code
 */
export const validateCVC = (cvc: string): boolean => {
  const cleanCVC = cvc.replace(/\D/g, "");
  return cleanCVC.length >= 3 && cleanCVC.length <= 4;
};

/**
 * Validate expiration date
 */
export const validateExpirationDate = (
  month: string,
  year: string
): boolean => {
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
 * Validate weight input
 */
export const validateWeight = (weight: number, unit: "kg" | "lbs"): boolean => {
  if (weight <= 0) {
    return false;
  }

  // Reasonable weight ranges
  if (unit === "kg") {
    return weight >= 20 && weight <= 300;
  } else {
    return weight >= 44 && weight <= 660; // lbs equivalent
  }
};

/**
 * Format card number with spaces
 */
export const formatCardNumber = (cardNumber: string): string => {
  const cleanNumber = cardNumber.replace(/\D/g, "");
  const groups = cleanNumber.match(/.{1,4}/g) || [];
  return groups.join(" ").substr(0, 19); // Max 16 digits + 3 spaces
};

/**
 * Format expiration date as MM/YY with smart month validation
 * Now handles backspace/deletion properly
 */
export const formatExpirationDate = (
  value: string,
  previousValue: string = ""
): string => {
  // Remove all non-digits
  const cleanValue = value.replace(/\D/g, "");
  const previousCleanValue = previousValue.replace(/\D/g, "");

  // Check if user is deleting (current length < previous length)
  const isDeleting = cleanValue.length < previousCleanValue.length;

  if (cleanValue.length === 0) {
    return "";
  }

  if (cleanValue.length === 1) {
    const digit = parseInt(cleanValue[0]);
    // If user types 2-9, auto-complete to 02-09 and add slash (but not when deleting)
    if (digit > 1 && !isDeleting) {
      return `0${digit}/`;
    }
    return cleanValue;
  }

  if (cleanValue.length === 2) {
    let month = cleanValue;
    const monthNum = parseInt(month);

    // Validate month
    if (monthNum > 12) {
      // If > 12, use first digit as month with 0 prefix, second digit starts year
      month = `0${cleanValue[0]}`;
      return `${month}/${cleanValue[1]}`;
    }

    if (monthNum === 0) {
      month = "01";
    }

    // Only auto-add slash if not deleting
    if (!isDeleting) {
      return `${month}/`;
    }
    return month;
  }

  // 3+ digits: MM/YY format
  let month = cleanValue.substr(0, 2);
  const monthNum = parseInt(month);

  if (monthNum > 12) {
    month = "12";
  }
  if (monthNum === 0) {
    month = "01";
  }

  const year = cleanValue.substr(2, 2);
  return `${month}/${year}`;
};

/**
 * Sanitize and validate text input
 */
export const sanitizeTextInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, "");
};

/**
 * Check if required fields are filled
 */
export const checkRequiredFields = (
  data: Record<string, unknown>,
  requiredFields: string[]
): string[] => {
  const missingFields: string[] = [];

  requiredFields.forEach((field) => {
    if (
      !data[field] ||
      (typeof data[field] === "string" && !data[field].trim())
    ) {
      missingFields.push(field);
    }
  });

  return missingFields;
};
