import type { Metadata } from "next";
import { ToolLayout } from "@/components/tool-layout";
import { SearchTool } from "@/components/search-tool";
import { seoMetadata } from "@/lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Adobe Stock Contributor Tracker — Portfolio & Download Analytics",
  description:
    "Track any Adobe Stock contributor's portfolio in real time: total downloads, top assets, per-asset stats, and CSV export. Search by keyword, contributor ID, or asset ID.",
  path: "/search",
});

export default function SearchPage() {
  return (
    <ToolLayout>
      <SearchTool />
    </ToolLayout>
  );
}
