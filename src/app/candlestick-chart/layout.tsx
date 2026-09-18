import type { Metadata } from "next";
import type { ReactNode } from "react";
import { seoMetadata } from "@/lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Candlestick Chart Maker — OHLC Charts in Seconds",
  description:
    "Create professional candlestick charts from OHLC data. Custom colors, clean export, no design skills needed.",
  path: "/candlestick-chart",
});

export default function CandlestickChartLayout({ children }: { children: ReactNode }) {
  return children;
}
