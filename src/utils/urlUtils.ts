/**
 * URL utilities for language-based routing
 */

export type Language = "en" | "ar";

/**
 * Extract language from URL path
 */
export const getLanguageFromPath = (pathname: string): Language => {
  const match = pathname.match(/^\/(en|ar)/);
  return (match?.[1] as Language) || "en";
};

/**
 * Remove language prefix from path
 */
export const removeLanguagePrefix = (pathname: string): string => {
  return pathname.replace(/^\/(en|ar)/, "");
};

/**
 * Add language prefix to path
 */
export const addLanguagePrefix = (
  pathname: string,
  language: Language
): string => {
  const cleanPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `/${language}${cleanPath}`;
};

/**
 * Get route path with current language
 */
export const getLocalizedPath = (path: string, language: Language): string => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `/${language}${cleanPath}`;
};

/**
 * Check if path has language prefix
 */
export const hasLanguagePrefix = (pathname: string): boolean => {
  return /^\/(en|ar)/.test(pathname);
};
