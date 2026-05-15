// frontend/app/src/i18n.js
// @ts-nocheck
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  // Load translations from a URL (e.g. /locales/es/translation.json)
  .use(HttpApi)
  // Automatically detect the user's language from browser, localStorage, etc.
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next for use in components
  .use(initReactI18next)
  .init({
    // Language to use if the detected language is not available
    fallbackLng: 'es',
    // List of supported languages
    supportedLngs: ['es', 'en'],
    // Default namespace to load
    defaultNS: 'translation',
    // Options for the backend that loads JSON files
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    // Language detection options
    detection: {
      order: ['localStorage', 'cookie', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
    },
    // Allows React to use Suspense for async translation loading
    react: {
      useSuspense: true,
    },
    interpolation: {
        // React already protects against XSS attacks, so double escaping is not needed.
        escapeValue: false,
    }
  });

export default i18n;