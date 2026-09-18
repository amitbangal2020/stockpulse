import type { Metadata } from "next";
import type { ReactNode } from "react";
import { seoMetadata } from "@/lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "How StockPulse Works — AI Metadata for Microstock",
  description:
    "Learn how StockPulse generates stock-optimized titles, keywords and descriptions, and how to track your portfolio.",
  path: "/how-it-works",
});

export default function HowItWorksLayout({ children }: { children: ReactNode }) {
  return children;
}
