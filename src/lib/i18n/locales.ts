// Supported UI languages. Add a code here, then add the matching dictionary in
// `messages.ts` — the `Messages` type refuses to compile until it exists.
//
// A language listed here also gets a blog URL space (/bn/blog, /hi/blog) and
// joins the hreflang set, so adding one is a content job, not just a label.
export const LOCALES = ["en", "bn", "hi"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

/** Languages that live behind a URL prefix; English owns the bare paths. */
export type TranslatedLocale = Exclude<Locale, typeof DEFAULT_LOCALE>;

export const TRANSLATED_LOCALES = LOCALES.filter(
  (locale): locale is TranslatedLocale => locale !== DEFAULT_LOCALE,
);
export function isTranslatedLocale(value: string): value is TranslatedLocale {
  return (TRANSLATED_LOCALES as readonly string[]).includes(value);
}

/** Shared with the pre-paint script in the root layout so both agree. */
export const LOCALE_STORAGE_KEY = "locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  bn: "বাংলা",
  hi: "हिंदी",
};

/** Short form for tight spots (the phone top bar). */
export const LOCALE_SHORT: Record<Locale, string> = {
  en: "EN",
  bn: "বাং",
  hi: "हिं",
};

/** `<html lang>` values — "bn" and "hi" are what screen readers and Google expect. */
export const LOCALE_HTML_LANG: Record<Locale, string> = {
  en: "en",
  bn: "bn",
  hi: "hi",
};

/** Open Graph locales, which want a region suffix. */
export const LOCALE_OG: Record<Locale, string> = {
  en: "en_US",
  bn: "bn_IN",
  hi: "hi_IN",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}
