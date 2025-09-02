import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Controller, useWatch } from "react-hook-form";
import type { LunchOption } from "../types";
import {
  trackUserInteraction,
  trackLunchSelection,
} from "../services/analytics";
import { useLunchForm } from "../hooks/useFormValidation";
import { apiService } from "../services/api";
import "./LunchSelection.css";

interface LunchSelectionProps {
  selectedLunch?: string;
  onSelect: (lunchType: string) => void;
  onNext: () => void;
  loading?: boolean;
}

/**
 * Lunch selection component for onboarding step 1
 * Allows users to select their typical lunch preference using React Hook Form + Zod
 */
export const LunchSelection: React.FC<LunchSelectionProps> = ({
  selectedLunch,
  onSelect,
  onNext,
  loading = false,
}) => {
  const { t } = useTranslation();
  const [lunchOptions, setLunchOptions] = useState<LunchOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize form with React Hook Form + Zod
  const form = useLunchForm({
    lunchType: selectedLunch as
      | "sandwiches"
      | "soups"
      | "fastfood"
      | "other"
      | undefined,
  });

  const { control, handleSubmit } = form;

  // Watch for selection changes
  const selectedLunchType = useWatch({ control, name: "lunchType" });

  // Fetch lunch types from API
  useEffect(() => {
    const fetchLunchTypes = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.getLunchTypes();
        if (response.success && response.data) {
          setLunchOptions(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch lunch types:", error);
        // Fallback to empty array, the API service already handles fallbacks
      } finally {
        setIsLoading(false);
      }
    };

    fetchLunchTypes();
  }, []);

  const handleOptionSelect = (lunchId: string) => {
    onSelect(lunchId);
    trackLunchSelection(lunchId);
    trackUserInteraction("lunch_option", `select_${lunchId}`);
  };

  const handleFormSubmit = () => {
    trackUserInteraction("next_button", "onboarding_step_1");
    onNext();
  };

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
          {isLoading ? (
            <div className="loading-state">
              <span className="spinner" />
              <p>{t("common.loading")}</p>
            </div>
          ) : (
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
                        <span className="option-label">
                          {t(option.labelKey)}
                        </span>
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
                              />
                            </svg>
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </>
                )}
              />
            </form>
          )}
        </motion.div>
      </div>

      <motion.div
        className="footer"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <button
          className={`btn btn-primary next-button ${
            !selectedLunchType || isLoading ? "disabled" : ""
          }`}
          onClick={handleSubmit(handleFormSubmit)}
          disabled={!selectedLunchType || loading || isLoading}
        >
          {loading ? <span className="spinner" /> : t("common.next")}
        </button>
      </motion.div>
    </div>
  );
};
