import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiService } from "../services/api";

// Mock fetch
global.fetch = vi.fn();

describe("API Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPlans", () => {
    it("should return plans successfully", async () => {
      const result = await apiService.getPlans();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe("getLunchTypes", () => {
    it("should return lunch types successfully", async () => {
      const result = await apiService.getLunchTypes();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe("getReviews", () => {
    it("should return reviews successfully", async () => {
      const result = await apiService.getReviews();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe("submitOnboardingStep", () => {
    it("should submit step 1 successfully", async () => {
      const result = await apiService.submitOnboardingStep(1, {
        lunchType: "light",
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("should submit step 2 successfully", async () => {
      const result = await apiService.submitOnboardingStep(2, {
        weight: 70,
        weightUnit: "kg",
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("should reject invalid step 1 data", async () => {
      const result = await apiService.submitOnboardingStep(1, {});

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should reject invalid step 2 data", async () => {
      const result = await apiService.submitOnboardingStep(2, {
        weight: 0,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
