import React from "react";
import { useTranslation } from "react-i18next";
import { Controller, useWatch } from "react-hook-form";
import {
  usePaymentForm,
  useFormHelpers,
  useFormFormatters,
} from "../hooks/useFormValidation";
import {
  trackPaymentMethodSelection,
  trackFormSubmission,
} from "../services/analytics";
import type { PaymentFormData } from "../schemas/validation";
import type { PaymentInfo } from "../types";

interface PaymentFormProps {
  onSubmit: (data: PaymentFormData) => void;
  loading?: boolean;
  initialValues?: Partial<PaymentInfo>;
}

/**
 * Payment form component with React Hook Form + Zod validation
 * Handles email input and credit card details with real-time validation
 */
export const PaymentForm: React.FC<PaymentFormProps> = ({
  onSubmit,
  loading = false,
  initialValues,
}) => {
  const { t } = useTranslation();
  const { getFieldClasses } = useFormHelpers();
  const {
    formatCardNumber,
    formatExpirationDate,
    formatCVC,
    formatCardholderName,
  } = useFormFormatters();

  // Initialize form with React Hook Form + Zod
  const form = usePaymentForm(t, {
    email: initialValues?.email || "",
    paymentMethod:
      (initialValues?.paymentMethod as "card" | "paypal" | "apple_pay") ||
      "card",
    cardNumber: initialValues?.cardNumber || "",
    expirationDate:
      initialValues?.expirationMonth && initialValues?.expirationYear
        ? `${initialValues.expirationMonth}/${initialValues.expirationYear}`
        : "",
    cvc: initialValues?.cvc || "",
    cardholderName: initialValues?.cardholderName || "",
  });

  const { control, handleSubmit } = form;

  // Watch payment method to conditionally show card fields
  const paymentMethod = useWatch({ control, name: "paymentMethod" });

  const handleFormSubmit = (data: PaymentFormData) => {
    trackFormSubmission("payment_form", true);
    onSubmit(data);
  };

  const handlePaymentMethodChange = (method: string) => {
    trackPaymentMethodSelection(method);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="payment-form">
      {/* Email input for all payment methods */}
      <div className="email-form">
        <div className="form-group">
          <label>{t("paywall.email")}</label>
          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <input
                  type="email"
                  className={getFieldClasses(
                    { email: fieldState.error },
                    { email: fieldState.isTouched },
                    "email",
                    "input"
                  )}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="example@email.com"
                />
                {fieldState.error && (
                  <span className="error-message">
                    {fieldState.error.message}
                  </span>
                )}
              </>
            )}
          />
        </div>
      </div>

      {/* Payment method selection */}
      <div className="payment-methods">
        <div className="form-group">
          <label>{t("paywall.paymentMethod")}</label>
          <Controller
            name="paymentMethod"
            control={control}
            render={({ field }) => (
              <div className="payment-method-options">
                <button
                  type="button"
                  className={`payment-method-btn ${field.value === "card" ? "active" : ""}`}
                  onClick={() => {
                    field.onChange("card");
                    handlePaymentMethodChange("card");
                  }}
                >
                  <span className="payment-icon">💳</span>
                  {t("paywall.creditCard")}
                </button>
                <button
                  type="button"
                  className={`payment-method-btn ${field.value === "paypal" ? "active" : ""}`}
                  onClick={() => {
                    field.onChange("paypal");
                    handlePaymentMethodChange("paypal");
                  }}
                >
                  <span className="payment-icon">🅿️</span>
                  PayPal
                </button>
                <button
                  type="button"
                  className={`payment-method-btn ${field.value === "apple_pay" ? "active" : ""}`}
                  onClick={() => {
                    field.onChange("apple_pay");
                    handlePaymentMethodChange("apple_pay");
                  }}
                >
                  <span className="payment-icon">🍎</span>
                  Apple Pay
                </button>
              </div>
            )}
          />
        </div>
      </div>

      {/* Card form - only show for card payment method */}
      {paymentMethod === "card" && (
        <div className="card-form">
          {/* Card Number */}
          <div className="form-group">
            <label>{t("paywall.cardNumberLabel")}</label>
            <Controller
              name="cardNumber"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <input
                    type="text"
                    className={getFieldClasses(
                      { cardNumber: fieldState.error },
                      { cardNumber: fieldState.isTouched },
                      "cardNumber",
                      "input"
                    )}
                    value={formatCardNumber(field.value || "")}
                    onChange={(e) => field.onChange(e.target.value)}
                    onBlur={field.onBlur}
                    placeholder={t("paywall.cardNumber")}
                    maxLength={19}
                  />
                  {fieldState.error && (
                    <span className="error-message">
                      {fieldState.error.message}
                    </span>
                  )}
                </>
              )}
            />
          </div>

          <div className="form-row">
            {/* Expiration Date */}
            <div className="form-group">
              <label>{t("paywall.expirationLabel")}</label>
              <Controller
                name="expirationDate"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <input
                      type="text"
                      className={getFieldClasses(
                        { expirationDate: fieldState.error },
                        { expirationDate: fieldState.isTouched },
                        "expirationDate",
                        "input"
                      )}
                      value={formatExpirationDate(field.value || "")}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                    {fieldState.error && (
                      <span className="error-message">
                        {fieldState.error.message}
                      </span>
                    )}
                  </>
                )}
              />
            </div>

            {/* CVC */}
            <div className="form-group">
              <label>{t("paywall.cvcLabel")}</label>
              <Controller
                name="cvc"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <input
                      type="text"
                      className={getFieldClasses(
                        { cvc: fieldState.error },
                        { cvc: fieldState.isTouched },
                        "cvc",
                        "input"
                      )}
                      value={formatCVC(field.value || "")}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      placeholder="123"
                      maxLength={4}
                    />
                    {fieldState.error && (
                      <span className="error-message">
                        {fieldState.error.message}
                      </span>
                    )}
                  </>
                )}
              />
            </div>
          </div>

          {/* Cardholder Name */}
          <div className="form-group">
            <label>{t("paywall.cardholderNameLabel")}</label>
            <Controller
              name="cardholderName"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <input
                    type="text"
                    className={getFieldClasses(
                      { cardholderName: fieldState.error },
                      { cardholderName: fieldState.isTouched },
                      "cardholderName",
                      "input"
                    )}
                    value={formatCardholderName(field.value || "")}
                    onChange={(e) => field.onChange(e.target.value)}
                    onBlur={field.onBlur}
                    placeholder={t("paywall.cardholderName")}
                    maxLength={50}
                  />
                  {fieldState.error && (
                    <span className="error-message">
                      {fieldState.error.message}
                    </span>
                  )}
                </>
              )}
            />
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-primary payment-submit-btn"
          disabled={loading}
        >
          {loading ? (
            <div className="loading-spinner" />
          ) : (
            t("paywall.completePayment")
          )}
        </button>
      </div>
    </form>
  );
};
