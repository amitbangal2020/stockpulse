"use client";

import Link from "next/link";
import { ChevronDown, Languages } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { blogPath } from "@/lib/i18n/localized-path";
import type { Locale } from "@/lib/i18n/locales";

/**
 * "Read this in another language" — one dropdown for the whole blog, instead of
 * a row of links that grows with every language we add.
 *
 * Deliberately a plain `<details>` rather than a JS popup: the links to the
 * other languages stay in the initial HTML, which is how crawlers discover the
 * translated URLs, and each one carries `hreflang` so the pairing is
 * unambiguous. It also works without JavaScript.
 *
 * The client side is only for two things — the label has to be in the language
 * the reader is using, and picking a language moves the UI with it.
 */
export function BlogLanguageMenu({ targets, slug }: { targets: Locale[]; slug?: string }) {
  const { t, setLocale } = useLanguage();
  if (targets.length === 0) return null;

  return (
    <details className="group relative w-fit print:hidden">
      <summary className="flex w-fit cursor-pointer list-none items-center gap-2 rounded-xl border border-accent/25 bg-accent-subtle px-3.5 py-2.5 text-[11px] font-medium text-accent transition-colors hover:border-accent/60 [&::-webkit-details-marker]:hidden">
        <Languages className="h-3.5 w-3.5 shrink-0" />
        {t.blog.otherLanguages}
        <ChevronDown className="h-3 w-3 shrink-0 transition-transform group-open:rotate-180" />
      </summary>

      <ul className="absolute left-0 top-full z-30 mt-1 max-h-72 w-72 overflow-y-auto rounded-xl border border-border bg-surface-elevated p-1 shadow-2xl">
        {targets.map((target) => (
          <li key={target}>
            <Link
              href={blogPath(target, slug)}
              hrefLang={target}
              lang={target}
              onClick={() => setLocale(target)}
              className="flex items-start gap-2 rounded-lg px-2.5 py-2 text-[11px] font-medium text-text-secondary transition-colors hover:bg-accent/5 hover:text-accent"
            >
              {t.blog.translations[target][slug ? "this" : "all"]}
              <span aria-hidden className="ml-auto shrink-0">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}
