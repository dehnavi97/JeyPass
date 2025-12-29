"use client";

import { useContext } from "react";
import { LanguageContext } from "@/contexts/language-provider";

/**
 * Provides access to language state and methods,
 * as well as authentication status.
 *
 * @example
 * ```tsx
 * const { language, setLanguage, isAuthenticated } = useLanguage();
 * ```
 */
export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
      throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
};
