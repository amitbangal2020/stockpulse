import type { Metadata } from "next";
import type { ReactNode } from "react";
import { seoMetadata } from "@/lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Color Harmonizer — Build Harmonious Color Schemes",
  description:
    "Create complementary, analogous and triadic color harmonies with live preview. Perfect for designers and stock artists.",
  path: "/color-harmonizer",
});

export default function ColorHarmonizerLayout({ children }: { children: ReactNode }) {
  return children;
}
