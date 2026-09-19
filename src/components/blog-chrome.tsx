"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

/**
 * The blog pages are server components (static, crawlable HTML), so the small
 * pieces of UI copy that should follow the visitor's language live here instead.
 * Post titles, descriptions and bodies stay as written — that is content, not
 * chrome.
 */

export function BlogHeader({ variant = "index" }: { variant?: "index" | "post" }) {
  const { t } = useLanguage();

  return (
    <div className="sticky top-[var(--shell-top)] z-20 flex items-center gap-3 border-b border-border bg-bg px-5 py-2.5 lg:top-0">
      {variant === "post" ? (
        <Link
          href="/blog"
          className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-[10px] font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent"
        >
          <ArrowLeft className="h-3 w-3" /> {t.blog.allPosts}
        </Link>
      ) : (
        <>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
            <BookOpen className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text-primary">{t.blog.title}</h2>
            <p className="text-[11px] text-text-muted">{t.blog.subtitle}</p>
          </div>
        </>
      )}
    </div>
  );
}

export function BlogEmptyState() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
        <BookOpen className="h-6 w-6 text-accent" />
      </div>
      <h3 className="font-heading text-lg font-semibold text-text-primary">{t.blog.comingSoon}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-text-muted">{t.blog.comingSoonBody}</p>
    </div>
  );
}

export function BlogKeepReading() {
  const { t } = useLanguage();

  return (
    <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-text-muted">
      {t.blog.keepReading}
    </h2>
  );
}
