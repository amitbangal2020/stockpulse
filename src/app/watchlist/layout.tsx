import type { Metadata } from "next";
import type { ReactNode } from "react";
import { seoMetadata } from "@/lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Contributor Watchlist — Track Adobe Stock Creators",
  description:
    "Follow your favorite Adobe Stock contributors and monitor their portfolio growth and downloads over time.",
  path: "/watchlist",
});

export default function WatchlistLayout({ children }: { children: ReactNode }) {
  return children;
}
