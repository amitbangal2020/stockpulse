import type { Metadata } from "next";
import type { ReactNode } from "react";
import { seoMetadata } from "@/lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Microstock Events Calendar — Upload Ideas by Season",
  description:
    "A calendar of seasonal events and holidays with stock content ideas, so you upload ahead of demand.",
  path: "/events",
});

export default function EventsLayout({ children }: { children: ReactNode }) {
  return children;
}
