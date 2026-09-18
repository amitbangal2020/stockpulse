import type { Metadata } from "next";
import type { ReactNode } from "react";
import { seoMetadata } from "@/lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Portfolio Manager — Organize Your Microstock Assets",
  description:
    "Manage and organize your uploaded stock photos, vectors and illustrations across all microstock platforms.",
  path: "/portfolio",
});

export default function PortfolioLayout({ children }: { children: ReactNode }) {
  return children;
}
