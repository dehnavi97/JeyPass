import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from '../../public/locales/en/translation.json';
import fa from '../../public/locales/fa/translation.json';
import ar from '../../public/locales/ar/translation.json';
import fr from '../../public/locales/fr/translation.json';
import tr from '../../public/locales/tr/translation.json';
import de from '../../public/locales/de/translation.json';


const resources = {
  en: {
    translation: en,
  },
  fa: {
    translation: fa,
  },
  ar: {
    translation: ar,
  },
  fr: {
    translation: fr,
  },
  tr: {
    translation: tr,
  },
  de: {
    translation: de,
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "fa",
    debug: false,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
