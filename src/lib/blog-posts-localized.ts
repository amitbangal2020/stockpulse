import { BLOG_POSTS, getPostBySlug, type BlogPost } from "./blog-posts";
import { BLOG_POSTS_BN, getBnPostBySlug } from "./blog-posts-bn";
import { BLOG_POSTS_HI, getHiPostBySlug } from "./blog-posts-hi";
import { LOCALES, type Locale } from "./i18n/locales";

/**
 * One place that knows where a post lives in each language.
 *
 * Server-only by nature — it imports every language's article bodies, which is
 * exactly what the client bundle must not do (see `blog-translated-slugs.ts`).
 */
const SOURCES: Record<Locale, { posts: BlogPost[]; bySlug: (slug: string) => BlogPost | undefined }> = {
  en: { posts: BLOG_POSTS, bySlug: getPostBySlug },
  bn: { posts: BLOG_POSTS_BN, bySlug: getBnPostBySlug },
  hi: { posts: BLOG_POSTS_HI, bySlug: getHiPostBySlug },
};

export function localizedPosts(locale: Locale): BlogPost[] {
  return SOURCES[locale].posts;
}

export function localizedPost(locale: Locale, slug: string): BlogPost | undefined {
  return SOURCES[locale].bySlug(slug);
}

/**
 * Languages that actually have this blog page — the post when a slug is given,
 * otherwise the index. Used for hreflang and for the language pills, so neither
 * can ever point at a page that does not exist.
 */
export function availableLocales(slug?: string): Locale[] {
  return LOCALES.filter((locale) =>
    slug ? Boolean(localizedPost(locale, slug)) : localizedPosts(locale).length > 0,
  );
}
