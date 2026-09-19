import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SITE_URL, seoMetadata } from "@/lib/seo";
import { ToolLayout } from "@/components/tool-layout";

export const metadata: Metadata = {
  ...seoMetadata({
    title: "StockPulse Blog — Microstock Tips, AI Workflows & Keyword Research",
    description:
      "Practical guides for microstock sellers: AI metadata workflows, Adobe Stock keyword strategy, trend forecasting and earning more from every upload.",
    path: "/blog",
  }),
  // The Bengali blog lives at /bn/blog — declaring the pair here keeps Google
  // from treating the two language versions as competing pages.
  alternates: {
    canonical: `${SITE_URL}/blog`,
    languages: {
      en: `${SITE_URL}/blog`,
      bn: `${SITE_URL}/bn/blog`,
      "x-default": `${SITE_URL}/blog`,
    },
  },
};

export default function BlogLayout({ children }: { children: ReactNode }) {
  return <ToolLayout>{children}</ToolLayout>;
}
