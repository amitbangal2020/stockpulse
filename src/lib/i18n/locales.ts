// Supported UI languages. Add a code here, then add the matching dictionary in
// `messages.ts` — the `Messages` type refuses to compile until it exists.
export const LOCALES = ["en", "bn"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Shared with the pre-paint script in the root layout so both agree. */
export const LOCALE_STORAGE_KEY = "locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  bn: "বাংলা",
};

/** Short form for tight spots (the phone top bar). */
export const LOCALE_SHORT: Record<Locale, string> = {
  en: "EN",
  bn: "বাং",
};

/** `<html lang>` values — "bn" is what screen readers and Google expect. */
export const LOCALE_HTML_LANG: Record<Locale, string> = {
  en: "en",
  bn: "bn",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}
