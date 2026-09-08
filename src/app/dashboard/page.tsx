"use client";

import { useState, useEffect, useCallback } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { getDashboardStats, getAllTrends, AssetTrend, recordSnapshot, getTrackedAssets } from "@/lib/tracking";
import { RefreshCw, TrendingUp, BarChart3, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";
import Link from "next/link";

function MiniChart({ data, height = 60 }: { data: number[]; height?: number }) {
  if (data.length < 2) return <div className="text-xs text-text-muted italic">Need 2+ snapshots for chart</div>;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 200;
  const h = height;
  const padding = 4;
  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * (w - padding * 2);
    const y = h - padding - ((v - min) / range) * (h - padding * 2);
    return `${x},${y}`;
  });
  const areaPoints = [...points, `${w - padding},${h - padding}`, `${padding},${h - padding}`];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: h }}>
      <defs><linearGradient id="grad-accent" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" /><stop offset="100%" stopColor="var(--accent)" stopOpacity="0.05" /></linearGradient></defs>
      <polygon points={areaPoints.join(" ")} fill="url(#grad-accent)" />
      <polyline points={points.join(" ")} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => { const x = padding + (i / (data.length - 1)) * (w - padding * 2); const y = h - padding - ((v - min) / range) * (h - padding * 2); return <circle key={i} cx={x} cy={y} r="3" fill="var(--accent)" />; })}
    </svg>
  );
}

function BarChart({ items, maxVal }: { items: { label: string; value: number }[]; maxVal?: number }) {
  const max = maxVal || Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="w-20 truncate text-right text-xs text-text-muted">{item.label}</span>
          <div className="flex-1 h-5 overflow-hidden rounded-full bg-border">
            <div className="h-full rounded-full bg-accent transition-all duration-700 flex items-center justify-end pr-2" style={{ width: `${Math.max((item.value / max) * 100, 2)}%` }}>
              <span className="text-[10px] font-bold text-white">{item.value}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function DashboardPage() {
  const [stats, setStats] = useState<ReturnType<typeof getDashboardStats> | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState("");
  const loadStats = useCallback(() => { setStats(getDashboardStats()); }, []);

  useEffect(() => { loadStats(); const stored = localStorage.getItem("stocktracker_last_refresh"); if (stored) setLastRefresh(stored); }, [loadStats]);

  const refreshData = async () => {
    setIsRefreshing(true);
    const trackedIds = getTrackedAssets();
    for (const assetId of trackedIds) {
      try {
        const resp = await fetch(`/api/asset?id=${assetId}`);
        const data = await resp.json();
        if (data.found) recordSnapshot({ assetId, timestamp: new Date().toISOString(), downloads: data.downloads ?? 0, views: data.views ?? 0, title: data.title, thumbnail: data.thumbnail, creator: data.creator });
      } catch (e) { console.error(`Failed to refresh ${assetId}:`, e); }
    }
    localStorage.setItem("stocktracker_last_refresh", new Date().toISOString());
    setLastRefresh(new Date().toISOString());
    loadStats();
    setIsRefreshing(false);
  };

  if (!stats) return <div className="flex items-center justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-2 border-accent/20 border-t-accent" /></div>;

  const topItems = stats.trends.slice(0, 5).map((t) => ({ label: t.title.substring(0, 15) + (t.title.length > 15 ? "..." : ""), value: t.currentDownloads }));

  return (
    <ToolLayout>
      <div className="flex flex-1 flex-col overflow-y-auto min-h-0">
        <div className="flex items-center justify-between border-b border-border px-5 py-2.5">
          <div>
            <h2 className="text-base font-semibold text-text-primary">Dashboard</h2>
            <p className="text-xs text-text-muted">Track how your assets perform over time</p>
          </div>
          <div className="flex items-center gap-3">
            {lastRefresh && <span className="text-xs text-text-muted">Last refresh: {new Date(lastRefresh).toLocaleString()}</span>}
            <button onClick={refreshData} disabled={isRefreshing} className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white shadow-md shadow-accent/20 transition-all hover:bg-accent-hover disabled:opacity-50">
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing..." : "Refresh Data"}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {/* Stats Grid */}
          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-xl border border-border bg-surface px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Total Tracked</p>
              <p className="mt-1 text-2xl font-bold text-text-primary">{stats.totalTracked}</p>
            </div>
            <div className="rounded-xl border border-border bg-surface px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Total Downloads</p>
              <p className="mt-1 text-2xl font-bold text-accent">{stats.totalDownloads.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-border bg-surface px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Rising</p>
              <p className="mt-1 text-2xl font-bold text-accent">{stats.risingCount}</p>
            </div>
            <div className="rounded-xl border border-border bg-surface px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Avg Downloads</p>
              <p className="mt-1 text-2xl font-bold text-text-primary">{stats.avgDownloads}</p>
            </div>
          </div>

          {/* Trend Chart */}
          {stats.overallTrend.length > 1 && (
            <div className="mb-6 rounded-xl border border-border bg-surface p-5">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Overall Trend</h3>
              <MiniChart data={stats.overallTrend.map((t) => t.downloads)} />
            </div>
          )}

          {/* Top Assets */}
          {topItems.length > 0 && (
            <div className="mb-6 rounded-xl border border-border bg-surface p-5">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Top Performing Assets</h3>
              <BarChart items={topItems} />
            </div>
          )}

          {/* Empty State */}
          {stats.trends.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
                <BarChart3 className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-base font-semibold text-text-primary">No Tracked Assets Yet</h3>
              <p className="mt-1.5 max-w-xs text-sm text-text-muted leading-relaxed">
                Search for an asset ID on the <Link href="/search" className="font-medium text-accent hover:underline">Search page</Link>, then click the chart icon to start tracking.
              </p>
              <Link href="/search" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-accent/20 transition-all hover:bg-accent-hover">
                Start Tracking
              </Link>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}

export default DashboardPage;
