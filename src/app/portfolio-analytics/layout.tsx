import type { Metadata } from "next";
import type { ReactNode } from "react";
import { seoMetadata } from "@/lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Portfolio Analytics — Downloads & Earnings Insights",
  description:
    "Deep analytics for your microstock portfolio: download trends, best-performing assets and platform comparison.",
  path: "/portfolio-analytics",
});

export default function PortfolioAnalyticsLayout({ children }: { children: ReactNode }) {
  return children;
}
