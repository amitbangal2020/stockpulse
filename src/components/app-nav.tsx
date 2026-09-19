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
  HelpCircle,
  ChevronDown,
  Globe,
  LayoutGrid,
  TrendingUp,
  Type,
  Target,
  GitCompare,
  Video,
  Calendar,
  Monitor,
  BookOpen,
  Layers,
  CircleDot,
  Palette,
  FileCode,
  Grid3X3,
  X,
} from "lucide-react";

/**
 * Top navigation shell.
 *
 * Design intent: the opposite of a left rail. Brand and section links share a
 * horizontal bar; the tool collection lives behind a "Tools" dropdown on
 * desktop and a full-screen launcher sheet on phones. Active sections are
 * marked with an underline accent that slides along the bar's bottom edge.
 */

const SECTIONS = [
  { label: "Generator", href: "/metagen", icon: Sparkles, match: ["/metagen"] },
  { label: "Tracker", href: "/search", icon: BarChart3, match: ["/search", "/dashboard", "/portfolio", "/trending", "/keywords", "/watchlist"] },
  { label: "SVG to Video", href: "/svg-to-video", icon: Video, match: ["/svg-to-video"] },
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
  { label: "Events", href: "/events", icon: Calendar },
  { label: "Title Optimizer", href: "/title-optimizer", icon: Type },
  { label: "Mockup Generator", href: "/mockup-generator", icon: Monitor },
  { label: "Country Map", href: "/country-map", icon: Globe },
];

export function AppNav() {
  const { theme, setTheme } = useTheme();
  const { t, locale } = useLanguage();
  const blogHref = blogPath(locale);
  const [showTools, setShowTools] = useState(false);
  const [mobileTools, setMobileTools] = useState(false);
  const pathname = usePathname();
  const mobileNavRef = useRef<HTMLDivElement | null>(null);
  const mobileHeaderRef = useRef<HTMLDivElement | null>(null);

  // Hydration-safe mounted flag: false on the server snapshot, true after
  // hydration — no effect or cascading setState needed.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // Publish the mobile header's height as --shell-top so sticky page bars and
  // the settings drawer can sit flush beneath it without hardcoded offsets.
  // Kept out of the effect body proper (and in a rAF) so layout measurement
  // happens after paint and lint stays quiet about synchronous work.
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

  // Close the launchers on navigation. Reset via the render-time key (the
  // pathname of the active route) rather than a setState-in-effect, which
  // this ESLint rule flags. Both panels are modal overlays, so remounting a
  // closed copy costs nothing.
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

  const navKey = `${pathname}|${showTools ? "t" : ""}`;
  const mobileKey = `${pathname}|${mobileTools ? "t" : ""}`;

  // Keep the active chip centred in the scrollable mobile nav row
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

  const activeSection = SECTIONS.find((s) => s.match.some((m) => isActive(m)));
  const isAnyToolActive = ALL_TOOLS.some((t2) => isActive(t2.href));
  const onBlog = isActive(blogHref);

  // Overlays render keyed by route: navigating unmounts them (the old code
  // closed them from an effect; same behaviour without cascading renders).

  return (
    <>
      {/* ── Desktop top bar ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 hidden border-b border-border bg-bg/90 backdrop-blur-md lg:block">
        <div className="flex h-12 items-center gap-1 px-4">
          {/* Brand — left */}
          <Link href="/" className="mr-4 flex shrink-0 items-center gap-2" aria-label="StockPulse home">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-white">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>
            <span className="font-heading text-sm font-bold tracking-tight text-text-primary">
              Stock<span className="text-accent">Pulse</span>
            </span>
            <span className="rounded border border-amber-500/40 bg-amber-500/10 px-1 py-px text-[9px] font-bold uppercase text-amber-600">
              PRO
            </span>
          </Link>

          {/* Section tabs — underline style, sits flush with the bottom border */}
          <nav className="flex h-full items-stretch" aria-label={t.nav.menu}>
            {SECTIONS.map((s) => {
              const active = activeSection?.href === s.href;
              return (
                <Link
                  key={s.href}
                  href={s.href}
                  className={`relative flex items-center gap-1.5 border-b-2 px-3 text-sm font-medium transition-colors ${
                    active
                      ? "border-accent text-accent"
                      : "border-transparent text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <s.icon className="h-3.5 w-3.5" />
                  {s.label}
                </Link>
              );
            })}

            {/* Tools launcher */}
            <div className="relative flex items-stretch">
              <button
                onClick={() => setShowTools((v) => !v)}
                aria-expanded={showTools}
                className={`relative flex items-center gap-1.5 border-b-2 px-3 text-sm font-medium transition-colors ${
                  isAnyToolActive || showTools
                    ? "border-accent text-accent"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                {t.nav.allTools}
                <ChevronDown className={`h-3 w-3 transition-transform ${showTools ? "rotate-180" : ""}`} />
              </button>

              {showTools && (
                <div key={navKey} className="absolute left-0 top-full z-50 mt-px w-[420px] animate-pop-in rounded-b-2xl border border-t-0 border-border bg-surface-elevated p-3 shadow-2xl">
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

            {/* Blog */}
            <Link
              href={blogHref}
              className={`relative flex items-center gap-1.5 border-b-2 px-3 text-sm font-medium transition-colors ${
                onBlog ? "border-accent text-accent" : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              {t.nav.blog}
            </Link>

            <Link
              href="/how-it-works"
              className={`relative flex items-center gap-1.5 border-b-2 px-3 text-sm font-medium transition-colors ${
                isActive("/how-it-works")
                  ? "border-accent text-accent"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              <HelpCircle className="h-3.5 w-3.5" />
              {t.nav.howItWorks}
            </Link>
          </nav>

          {/* Right controls */}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
              aria-label={mounted && theme === "dark" ? t.nav.lightMode : t.nav.darkMode}
            >
              {mounted ? theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" /> : <span className="h-3.5 w-3.5" />}
            </button>
            <LanguageMenu />
          </div>
        </div>
      </header>

      {/* ── Mobile brand row + chip nav ─────────────────────────────────── */}
      <div ref={mobileHeaderRef} className="order-first sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur-md lg:hidden">
        <div className="flex items-center justify-between px-4 py-1.5">
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
              className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                isAnyToolActive || mobileTools
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-surface text-text-secondary"
              }`}
            >
              {mobileTools ? <X className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary"
              aria-label={mounted && theme === "dark" ? t.nav.lightMode : t.nav.darkMode}
            >
              {mounted ? theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" /> : <span className="h-3.5 w-3.5" />}
            </button>
            <LanguageMenu compact />
          </div>
        </div>

        <div ref={mobileNavRef} className="flex items-center gap-1 overflow-x-auto px-3 pb-1.5 pt-0.5 no-scrollbar">
          <Link href="/metagen" data-active={isActive("/metagen") || undefined}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${isActive("/metagen") ? "bg-accent text-white" : "bg-surface text-text-secondary border border-border"}`}>
            {t.nav.quickGenerate}
          </Link>
          <Link href="/search" data-active={isActive("/search") || undefined}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${isActive("/search") ? "bg-accent text-white" : "bg-surface text-text-secondary border border-border"}`}>
            {t.nav.quickTracker}
          </Link>
          <Link href={blogHref} data-active={onBlog || undefined}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${onBlog ? "bg-accent text-white" : "bg-surface text-text-secondary border border-border"}`}>
            {t.nav.blog}
          </Link>
          <Link href="/how-it-works" data-active={isActive("/how-it-works") || undefined}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${isActive("/how-it-works") ? "bg-accent text-white" : "bg-surface text-text-secondary border border-border"}`}>
            {t.nav.quickGuides}
          </Link>
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
