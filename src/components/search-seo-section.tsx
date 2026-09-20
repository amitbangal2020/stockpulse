"use client";

import { useLanguage } from "@/components/language-provider";
import Link from "next/link";

/**
 * SEO copy below the search tool, localized through the shared dictionary.
 * English markup arrives in the initial HTML (what Google indexes for the
 * bare /search URL); after hydration it renders in the visitor's language —
 * same behaviour as every other tool page.
 */
export function SearchSeoSection() {
  const { t } = useLanguage();
  const s = t.searchSeo;

  return (
    <section className="mt-10 border-t border-border bg-bg-secondary">
      <div className="mx-auto max-w-screen-2xl px-5 py-12 lg:px-8">
        <h2 className="font-heading text-lg font-bold tracking-tight text-text-primary">
          {s.title}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-secondary">
          {s.intro}
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {s.cards.map((card) => (
            <div key={card.title} className="rounded-xl border border-border bg-surface p-5">
              <h3 className="text-sm font-semibold text-text-primary">{card.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-text-muted">{card.body}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-10 font-heading text-lg font-bold tracking-tight text-text-primary">
          {s.faqTitle}
        </h2>
        <div className="mt-4 grid gap-x-8 gap-y-5 md:grid-cols-2">
          {s.faqs.map((item) => (
            <div key={item.q}>
              <h3 className="text-sm font-semibold text-text-primary">{item.q}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-text-muted">{item.a}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs leading-relaxed text-text-muted">
          {s.footnote}{" "}
          <Link href="/how-it-works" className="text-accent hover:underline">
            {s.linkHow}
          </Link>{" "}
          {s.linkBlogJoin}{" "}
          <Link href="/blog" className="text-accent hover:underline">
            {s.linkBlog}
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
