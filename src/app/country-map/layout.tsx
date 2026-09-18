import type { Metadata } from "next";
import type { ReactNode } from "react";
import { seoMetadata } from "@/lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Country Map Generator — Clean Vector-Style Maps",
  description:
    "Create clean, customizable country maps for presentations, designs and stock portfolios.",
  path: "/country-map",
});

export default function CountryMapLayout({ children }: { children: ReactNode }) {
  return children;
}
