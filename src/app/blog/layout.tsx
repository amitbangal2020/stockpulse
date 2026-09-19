import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { blogIndexMetadata } from "@/lib/blog-seo";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";

// Canonical + hreflang for every language the blog exists in, from one place.
export const metadata: Metadata = blogIndexMetadata(DEFAULT_LOCALE);

export default function BlogLayout({ children }: { children: ReactNode }) {
  return <ToolLayout>{children}</ToolLayout>;
}
