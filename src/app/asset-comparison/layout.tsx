import type { Metadata } from "next";
import type { ReactNode } from "react";
import { seoMetadata } from "@/lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Asset Comparison — Compare Stock Asset Performance",
  description:
    "Compare downloads and performance of multiple stock assets side by side to spot your best sellers.",
  path: "/asset-comparison",
});

export default function AssetComparisonLayout({ children }: { children: ReactNode }) {
  return children;
}
