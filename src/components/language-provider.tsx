"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  DEFAULT_LOCALE,
  LOCALE_HTML_LANG,
  LOCALE_STORAGE_KEY,
  isLocale,
  type Locale,
} from "@/lib/i18n/locales";
import { messages, type Messages } from "@/lib/i18n/messages";

interface LanguageValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** Copy for the active language: `t.nav.blog`, `t.howItWorks.title`, … */
  t: Messages;
}

const LanguageContext = createContext<LanguageValue | null>(null);

/** Safe outside the provider (e.g. a stray component) — falls back to English. */
export function useLanguage(): LanguageValue {
  return useContext(LanguageContext) ?? { locale: DEFAULT_LOCALE, setLocale: () => {}, t: messages[DEFAULT_LOCALE] };
}

function readStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(stored) ? stored : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

/**
 * Same hydration rule as the theme: the first client render must equal the
 * server render, so we start on the default locale and switch in an effect.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = readStoredLocale();
    if (stored !== DEFAULT_LOCALE) setLocaleState(stored);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      /* storage unavailable — the in-memory choice still applies */
    }
    document.documentElement.lang = LOCALE_HTML_LANG[next];
  }, []);

  const value = useMemo<LanguageValue>(
    () => ({ locale, setLocale, t: messages[locale] }),
    [locale, setLocale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
