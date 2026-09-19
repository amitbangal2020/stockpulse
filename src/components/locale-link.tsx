"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useLanguage } from "@/components/language-provider";
import type { Locale } from "@/lib/i18n/locales";

/**
 * A link to the same page in another language that takes the UI language with
 * it.
 *
 * Landing on /bn/* forces the shell to Bengali, but nothing forces it back —
 * so "read this in English" has to say so itself, in a client component (the
 * Bengali blog pages stay server-rendered, which is the whole point).
 */
export function LocaleLink({
  href,
  locale,
  className,
  children,
}: {
  href: string;
  locale: Locale;
  className?: string;
  children: ReactNode;
}) {
  const { setLocale } = useLanguage();

  return (
    <Link href={href} className={className} onClick={() => setLocale(locale)}>
      {children}
    </Link>
  );
}
