import type { Metadata } from "next";
import type { ReactNode } from "react";
import { seoMetadata } from "@/lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Dither Studio — Retro Pixel Dithering Effects",
  description:
    "Apply retro dithering effects to any image. Choose from Bayer, noise and other pixel-art dither patterns.",
  path: "/dither-studio",
});

export default function DitherStudioLayout({ children }: { children: ReactNode }) {
  return children;
}
