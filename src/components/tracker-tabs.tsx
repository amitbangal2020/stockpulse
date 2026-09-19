"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, BarChart3, FolderOpen, TrendingUp, Tag, Eye } from "lucide-react";

/**
 * Segmented switcher for the Adobe Tracker's sub-pages (Search, Dashboard,
 * Portfolio, Trending, Keywords, Watchlist). Lives *inside* the page as a
 * compact pill group, replacing the old shell-level tab strip.
 */

const TRACKER_TABS = [
  { label: "Search", href: "/search", icon: Search },
  { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { label: "Portfolio", href: "/portfolio", icon: FolderOpen },
  { label: "Trending", href: "/trending", icon: TrendingUp },
  { label: "Keywords", href: "/keywords", icon: Tag },
  { label: "Watchlist", href: "/watchlist", icon: Eye },
];

export function TrackerTabs() {
  const pathname = usePathname();

  return (
    <nav
      className="mx-auto flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-full border border-border bg-surface p-1 shadow-sm no-scrollbar"
      aria-label="Tracker sections"
    >
      {TRACKER_TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              active
                ? "bg-accent text-white shadow-sm"
                : "text-text-secondary hover:bg-accent/8 hover:text-accent"
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
