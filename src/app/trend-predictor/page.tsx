"use client";

import { useState, useEffect, useCallback } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { TrendingUp, Calendar, Search, BarChart3, Download, RefreshCw, ChevronDown, ChevronUp, ArrowUpRight, ArrowDownRight, Minus, Zap, Target, Clock } from "lucide-react";

// ─── Types ───
interface TrendItem {
  name: string;
  currentScore: number;
  predictedScore: number;
  growth: number;
  confidence: number;
  category: string;
  season: string;
  keywords: string[];
  competition: "Low" | "Medium" | "High";
  opportunity: "Low" | "Medium" | "High" | "Very High";
  history: number[];
  totalDownloads?: number;
  totalViews?: number;
  assetCount?: number;
}

// ─── Mini Chart ───
function MiniChart({ data, color = "var(--accent)" }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const h = 40;
  const w = 120;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="rounded">
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${points} ${w},${h}`} fill="url(#grad)" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Bar Chart ───
function BarChart({ data }: { data: { month: string; value: number }[] }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="flex items-end gap-1.5 h-32">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center flex-1 gap-1">
          <span className="text-[9px] text-text-muted">{Math.round(d.value)}</span>
          <div className="w-full rounded-t transition-all hover:opacity-80"
            style={{ height: `${(d.value / max) * 100}%`, backgroundColor: i === 0 ? "var(--accent)" : "var(--border)" }} />
          <span className="text-[9px] text-text-muted">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───
export default function TrendPredictorPage() {
  const [category, setCategory] = useState("Technology");
  const [timeRange, setTimeRange] = useState("month");
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ month: string; value: number }[]>([]);
  const [stats, setStats] = useState({ avgGrowth: 0, highOpp: 0, avgConfidence: 0, topTrend: "—" });
  const [selectedTrend, setSelectedTrend] = useState<TrendItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const fetchTrends = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`/api/trend-predictor?category=${category}&range=${timeRange}`);
      if (!resp.ok) throw new Error("Failed to fetch");
      const data = await resp.json();
      setTrends(data.trends || []);
      setMonthlyData(data.monthlyForecast || []);
      setStats(data.stats || { avgGrowth: 0, highOpp: 0, avgConfidence: 0, topTrend: "—" });
      setSelectedTrend(null);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (e: any) {
      setError(e.message || "Failed to load trends");
    } finally {
      setLoading(false);
    }
  }, [category, timeRange]);

  useEffect(() => { fetchTrends(); }, [fetchTrends]);

  const filteredTrends = trends.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <ToolLayout>
      <main className="flex flex-1 flex-col overflow-hidden min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-bg px-5 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10"><TrendingUp className="h-4 w-4 text-accent" /></div>
            <div>
              <h1 className="text-sm font-semibold text-text-primary">Trend Predictor</h1>
              <p className="text-[11px] text-text-muted">Real-time trend forecasting from Adobe Stock</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {lastUpdated && <span className="text-[10px] text-text-muted">Last updated: {lastUpdated}</span>}
            <button onClick={fetchTrends} disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-text-secondary hover:border-accent hover:text-accent disabled:opacity-50">
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-auto" style={{ backgroundColor: "#f1f5f9" }}>
          <div className="flex-1 p-6">
            {/* Stats Row */}
            <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                { label: "Avg Growth", value: `${stats.avgGrowth > 0 ? "+" : ""}${stats.avgGrowth}%`, icon: TrendingUp, color: stats.avgGrowth > 0 ? "text-green-600" : "text-red-500" },
                { label: "High Opportunities", value: String(stats.highOpp), icon: Target, color: "text-accent" },
                { label: "Avg Confidence", value: `${stats.avgConfidence}%`, icon: Zap, color: "text-amber-600" },
                { label: "Top Trend", value: stats.topTrend.slice(0, 15), icon: Clock, color: "text-blue-600" },
              ].map((s, i) => (
                <div key={i} className="rounded-xl border border-border bg-surface p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <s.icon className={`h-4 w-4 ${s.color}`} />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">{s.label}</span>
                  </div>
                  <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Monthly Forecast Chart */}
            <div className="mb-6 rounded-xl border border-border bg-surface p-5">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">📈 Monthly Forecast — {category}</h3>
              {monthlyData.length > 0 ? <BarChart data={monthlyData} /> : <div className="h-32 flex items-center justify-center text-text-muted text-xs">Loading...</div>}
            </div>

            {/* Trend List */}
            <div className="rounded-xl border border-border bg-surface">
              <div className="border-b border-border p-4">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-text-muted" />
                  <input type="text" placeholder="Search trends..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted" />
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2">
                  <RefreshCw className="h-6 w-6 animate-spin text-accent" />
                  <span className="text-xs text-text-muted">Fetching real data from Adobe Stock...</span>
                </div>
              ) : error ? (
                <div className="py-16 text-center">
                  <p className="text-sm text-danger mb-2">{error}</p>
                  <button onClick={fetchTrends} className="text-xs text-accent hover:underline">Try again</button>
                </div>
              ) : filteredTrends.length === 0 ? (
                <div className="py-16 text-center text-sm text-text-muted">No trends found</div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredTrends.map((trend, i) => (
                    <div key={i} onClick={() => setSelectedTrend(selectedTrend?.name === trend.name ? null : trend)}
                      className="flex items-center gap-4 p-4 transition-colors hover:bg-accent/5 cursor-pointer">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg text-xs font-bold text-text-muted">#{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text-primary">{trend.name}</p>
                        <p className="text-[11px] text-text-muted">{trend.category} • {trend.season} • Confidence: {trend.confidence}%</p>
                        {trend.totalDownloads !== undefined && (
                          <p className="text-[10px] text-text-muted">{trend.totalDownloads.toLocaleString()} downloads • {trend.assetCount?.toLocaleString()} assets</p>
                        )}
                      </div>
                      <MiniChart data={trend.history} />
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          {trend.growth > 0 ? <ArrowUpRight className="h-3 w-3 text-green-600" /> : trend.growth < 0 ? <ArrowDownRight className="h-3 w-3 text-red-500" /> : <Minus className="h-3 w-3 text-text-muted" />}
                          <span className={`text-xs font-bold ${trend.growth > 0 ? "text-green-600" : trend.growth < 0 ? "text-red-500" : "text-text-muted"}`}>
                            {trend.growth > 0 ? "+" : ""}{trend.growth}%
                          </span>
                        </div>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${trend.opportunity === "Very High" ? "bg-green-100 text-green-700" : trend.opportunity === "High" ? "bg-blue-100 text-blue-700" : trend.opportunity === "Medium" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                          {trend.opportunity}
                        </span>
                      </div>
                      {selectedTrend?.name === trend.name ? <ChevronUp className="h-4 w-4 text-text-muted" /> : <ChevronDown className="h-4 w-4 text-text-muted" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Expanded Trend Detail */}
            {selectedTrend && (
              <div className="mt-4 rounded-xl border border-accent/30 bg-accent-subtle p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-text-primary">{selectedTrend.name} — Detailed Analysis</h3>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${selectedTrend.opportunity === "Very High" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {selectedTrend.opportunity} Opportunity
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <div><p className="text-[10px] text-text-muted">Current Score</p><p className="text-sm font-bold text-text-primary">{selectedTrend.currentScore}/100</p></div>
                  <div><p className="text-[10px] text-text-muted">Predicted Score</p><p className="text-sm font-bold text-accent">{selectedTrend.predictedScore}/100</p></div>
                  <div><p className="text-[10px] text-text-muted">Competition</p><p className="text-sm font-bold text-text-primary">{selectedTrend.competition}</p></div>
                  <div><p className="text-[10px] text-text-muted">Peak Season</p><p className="text-sm font-bold text-text-primary">{selectedTrend.season}</p></div>
                </div>
                {selectedTrend.totalDownloads !== undefined && (
                  <div className="mt-3 grid grid-cols-3 gap-4">
                    <div><p className="text-[10px] text-text-muted">Total Downloads</p><p className="text-sm font-bold text-text-primary">{selectedTrend.totalDownloads?.toLocaleString()}</p></div>
                    <div><p className="text-[10px] text-text-muted">Total Views</p><p className="text-sm font-bold text-text-primary">{selectedTrend.totalViews?.toLocaleString()}</p></div>
                    <div><p className="text-[10px] text-text-muted">Assets Found</p><p className="text-sm font-bold text-text-primary">{selectedTrend.assetCount?.toLocaleString()}</p></div>
                  </div>
                )}
                <div className="mt-3">
                  <p className="text-[10px] text-text-muted mb-1">Suggested Keywords</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedTrend.keywords.map((kw, i) => (
                      <span key={i} className="rounded-full bg-surface border border-border px-2 py-0.5 text-[10px] text-text-secondary">{kw}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Right Panel */}
      <aside className="hidden w-[280px] shrink-0 flex-col overflow-y-auto min-h-0 border-l border-border bg-bg-secondary lg:flex">
        <div className="p-4">
          <Section title="Category" icon={<BarChart3 className="h-3.5 w-3.5" />}>
            <div className="grid grid-cols-2 gap-1.5">
              {["Technology", "Nature", "Business", "Health", "Food", "Travel", "Art", "Education"].map(c => (
                <button key={c} onClick={() => setCategory(c)}
                  className={`rounded-lg border px-2 py-1.5 text-[11px] font-semibold transition-all ${category === c ? "border-accent bg-accent text-white" : "border-border bg-surface text-text-secondary hover:border-text-muted"}`}>
                  {c}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Time Range" icon={<Calendar className="h-3.5 w-3.5" />}>
            <div className="flex gap-1.5">
              {[
                { id: "week", label: "Week" },
                { id: "month", label: "Month" },
                { id: "quarter", label: "Quarter" },
                { id: "year", label: "Year" },
              ].map(r => (
                <button key={r.id} onClick={() => setTimeRange(r.id)}
                  className={`flex-1 rounded-lg border px-2 py-1.5 text-[11px] font-semibold transition-all ${timeRange === r.id ? "border-accent bg-accent text-white" : "border-border bg-surface text-text-secondary hover:border-text-muted"}`}>
                  {r.label}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Forecast Summary" icon={<Zap className="h-3.5 w-3.5" />}>
            <div className="rounded-xl border border-border bg-surface p-3 space-y-2">
              <div className="flex justify-between text-xs"><span className="text-text-muted">Trends Analyzed</span><span className="font-bold text-text-primary">{trends.length}</span></div>
              <div className="flex justify-between text-xs"><span className="text-text-muted">Positive Growth</span><span className="font-bold text-green-600">{trends.filter(t => t.growth > 0).length}</span></div>
              <div className="flex justify-between text-xs"><span className="text-text-muted">Declining</span><span className="font-bold text-red-500">{trends.filter(t => t.growth < 0).length}</span></div>
              <div className="flex justify-between text-xs"><span className="text-text-muted">Avg Confidence</span><span className="font-bold text-accent">{stats.avgConfidence}%</span></div>
              <div className="flex justify-between text-xs"><span className="text-text-muted">Data Source</span><span className="font-bold text-accent">Adobe Stock API</span></div>
            </div>
          </Section>

          <div className="space-y-2">
            <button onClick={() => {
              const csv = "Trend,Growth,Confidence,Opportunity,Competition,Downloads,Assets\n" + trends.map(t => `${t.name},${t.growth}%,${t.confidence}%,${t.opportunity},${t.competition},${t.totalDownloads || 0},${t.assetCount || 0}`).join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const link = document.createElement("a");
              link.download = `trends-${category}-${timeRange}.csv`;
              link.href = URL.createObjectURL(blob);
              link.click();
            }} className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-xs font-medium text-text-secondary hover:border-accent hover:text-accent">
              <Download className="h-3.5 w-3.5" /> Export Trends CSV
            </button>
          </div>
        </div>
      </aside>
    </ToolLayout>
  );
}

function Section({ title, icon, defaultOpen = true, children }: { title: string; icon?: React.ReactNode; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-4">
      <button onClick={() => setOpen(!open)} className="mb-3 flex w-full items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-accent">
        {icon}{title}<span className="flex-1 border-t border-border-subtle" />
        {open ? <ChevronUp className="h-2.5 w-2.5" /> : <ChevronDown className="h-2.5 w-2.5" />}
      </button>
      {open && <div className="space-y-3">{children}</div>}
    </div>
  );
}
