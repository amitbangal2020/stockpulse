import { TRANSLATED_SLUGS } from "../blog-translated-slugs";
import { DEFAULT_LOCALE, isTranslatedLocale, type Locale } from "./locales";

/**
 * Where a page lives in another language.
 *
 * The translated posts are their own statically generated URLs (/bn/blog/…,
 * /hi/blog/…), not the same page rendered with different strings — that is what
 * lets Google index each language in its own HTML. So switching language on
 * those pages means switching URL; everywhere else the copy switches in place.
 *
 * Kept free of post data on purpose: this runs in the client bundle, so it
 * checks availability against the slug list rather than the articles.
 */

/** The URL of a blog page in `locale`. */
export function blogPath(locale: Locale, slug?: string): string {
  const base = locale === DEFAULT_LOCALE ? "/blog" : `/${locale}/blog`;
  return slug ? `${base}/${slug}` : base;
}

function normalize(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

/**
 * Which language a path is served in, plus the language-less path behind it:
 * `/hi/blog/x` → `{ locale: "hi", base: "/blog/x" }`, `/blog` →
 * `{ locale: "en", base: "/blog" }`.
 */
export function splitLocale(pathname: string): { locale: Locale; base: string } {
  const clean = normalize(pathname);
  const match = /^\/([a-z]{2})(\/.*)?$/.exec(clean);
  const prefix = match?.[1];
  if (prefix && isTranslatedLocale(prefix)) {
    return { locale: prefix, base: match[2] || "/" };
  }
  return { locale: DEFAULT_LOCALE, base: clean };
}

/**
 * The URL `locale` should send the visitor to, or null when there is nothing to
 * do: the page has no version in that language (the caller then only swaps the
 * UI copy) or the visitor is already on it.
 *
 * Only the blog exists as one page per language today — that is the `base`
 * check below.
 */
export function localizedPath(pathname: string, locale: Locale): string | null {
  const { locale: current, base } = splitLocale(pathname);
  if (current === locale) return null;

  const slug = /^\/blog\/([^/]+)$/.exec(base)?.[1];
  if (base !== "/blog" && !slug) return null;

  // Only cross over when a translation actually exists — otherwise this would
  // walk visitors into a 404 instead of leaving them on the article they opened.
  if (slug && isTranslatedLocale(locale) && !TRANSLATED_SLUGS[locale].includes(slug)) return null;

  return blogPath(locale, slug);
}
