import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  SUPPORTED_LANGUAGES,
  TRANSLATIONS,
  resolveTranslationPath,
} from '../data/translations';

export const LANGUAGE_STORAGE_KEY = 'gokul_ghee_lang_v1';
const VALID_LANGUAGE_CODES = new Set(['en', 'hi', 'hinglish']);

function readInitialLanguage() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return 'en';
    }
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && VALID_LANGUAGE_CODES.has(stored)) {
      return stored;
    }
  } catch {
    // Ignore storage access errors
  }
  return 'en';
}

function createTranslator(language) {
  const pack = TRANSLATIONS[language] || TRANSLATIONS.en;
  const fallbackPack = TRANSLATIONS.en;

  const t = (path, fallback) => {
    const localized = resolveTranslationPath(pack, path);
    if (localized !== undefined) return localized;
    const defaultVal = resolveTranslationPath(fallbackPack, path);
    if (defaultVal !== undefined) return defaultVal;
    return fallback !== undefined ? fallback : path;
  };

  const categoryLabel = (slug, defaultName) => {
    if (!slug) return defaultName || '';
    const localized = pack?.categories?.[slug]?.name;
    if (localized) return localized;
    return defaultName || fallbackPack?.categories?.[slug]?.name || slug;
  };

  const categoryTagline = (slug, defaultTagline) => {
    if (!slug) return defaultTagline || '';
    const localized = pack?.categories?.[slug]?.tagline;
    if (localized) return localized;
    return defaultTagline || fallbackPack?.categories?.[slug]?.tagline || '';
  };

  return { t, categoryLabel, categoryTagline, pack };
}

const DEFAULT_TRANSLATOR = createTranslator('en');

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  languages: SUPPORTED_LANGUAGES,
  ...DEFAULT_TRANSLATOR,
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(readInitialLanguage);

  const setLanguage = useCallback((nextLang) => {
    const normalized = VALID_LANGUAGE_CODES.has(nextLang) ? nextLang : 'en';
    setLanguageState(normalized);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(LANGUAGE_STORAGE_KEY, normalized);
      }
    } catch {
      // Ignore storage persistence errors
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language === 'hi' ? 'hi' : 'en';
      document.documentElement.dataset.gokulLang = language;
    }
  }, [language]);

  const value = useMemo(() => {
    const translator = createTranslator(language);
    return {
      language,
      setLanguage,
      languages: SUPPORTED_LANGUAGES,
      ...translator,
    };
  }, [language, setLanguage]);

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
