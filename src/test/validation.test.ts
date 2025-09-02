import { describe, it, expect } from "vitest";
import {
  validateEmail,
  validateCardNumber,
  validateExpirationDate,
  validateCVC,
  validateCardholderName,
  validateWeight,
  validateWeightUnit,
  validateLunchType,
} from "../schemas/validation";

describe("Validation Functions", () => {
  describe("validateEmail", () => {
    it("should validate correct email", () => {
      expect(validateEmail("test@example.com")).toBe(true);
      expect(validateEmail("user.name+tag@domain.co.uk")).toBe(true);
    });

    it("should reject invalid email", () => {
      expect(validateEmail("invalid-email")).toBe(false);
      expect(validateEmail("test@")).toBe(false);
      expect(validateEmail("@example.com")).toBe(false);
      expect(validateEmail("")).toBe(false);
    });
  });

  describe("validateCardNumber", () => {
    it("should validate correct card number", () => {
      expect(validateCardNumber("4242424242424242")).toBe(true);
      expect(validateCardNumber("4000056655665556")).toBe(true);
    });

    it("should reject invalid card number", () => {
      expect(validateCardNumber("1234")).toBe(false);
      expect(validateCardNumber("4242424242424243")).toBe(false);
      expect(validateCardNumber("")).toBe(false);
    });
  });

  describe("validateExpirationDate", () => {
    it("should validate correct expiration date", () => {
      expect(validateExpirationDate("12", "25")).toBe(true);
      expect(validateExpirationDate("01", "30")).toBe(true);
    });

    it("should reject invalid expiration date", () => {
      expect(validateExpirationDate("13", "25")).toBe(false);
      expect(validateExpirationDate("00", "25")).toBe(false);
      expect(validateExpirationDate("12", "20")).toBe(false); // Past date
    });
  });

  describe("validateCVC", () => {
    it("should validate correct CVC", () => {
      expect(validateCVC("123")).toBe(true);
      expect(validateCVC("1234")).toBe(true);
    });

    it("should reject invalid CVC", () => {
      expect(validateCVC("12")).toBe(false);
      expect(validateCVC("12345")).toBe(false);
      expect(validateCVC("abc")).toBe(false);
    });
  });

  describe("validateCardholderName", () => {
    it("should validate correct cardholder name", () => {
      expect(validateCardholderName("John Doe")).toBe(true);
      expect(validateCardholderName("Mary Jane Smith")).toBe(true);
    });

    it("should reject invalid cardholder name", () => {
      expect(validateCardholderName("")).toBe(false);
      expect(validateCardholderName("A")).toBe(false);
      expect(validateCardholderName("123")).toBe(false);
    });
  });

  describe("validateWeight", () => {
    it("should validate correct weight", () => {
      expect(validateWeight(50)).toBe(true);
      expect(validateWeight(200)).toBe(true);
    });

    it("should reject invalid weight", () => {
      expect(validateWeight(0)).toBe(false);
      expect(validateWeight(500)).toBe(false);
      expect(validateWeight(-10)).toBe(false);
    });
  });

  describe("validateWeightUnit", () => {
    it("should validate correct weight unit", () => {
      expect(validateWeightUnit("kg")).toBe(true);
      expect(validateWeightUnit("lbs")).toBe(true);
    });

    it("should reject invalid weight unit", () => {
      expect(validateWeightUnit("invalid")).toBe(false);
      expect(validateWeightUnit("")).toBe(false);
    });
  });

  describe("validateLunchType", () => {
    it("should validate correct lunch type", () => {
      expect(validateLunchType("sandwiches")).toBe(true);
      expect(validateLunchType("soups")).toBe(true);
      expect(validateLunchType("fastfood")).toBe(true);
      expect(validateLunchType("other")).toBe(true);
    });

    it("should reject invalid lunch type", () => {
      expect(validateLunchType("invalid")).toBe(false);
      expect(validateLunchType("")).toBe(false);
    });
  });
});
