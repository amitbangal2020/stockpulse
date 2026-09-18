import type { Metadata } from "next";
import type { ReactNode } from "react";
import { seoMetadata } from "@/lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Bento Builder — Beautiful Bento Grid Graphics",
  description:
    "Design bento-style grid graphics with drag-and-drop blocks. Great for social posts, landing pages and stock assets.",
  path: "/bento-builder",
});

export default function BentoBuilderLayout({ children }: { children: ReactNode }) {
  return children;
}
