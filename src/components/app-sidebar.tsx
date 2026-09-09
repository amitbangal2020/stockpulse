"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sun,
  Moon,
  Sparkles,
  BarChart3,
  CreditCard,
  HelpCircle,
  Grid3X3,
  ChevronRight,
  Globe,
  LogIn,
  Layers,
  Palette,
  FileCode,
  CircleDot,
  LayoutGrid,
  TrendingUp,
  Type,
  X,
  Target,
  GitCompare,
  Video,
  Calendar,
  Monitor,
} from "lucide-react";

const MAIN_ITEMS = [
  { label: "Generator", href: "/metagen", icon: Sparkles },
  { label: "Adobe Tracker", href: "/search", icon: BarChart3 },
  { label: "SVG to Video", href: "/svg-to-video", icon: Video },
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

const BOTTOM_ITEMS = [
  { label: "Pricing", href: "/pricing", icon: CreditCard },
  { label: "How it Works", href: "/how-it-works", icon: HelpCircle },
];

export function AppSidebar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  // Close popup on route change
  useEffect(() => {
    setShowTools(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const isAnyToolActive = ALL_TOOLS.some((t) => isActive(t.href));

  return (
    <>
    <aside className="hidden w-[220px] shrink-0 flex-col border-r border-border bg-bg-secondary/80 backdrop-blur-sm lg:flex">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-4.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
          <Sparkles className="h-4 w-4" strokeWidth={2.5} />
        </div>
        <span className="font-heading text-base font-bold tracking-tight text-text-primary">
          Stock<span className="text-accent">Pulse</span>
        </span>
        <span className="rounded bg-amber-500/90 px-1.5 py-0.5 text-[9px] font-bold text-white">
          PRO
        </span>
      </div>

      {/* Get Extension Card */}
      <div className="mx-4 mb-4 rounded-xl border border-border bg-surface p-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-bg-secondary">
            <Globe className="h-4 w-4 text-text-muted" />
          </div>
          <div>
            <p className="text-xs font-semibold text-text-primary">Get Extension</p>
            <p className="text-[10px] text-text-muted">Chrome Web Store</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="px-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-text-muted">
          Menu
        </p>
        <nav className="flex flex-col gap-0.5">
          {/* Main Items */}
          {MAIN_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "bg-accent text-white shadow-md shadow-accent/20"
                  : "text-text-secondary hover:bg-accent-subtle hover:text-accent"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}

          {/* All Tools Button */}
          <button
            onClick={() => setShowTools(!showTools)}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isAnyToolActive
                ? "bg-accent text-white shadow-md shadow-accent/20"
                : "text-text-secondary hover:bg-accent-subtle hover:text-accent"
            }`}
          >
            <Grid3X3 className="h-4 w-4" />
            All Tools
            <ChevronRight className={`ml-auto h-3.5 w-3.5 transition-transform ${showTools ? "rotate-90" : ""}`} />
          </button>
        </nav>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* How it Works */}
      <div className="px-4">
        <nav className="flex flex-col gap-0.5 border-t border-border pt-3">
          <Link
            href="/how-it-works"
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive("/how-it-works")
                ? "bg-accent text-white shadow-md shadow-accent/20"
                : "text-text-secondary hover:bg-accent-subtle hover:text-accent"
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            How it Works
          </Link>
        </nav>
      </div>

      {/* Dark Mode Toggle */}
      <div className="mx-4 mt-3 mb-4">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex w-full items-center gap-2.5 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
        >
          {mounted ? (
            theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )
          ) : (
            <div className="h-4 w-4" />
          )}
          {mounted && theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      {/* User - hidden, will be implemented later */}
      {/*
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/20 text-sm font-bold text-accent">
          A
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-text-primary">Guest User</p>
          <p className="text-[11px] text-text-muted">Sign In</p>
        </div>
        <LogIn className="h-3.5 w-3.5 text-text-muted" />
      </div>
      */}

    </aside>

      {/* All Tools Popup - rendered outside aside to avoid backdrop-filter trapping fixed children */}
      {showTools && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowTools(false)} />
          <div className="fixed left-[220px] top-16 z-50 bottom-0 w-[340px] border-r border-border bg-bg shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-text-primary">All Tools Collection</h2>
                <p className="text-[11px] text-text-muted">Select a tool to start creating</p>
              </div>
              <button onClick={() => setShowTools(false)} className="rounded-lg p-1.5 text-text-muted hover:text-text-primary hover:bg-accent/10">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-3">
              <div className="grid grid-cols-2 gap-1.5">
                {ALL_TOOLS.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    onClick={() => setShowTools(false)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${
                      isActive(tool.href)
                        ? "bg-accent text-white"
                        : "text-text-secondary hover:bg-accent-subtle hover:text-accent"
                    }`}
                  >
                    <tool.icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{tool.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
