import type { Metadata } from "next";
import type { ReactNode } from "react";
import { seoMetadata } from "@/lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "SVG to Video Converter — Animated MP4 & WebM Export",
  description:
    "Convert SVG animations to MP4, WebM or GIF video. Smooth frame-by-frame rendering with transparent background support.",
  path: "/svg-to-video",
});

export default function SvgToVideoLayout({ children }: { children: ReactNode }) {
  return children;
}
