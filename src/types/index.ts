// User onboarding data types
export interface OnboardingData {
  lunchType?: string;
  weight?: number;
  weightUnit?: "kg" | "lbs";
}

// Payment information types
export interface PaymentInfo {
  email: string;
  cardNumber: string;
  expirationMonth: string;
  expirationYear: string;
  cvc: string;
  cardholderName: string;
  country: string;
  paymentMethod: "card" | "apple-pay" | "paypal";
}

// Subscription plan types
export interface SubscriptionPlan {
  id: string;
  name: string;
  duration: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  isFree?: boolean;
  isPopular?: boolean;
}

// Application state types
export interface AppState {
  currentStep: number;
  onboardingData: OnboardingData;
  paymentInfo: Partial<PaymentInfo>;
  selectedPlan?: SubscriptionPlan;
  language: "en" | "ar";
  direction: "ltr" | "rtl";
}

// Analytics event types
export interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Lunch type options
export const LUNCH_TYPES = {
  SANDWICHES: "sandwiches",
  SOUPS: "soups",
  FAST_FOOD: "fast_food",
  OTHER: "other",
} as const;

export type LunchType = (typeof LUNCH_TYPES)[keyof typeof LUNCH_TYPES];

// Lunch option interface for API data
export interface LunchOption {
  id: string;
  value: string;
  labelKey: string;
  emoji: string;
}

// Country interface for API data
export interface Country {
  id: string;
  code: string;
  nameKey: string;
}

// Testimonial types
export interface Testimonial {
  id: string;
  name: string;
  ratingTitle: string;
  text: string;
  stars: number;
  beforeImage: string;
  afterImage: string;
}

// Review types for the new review slider
export interface Review {
  id: string;
  title: string;
  emoji: string;
  stars: number;
  content: string;
  reviewer: string;
  reviewDate: string;
}
