import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  createPaymentIntent,
  processPayment,
  formatPrice,
  toCents,
  TEST_CARDS,
} from "../services/stripe";
import { trackPaymentEvent } from "../services/analytics";
import type { SubscriptionPlan } from "../types";

interface StripePaymentFormProps {
  plan: SubscriptionPlan;
  customerEmail: string;
  onSuccess: (paymentIntent: unknown) => void;
  onError: (error: string) => void;
  loading?: boolean;
}

/**
 * Demo Payment Form Component (Mock Stripe Integration)
 * For demo purposes - in production, use actual Stripe Elements
 */
export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  plan,
  customerEmail,
  onSuccess,
  onError,
  loading: externalLoading = false,
}) => {
  const { t } = useTranslation();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string>("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardholderName, setCardholderName] = useState("");

  const isLoading = processing || externalLoading;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!cardNumber || !expiryDate || !cvc || !cardholderName) {
      setError(
        t("payment.stripe.fillAllFields", "Please fill in all card details.")
      );
      return;
    }

    setProcessing(true);
    setError("");

    try {
      // Track payment attempt
      trackPaymentEvent("payment_attempt", plan.id);

      // Create payment intent
      const { clientSecret } = await createPaymentIntent({
        amount: toCents(plan.price),
        currency: "usd",
        planId: plan.id,
        customerEmail: customerEmail,
        customerName: cardholderName,
      });

      // Process payment (mock)
      const result = await processPayment(null, clientSecret, {
        email: customerEmail,
        name: cardholderName,
        cardNumber: cardNumber.replace(/\s/g, ""), // Remove spaces for validation
        returnUrl: `${window.location.origin}/payment/success`,
      });

      if (result.success && result.paymentIntent) {
        trackPaymentEvent("payment_success", plan.id);
        onSuccess(result.paymentIntent);
      } else {
        const errorMessage =
          result.error ||
          t("payment.stripe.genericError", "Payment failed. Please try again.");
        setError(errorMessage);
        onError(errorMessage);
        trackPaymentEvent("payment_error", errorMessage);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : t(
              "payment.stripe.networkError",
              "Network error. Please check your connection."
            );
      setError(errorMessage);
      onError(errorMessage);
      trackPaymentEvent("payment_error", errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const cleanValue = value.replace(/\D/g, "");
    const groups = cleanValue.match(/.{1,4}/g) || [];
    return groups.join(" ").substring(0, 19);
  };

  const formatExpiryDate = (value: string) => {
    const cleanValue = value.replace(/\D/g, "");
    if (cleanValue.length >= 2) {
      return `${cleanValue.substring(0, 2)}/${cleanValue.substring(2, 4)}`;
    }
    return cleanValue;
  };

  const formatCVC = (value: string) => {
    return value.replace(/\D/g, "").substring(0, 4);
  };

  return (
    <div className="stripe-payment-form">
      {/* Plan Summary */}
      <div className="payment-summary">
        <h3 className="summary-title">
          {t("payment.orderSummary", "Order Summary")}
        </h3>
        <div className="summary-item">
          <span className="item-name">{plan.name}</span>
          <span className="item-price">{formatPrice(toCents(plan.price))}</span>
        </div>
        {plan.originalPrice && plan.originalPrice > plan.price && (
          <div className="summary-discount">
            <span className="discount-label">
              {t("payment.discount", "Discount")}
            </span>
            <span className="discount-amount">
              -{formatPrice(toCents(plan.originalPrice - plan.price))}
            </span>
          </div>
        )}
        <div className="summary-total">
          <span className="total-label">{t("payment.total", "Total")}</span>
          <span className="total-amount">
            {formatPrice(toCents(plan.price))}
          </span>
        </div>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="payment-form">
        {/* Customer Email */}
        <div className="form-group">
          <label className="form-label">
            {t("payment.email", "Email Address")}
          </label>
          <input
            type="email"
            value={customerEmail}
            className="form-input"
            disabled
          />
        </div>

        {/* Card Number */}
        <div className="form-group">
          <label className="form-label">
            {t("payment.cardNumber", "Card Number")}
          </label>
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            className="form-input"
            placeholder="1234 5678 9012 3456"
            maxLength={19}
          />
        </div>

        <div className="form-row">
          {/* Expiry Date */}
          <div className="form-group">
            <label className="form-label">
              {t("payment.expiryDate", "Expiry Date")}
            </label>
            <input
              type="text"
              value={expiryDate}
              onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
              className="form-input"
              placeholder="MM/YY"
              maxLength={5}
            />
          </div>

          {/* CVC */}
          <div className="form-group">
            <label className="form-label">{t("payment.cvc", "CVC")}</label>
            <input
              type="text"
              value={cvc}
              onChange={(e) => setCvc(formatCVC(e.target.value))}
              className="form-input"
              placeholder="123"
              maxLength={4}
            />
          </div>
        </div>

        {/* Cardholder Name */}
        <div className="form-group">
          <label className="form-label">
            {t("payment.cardholderName", "Cardholder Name")}
          </label>
          <input
            type="text"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            className="form-input"
            placeholder={t("payment.cardholderNamePlaceholder", "John Doe")}
            maxLength={50}
          />
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            className="error-message"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {error}
          </motion.div>
        )}

        {/* Test Cards Info */}
        {import.meta.env.DEV && (
          <div className="test-cards-info">
            <details>
              <summary>
                {t("payment.testCards", "Test Cards for Development")}
              </summary>
              <div className="test-cards-list">
                <div className="test-card">
                  <strong>Success:</strong> {TEST_CARDS.VISA_SUCCESS}
                  <button
                    type="button"
                    onClick={() =>
                      setCardNumber(formatCardNumber(TEST_CARDS.VISA_SUCCESS))
                    }
                    className="use-card-btn"
                  >
                    Use
                  </button>
                </div>
                <div className="test-card">
                  <strong>Decline:</strong> {TEST_CARDS.VISA_DECLINE}
                  <button
                    type="button"
                    onClick={() =>
                      setCardNumber(formatCardNumber(TEST_CARDS.VISA_DECLINE))
                    }
                    className="use-card-btn"
                  >
                    Use
                  </button>
                </div>
                <p className="test-note">
                  Expiry: 12/34, CVC: 123, Name: Test User
                  <button
                    type="button"
                    onClick={() => {
                      setExpiryDate("12/34");
                      setCvc("123");
                      setCardholderName("Test User");
                    }}
                    className="use-card-btn"
                  >
                    Fill Details
                  </button>
                </p>
              </div>
            </details>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-primary payment-submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="loading-content">
              <div className="loading-spinner" />
              {t("payment.processing", "Processing...")}
            </div>
          ) : (
            <>
              {t("payment.payNow", "Pay Now")} -{" "}
              {formatPrice(toCents(plan.price))}
            </>
          )}
        </button>

        {/* Security Notice */}
        <div className="security-notice">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 1L3 3v4c0 3.5 2.5 6.5 5 7 2.5-.5 5-3.5 5-7V3l-5-2z"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
          {t(
            "payment.securityNotice",
            "Your payment information is secure and encrypted"
          )}
        </div>

        {/* Demo Notice */}
        <div className="demo-notice">
          <p>
            <strong>Demo Mode:</strong> This is a demonstration. No real
            payments will be processed.
          </p>
        </div>
      </form>
    </div>
  );
};
