import type { Metadata } from "next";
import type { ReactNode } from "react";
import { seoMetadata } from "@/lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Market Heatmap — Visualize Microstock Demand",
  description:
    "See which stock topics and styles are hot right now with a visual demand heatmap.",
  path: "/market-heatmap",
});

export default function MarketHeatmapLayout({ children }: { children: ReactNode }) {
  return children;
}
