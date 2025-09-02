import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Controller, useWatch, useFormState } from "react-hook-form";
import {
  trackUserInteraction,
  trackWeightInput,
} from "../../services/analytics";
import { useWeightForm, useFormHelpers } from "../../hooks/useFormValidation";
import type { WeightWithUnitFormData } from "../../schemas/validation";
import { FormActions } from "./FormActions";
import "./WeightInput.css";

interface WeightInputProps {
  weight?: number;
  weightUnit?: "kg" | "lbs";
  onWeightChange: (weight: number, unit: "kg" | "lbs") => void;
  onNext: () => void;
  loading?: boolean;
}

/**
 * Weight input component for onboarding step 2
 * Provides numeric input with unit selection (kg/lbs) using React Hook Form + Zod
 */
export const WeightInput: React.FC<WeightInputProps> = ({
  weight,
  weightUnit = "kg",
  onWeightChange,
  onNext,
  loading = false,
}) => {
  const { t } = useTranslation();
  const { getFieldError, getFieldClasses } = useFormHelpers();

  // Initialize form with React Hook Form + Zod
  const form = useWeightForm(t, {
    weight: weight || 0,
    unit: weightUnit,
  });

  const { control, handleSubmit, setValue } = form;

  // Use useWatch and useFormState hooks separately to avoid ESLint warnings
  const watchedWeight = useWatch({ control, name: "weight" });
  const watchedUnit = useWatch({ control, name: "unit" });
  const { errors, touchedFields } = useFormState({ control });

  // Handle weight change with immediate callback
  const handleWeightChange = (newWeight: number, currentUnit: "kg" | "lbs") => {
    if (newWeight > 0) {
      onWeightChange(newWeight, currentUnit);
    }
  };

  // Handle unit toggle
  const handleUnitToggle = (unit: "kg" | "lbs") => {
    setValue("unit", unit, { shouldValidate: true });
    trackUserInteraction("weight_unit", `select_${unit}`);

    // Call onWeightChange with current weight and new unit
    if (watchedWeight > 0) {
      onWeightChange(watchedWeight, unit);
    }
  };

  // Handle form submission
  const onSubmit = (data: WeightWithUnitFormData) => {
    trackWeightInput(data.weight, data.unit);
    onWeightChange(data.weight, data.unit);
    trackUserInteraction("next_button", "onboarding_step_2");
    onNext();
  };

  const weightError = getFieldError(errors, "weight");

  return (
    <div className="weight-input">
      <div className="content">
        <motion.div
          className="question-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="question-title">{t("onboarding.weightQuestion")}</h1>
        </motion.div>

        <motion.div
          className="weight-input-section"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="weight-display">
              <div className="weight-input-container">
                <Controller
                  name="weight"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="number"
                      className={getFieldClasses(
                        errors,
                        touchedFields,
                        "weight",
                        "weight-input-field"
                      )}
                      value={
                        field.value !== undefined &&
                        field.value !== null &&
                        field.value !== 0
                          ? field.value.toString()
                          : ""
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow numbers and limit to 3 digits
                        if (
                          value === "" ||
                          (/^\d{1,3}$/.test(value) && parseInt(value) <= 999)
                        ) {
                          // Set to 0 when empty, otherwise parse the number
                          const newWeight = value === "" ? 0 : parseInt(value);
                          field.onChange(newWeight);
                          trackUserInteraction("weight_input", "typing");

                          // Call onWeightChange only when there's a valid weight
                          if (newWeight > 0) {
                            handleWeightChange(newWeight, watchedUnit);
                          }
                        } else {
                          // Reset to 0 for invalid input
                          field.onChange(0);
                        }
                      }}
                      onBlur={field.onBlur}
                      placeholder={t("onboarding.weightPlaceholder")}
                      min="1"
                      max="999"
                      autoFocus
                    />
                  )}
                />
              </div>

              <div className="unit-selector">
                <Controller
                  name="unit"
                  control={control}
                  render={({ field }) => (
                    <>
                      <button
                        type="button"
                        className={`unit-option ${field.value === "kg" ? "active" : ""}`}
                        onClick={() => handleUnitToggle("kg")}
                      >
                        {t("common.kg")}
                      </button>
                      <button
                        type="button"
                        className={`unit-option ${field.value === "lbs" ? "active" : ""}`}
                        onClick={() => handleUnitToggle("lbs")}
                      >
                        {t("common.lbs")}
                      </button>
                    </>
                  )}
                />
              </div>
            </div>

            {weightError && (
              <motion.div
                className="error-message"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                {weightError}
              </motion.div>
            )}
          </form>
        </motion.div>
      </div>

      <FormActions
        form={form}
        onSubmit={onSubmit}
        loading={loading}
        buttonText={t("common.continue")}
        trackingEvent="onboarding_step_2"
      />
    </div>
  );
};
