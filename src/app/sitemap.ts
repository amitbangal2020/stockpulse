import type { MetadataRoute } from "next";

const BASE_URL = "https://abanti.in";

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

const infoPages = [
  { path: "/how-it-works", changeFrequency: "monthly" as const, priority: 0.4 },
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
    ...infoPages.map((page) => ({
      url: `${BASE_URL}${page.path}`,
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    ...tools.map((tool) => ({
      url: `${BASE_URL}${tool.path}`,
      lastModified: now,
      changeFrequency: tool.changeFrequency,
      priority: tool.priority,
    })),
  ];

  return staticPages;
}
