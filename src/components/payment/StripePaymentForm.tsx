import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Controller, useFormState } from "react-hook-form";
import {
  createPaymentIntent,
  processPayment,
  formatPrice,
  toCents,
  TEST_CARDS,
} from "../../services/stripe";
import { trackPaymentEvent } from "../../services/analytics";
import {
  usePaymentForm,
  useFormHelpers,
  useFormFormatters,
} from "../../hooks/useFormValidation";
import type { SubscriptionPlan } from "../../types";
import type { PaymentFormData } from "../../schemas/validation";

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

  const { getFieldError, getFieldClasses } = useFormHelpers();
  const {
    formatCardNumber,
    formatExpirationDate,
    formatCVC,
    formatCardholderName,
  } = useFormFormatters();

  const form = usePaymentForm(t, {
    email: customerEmail,
    paymentMethod: "card",
    cardNumber: "",
    expirationDate: "",
    cvc: "",
    cardholderName: "",
  });

  const { control, handleSubmit, setValue } = form;

  const { errors, isValid, touchedFields } = useFormState({ control });

  const isLoading = processing || externalLoading;

  const handleFormSubmit = async (data: PaymentFormData) => {
    if (
      !data.cardNumber ||
      !data.expirationDate ||
      !data.cvc ||
      !data.cardholderName
    ) {
      setError(
        t("payment.stripe.fillAllFields", "Please fill in all card details.")
      );
      return;
    }

    setProcessing(true);
    setError("");

    try {
      trackPaymentEvent("payment_attempt", plan.id);

      const { clientSecret } = await createPaymentIntent({
        amount: toCents(plan.price),
        currency: "usd",
        planId: plan.id,
        customerEmail: data.email,
        customerName: data.cardholderName,
      });

      const result = await processPayment(null, clientSecret, {
        email: data.email,
        name: data.cardholderName,
        cardNumber: data.cardNumber.replace(/\s/g, ""), // Remove spaces for validation
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
      <form onSubmit={handleSubmit(handleFormSubmit)} className="payment-form">
        {/* Customer Email */}
        <div className="form-group">
          <label className="form-label">
            {t("payment.email", "Email Address")}
          </label>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <input {...field} type="email" className="form-input" disabled />
            )}
          />
        </div>

        {/* Card Number */}
        <div className="form-group">
          <label className="form-label">
            {t("payment.cardNumber", "Card Number")}
          </label>
          <Controller
            name="cardNumber"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className={getFieldClasses(
                  errors,
                  touchedFields,
                  "cardNumber",
                  "form-input"
                )}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                onChange={(e) => {
                  const formatted = formatCardNumber(e.target.value);
                  field.onChange(formatted);
                }}
              />
            )}
          />
          {getFieldError(errors, "cardNumber") && (
            <span className="error-text">
              {getFieldError(errors, "cardNumber")}
            </span>
          )}
        </div>

        <div className="form-row">
          {/* Expiry Date */}
          <div className="form-group">
            <label className="form-label">
              {t("payment.expiryDate", "Expiry Date")}
            </label>
            <Controller
              name="expirationDate"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className={getFieldClasses(
                    errors,
                    touchedFields,
                    "expirationDate",
                    "form-input"
                  )}
                  placeholder="MM/YY"
                  maxLength={5}
                  onChange={(e) => {
                    const formatted = formatExpirationDate(e.target.value);
                    field.onChange(formatted);
                  }}
                />
              )}
            />
            {getFieldError(errors, "expirationDate") && (
              <span className="error-text">
                {getFieldError(errors, "expirationDate")}
              </span>
            )}
          </div>

          {/* CVC */}
          <div className="form-group">
            <label className="form-label">{t("payment.cvc", "CVC")}</label>
            <Controller
              name="cvc"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className={getFieldClasses(
                    errors,
                    touchedFields,
                    "cvc",
                    "form-input"
                  )}
                  placeholder="123"
                  maxLength={4}
                  onChange={(e) => {
                    const formatted = formatCVC(e.target.value);
                    field.onChange(formatted);
                  }}
                />
              )}
            />
            {getFieldError(errors, "cvc") && (
              <span className="error-text">{getFieldError(errors, "cvc")}</span>
            )}
          </div>
        </div>

        {/* Cardholder Name */}
        <div className="form-group">
          <label className="form-label">
            {t("payment.cardholderName", "Cardholder Name")}
          </label>
          <Controller
            name="cardholderName"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className={getFieldClasses(
                  errors,
                  touchedFields,
                  "cardholderName",
                  "form-input"
                )}
                placeholder={t("payment.cardholderNamePlaceholder", "John Doe")}
                maxLength={50}
                onChange={(e) => {
                  const formatted = formatCardholderName(e.target.value);
                  field.onChange(formatted);
                }}
              />
            )}
          />
          {getFieldError(errors, "cardholderName") && (
            <span className="error-text">
              {getFieldError(errors, "cardholderName")}
            </span>
          )}
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
                      setValue(
                        "cardNumber",
                        formatCardNumber(TEST_CARDS.VISA_SUCCESS),
                        { shouldValidate: true }
                      )
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
                      setValue(
                        "cardNumber",
                        formatCardNumber(TEST_CARDS.VISA_DECLINE),
                        { shouldValidate: true }
                      )
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
                      setValue("expirationDate", "12/34", {
                        shouldValidate: true,
                      });
                      setValue("cvc", "123", { shouldValidate: true });
                      setValue("cardholderName", "Test User", {
                        shouldValidate: true,
                      });
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
          disabled={isLoading || !isValid}
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
