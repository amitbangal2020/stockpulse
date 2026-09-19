"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  BarChart3,
  FolderOpen,
  TrendingUp,
  Tag,
  Eye,
  Settings,
  Palette,
  LayoutGrid,
} from "lucide-react";

const TOOL_TABS: Record<string, { label: string; href: string; icon: React.ElementType }[]> = {
  "/search": [
    { label: "Search", href: "/search", icon: Search },
    { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { label: "Portfolio", href: "/portfolio", icon: FolderOpen },
    { label: "Trending", href: "/trending", icon: TrendingUp },
    { label: "Keywords", href: "/keywords", icon: Tag },
    { label: "Watchlist", href: "/watchlist", icon: Eye },
  ],
  "/metagen": [],
  "/dashboard": [
    { label: "Search", href: "/search", icon: Search },
    { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { label: "Portfolio", href: "/portfolio", icon: FolderOpen },
    { label: "Trending", href: "/trending", icon: TrendingUp },
    { label: "Keywords", href: "/keywords", icon: Tag },
    { label: "Watchlist", href: "/watchlist", icon: Eye },
  ],
  "/portfolio": [
    { label: "Search", href: "/search", icon: Search },
    { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { label: "Portfolio", href: "/portfolio", icon: FolderOpen },
    { label: "Trending", href: "/trending", icon: TrendingUp },
    { label: "Keywords", href: "/keywords", icon: Tag },
    { label: "Watchlist", href: "/watchlist", icon: Eye },
  ],
  "/trending": [
    { label: "Search", href: "/search", icon: Search },
    { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { label: "Portfolio", href: "/portfolio", icon: FolderOpen },
    { label: "Trending", href: "/trending", icon: TrendingUp },
    { label: "Keywords", href: "/keywords", icon: Tag },
    { label: "Watchlist", href: "/watchlist", icon: Eye },
  ],
  "/keywords": [
    { label: "Search", href: "/search", icon: Search },
    { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { label: "Portfolio", href: "/portfolio", icon: FolderOpen },
    { label: "Trending", href: "/trending", icon: TrendingUp },
    { label: "Keywords", href: "/keywords", icon: Tag },
    { label: "Watchlist", href: "/watchlist", icon: Eye },
  ],
  "/tools": [
    { label: "Color Palette", href: "/tools/color-palette", icon: Palette },
    { label: "Bento Grid", href: "/tools/bento-grid", icon: LayoutGrid },
    { label: "Settings", href: "/tools/settings", icon: Settings },
  ],
};

// Page headings for each route
const PAGE_HEADINGS: Record<string, { title: string; subtitle: string; icon: React.ElementType }> = {
  "/search": { title: "Adobe Tracker", subtitle: "Real-time download analytics for contributors", icon: BarChart3 },
  "/dashboard": { title: "Dashboard", subtitle: "Portfolio overview and analytics", icon: BarChart3 },
  "/portfolio": { title: "Portfolio", subtitle: "Manage your Adobe Stock portfolio", icon: FolderOpen },
  "/trending": { title: "Trending", subtitle: "Trending keywords and topics", icon: TrendingUp },
  "/keywords": { title: "Keywords", subtitle: "Keyword research and analysis", icon: Tag },
  "/watchlist": { title: "Watchlist", subtitle: "Track your favorite assets", icon: Eye },
};

function getTabsForPath(pathname: string): { label: string; href: string; icon: React.ElementType }[] {
  // Direct match
  if (TOOL_TABS[pathname]) return TOOL_TABS[pathname];
  // Check parent route (e.g. /tools/color-palette -> /tools)
  const segments = pathname.split("/");
  for (let i = segments.length - 1; i > 0; i--) {
    const parent = segments.slice(0, i).join("/") || "/";
    if (TOOL_TABS[parent]) return TOOL_TABS[parent];
  }
  return [];
}

function getHeadingForPath(pathname: string): { title: string; subtitle: string; icon: React.ElementType } | null {
  if (PAGE_HEADINGS[pathname]) return PAGE_HEADINGS[pathname];
  const segments = pathname.split("/");
  for (let i = segments.length - 1; i > 0; i--) {
    const parent = segments.slice(0, i).join("/") || "/";
    if (PAGE_HEADINGS[parent]) return PAGE_HEADINGS[parent];
  }
  return null;
}

/**
 * Page heading strip under the top nav. Visually distinct from the nav itself:
 * the heading sits in a plain text row (no icon tile), while sub-section tabs
 * render as pill chips with a soft filled state — the underline language is
 * reserved for the shell nav above.
 */
export function TopTabs() {
  const pathname = usePathname();
  const tabs = getTabsForPath(pathname);
  const heading = getHeadingForPath(pathname);

  // Nothing to show means no bar at all — an empty strip is worse than
  // no strip. (The language switcher lives in the top nav, not here.)
  if (!heading && tabs.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border bg-bg px-4 py-2.5 sm:px-6">
      {/* Page heading — quiet text, no tile */}
      {heading && (
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold tracking-tight text-text-primary">
            {heading.title}
          </h2>
          <p className="hidden text-[11px] leading-tight text-text-muted sm:block">
            {heading.subtitle}
          </p>
        </div>
      )}

      {/* Sub-section chips */}
      {tabs.length > 0 && (
        <nav className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto no-scrollbar" aria-label="Sections">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "border-accent bg-accent text-white"
                    : "border-border bg-surface text-text-secondary hover:border-accent/40 hover:text-accent"
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
