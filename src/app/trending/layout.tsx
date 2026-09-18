import type { Metadata } from "next";
import type { ReactNode } from "react";
import { seoMetadata } from "@/lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Trending Stock Keywords — What's Hot on Adobe Stock",
  description:
    "Discover trending keywords and popular assets across stock platforms. Find high-demand topics before they saturate.",
  path: "/trending",
});

export default function TrendingLayout({ children }: { children: ReactNode }) {
  return children;
}
