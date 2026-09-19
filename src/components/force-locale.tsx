"use client";

import { useEffect, useRef } from "react";
import { useLanguage } from "@/components/language-provider";
import type { Locale } from "@/lib/i18n/locales";

/**
 * Language-scoped routes (/bn/*) are Bengali-first: the URL already says which
 * language the visitor wants, so the app shell follows the page instead of the
 * other way round. Runs once — picking another language afterwards still works.
 */
export function ForceLocale({ locale }: { locale: Locale }) {
  const { locale: current, setLocale } = useLanguage();
  const applied = useRef<Locale | null>(null);

  useEffect(() => {
    if (applied.current === locale) return;
    applied.current = locale;
    if (current !== locale) setLocale(locale);
  }, [current, locale, setLocale]);

  return null;
}
