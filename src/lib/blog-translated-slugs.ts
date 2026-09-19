import type { TranslatedLocale } from "@/lib/i18n/locales";

/**
 * Slugs that have a translation, per language.
 *
 * Deliberately separate from the `blog-posts-<locale>.ts` files: the language
 * switcher runs in every page's client bundle, and importing a post file would
 * drag tens of KB of article bodies along with the handful of slugs it needs.
 *
 * Each post file calls `assertSlugsMatchLocale` with its own slugs, so a post
 * whose translation was never listed here cannot slip through silently — the
 * switcher would otherwise either miss it or point at a 404.
 */
export const TRANSLATED_SLUGS: Record<TranslatedLocale, readonly string[]> = {
  bn: [
    "how-to-write-adobe-stock-titles-that-rank",
    "how-many-keywords-stock-photo-adobe-stock",
    "seasonal-stock-content-upload-timing",
    "ai-generated-content-rules-stock-platforms",
    "best-ai-tools-microstock-sellers-2026",
  ],
  hi: [
    "how-to-write-adobe-stock-titles-that-rank",
    "how-many-keywords-stock-photo-adobe-stock",
    "seasonal-stock-content-upload-timing",
    "ai-generated-content-rules-stock-platforms",
    "best-ai-tools-microstock-sellers-2026",
  ],
};

/** Development tripwire — see above. Silent in production builds. */
export function assertSlugsMatchLocale(locale: TranslatedLocale, slugs: readonly string[]): void {
  if (process.env.NODE_ENV === "production") return;
  if (slugs.join() === TRANSLATED_SLUGS[locale].join()) return;
  console.warn(`[blog] blog-translated-slugs.ts is out of sync with the ${locale} posts`, {
    posted: slugs,
    listed: [...TRANSLATED_SLUGS[locale]],
  });
}
