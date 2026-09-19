"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check, ChevronDown, Globe } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { LOCALES, LOCALE_LABELS, LOCALE_SHORT, type Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/localized-path";

/**
 * Language dropdown for the top-right corner of the tool shell.
 *
 * The panel is positioned with `fixed` coordinates measured from the trigger:
 * the tool column is `lg:overflow-hidden`, which would clip an absolutely
 * positioned dropdown rendered inside it.
 */
export function LanguageMenu({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 8 });
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const choose = useCallback(
    (code: Locale) => {
      setLocale(code);
      setOpen(false);
      // Pages that exist as two separate URLs (the blog) also move with the
      // language, otherwise picking বাংলা here would leave English articles on
      // screen with a Bengali shell around them.
      const next = localizedPath(pathname, code);
      if (next) router.push(next);
    },
    [pathname, router, setLocale],
  );

  const place = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ top: rect.bottom + 6, right: Math.max(8, window.innerWidth - rect.right) });
  }, []);

  useEffect(() => {
    if (!open) return;
    place();

    const isOurs = (node: EventTarget | null) =>
      node instanceof Element && !!node.closest("[data-language-menu]");
    const onPointerDown = (event: Event) => {
      if (!isOurs(event.target)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onMove = () => place();

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
    };
  }, [open, place]);

  return (
    <div data-language-menu className="shrink-0">
      <button
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={t.language.change}
        aria-label={`${t.language.change}: ${LOCALE_LABELS[locale]}`}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-accent/40 hover:text-text-primary"
      >
        <Globe className="h-3.5 w-3.5 shrink-0 text-text-muted" />
        {compact ? LOCALE_SHORT[locale] : LOCALE_LABELS[locale]}
        <ChevronDown className={`h-3 w-3 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          data-language-menu
          role="listbox"
          aria-label={t.language.label}
          style={{ top: pos.top, right: pos.right }}
          className="fixed z-[70] w-40 overflow-hidden rounded-xl border border-border bg-surface-elevated p-1 shadow-2xl"
        >
          {LOCALES.map((code) => (
            <button
              key={code}
              role="option"
              aria-selected={locale === code}
              onClick={() => choose(code)}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-colors ${
                locale === code
                  ? "bg-accent/10 text-accent"
                  : "text-text-secondary hover:bg-accent/5 hover:text-text-primary"
              }`}
            >
              {LOCALE_LABELS[code]}
              {locale === code && <Check className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
