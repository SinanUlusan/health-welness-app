import type {
  OnboardingData,
  PaymentInfo,
  SubscriptionPlan,
  ApiResponse,
  Testimonial,
  Review,
  LunchOption,
  Country,
} from "../types";
import { getBaseUrl } from "../utils/config";

/**
 * HTTP API service for handling data persistence and validation
 * Uses json-server mock API for development
 */
class ApiService {
  private baseUrl = getBaseUrl();

  /**
   * Submit onboarding step data
   */
  async submitOnboardingStep(
    step: number,
    data: Partial<OnboardingData>
  ): Promise<ApiResponse> {
    try {
      // Validate the data based on step
      if (step === 1 && !data.lunchType) {
        throw new Error("Lunch type is required");
      }

      if (step === 2 && (!data.weight || data.weight <= 0)) {
        throw new Error("Valid weight is required");
      }

      // Submit to mock API
      const response = await fetch(`${this.baseUrl}/onboarding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          step,
          data,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json(); // Consume the response but don't store it

      // Store locally as backup
      const existingData = this.getStoredOnboardingData();
      const updatedData = { ...existingData, ...data };
      localStorage.setItem("onboarding_data", JSON.stringify(updatedData));

      return {
        success: true,
        data: updatedData,
      };
    } catch {
      // Fallback to localStorage if server is not available
      console.warn("Mock server not available, falling back to localStorage");
      return this.submitOnboardingStepFallback(step, data);
    }
  }

  /**
   * Fallback method for when mock server is not available
   */
  private async submitOnboardingStepFallback(
    step: number,
    data: Partial<OnboardingData>
  ): Promise<ApiResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      // Validate the data based on step
      if (step === 1 && !data.lunchType) {
        throw new Error("Lunch type is required");
      }

      if (step === 2 && (!data.weight || data.weight <= 0)) {
        throw new Error("Valid weight is required");
      }

      // Store in localStorage to simulate persistence
      const existingData = this.getStoredOnboardingData();
      const updatedData = { ...existingData, ...data };
      localStorage.setItem("onboarding_data", JSON.stringify(updatedData));

      return {
        success: true,
        data: updatedData,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Get stored onboarding data
   */
  getStoredOnboardingData(): OnboardingData {
    const stored = localStorage.getItem("onboarding_data");
    return stored ? JSON.parse(stored) : {};
  }

  /**
   * Get available subscription plans
   */
  async getPlans(): Promise<ApiResponse<SubscriptionPlan[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/plans`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const plans = await response.json();
      return {
        success: true,
        data: plans,
      };
    } catch {
      // Fallback to hardcoded plans if server is not available
      console.warn("Mock server not available, using fallback plans data");
      return this.getPlansFallback();
    }
  }

  /**
   * Fallback method for plans
   */
  private async getPlansFallback(): Promise<ApiResponse<SubscriptionPlan[]>> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const plans: SubscriptionPlan[] = [
      {
        id: "free-trial",
        name: "Free Trial",
        price: 0,
        isFree: true,
        duration: "7 days",
      },
      {
        id: "1-month",
        name: "1 Month",
        price: 9.99,
        isFree: false,
        duration: "1 month",
      },
      {
        id: "3-months",
        name: "3 Months",
        price: 24.99,
        isFree: false,
        duration: "3 months",
      },
    ];

    return {
      success: true,
      data: plans,
    };
  }

  /**
   * Get available subscription plans
   */
  async getSubscriptionPlans(): Promise<ApiResponse<SubscriptionPlan[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/subscriptionPlans`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const plans = await response.json();
      return {
        success: true,
        data: plans,
      };
    } catch {
      // Fallback to hardcoded plans if server is not available
      console.warn("Mock server not available, using fallback data");
      return this.getSubscriptionPlansFallback();
    }
  }

  /**
   * Fallback method for subscription plans
   */
  private async getSubscriptionPlansFallback(): Promise<
    ApiResponse<SubscriptionPlan[]>
  > {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const plans: SubscriptionPlan[] = [
      {
        id: "free-trial",
        name: "7 days free trial",
        duration: "1 year",
        price: 0,
        isFree: true,
        isPopular: true,
      },
      {
        id: "3-months",
        name: "3 months",
        duration: "",
        price: 8.4,
        originalPrice: 11.6,
        discount: 29,
      },
      {
        id: "1-month",
        name: "1 month",
        duration: "",
        price: 11.6,
      },
    ];

    return {
      success: true,
      data: plans,
    };
  }

  /**
   * Get available lunch types
   */
  async getLunchTypes(): Promise<ApiResponse<LunchOption[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/lunchTypes`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const lunchTypes = await response.json();
      return {
        success: true,
        data: lunchTypes,
      };
    } catch {
      // Fallback to hardcoded lunch types if server is not available
      console.warn(
        "Mock server not available, using fallback lunch types data"
      );
      return this.getLunchTypesFallback();
    }
  }

  /**
   * Fallback method for lunch types
   */
  private async getLunchTypesFallback(): Promise<ApiResponse<LunchOption[]>> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const lunchTypes: LunchOption[] = [
      {
        id: "sandwiches",
        value: "sandwiches",
        labelKey: "onboarding.lunchTypes.sandwiches",
        emoji: "🥪",
      },
      {
        id: "soups",
        value: "soups",
        labelKey: "onboarding.lunchTypes.soups",
        emoji: "🥗",
      },
      {
        id: "fast_food",
        value: "fastfood",
        labelKey: "onboarding.lunchTypes.fastFood",
        emoji: "🍟",
      },
      {
        id: "other",
        value: "other",
        labelKey: "onboarding.lunchTypes.other",
        emoji: "👀",
      },
    ];

    return {
      success: true,
      data: lunchTypes,
    };
  }

  /**
   * Get testimonials
   */
  async getTestimonials(): Promise<ApiResponse<Testimonial[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/testimonials`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const testimonials = await response.json();
      return {
        success: true,
        data: testimonials,
      };
    } catch {
      // Fallback to hardcoded testimonials if server is not available
      console.warn(
        "Mock server not available, using fallback testimonials data"
      );
      return this.getTestimonialsFallback();
    }
  }

  /**
   * Fallback method for testimonials
   */
  private async getTestimonialsFallback(): Promise<ApiResponse<Testimonial[]>> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const testimonials: Testimonial[] = [
      {
        id: "testimonial-1",
        name: "Yasmine, -8 kg",
        ratingTitle: "Improved digestion",
        text: "My customized fasting plan really helped me with my stomach cramps and bloating problems.",
        stars: 5,
        beforeImage: "testimonial-before.png",
        afterImage: "testimonial-after.png",
      },
      {
        id: "testimonial-2",
        name: "Jennifer, -12 kg",
        ratingTitle: "Better energy levels",
        text: "I feel so much more energetic throughout the day. The plan is easy to follow and very effective.",
        stars: 5,
        beforeImage: "fat-body.png",
        afterImage: "skinny-body.png",
      },
      {
        id: "testimonial-3",
        name: "Sarah, -6 kg",
        ratingTitle: "Amazing results",
        text: "The personalized approach made all the difference. I've never felt better about my body.",
        stars: 5,
        beforeImage: "testimonial-before.png",
        afterImage: "testimonial-after.png",
      },
      {
        id: "testimonial-4",
        name: "Claire, -10 kg",
        ratingTitle: "Life changing",
        text: "This app changed my relationship with food completely. The results speak for themselves.",
        stars: 5,
        beforeImage: "testimonial-before.png",
        afterImage: "testimonial-after.png",
      },
    ];

    return {
      success: true,
      data: testimonials,
    };
  }

  /**
   * Get reviews for the review slider
   */
  async getReviews(): Promise<ApiResponse<Review[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/reviews`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reviews = await response.json();
      return {
        success: true,
        data: reviews,
      };
    } catch {
      // Fallback to hardcoded reviews if server is not available
      console.warn("Mock server not available, using fallback reviews data");
      return this.getReviewsFallback();
    }
  }

  /**
   * Fallback method for reviews
   */
  private async getReviewsFallback(): Promise<ApiResponse<Review[]>> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const reviews: Review[] = [
      {
        id: "review-1",
        title: "Fascinating!",
        emoji: "🔥",
        stars: 5,
        content:
          "My customized fasting plan really helped me with my stomach cramps and bloating problems.",
        reviewer: "Kumsalp",
        reviewDate: "Nov 22",
      },
      {
        id: "review-2",
        title: "Awesome!",
        emoji: "⭐",
        stars: 5,
        content:
          "The personalized approach made all the difference. I've never felt better about my body.",
        reviewer: "Mertoz",
        reviewDate: "Nov 20",
      },
      {
        id: "review-3",
        title: "Incredible!",
        emoji: "💪",
        stars: 5,
        content:
          "This app changed my relationship with food completely. The results speak for themselves.",
        reviewer: "Ahmed",
        reviewDate: "Nov 18",
      },
      {
        id: "review-4",
        title: "Amazing!",
        emoji: "✨",
        stars: 4,
        content:
          "I feel so much more energetic throughout the day. The plan is easy to follow and very effective.",
        reviewer: "Sarah",
        reviewDate: "Nov 15",
      },
    ];

    return {
      success: true,
      data: reviews,
    };
  }

  /**
   * Get available countries
   */
  async getCountries(): Promise<ApiResponse<Country[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/countries`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const countries = await response.json();
      return {
        success: true,
        data: countries,
      };
    } catch {
      // Fallback to hardcoded countries if server is not available
      console.warn("Mock server not available, using fallback countries data");
      return this.getCountriesFallback();
    }
  }

  /**
   * Fallback method for countries
   */
  private async getCountriesFallback(): Promise<ApiResponse<Country[]>> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const countries: Country[] = [
      {
        id: "turkey",
        code: "TR",
        nameKey: "paywall.countries.turkey",
      },
      {
        id: "united-states",
        code: "US",
        nameKey: "paywall.countries.unitedStates",
      },
      {
        id: "united-kingdom",
        code: "GB",
        nameKey: "paywall.countries.unitedKingdom",
      },
      {
        id: "germany",
        code: "DE",
        nameKey: "paywall.countries.germany",
      },
      {
        id: "france",
        code: "FR",
        nameKey: "paywall.countries.france",
      },
      {
        id: "spain",
        code: "ES",
        nameKey: "paywall.countries.spain",
      },
      {
        id: "italy",
        code: "IT",
        nameKey: "paywall.countries.italy",
      },
      {
        id: "canada",
        code: "CA",
        nameKey: "paywall.countries.canada",
      },
      {
        id: "australia",
        code: "AU",
        nameKey: "paywall.countries.australia",
      },
      {
        id: "netherlands",
        code: "NL",
        nameKey: "paywall.countries.netherlands",
      },
    ];

    return {
      success: true,
      data: countries,
    };
  }

  /**
   * Process payment information
   */
  async processPayment(
    paymentInfo: PaymentInfo,
    planId: string
  ): Promise<ApiResponse> {
    try {
      // Validate payment information before sending
      this.validatePaymentInfo(paymentInfo);

      const response = await fetch(`${this.baseUrl}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentInfo,
          planId,
          timestamp: new Date().toISOString(),
          transactionId: `txn_${Date.now()}`,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Store payment info locally as backup
      const paymentData = {
        planId,
        email: paymentInfo.email,
        country: paymentInfo.country,
        paymentMethod: paymentInfo.paymentMethod,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem("payment_data", JSON.stringify(paymentData));

      return {
        success: true,
        data: { transactionId: result.transactionId },
      };
    } catch {
      // Fallback to local processing if server is not available
      console.warn(
        "Mock server not available, falling back to local processing"
      );
      return this.processPaymentFallback(paymentInfo, planId);
    }
  }

  /**
   * Fallback payment processing
   */
  private async processPaymentFallback(
    paymentInfo: PaymentInfo,
    planId: string
  ): Promise<ApiResponse> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      // Validate payment information
      this.validatePaymentInfo(paymentInfo);

      // Check for declined test cards
      if (paymentInfo.paymentMethod === "card" && paymentInfo.cardNumber) {
        const cleanCardNumber = paymentInfo.cardNumber.replace(/\s/g, "");

        // Simulate declined cards
        if (cleanCardNumber === "4000000000000002") {
          return {
            success: false,
            error:
              "Your card was declined. Please try a different payment method.",
          };
        }

        // Simulate 3D Secure requirement for certain cards
        if (cleanCardNumber === "4000000000003220") {
          return {
            success: false,
            error:
              "3D Secure authentication required. Please use a different card.",
          };
        }
      }

      // Store payment info (in real app, this would be securely handled)
      const paymentData = {
        planId,
        email: paymentInfo.email,
        country: paymentInfo.country,
        paymentMethod: paymentInfo.paymentMethod,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem("payment_data", JSON.stringify(paymentData));

      return {
        success: true,
        data: { transactionId: `txn_${Date.now()}` },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Payment processing failed",
      };
    }
  }

  /**
   * Validate payment information
   */
  private validatePaymentInfo(paymentInfo: PaymentInfo): void {
    if (!paymentInfo.email || !this.isValidEmail(paymentInfo.email)) {
      throw new Error("Valid email is required");
    }

    if (paymentInfo.paymentMethod === "card") {
      if (
        !paymentInfo.cardNumber ||
        !this.isValidCardNumber(paymentInfo.cardNumber)
      ) {
        throw new Error("Valid card number is required");
      }

      if (!paymentInfo.expirationMonth || !paymentInfo.expirationYear) {
        throw new Error("Card expiration date is required");
      }

      if (!paymentInfo.cvc || paymentInfo.cvc.length < 3) {
        throw new Error("Valid CVC is required");
      }
    }

    if (!paymentInfo.country) {
      throw new Error("Country is required");
    }
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate card number (simple Luhn algorithm check)
   */
  private isValidCardNumber(cardNumber: string): boolean {
    const cleanNumber = cardNumber.replace(/\s/g, "");
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      return false;
    }

    // Test card numbers - only these should be accepted in demo
    const validTestCards = [
      "4242424242424242", // Visa - Success
      "4000000000000002", // Visa - Declined
    ];

    if (validTestCards.includes(cleanNumber)) {
      // 4000000000000002 should be declined
      if (cleanNumber === "4000000000000002") {
        return false;
      }
      return true;
    }

    // For other cards, use Luhn algorithm
    return this.luhnCheck(cleanNumber);
  }

  /**
   * Luhn algorithm for card validation
   */
  private luhnCheck(cardNumber: string): boolean {
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
  }

  /**
   * Submit payment
   */
  async submitPayment(paymentInfo: PaymentInfo): Promise<ApiResponse> {
    try {
      // Validate payment information
      this.validatePaymentInfo(paymentInfo);

      // Submit to mock API
      const response = await fetch(`${this.baseUrl}/payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...paymentInfo,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result,
      };
    } catch {
      // Fallback to local processing if server is not available
      console.warn("Mock server not available, processing payment locally");
      return this.submitPaymentFallback(paymentInfo);
    }
  }

  /**
   * Fallback method for payment processing
   */
  private async submitPaymentFallback(
    paymentInfo: PaymentInfo
  ): Promise<ApiResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      // Validate payment information
      this.validatePaymentInfo(paymentInfo);

      // Simulate payment processing
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      return {
        success: true,
        data: {
          transactionId,
          status: "succeeded",
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Payment processing failed",
      };
    }
  }

  /**
   * Clear all stored data (for testing purposes)
   */
  clearStoredData(): void {
    localStorage.removeItem("onboarding_data");
    localStorage.removeItem("payment_data");
    localStorage.removeItem("app_state");
  }
}

// Export singleton instance
export const apiService = new ApiService();
