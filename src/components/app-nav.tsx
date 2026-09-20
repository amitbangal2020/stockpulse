"use client";

import { useTheme } from "@/components/theme-provider";
import { useLanguage } from "@/components/language-provider";
import { LanguageMenu } from "@/components/language-menu";
import { blogPath } from "@/lib/i18n/localized-path";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sun,
  Moon,
  Sparkles,
  BarChart3,
  Video,
  LayoutGrid,
  TrendingUp,
  Type,
  Target,
  GitCompare,
  Calendar,
  Monitor,
  BookOpen,
  HelpCircle,
  Layers,
  CircleDot,
  Palette,
  FileCode,
  Grid3X3,
  Globe,
  X,
} from "lucide-react";

/**
 * Single-row top navigation.
 *
 * The whole nav is one bar: brand on the left, a centered segmented capsule
 * holding every destination (no second strip underneath), controls on the
 * right. The active segment fills with the accent color. The tool collection
 * opens as a floating panel from the capsule's last segment. On phones the
 * capsule becomes a scrollable pill row under a slim brand bar.
 */

interface NavSegment {
  label: string;
  /** Translation key in `t.nav` — overrides `label` when present. */
  labelKey?: "blog" | "howItWorks";
  href: string;
  icon: typeof Sparkles;
  match: string[];
}

const SEGMENTS: NavSegment[] = [
  { label: "Generator", href: "/metagen", icon: Sparkles, match: ["/metagen"] },
  { label: "Tracker", href: "/search", icon: BarChart3, match: ["/search", "/dashboard", "/portfolio", "/trending", "/keywords", "/watchlist"] },
  { label: "SVG to Video", href: "/svg-to-video", icon: Video, match: ["/svg-to-video"] },
  { label: "Blog", labelKey: "blog", href: "/blog", icon: BookOpen, match: ["/blog"] },
  { label: "How it Works", labelKey: "howItWorks", href: "/how-it-works", icon: HelpCircle, match: ["/how-it-works"] },
];

const ALL_TOOLS = [
  { label: "Dither Studio", href: "/dither-studio", icon: Layers },
  { label: "Halftone Studio", href: "/halftone-studio", icon: CircleDot },
  { label: "Bento Builder", href: "/bento-builder", icon: LayoutGrid },
  { label: "Color Palette", href: "/color-palette", icon: Palette },
  { label: "Color Harmonizer", href: "/color-harmonizer", icon: Palette },
  { label: "ASCII Vision", href: "/ascii-vision", icon: Type },
  { label: "SVG to EPS", href: "/svg-to-eps", icon: FileCode },
  { label: "Trend Predictor", href: "/trend-predictor", icon: TrendingUp },
  { label: "Candlestick Chart", href: "/candlestick-chart", icon: BarChart3 },
  { label: "Market Heatmap", href: "/market-heatmap", icon: Grid3X3 },
  { label: "Portfolio Analytics", href: "/portfolio-analytics", icon: Target },
  { label: "Asset Comparison", href: "/asset-comparison", icon: GitCompare },
  { label: "Event Calendar", href: "/event-calendar", icon: Calendar },
  { label: "Title Optimizer", href: "/title-optimizer", icon: Type },
  { label: "Mockup Generator", href: "/mockup-generator", icon: Monitor },
  { label: "Country Map", href: "/country-map", icon: Globe },
];

export function AppNav() {
  const { theme, setTheme } = useTheme();
  const { t, locale } = useLanguage();
  const [showTools, setShowTools] = useState(false);
  const [mobileTools, setMobileTools] = useState(false);
  const pathname = usePathname();
  const mobileNavRef = useRef<HTMLDivElement | null>(null);
  const mobileHeaderRef = useRef<HTMLDivElement | null>(null);
  const toolsWrapRef = useRef<HTMLDivElement | null>(null);

  // Hydration-safe mounted flag: false on the server snapshot, true after
  // hydration — no effect or cascading setState needed.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // Publish the mobile header's height as --shell-top so sticky page bars and
  // the settings drawer can sit flush beneath it without hardcoded offsets.
  useEffect(() => {
    const el = mobileHeaderRef.current;
    if (!el) return;
    const publishHeight = () =>
      document.documentElement.style.setProperty("--shell-top", `${el.offsetHeight}px`);
    const raf = requestAnimationFrame(publishHeight);
    const ro = new ResizeObserver(publishHeight);
    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  // Close the tools panels on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowTools(false);
        setMobileTools(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Click-outside for the desktop tools panel.
  useEffect(() => {
    if (!showTools) return;
    const onDown = (e: Event) => {
      if (e.target instanceof Element && !e.target.closest("[data-tools-panel]")) {
        setShowTools(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [showTools]);

  // Keep the active pill centred in the scrollable mobile nav row
  useEffect(() => {
    const container = mobileNavRef.current;
    const active = container?.querySelector<HTMLElement>('[data-active="true"]');
    if (!container || !active) return;
    const containerRect = container.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    const delta = activeRect.left - containerRect.left - (container.clientWidth - activeRect.width) / 2;
    container.scrollTo({ left: container.scrollLeft + delta, behavior: "smooth" });
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const activeSegment = SEGMENTS.find((s) => s.match.some((m) => isActive(m)));
  const isAnyToolActive = ALL_TOOLS.some((t2) => isActive(t2.href));
  const blogHref = blogPath(locale);
  const onBlog = pathname === blogHref || pathname.startsWith(blogHref + "/");

  // The centered capsule: main destinations plus a Tools segment. "Blog" maps
  // to the visitor's language, matching the old shell's behaviour.
  const capsule = SEGMENTS.map((s) => {
    const label = s.labelKey ? t.nav[s.labelKey] : s.label;
    if (s.match.includes("/blog")) return { ...s, label, href: blogHref, active: onBlog };
    return { ...s, label, active: activeSegment?.href === s.href };
  });
  const toolsActive = isAnyToolActive || showTools;
  // Overlays remount per route + open state: navigating unmounts them (same
  // behaviour as the old close-on-navigate effect, without setState-in-effect).
  const navKey = `${pathname}|${showTools ? "t" : ""}`;
  const mobileKey = `${pathname}|${mobileTools ? "t" : ""}`;

  const segmentClass = (active: boolean) =>
    `relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
      active ? "bg-accent text-white shadow-sm" : "text-text-secondary hover:bg-accent/8 hover:text-accent"
    }`;

  return (
    <>
      {/* ── Desktop: one-row nav ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 hidden border-b border-border bg-bg/90 backdrop-blur-md lg:block">
        <div className="flex h-14 items-center px-5">
          {/* Brand */}
          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="StockPulse home">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-white">
              <Sparkles className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <span className="font-heading text-base font-bold tracking-tight text-text-primary">
              Stock<span className="text-accent">Pulse</span>
            </span>
          </Link>

          {/* Centered capsule — absolute so it stays truly centered */}
          <nav
            className="pointer-events-none absolute left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-surface p-1 shadow-sm"
            aria-label={t.nav.menu}
          >
            <div className="pointer-events-auto flex items-center gap-1">
              {capsule.map((s) => (
                <Link key={s.label} href={s.href} className={segmentClass(s.active)}>
                  <s.icon className="h-3.5 w-3.5" />
                  {s.label}
                </Link>
              ))}
              <div ref={toolsWrapRef} className="relative">
                <button onClick={() => setShowTools((v) => !v)} aria-expanded={showTools} className={segmentClass(toolsActive)}>
                  <LayoutGrid className="h-3.5 w-3.5" />
                  {t.nav.allTools}
                </button>
                {showTools && (
                  <div
                    key={navKey}
                    data-tools-panel
                    className="absolute right-0 top-full z-50 mt-2 w-[420px] animate-pop-in rounded-2xl border border-border bg-surface-elevated p-3 shadow-2xl"
                  >
                    <div className="grid grid-cols-2 gap-1">
                      {ALL_TOOLS.map((tool) => (
                        <Link
                          key={tool.href}
                          href={tool.href}
                          onClick={() => setShowTools(false)}
                          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                            isActive(tool.href)
                              ? "bg-accent/10 text-accent"
                              : "text-text-secondary hover:bg-accent/5 hover:text-accent"
                          }`}
                        >
                          <tool.icon className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{tool.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </nav>

          {/* Right controls */}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
              aria-label={mounted && theme === "dark" ? t.nav.lightMode : t.nav.darkMode}
            >
              {mounted ? theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" /> : <span className="h-4 w-4" />}
            </button>
            <LanguageMenu />
          </div>
        </div>
      </header>

      {/* ── Mobile: slim brand row + scrollable capsule pills ───────────── */}
      <div ref={mobileHeaderRef} className="order-first sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur-md lg:hidden">
        <div className="flex items-center justify-between px-4 py-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-white">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>
            <span className="font-heading text-sm font-bold tracking-tight text-text-primary">
              Stock<span className="text-accent">Pulse</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileTools((v) => !v)}
              aria-label={t.nav.allTools}
              className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                isAnyToolActive || mobileTools
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-surface text-text-secondary"
              }`}
            >
              {mobileTools ? <X className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-text-secondary"
              aria-label={mounted && theme === "dark" ? t.nav.lightMode : t.nav.darkMode}
            >
              {mounted ? theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" /> : <span className="h-3.5 w-3.5" />}
            </button>
            <LanguageMenu compact />
          </div>
        </div>

        <div ref={mobileNavRef} className="flex items-center gap-1.5 overflow-x-auto px-3 pb-2 no-scrollbar">
          {capsule.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              data-active={s.active || undefined}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                s.active ? "border-accent bg-accent text-white" : "border-border bg-surface text-text-secondary"
              }`}
            >
              <s.icon className="h-3 w-3" />
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Mobile full-screen tools launcher ───────────────────────────── */}
      {mobileTools && (
        <div key={mobileKey}>
          <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMobileTools(false)} aria-hidden />
          <div className="fixed inset-x-3 top-16 bottom-16 z-50 animate-pop-in overflow-y-auto rounded-2xl border border-border bg-surface-elevated p-3 shadow-2xl lg:hidden">
            <div className="grid grid-cols-2 gap-1">
              {ALL_TOOLS.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  onClick={() => setMobileTools(false)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                    isActive(tool.href)
                      ? "bg-accent/10 text-accent"
                      : "text-text-secondary hover:bg-accent/5 hover:text-accent"
                  }`}
                >
                  <tool.icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{tool.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
