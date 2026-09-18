import type { Metadata } from "next";
import type { ReactNode } from "react";
import { seoMetadata } from "@/lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Stock Title Optimizer — Score & Improve Your Titles",
  description:
    "Score your stock photo titles for SEO, length and keyword strength, then improve them with AI suggestions.",
  path: "/title-optimizer",
});

export default function TitleOptimizerLayout({ children }: { children: ReactNode }) {
  return children;
}
