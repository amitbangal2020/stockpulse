import type { Metadata } from "next";
import type { ReactNode } from "react";
import { seoMetadata } from "@/lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Halftone Studio — Turn Photos into Halftone Art",
  description:
    "Convert photos into halftone-style art with adjustable dot size, contrast and pattern. Perfect for posters and stock graphics.",
  path: "/halftone-studio",
});

export default function HalftoneStudioLayout({ children }: { children: ReactNode }) {
  return children;
}
