import type { Metadata } from "next";
import type { ReactNode } from "react";
import { seoMetadata } from "@/lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "SVG to EPS Converter — Print-Ready Vector Files",
  description:
    "Convert SVG vectors to EPS format for Adobe Stock and print. Free, fast and fully in-browser.",
  path: "/svg-to-eps",
});

export default function SvgToEpsLayout({ children }: { children: ReactNode }) {
  return children;
}
