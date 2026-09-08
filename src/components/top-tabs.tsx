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

export function TopTabs() {
  const pathname = usePathname();
  const tabs = getTabsForPath(pathname);
  const heading = getHeadingForPath(pathname);

  if (tabs.length === 0 && !heading) return null;
  
  const HeadingIcon = heading?.icon;
  
  return (
    <nav className="flex items-center border-b border-border bg-bg px-5 py-2.5">
      {/* Page Heading - Left */}
      {heading && HeadingIcon && (
        <div className="flex items-center gap-3 shrink-0 mr-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
            <HeadingIcon className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text-primary">{heading.title}</h2>
            <p className="text-[11px] text-text-muted">{heading.subtitle}</p>
          </div>
        </div>
      )}
      
      {/* Tabs - Right/Center */}
      {tabs.length > 0 && (
        <div className="flex items-center gap-1">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  active
                    ? "bg-accent/10 text-accent shadow-sm"
                    : "text-text-secondary hover:bg-accent/5 hover:text-text-primary"
                }`}>
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
