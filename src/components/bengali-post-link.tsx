"use client";

import Link from "next/link";
import { Languages } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

/**
 * Points readers of the English posts at the Bengali translations.
 *
 * This one has to be a client component: the label follows the visitor's chosen
 * language, and the language is only known in the browser (localStorage). That
 * costs the Bengali pages nothing — their actual *content* is still rendered
 * server-side in `blog-bn.tsx`, which is what Google indexes.
 */
export function BengaliPostLink({ slug }: { slug?: string }) {
  const { t } = useLanguage();

  return (
    <Link
      href={slug ? `/bn/blog/${slug}` : "/bn/blog"}
      className="flex items-center gap-2 rounded-xl border border-accent/25 bg-accent-subtle px-3.5 py-2.5 text-[11px] font-medium text-accent transition-colors hover:border-accent/60"
    >
      <Languages className="h-3.5 w-3.5 shrink-0" />
      {slug ? t.blog.bengaliThis : t.blog.bengaliAll}
      <span aria-hidden>→</span>
    </Link>
  );
}
