import type { MetadataRoute } from "next";
import { BLOG_POSTS, type BlogPost } from "@/lib/blog-posts";
import { BLOG_POSTS_BN } from "@/lib/blog-posts-bn";
import { BLOG_POSTS_HI } from "@/lib/blog-posts-hi";
import { blogPath } from "@/lib/i18n/localized-path";
import { LOCALES, type Locale } from "@/lib/i18n/locales";

const BASE_URL = "https://www.abanti.in";

const tools = [
  { path: "/metagen", changeFrequency: "weekly" as const, priority: 0.9 },
  { path: "/search", changeFrequency: "daily" as const, priority: 0.9 },
  { path: "/dashboard", changeFrequency: "daily" as const, priority: 0.8 },
  { path: "/trending", changeFrequency: "daily" as const, priority: 0.8 },
  { path: "/portfolio", changeFrequency: "weekly" as const, priority: 0.7 },
  { path: "/portfolio-analytics", changeFrequency: "weekly" as const, priority: 0.7 },
  { path: "/keywords", changeFrequency: "weekly" as const, priority: 0.8 },
  { path: "/country-map", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "/halftone-studio", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "/dither-studio", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "/color-palette", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "/color-harmonizer", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "/svg-to-video", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "/svg-to-eps", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "/mockup-generator", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "/bento-builder", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "/ascii-vision", changeFrequency: "monthly" as const, priority: 0.5 },
  { path: "/candlestick-chart", changeFrequency: "monthly" as const, priority: 0.5 },
  { path: "/market-heatmap", changeFrequency: "monthly" as const, priority: 0.5 },
  { path: "/trend-predictor", changeFrequency: "monthly" as const, priority: 0.5 },
  { path: "/title-optimizer", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "/asset-comparison", changeFrequency: "monthly" as const, priority: 0.5 },
  { path: "/events", changeFrequency: "monthly" as const, priority: 0.5 },
  { path: "/watchlist", changeFrequency: "weekly" as const, priority: 0.6 },
];

/**
 * Every post exists in each language under its own URL, sharing the slug.
 * Listing all of them with each other as alternates is the sitemap half of the
 * hreflang pair.
 */
const blogLanguages = (slug: string) =>
  Object.fromEntries(
    LOCALES.map((locale) => [locale, `${BASE_URL}${blogPath(locale, slug)}`]),
  );

const postsByLocale: { locale: Locale; posts: BlogPost[] }[] = [
  { locale: "en", posts: BLOG_POSTS },
  { locale: "bn", posts: BLOG_POSTS_BN },
  { locale: "hi", posts: BLOG_POSTS_HI },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/how-it-works`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    // Policy and info pages.
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    // The blog index in every language, each pointing at its siblings.
    ...LOCALES.map((locale) => ({
      url: `${BASE_URL}${blogPath(locale)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: locale === "en" ? 0.7 : 0.6,
      alternates: { languages: blogLanguages("") },
    })),
    ...tools.map((tool) => ({
      url: `${BASE_URL}${tool.path}`,
      lastModified: now,
      changeFrequency: tool.changeFrequency,
      priority: tool.priority,
    })),
    ...postsByLocale.flatMap(({ locale, posts }) =>
      posts.map((post) => ({
        url: `${BASE_URL}${blogPath(locale, post.slug)}`,
        lastModified: new Date(post.date),
        changeFrequency: "monthly" as const,
        priority: 0.6,
        alternates: { languages: blogLanguages(`/${post.slug}`) },
      })),
    ),
  ];

  return staticPages;
}
