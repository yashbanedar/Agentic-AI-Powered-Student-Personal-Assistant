import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { translations, LANGUAGES, EDUCATIONAL_LEVELS } from "../utils/translations";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  // Read initial language from localStorage or default to English
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem("student_ai_lang");
    if (saved && (saved === "en" || saved === "hi" || saved === "mr")) {
      return saved;
    }
    return "en";
  });

  // Track active educational level
  const [studentLevel, setStudentLevelState] = useState(() => {
    return localStorage.getItem("student_ai_level") || "undergraduate";
  });

  // Update HTML lang attribute and localStorage whenever language changes
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("lang", language);
    localStorage.setItem("student_ai_lang", language);
  }, [language]);

  // Persist student level in localStorage
  useEffect(() => {
    localStorage.setItem("student_ai_level", studentLevel);
  }, [studentLevel]);

  // Change language instantly
  const setLanguage = useCallback((newLang) => {
    if (newLang === "en" || newLang === "hi" || newLang === "mr") {
      setLanguageState(newLang);
    }
  }, []);

  const setStudentLevel = useCallback((levelId) => {
    setStudentLevelState(levelId);
  }, []);

  // Fast memoized translation helper with key-path resolution and fallback
  const t = useCallback(
    (keyPath, defaultFallback = "") => {
      if (!keyPath) return defaultFallback;

      const keys = keyPath.split(".");
      
      // 1. Try selected language
      let current = translations[language];
      for (const k of keys) {
        if (current && typeof current === "object" && k in current) {
          current = current[k];
        } else {
          current = undefined;
          break;
        }
      }

      if (current !== undefined && typeof current === "string") {
        return current;
      }

      // 2. Fallback to English
      let fallbackCurrent = translations["en"];
      for (const k of keys) {
        if (fallbackCurrent && typeof fallbackCurrent === "object" && k in fallbackCurrent) {
          fallbackCurrent = fallbackCurrent[k];
        } else {
          fallbackCurrent = undefined;
          break;
        }
      }

      if (fallbackCurrent !== undefined && typeof fallbackCurrent === "string") {
        return fallbackCurrent;
      }

      // 3. Fallback to provided default or key itself
      return defaultFallback || keys[keys.length - 1];
    },
    [language]
  );

  // Helper to get active educational level details
  const currentLevelProfile = 
    EDUCATIONAL_LEVELS.find((l) => l.id === studentLevel) ||
    EDUCATIONAL_LEVELS.find((l) => l.id === "undergraduate");

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        languages: LANGUAGES,
        studentLevel,
        setStudentLevel,
        educationalLevels: EDUCATIONAL_LEVELS,
        currentLevelProfile,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
