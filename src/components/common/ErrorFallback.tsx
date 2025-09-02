import React from "react";
import { useTranslation } from "react-i18next";

export const ErrorFallback: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="error-boundary">
      <h2>{t("errorFallback.title")}</h2>
      <p>{t("errorFallback.description")}</p>
      <button
        className="btn btn-primary"
        onClick={() => window.location.reload()}
      >
        {t("errorFallback.refreshButton")}
      </button>
    </div>
  );
};
