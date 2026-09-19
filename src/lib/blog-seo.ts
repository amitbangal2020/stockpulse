import type { Metadata } from "next";
import type { BlogPost } from "./blog-posts";
import { availableLocales } from "./blog-posts-localized";
import { BLOG_INDEX_SEO } from "./blog-locale-copy";
import { blogPath } from "./i18n/localized-path";
import { DEFAULT_LOCALE, LOCALE_OG, type Locale } from "./i18n/locales";

export const SITE_URL = "https://www.abanti.in";

/**
 * The hreflang set for a blog page.
 *
 * Two rules worth keeping: `x-default` always points at English, and a language
 * is only listed when the page genuinely exists in it — announcing a Bengali
 * translation of an English-only post would send Google (and readers) to a 404.
 */
export function blogAlternates(locale: Locale, slug?: string) {
  const languages: Record<string, string> = {};
  for (const other of availableLocales(slug)) {
    languages[other] = `${SITE_URL}${blogPath(other, slug)}`;
  }
  languages["x-default"] = `${SITE_URL}${blogPath(DEFAULT_LOCALE, slug)}`;

  return {
    canonical: `${SITE_URL}${blogPath(locale, slug)}`,
    languages,
  };
}

export function blogIndexMetadata(locale: Locale): Metadata {
  const copy = BLOG_INDEX_SEO[locale];
  const url = `${SITE_URL}${blogPath(locale)}`;

  return {
    title: copy.title,
    description: copy.description,
    alternates: blogAlternates(locale),
    openGraph: {
      title: copy.title,
      description: copy.description,
      url,
      siteName: "StockPulse",
      type: "website",
      locale: LOCALE_OG[locale],
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: copy.ogAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.description,
      images: ["/og-image.png"],
    },
  };
}

export function blogPostMetadata(locale: Locale, post: BlogPost): Metadata {
  const url = `${SITE_URL}${blogPath(locale, post.slug)}`;

  return {
    title: post.title,
    description: post.description,
    alternates: blogAlternates(locale, post.slug),
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      siteName: "StockPulse",
      type: "article",
      locale: LOCALE_OG[locale],
      publishedTime: post.date,
      tags: post.tags,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: ["/og-image.png"],
    },
  };
}

/** Article structured data for Google rich results. */
export function blogArticleJsonLd(locale: Locale, post: BlogPost) {
  const url = `${SITE_URL}${blogPath(locale, post.slug)}`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    // Stated explicitly so the rich result is attributed to this language's
    // version rather than to the English article it translates.
    inLanguage: LOCALE_OG[locale].replace("_", "-"),
    datePublished: post.date,
    author: { "@type": "Organization", name: "StockPulse", url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: "StockPulse",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/og-image.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    keywords: post.tags.join(", "),
  };
}
