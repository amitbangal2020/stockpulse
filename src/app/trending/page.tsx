"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Flame, Users, Tag, Loader2, RefreshCw } from "lucide-react";

interface TrendingNiche {
  name: string;
  score: number;
  downloads: number;
  competition: string;
  opportunity: string;
}

interface TrendingContributor {
  name: string;
  assets: number;
  downloads: number;
  momentum: number;
}

interface TrendingCategory {
  name: string;
  count: number;
  topDownload: number;
  color: string;
}

interface TrendingInsight {
  label: string;
  value: string;
  highlight?: boolean;
}

interface TrendingData {
  niches: TrendingNiche[];
  contributors: TrendingContributor[];
  categories: TrendingCategory[];
  insights: TrendingInsight[];
  sortOrder?: string;
}

function TrendingPage() {
  const [timeRange, setTimeRange] = useState("all");
  const [data, setData] = useState<TrendingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrending = async (range: string) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`/api/trending?range=${range}`);
      if (!resp.ok) throw new Error("Failed to fetch");
      const result = await resp.json();
      setData(result);
    } catch (e: any) {
      setError(e.message || "Failed to load trending data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrending(timeRange);
  }, [timeRange]);

  return (
    <ToolLayout>
      <div className="flex flex-1 flex-col overflow-y-auto min-h-0">
        <div className="border-b border-border px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-text-primary">Trending on Adobe Stock</h2>
              <p className="text-xs text-text-muted">{data?.sortOrder === 'creation' ? 'Recently uploaded content from Adobe Stock' : 'Most downloaded content from Adobe Stock'}</p>
            </div>
            <button
              onClick={() => fetchTrending(timeRange)}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-text-secondary hover:border-accent hover:text-accent disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
          <div className="mt-3 flex gap-1.5">
            {["all", "week", "month", "quarter"].map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                disabled={loading}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-50 ${
                  timeRange === r
                    ? "bg-accent text-white"
                    : "border border-border bg-surface text-text-secondary hover:border-accent hover:text-accent"
                }`}
              >
                {r === "all" ? "All Time" : r === "week" ? "This Week" : r === "month" ? "This Month" : "This Quarter"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading && !data ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-accent mb-3" />
              <p className="text-sm text-text-muted">Fetching trending data from Adobe Stock...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-sm text-danger mb-3">{error}</p>
              <button onClick={() => fetchTrending(timeRange)} className="text-xs text-accent hover:underline">
                Try again
              </button>
            </div>
          ) : data ? (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
                    <Flame className="h-3.5 w-3.5" /> Trending Niches
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {data.niches.map((niche, i) => (
                      <div key={`${timeRange}-${i}`} className="rounded-xl border border-border bg-surface p-4 transition-all hover:border-accent/40">
                        <div className="mb-2 flex items-start justify-between">
                          <h4 className="text-sm font-medium text-text-primary">{niche.name}</h4>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              niche.opportunity === "Very High"
                                ? "bg-accent/10 text-accent"
                                : niche.opportunity === "High"
                                ? "bg-accent/5 text-accent/80"
                                : niche.opportunity === "Medium"
                                ? "bg-yellow-500/10 text-yellow-500"
                                : "bg-danger/10 text-danger"
                            }`}
                          >
                            {niche.opportunity}
                          </span>
                        </div>
                        <div className="flex gap-4 text-xs text-text-muted">
                          <span>
                            Trending:{" "}
                            <b className={niche.score >= 70 ? "text-accent" : niche.score >= 40 ? "text-yellow-500" : "text-text-muted"}>
                              {niche.score}/100
                            </b>
                          </span>
                          <span>
                            Competition: <b className="text-text-secondary">{niche.competition}</b>
                          </span>
                        </div>
                        <div className="mt-2">
                          <div className="h-1 w-full overflow-hidden rounded-full bg-border">
                            <div
                              className={`h-1 rounded-full transition-all duration-500 ${niche.score >= 70 ? 'bg-gradient-to-r from-accent/60 to-accent' : niche.score >= 40 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 'bg-text-muted/30'}`}
                              style={{ width: `${niche.score}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-border bg-surface p-5">
                  <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
                    <Users className="h-3.5 w-3.5" /> Top Contributors
                  </h3>
                  <div className="space-y-2.5">
                    {data.contributors.map((c, i) => (
                      <div key={`${timeRange}-c-${i}`} className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-4 text-xs text-text-muted">#{i + 1}</span>
                          <div>
                            <p className="text-sm font-medium text-text-primary">{c.name}</p>
                            <p className="text-[10px] text-text-muted">{c.downloads > 0 ? `${c.assets} assets · ${c.downloads.toLocaleString()} dl` : `${c.assets} assets uploaded`}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-medium ${c.momentum > 0 ? 'text-accent' : c.momentum < 0 ? 'text-danger' : 'text-text-muted'}`}>
                          {c.momentum > 0 ? `+${c.momentum}%` : `${c.momentum}%`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-surface p-5">
                  <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
                    <Tag className="h-3.5 w-3.5" /> Popular Categories
                  </h3>
                  <div className="space-y-2.5">
                    {data.categories.map((cat, i) => {
                      const maxCount = Math.max(...data.categories.map((c) => c.count));
                      const formatCount = (n: number) => n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
                      return (
                        <div key={`${timeRange}-cat-${i}`}>
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-xs font-medium text-text-secondary">{cat.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-text-muted">{formatCount(cat.count)} assets</span>
                              {cat.topDownload > 0 ? (
                                <span className="text-[10px] font-medium text-accent">Top: {cat.topDownload.toLocaleString()} dl</span>
                              ) : (
                                <span className="text-[10px] text-text-muted">New uploads</span>
                              )}
                            </div>
                          </div>
                          <div className="h-1 w-full overflow-hidden rounded-full bg-border">
                            <div
                              className={`h-1 rounded-full bg-gradient-to-r ${cat.color}`}
                              style={{ width: `${Math.min(100, (cat.count / maxCount) * 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-xl border border-accent/20 bg-accent-subtle p-5">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-accent">Market Insights</h3>
                  <div className="space-y-2.5 text-sm">
                    {data.insights.map((ins, i) => (
                      <div key={`${timeRange}-ins-${i}`} className="flex justify-between">
                        <span className="text-text-muted">{ins.label}</span>
                        <span className={`font-bold ${ins.highlight ? "text-accent" : "text-text-primary"}`}>
                          {ins.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </ToolLayout>
  );
}

export default TrendingPage;
