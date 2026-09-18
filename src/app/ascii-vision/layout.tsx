import type { Metadata } from "next";
import type { ReactNode } from "react";
import { seoMetadata } from "@/lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "ASCII Art Generator — Turn Images into ASCII Text",
  description:
    "Convert any image into ASCII art with adjustable density and characters. Copy or export as text or PNG.",
  path: "/ascii-vision",
});

export default function AsciiVisionLayout({ children }: { children: ReactNode }) {
  return children;
}
