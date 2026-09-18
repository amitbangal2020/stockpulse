import type { Metadata } from "next";
import type { ReactNode } from "react";
import { seoMetadata } from "@/lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Color Palette Generator — Palettes from Any Image",
  description:
    "Extract beautiful color palettes from any image. Copy hex codes and build consistent color schemes for your designs.",
  path: "/color-palette",
});

export default function ColorPaletteLayout({ children }: { children: ReactNode }) {
  return children;
}
