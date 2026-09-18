import type { Metadata } from "next";
import type { ReactNode } from "react";
import { seoMetadata } from "@/lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "StockPulse Blog — Microstock Tips, AI Workflows & Keyword Research",
  description:
    "Practical guides for microstock sellers: AI metadata workflows, Adobe Stock keyword strategy, trend forecasting and earning more from every upload.",
  path: "/blog",
});

export default function BlogLayout({ children }: { children: ReactNode }) {
  return children;
}
