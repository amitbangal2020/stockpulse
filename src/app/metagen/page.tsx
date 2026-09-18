import type { Metadata } from "next";
import { ToolLayout } from "@/components/tool-layout";
import { MetadataGenerator } from "@/components/metadata-generator";
import { seoMetadata } from "@/lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "AI Metadata Generator for Stock Photos — Titles, Keywords & Descriptions",
  description:
    "Generate SEO-optimized titles, keywords, and descriptions for Adobe Stock, Shutterstock, Freepik & Vecteezy in seconds. Batch AI metadata for stock photos, vectors and illustrations.",
  path: "/metagen",
});

export default function MetaGenPage() {
  return (
    <ToolLayout>
      <MetadataGenerator />
    </ToolLayout>
  );
}
