"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check, ChevronDown, Globe } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { LOCALES, LOCALE_LABELS, LOCALE_SHORT, type Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/localized-path";
import { trackEvent } from "@/lib/track-event";

/** Panel geometry, used both to place it and to decide which way it opens. */
const PANEL_WIDTH = 160; // matches w-40
const ITEM_HEIGHT = 34; // one option row, padding included
const PANEL_PADDING = 8; // the p-1 wrapper
const GAP = 6; // distance from the trigger
/** Keep a long language list scrollable instead of taller than the window. */
const MAX_PANEL_VH = 0.6;

/**
 * Language dropdown: `full` for the sidebar row, `compact` for the phone top
 * bar, default for anywhere else that needs a chip.
 *
 * The panel is positioned with `fixed` coordinates measured from the trigger:
 * the tool column is `lg:overflow-hidden`, which would clip an absolutely
 * positioned dropdown rendered inside it.
 */
export function LanguageMenu({
  compact = false,
  full = false,
}: {
  compact?: boolean;
  full?: boolean;
}) {
  const { locale, setLocale, t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 8 });
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const choose = useCallback(
    (code: Locale) => {
      trackEvent("language_switched", { from: locale, to: code });
      setLocale(code);
      setOpen(false);
      // Pages that exist as two separate URLs (the blog) also move with the
      // language, otherwise picking বাংলা here would leave English articles on
      // screen with a Bengali shell around them.
      const next = localizedPath(pathname, code);
      if (next) router.push(next);
    },
    [pathname, router, setLocale, locale],
  );

  const place = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const width = PANEL_WIDTH;
    // Sidebar rows line up on their left edge; floating chips keep the panel's
    // right edge under the trigger, the way a menu usually behaves.
    const left = full
      ? rect.left
      : Math.min(Math.max(8, rect.right - width), Math.max(8, window.innerWidth - width - 8));

    // The sidebar trigger sits at the bottom of the window, so a panel that only
    // opens downwards pushes its last languages — Hindi, for one — off screen.
    // Measure the room and flip above the trigger when there isn't enough.
    const height = Math.min(
      LOCALES.length * ITEM_HEIGHT + PANEL_PADDING,
      Math.round(window.innerHeight * MAX_PANEL_VH),
    );
    const below = rect.bottom + GAP + height <= window.innerHeight - GAP;
    const top = below ? rect.bottom + GAP : Math.max(GAP, rect.top - GAP - height);

    setPos({ top, left });
  }, [full]);

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
        className={
          full
            ? "flex w-full items-center gap-2.5 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            : "flex w-[118px] items-center justify-between gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-accent/40 hover:text-text-primary"
        }
      >
        <Globe className={full ? "h-4 w-4 shrink-0 text-text-muted" : "h-3.5 w-3.5 shrink-0 text-text-muted"} />
        {compact ? LOCALE_SHORT[locale] : LOCALE_LABELS[locale]}
        <ChevronDown
          className={`shrink-0 transition-transform ${full ? "ml-auto h-3.5 w-3.5" : "h-3 w-3"} ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          data-language-menu
          role="listbox"
          aria-label={t.language.label}
          style={{ top: pos.top, left: pos.left }}
          className="fixed z-[70] max-h-[60vh] w-40 overflow-y-auto rounded-xl border border-border bg-surface-elevated p-1 shadow-2xl"
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
