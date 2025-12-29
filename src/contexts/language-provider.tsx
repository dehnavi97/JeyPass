"use client";

import React, { createContext, useState, useEffect, useCallback } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  isAuthenticated: boolean;
  isReady: boolean;
  isSetup: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  setupMasterPassword: (password: string) => Promise<boolean>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState(i18n.language);
  const [isReady, setIsReady] = useState(false);
  const [isSetup, setIsSetup] = useState(true);

  const {
    isAuthenticated,
    login,
    logout,
    setupMasterPassword
  } = useAuth();

  const handleSetLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setLanguage(lang);
    if (typeof window !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = i18n.dir(lang);
    }
  };

  useEffect(() => {
    const verificationHash = localStorage.getItem("jeypass_verificationHash");
    if (verificationHash) {
      setIsSetup(false);
    }
    
    // Set initial language and direction
    const currentLanguage = i18n.language;
    if (typeof window !== "undefined") {
      document.documentElement.lang = currentLanguage;
      document.documentElement.dir = i18n.dir(currentLanguage);
    }
    setLanguage(currentLanguage);
    
    setIsReady(true);

    const onLanguageChanged = (lng: string) => {
        setLanguage(lng);
        if (typeof window !== "undefined") {
          document.documentElement.lang = lng;
          document.documentElement.dir = i18n.dir(lng);
        }
    };

    i18n.on('languageChanged', onLanguageChanged);
    return () => {
        i18n.off('languageChanged', onLanguageChanged);
    };
  }, []);

  const value = {
    language,
    setLanguage: handleSetLanguage,
    isAuthenticated,
    isReady,
    isSetup,
    login,
    logout,
    setupMasterPassword,
  };

  return (
    <I18nextProvider i18n={i18n}>
      <LanguageContext.Provider value={value}>
        {children}
      </LanguageContext.Provider>
    </I18nextProvider>
  );
};

export { LanguageContext };
