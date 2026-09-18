import type { Metadata } from "next";
import type { ReactNode } from "react";
import { seoMetadata } from "@/lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Trend Predictor — Spot the Next Big Stock Topic",
  description:
    "Predict rising microstock trends before they peak. Data-driven topic suggestions for photographers and vector artists.",
  path: "/trend-predictor",
});

export default function TrendPredictorLayout({ children }: { children: ReactNode }) {
  return children;
}
