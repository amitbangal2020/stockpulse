import { BN_POST_SLUGS } from "../blog-posts-bn-slugs";
import type { Locale } from "./locales";

/**
 * Where a page lives in the other language.
 *
 * The Bengali posts are their own statically generated URLs (/bn/blog/…), not
 * the same page rendered with different strings — that is what lets Google
 * index Bengali text in the Bengali HTML. So switching language on those pages
 * means switching URL; everywhere else the copy switches in place.
 */

const BN_PREFIX = "/bn";

/** `/blog` and its posts are the only routes with a Bengali twin today. */
const BENGALI_TWINS: { match: RegExp; to: (match: RegExpMatchArray) => string }[] = [
  { match: /^\/blog$/, to: () => `${BN_PREFIX}/blog` },
  { match: /^\/blog\/([^/]+)$/, to: (match) => `${BN_PREFIX}/blog/${match[1]}` },
];

function normalize(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

function isBengaliPath(pathname: string): boolean {
  return pathname === BN_PREFIX || pathname.startsWith(`${BN_PREFIX}/`);
}

/** `/bn/blog/x` → `/blog/x`; null for any other Bengali path. */
function englishTwin(pathname: string): string | null {
  const withoutPrefix = pathname.slice(BN_PREFIX.length);
  return /^\/blog(\/[^/]+)?$/.test(withoutPrefix) ? withoutPrefix : null;
}

/**
 * The URL `locale` should send the visitor to, or null when there is nothing to
 * do: either the page has no translation (the caller then only swaps the UI
 * language) or the visitor is already on the right one.
 */
export function localizedPath(pathname: string, locale: Locale): string | null {
  const clean = normalize(pathname);

  if (locale === "bn") {
    if (isBengaliPath(clean)) return null;
    for (const twin of BENGALI_TWINS) {
      const match = clean.match(twin.match);
      if (!match) continue;
      // Only cross over when a translation exists — otherwise this would walk
      // visitors into a 404 instead of leaving them on the English article.
      const slug = match[1];
      if (slug && !BN_POST_SLUGS.includes(slug)) return null;
      return twin.to(match);
    }
    return null;
  }

  return isBengaliPath(clean) ? englishTwin(clean) : null;
}
