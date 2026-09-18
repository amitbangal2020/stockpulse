import type { Metadata } from "next";
import type { ReactNode } from "react";
import { seoMetadata } from "@/lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Mockup Generator — Device & Print Mockups in Seconds",
  description:
    "Create professional device and print mockups from your artwork. Ideal for stock previews and client presentations.",
  path: "/mockup-generator",
});

export default function MockupGeneratorLayout({ children }: { children: ReactNode }) {
  return children;
}
