import type { Metadata } from "next";
import { BlogIndexView } from "@/components/blog-locale-view";
import { blogIndexMetadata } from "@/lib/blog-seo";

export const metadata: Metadata = blogIndexMetadata("hi");

export default function HindiBlogIndexPage() {
  return <BlogIndexView locale="hi" />;
}
