import type { Metadata } from "next";
import type { ReactNode } from "react";
import { seoMetadata } from "@/lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Keyword Research Tool for Microstock — High-Demand Tags",
  description:
    "Find high-demand, low-competition keywords for stock photos and vectors. Boost your Adobe Stock and Shutterstock rankings.",
  path: "/keywords",
});

export default function KeywordsLayout({ children }: { children: ReactNode }) {
  return children;
}
