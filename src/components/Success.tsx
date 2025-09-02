import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { trackUserInteraction } from "../services/analytics";
import successIcon from "../assets/images/success-icon.png";
import starIcon from "../assets/images/star-icon.png";
import securityIcon from "../assets/images/ic-security.png";
import appleLogo from "../assets/images/apple-logo.png";
import googlePlayLogo from "../assets/images/google-play-logo.png";
import "./Success.css";

interface SuccessProps {
  userEmail?: string;
  onGoHome?: () => void;
}

/**
 * Success page component shown after successful payment
 * Displays completion steps and app download links
 */
export const Success: React.FC<SuccessProps> = ({ userEmail, onGoHome }) => {
  const { t } = useTranslation();

  useEffect(() => {
    // Track successful completion
    trackUserInteraction("success_page", "view");

    // Handle browser back button
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      if (onGoHome) {
        onGoHome();
      } else {
        // Fallback to reload homepage
        window.location.href = "/";
      }
    };

    // Add popstate listener for back button
    window.addEventListener("popstate", handlePopState);

    // Push a new state to handle back button
    window.history.pushState({ page: "success" }, "", window.location.href);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [onGoHome]);

  const handleDownloadClick = (platform: "ios" | "android") => {
    trackUserInteraction("download_button", `click_${platform}`);
    // In a real app, these would be actual store links
    if (platform === "ios") {
      window.open("https://apps.apple.com/app/kompanion", "_blank");
    } else {
      window.open(
        "https://play.google.com/store/apps/details?id=com.kompanion.fitness.android",
        "_blank"
      );
    }
  };

  const handleGoHome = () => {
    trackUserInteraction("homepage_redirect", "click");
    if (onGoHome) {
      onGoHome();
    } else {
      // Fallback to reload homepage
      window.location.href = "/";
    }
  };

  return (
    <div className="success">
      <div className="content">
        {/* Progress indicators */}
        <motion.div
          className="progress-indicators"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="progress-step completed">
            <div className="step-circle">
              <span className="step-number">1</span>
            </div>
            <span className="step-label">{t("success.createPlan")}</span>
          </div>

          <div className="progress-connector"></div>

          <div className="progress-step completed">
            <div className="step-circle">
              <span className="step-number">2</span>
            </div>
            <span className="step-label">{t("success.addOffer")}</span>
          </div>

          <div className="progress-connector"></div>

          <div className="progress-step completed">
            <div className="step-circle">
              <span className="step-number">3</span>
            </div>
            <span className="step-label">{t("success.accessPlan")}</span>
          </div>
        </motion.div>

        {/* Success message */}
        <motion.div
          className="success-message"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="success-icon">
            <img
              src={successIcon}
              alt="Success"
              className="success-icon-image"
            />
          </div>

          <h1 className="success-title">{t("success.allSet")}</h1>
          <p className="success-description">{t("success.planReady")}</p>
        </motion.div>

        {/* Steps to follow */}
        <motion.div
          className="next-steps"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {/* Step 1: Get password */}
          <div className="step-card">
            <div className="step-header">
              <span className="step-tag">{t("success.step1")}</span>
              <h3 className="step-title">{t("success.getPassword")}</h3>
            </div>

            <div className="step-content">
              <div className="password-info">
                <img src={starIcon} alt="Info" className="info-icon" />
                <div className="info-text">
                  <p>
                    {t("success.passwordSent")}{" "}
                    <strong>
                      {userEmail || t("success.yourEmail", "your email")}
                    </strong>
                    .
                  </p>
                  <p className="info-note">{t("success.checkSpam")}</p>
                </div>
              </div>

              <div className="password-display">
                <div className="password-dots">
                  {Array.from({ length: 6 }, (_, i) => (
                    <span key={i} className="password-dot">
                      *
                    </span>
                  ))}
                </div>
                <div className="password-lock">
                  <img
                    src={securityIcon}
                    alt="Security"
                    className="security-icon"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Download app */}
          <div className="step-card">
            <div className="step-header">
              <span className="step-tag">{t("success.step2")}</span>
              <h3 className="step-title">{t("success.downloadApp")}</h3>
            </div>

            <div className="step-content">
              <div className="download-info">
                <img src={starIcon} alt="Info" className="info-icon" />
                <p className="info-text">{t("success.downloadText")}</p>
              </div>

              <div className="download-buttons">
                <motion.button
                  className="download-button ios"
                  onClick={() => handleDownloadClick("ios")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="download-icon">
                    <img src={appleLogo} alt="Apple" className="logo-icon" />
                  </div>
                  <div className="download-text">
                    <span className="download-label">
                      {t("success.downloadOn")}
                    </span>
                    <span className="download-store">
                      {t("success.appStore")}
                    </span>
                  </div>
                </motion.button>

                <motion.button
                  className="download-button android"
                  onClick={() => handleDownloadClick("android")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="download-icon">
                    <img
                      src={googlePlayLogo}
                      alt="Google Play"
                      className="logo-icon logo-google-icon"
                    />
                  </div>
                  <div className="download-text">
                    <span className="download-label">
                      {t("success.getItOn")}
                    </span>
                    <span className="download-store">
                      {t("success.googlePlay")}
                    </span>
                  </div>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Homepage redirect button */}
        <motion.div
          className="homepage-redirect"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <button className="btn btn-homepage" onClick={handleGoHome}>
            <span className="btn-icon">🏠</span>
            {t("success.backToHome", "Back to Homepage")}
          </button>
        </motion.div>
      </div>
    </div>
  );
};
