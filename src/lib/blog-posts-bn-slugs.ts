/**
 * Slugs that have a Bengali translation.
 *
 * Deliberately separate from `blog-posts-bn.ts`: the language switcher runs in
 * every page's client bundle, and importing that module would drag ~30 KB of
 * post bodies along with the handful of slugs it needs.
 *
 * `blog-posts-bn.ts` compares this list against its own posts in development,
 * so a new post with a forgotten slug here cannot slip through silently.
 */
export const BN_POST_SLUGS: readonly string[] = [
  "how-to-write-adobe-stock-titles-that-rank",
  "how-many-keywords-stock-photo-adobe-stock",
  "seasonal-stock-content-upload-timing",
  "ai-generated-content-rules-stock-platforms",
  "best-ai-tools-microstock-sellers-2026",
];
