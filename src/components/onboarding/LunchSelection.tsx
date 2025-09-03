import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Controller } from "react-hook-form";
import type { LunchSelectionFormData } from "../../schemas/validation";
import { apiService } from "../../services/api";
import {
  trackLunchSelection,
  trackUserInteraction,
} from "../../services/analytics";
import { useLunchForm } from "../../hooks/useFormValidation";
import { useQuery } from "../../hooks/useQuery";
import "./LunchSelection.css";

interface LunchSelectionProps {
  selectedLunch?: string;
  onSelect: (lunchType: string) => void;
  onNext: () => void;
  loading?: boolean;
}

// Main LunchSelection component
const LunchSelectionContent: React.FC<LunchSelectionProps> = ({
  selectedLunch = "",
  onSelect,
  onNext,
  loading = false,
}) => {
  const { t } = useTranslation();

  const {
    data: lunchOptions,
    loading: dataLoading,
    error,
    execute,
  } = useQuery(() =>
    apiService.getLunchTypes().then((response) => {
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error("Failed to load lunch options");
    })
  );

  useEffect(() => {
    execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const form = useLunchForm({
    lunchType: selectedLunch as
      | "sandwiches"
      | "soups"
      | "fastfood"
      | "other"
      | undefined,
  });

  const { control, handleSubmit } = form;

  const handleOptionSelect = (lunchId: string) => {
    onSelect(lunchId);
    trackLunchSelection(lunchId);
    trackUserInteraction("lunch_option", `select_${lunchId}`);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleFormSubmit = (_data: LunchSelectionFormData) => {
    trackUserInteraction("next_button", "onboarding_step_1");
    onNext();
  };

  // Show loading state while data is being fetched
  if (dataLoading || !lunchOptions) {
    return (
      <div className="lunch-selection">
        <div className="content">
          <div className="question-section">
            <h1 className="question-title">Loading...</h1>
            <p className="question-description">
              Please wait while we load your options...
            </p>
          </div>
          <div className="options-container">
            <div className="loading-state">
              <span className="spinner" />
              <p>Loading lunch options...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if data fetching failed
  if (error) {
    return (
      <div className="lunch-selection">
        <div className="content">
          <div className="question-section">
            <h1 className="question-title">Error</h1>
            <p className="question-description">
              Failed to load lunch options. Please try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lunch-selection">
      <div className="content">
        <motion.div
          className="question-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="question-title">{t("onboarding.lunchQuestion")}</h1>
          <p className="question-description">
            {t("onboarding.lunchDescription")}
          </p>
        </motion.div>

        <motion.div
          className="options-container"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <Controller
              name="lunchType"
              control={control}
              render={({ field }) => (
                <>
                  {lunchOptions.map((option, index) => (
                    <motion.button
                      key={option.id}
                      type="button"
                      className={`lunch-option ${
                        field.value === option.value ? "selected" : ""
                      }`}
                      onClick={() => {
                        field.onChange(option.value);
                        handleOptionSelect(option.id);
                      }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="option-emoji">{option.emoji}</span>
                      <span className="option-label">{t(option.labelKey)}</span>
                      {field.value === option.value && (
                        <motion.div
                          className="selection-indicator"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                          >
                            <path
                              d="M16.667 5L7.5 14.167L3.333 10"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            ></path>
                          </svg>
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </>
              )}
            />

            <motion.button
              type="submit"
              className={`next-button ${loading ? "loading" : ""}`}
              disabled={loading || !selectedLunch}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  {t("common.processing")}
                </>
              ) : (
                t("common.next")
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export const LunchSelection: React.FC<LunchSelectionProps> = (props) => {
  return <LunchSelectionContent {...props} />;
};
