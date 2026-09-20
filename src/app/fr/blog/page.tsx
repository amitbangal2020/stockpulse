import type { Metadata } from "next";
import { BlogIndexView } from "@/components/blog-locale-view";
import { blogIndexMetadata } from "@/lib/blog-seo";

export const metadata: Metadata = blogIndexMetadata("fr");

export default function FrenchBlogIndexPage() {
  return <BlogIndexView locale="fr" />;
}
