import type { Metadata } from "next";
import type { ReactNode } from "react";
import { seoMetadata } from "@/lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Microstock Dashboard — Portfolio Performance at a Glance",
  description:
    "See your microstock earnings, downloads and portfolio activity in one overview. Track performance across Adobe Stock, Shutterstock and Freepik.",
  path: "/dashboard",
});

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return children;
}
