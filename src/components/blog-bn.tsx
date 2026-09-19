import Link from "next/link";
import { ArrowLeft, BookOpen, Languages } from "lucide-react";
import { LocaleLink } from "@/components/locale-link";

/**
 * Bengali blog chrome — deliberately plain server components (no "use client").
 *
 * The point of /bn/blog is that Google receives Bengali text in the *initial
 * HTML*: a client component reading the visitor's language would render
 * English on the server, which is exactly what we must avoid here. So the
 * Bengali labels are hard-coded rather than pulled from `useLanguage()`.
 *
 * `useLanguage()` still drives the app shell (sidebar, settings drawer), which
 * /bn routes force to Bengali via <ForceLocale />.
 */

export function BlogHeaderBn({ variant = "index" }: { variant?: "index" | "post" }) {
  return (
    <div className="sticky top-[45px] z-20 flex items-center gap-3 border-b border-border bg-bg px-5 py-2.5 lg:top-0">
      {variant === "post" ? (
        <>
          <Link
            href="/bn/blog"
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-[10px] font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent"
          >
            <ArrowLeft className="h-3 w-3" /> সব পোস্ট
          </Link>
          <LocaleLink
            href="/blog"
            locale="en"
            className="ml-auto flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-[10px] font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent"
          >
            <Languages className="h-3 w-3" /> সব পোস্ট ইংরেজিতে
          </LocaleLink>
        </>
      ) : (
        <>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
            <BookOpen className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text-primary">ব্লগ</h2>
            <p className="text-[11px] text-text-muted">
              মাইক্রোস্টক টিপস, AI ওয়ার্কফ্লো ও কীওয়ার্ড স্ট্র্যাটেজি
            </p>
          </div>
          <LocaleLink
            href="/blog"
            locale="en"
            className="ml-auto flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-[10px] font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent"
          >
            <Languages className="h-3 w-3" /> Read in English
          </LocaleLink>
        </>
      )}
    </div>
  );
}

export function BlogKeepReadingBn() {
  return (
    <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-text-muted">আরও পড়ুন</h2>
  );
}

export function BlogEmptyStateBn() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
        <BookOpen className="h-6 w-6 text-accent" />
      </div>
      <h3 className="font-heading text-lg font-semibold text-text-primary">শীঘ্রই আসছে</h3>
      <p className="mt-1.5 max-w-sm text-sm text-text-muted">
        বাংলা গাইডগুলো লেখা হচ্ছে — ততদিন ইংরেজি পোস্টগুলো পড়তে পারেন।
      </p>
    </div>
  );
}

// The banner that links the English posts to their Bengali versions lives in
// `bengali-post-link.tsx` — its label has to follow the visitor's language, so
// it is a client component (unlike everything above).
