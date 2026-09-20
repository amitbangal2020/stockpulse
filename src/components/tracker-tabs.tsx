import { Search, BarChart3, FolderOpen, TrendingUp, Tag, Eye } from "lucide-react";

/**
 * Shared definition of the Adobe Tracker's sub-pages (Search, Dashboard,
 * Portfolio, Trending, Keywords, Watchlist). Consumed by the top-nav Tracker
 * dropdown (app-nav.tsx); the old in-page tab strip was removed so the site
 * has a single navigation row.
 */

export const TRACKER_TABS = [
  { label: "Search", href: "/search", icon: Search },
  { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { label: "Portfolio", href: "/portfolio", icon: FolderOpen },
  { label: "Trending", href: "/trending", icon: TrendingUp },
  { label: "Keywords", href: "/keywords", icon: Tag },
  { label: "Watchlist", href: "/watchlist", icon: Eye },
] as const;

export type TrackerTab = (typeof TRACKER_TABS)[number];
