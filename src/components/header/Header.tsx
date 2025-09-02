import React from "react";
import { useTranslation } from "react-i18next";
import { useAppState } from "../../hooks/useAppState";
import {
  trackUserInteraction,
  trackLanguageChange,
} from "../../services/analytics";
import UKFlag from "../../assets/images/svg/united-kingdom.svg";
import SaudiFlag from "../../assets/images/svg/saudi-arabia.svg";
import KompanionLogo from "../../assets/images/kompanion-logo.png";
import "./Header.css";

interface HeaderProps {
  showBack?: boolean;
  onBack?: () => void;
}

/**
 * Header component with navigation and language switching
 * Displays the Kompanion logo and provides back navigation
 */
export const Header: React.FC<HeaderProps> = ({ showBack = false, onBack }) => {
  const { t, i18n } = useTranslation();
  const { appState, switchLanguage, previousStep } = useAppState();

  const handleBackClick = () => {
    trackUserInteraction("back_button", "click");
    if (onBack) {
      onBack();
    } else {
      previousStep();
    }
  };

  const handleLanguageToggle = () => {
    const newLanguage = appState.language === "en" ? "ar" : "en";
    trackLanguageChange(newLanguage);
    trackUserInteraction("language_toggle", `switch_to_${newLanguage}`);

    // Force language change immediately
    i18n.changeLanguage(newLanguage);
    switchLanguage(newLanguage);
  };

  return (
    <header className="header">
      <div className="header-content">
        {showBack && (
          <button
            className="back-button"
            onClick={handleBackClick}
            aria-label={t("common.back")}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        <div className="logo-container">
          <div className="logo">
            <img
              src={KompanionLogo}
              alt="Kompanion Logo"
              className="logo-icon"
              width="24"
              height="24"
            />
            <span className="logo-text">{t("common.kompanion")}</span>
          </div>
        </div>

        <button
          className="language-toggle"
          onClick={handleLanguageToggle}
          aria-label={`Switch to ${
            appState.language === "en" ? "Arabic" : "English"
          }`}
        >
          <img
            src={appState.language === "en" ? SaudiFlag : UKFlag}
            alt={appState.language === "en" ? "Arabic" : "English"}
            width="20"
            height="20"
          />
        </button>
      </div>
    </header>
  );
};
