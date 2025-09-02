import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useFormState } from "react-hook-form";
import type { UseFormReturn, FieldValues } from "react-hook-form";
import { trackUserInteraction } from "../../services/analytics";

interface FormActionsProps<T extends FieldValues = FieldValues> {
  form: UseFormReturn<T>;
  onSubmit: (data: T) => void;
  loading?: boolean;
  disabled?: boolean;
  buttonText?: string;
  trackingEvent?: string;
}

/**
 * FormActions component for handling form submission and button state
 * Uses useFormState to avoid unnecessary re-renders
 */
export const FormActions = <T extends FieldValues = FieldValues>({
  form,
  onSubmit,
  loading = false,
  disabled = false,
  buttonText,
  trackingEvent = "next_button",
}: FormActionsProps<T>) => {
  const { t } = useTranslation();
  const { control, handleSubmit } = form;

  // Use useFormState to get form state without causing re-renders
  const { isValid, errors } = useFormState({ control });

  const handleFormSubmit = (data: T) => {
    trackUserInteraction(trackingEvent, "form_submit");
    onSubmit(data);
  };

  // Check if form has any errors or is not valid
  const hasErrors = Object.keys(errors).length > 0;
  const isButtonDisabled = !isValid || hasErrors || loading || disabled;

  return (
    <motion.div
      className="footer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <button
        className={`btn btn-primary next-button ${
          isButtonDisabled ? "disabled" : ""
        }`}
        onClick={handleSubmit(handleFormSubmit)}
        disabled={isButtonDisabled}
      >
        {loading && <span className="spinner" />}
        {buttonText || t("common.next")}
      </button>
    </motion.div>
  );
};
