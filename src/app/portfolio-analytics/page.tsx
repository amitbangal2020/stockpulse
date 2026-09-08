"use client";

import { useState, useMemo } from "react";
import { CandlestickChart as Chart } from "@/components/candlestick-chart-wrapper";
import { ToolLayout } from "@/components/tool-layout";
import {
  BarChart3, Download, ChevronUp, ChevronDown, RefreshCw, Shuffle,
  Target, Activity, TrendingUp, Eye, EyeOff,
} from "lucide-react";



const METRICS = ["Downloads", "Views", "Likes", "Revenue", "Rank", "Keywords", "Consistency", "Niche Score"];
const TIMEFRAMES = ["7 Days", "30 Days", "90 Days", "1 Year"];

interface PortfolioProfile {
  name: string;
  color: string;
  values: number[];
}

function generateRandomProfile(name: string, color: string): PortfolioProfile {
  return { name, color, values: METRICS.map(() => Math.floor(Math.random() * 80) + 20) };
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

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-text-primary">{label}</span>
      <button onClick={() => onChange(!checked)} className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? "bg-accent" : "bg-border"}`}>
        <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-4" : ""}`} />
      </button>
    </div>
  );
}

export default function PortfolioAnalyticsPage() {
  const [profiles, setProfiles] = useState<PortfolioProfile[]>([
    { name: "Your Portfolio", color: "#0d9488", values: [75, 60, 82, 45, 68, 71, 55, 90] },
    { name: "Top Performer", color: "#3fb950", values: [92, 88, 95, 78, 94, 85, 91, 87] },
    { name: "Market Average", color: "#8b949e", values: [45, 42, 38, 35, 40, 48, 44, 36] },
  ]);
  const [timeframe, setTimeframe] = useState(1);
  const [showRadar, setShowRadar] = useState(true);
  const [showBar, setShowBar] = useState(true);
  const [radarType, setRadarType] = useState<"radar" | "polarArea">("radar");

  const randomize = () => {
    setProfiles(profiles.map((p) => ({
      ...p,
      values: METRICS.map(() => Math.floor(Math.random() * 80) + 20),
    })));
  };

  // Radar chart
  const radarOptions: any = {
    chart: { type: radarType, height: 400, background: "#ffffff", toolbar: { show: false }, fontFamily: "Inter, sans-serif" },
    colors: profiles.map((p) => p.color),
    stroke: { width: 2 },
    fill: { opacity: 0.15 },
    markers: { size: 4, strokeWidth: 2 },
    xaxis: { categories: METRICS, labels: { style: { fontSize: "11px", colors: "var(--text-muted)" } } },
    yaxis: { show: false, max: 100 },
    legend: { show: true, position: "bottom", fontSize: "11px", labels: { useSeriesColors: true }, markers: { size: 8 } },
    tooltip: { theme: "light" },
    plotOptions: {
      radar: { polygons: { strokeColors: "var(--border)", strokeWidth: 1, connectorColors: "var(--border)", fill: { colors: ["transparent"] } } },
    },
  };

  const radarSeries = profiles.filter((_, i) => i < 3).map((p) => ({ name: p.name, data: p.values }));

  // Bar chart
  const barOptions: any = {
    chart: { type: "bar", height: 300, background: "#ffffff", toolbar: { show: false }, fontFamily: "Inter, sans-serif" },
    colors: profiles.map((p) => p.color),
    xaxis: { categories: METRICS, labels: { style: { fontSize: "10px" } } },
    yaxis: { max: 100, labels: { style: { fontSize: "11px" }, formatter: (v: number) => v + "%" } },
    grid: { borderColor: "var(--border)", strokeDashArray: 4 },
    plotOptions: { bar: { horizontal: false, borderRadius: 4, columnWidth: "60%" } },
    legend: { show: false },
    tooltip: { theme: "light" },
  };

  const barSeries = profiles.map((p) => ({ name: p.name, data: p.values }));

  // Score calculation
  const getScore = (values: number[]) => Math.round(values.reduce((s, v) => s + v, 0) / values.length);

  // Improvement tips
  const getTips = (values: number[]) => {
    const tips: { metric: string; score: number; tip: string }[] = [];
    const lowestIdx = values.indexOf(Math.min(...values));
    tips.push({ metric: METRICS[lowestIdx], score: values[lowestIdx], tip: `Focus on improving ${METRICS[lowestIdx].toLowerCase()} — it's your weakest area.` });
    const highestIdx = values.indexOf(Math.max(...values));
    tips.push({ metric: METRICS[highestIdx], score: values[highestIdx], tip: `Leverage your strength in ${METRICS[highestIdx].toLowerCase()} to boost other areas.` });
    if (values[5] < 50) tips.push({ metric: "Keywords", score: values[5], tip: "Add more diverse keywords to improve discoverability." });
    if (values[6] < 50) tips.push({ metric: "Consistency", score: values[6], tip: "Upload regularly to maintain algorithm visibility." });
    return tips;
  };

  const yourProfile = profiles[0];
  const yourScore = getScore(yourProfile.values);
  const tips = getTips(yourProfile.values);

  return (
    <ToolLayout>
      <main className="flex flex-1 flex-col overflow-hidden min-h-0">
        <div className="flex items-center justify-between border-b border-border bg-bg px-5 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10"><Target className="h-4 w-4 text-accent" /></div>
            <div>
              <h1 className="text-sm font-semibold text-text-primary">Portfolio Analytics</h1>
              <p className="text-[11px] text-text-muted">Analyze and compare portfolio performance</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {TIMEFRAMES.map((tf, i) => (
              <button key={tf} onClick={() => setTimeframe(i)}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors ${timeframe === i ? "bg-accent text-white" : "bg-bg-secondary text-text-muted hover:text-text-primary"}`}>{tf}</button>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-6 border-b border-border bg-bg px-5 py-2">
          <div><span className="text-[10px] text-text-muted">YOUR SCORE</span>
            <p className={`text-sm font-bold ${yourScore >= 70 ? "text-green-600" : yourScore >= 40 ? "text-yellow-500" : "text-red-500"}`}>{yourScore}/100</p>
          </div>
          {profiles.slice(1).map((p) => (
            <div key={p.name}><span className="text-[10px]" style={{ color: p.color }}>{p.name.toUpperCase()}</span>
              <p className="text-sm font-bold" style={{ color: p.color }}>{getScore(p.values)}/100</p>
            </div>
          ))}
          <div className="ml-auto"><span className="text-[10px] text-text-muted">STRONGEST</span>
            <p className="text-sm font-semibold text-text-primary">{METRICS[yourProfile.values.indexOf(Math.max(...yourProfile.values))]}</p>
          </div>
          <div><span className="text-[10px] text-text-muted">WEAKEST</span>
            <p className="text-sm font-semibold text-text-primary">{METRICS[yourProfile.values.indexOf(Math.min(...yourProfile.values))]}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="flex-1 overflow-auto" style={{ minHeight: 0, background: "#ffffff" }}>
          <div className="flex h-full flex-col gap-4 p-4">
            {showRadar && (
              <div className="rounded-xl border border-border bg-surface p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-text-primary">Radar Comparison</h3>
                  <div className="flex gap-1">
                    <button onClick={() => setRadarType("radar")}
                      className={`rounded-md px-2 py-1 text-[10px] font-medium ${radarType === "radar" ? "bg-accent text-white" : "text-text-muted"}`}>Radar</button>
                    <button onClick={() => setRadarType("polarArea")}
                      className={`rounded-md px-2 py-1 text-[10px] font-medium ${radarType === "polarArea" ? "bg-accent text-white" : "text-text-muted"}`}>Polar</button>
                  </div>
                </div>
                <Chart options={radarOptions} series={radarSeries} type={radarType} height={400} />
              </div>
            )}
            {showBar && (
              <div className="rounded-xl border border-border bg-surface p-4">
                <h3 className="mb-3 text-xs font-semibold text-text-primary">Metric Comparison</h3>
                <Chart options={barOptions} series={barSeries} type="bar" height={300} />
              </div>
            )}
          </div>
        </div>
      </main>

      <aside className="hidden w-[280px] shrink-0 flex-col overflow-y-auto min-h-0 border-l border-border bg-bg-secondary lg:flex">
        <div className="p-4">
          <div className="mb-4"><h2 className="text-sm font-semibold text-text-primary">Settings</h2><p className="text-[11px] text-text-muted">Portfolio comparison & insights</p></div>

          <Section title="Portfolios" icon={<Target className="h-3 w-3" />}>
            {profiles.map((p, i) => (
              <div key={i} className="rounded-xl border border-border bg-surface p-3">
                <div className="mb-2 flex items-center gap-2">
                  <input type="color" value={p.color} onChange={(e) => { const np = [...profiles]; np[i] = { ...np[i], color: e.target.value }; setProfiles(np); }}
                    className="h-6 w-6 cursor-pointer rounded border border-border" />
                  <input value={p.name} onChange={(e) => { const np = [...profiles]; np[i] = { ...np[i], name: e.target.value }; setProfiles(np); }}
                    className="flex-1 rounded-lg border border-border bg-surface px-2 py-1 text-xs font-medium text-text-primary focus:border-accent focus:outline-none" />
                  <button onClick={() => { const np = profiles.filter((_, j) => j !== i); setProfiles(np); }}
                    className="text-[10px] text-red-500 hover:text-red-600" disabled={profiles.length <= 1}>✕</button>
                </div>
                {METRICS.map((m, mi) => (
                  <div key={m} className="mb-1 flex items-center gap-2">
                    <span className="w-20 text-[9px] text-text-muted truncate">{m}</span>
                    <input type="range" min={0} max={100} value={p.values[mi]}
                      onChange={(e) => { const np = [...profiles]; const nv = [...np[i].values]; nv[mi] = Number(e.target.value); np[i] = { ...np[i], values: nv }; setProfiles(np); }}
                      className="flex-1" />
                    <span className="w-6 text-[10px] font-bold text-accent text-right">{p.values[mi]}</span>
                  </div>
                ))}
              </div>
            ))}
            <button onClick={() => {
              const colors = ["#2196f3", "#e91e63", "#ff9800", "#9c27b0", "#00bcd4"];
              setProfiles([...profiles, generateRandomProfile(`Profile ${profiles.length + 1}`, colors[profiles.length % colors.length])]);
            }} className="w-full rounded-xl border border-dashed border-border bg-surface py-2 text-[11px] font-medium text-text-muted transition-colors hover:border-accent hover:text-accent">
              + Add Profile
            </button>
            <button onClick={randomize}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-[11px] font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent">
              <Shuffle className="h-3 w-3" /> Randomize All
            </button>
          </Section>

          <Section title="Display" icon={<Eye className="h-3 w-3" />}>
            <Toggle checked={showRadar} onChange={setShowRadar} label="Radar Chart" />
            <Toggle checked={showBar} onChange={setShowBar} label="Bar Chart" />
          </Section>

          {/* Insights */}
          <Section title="Insights" icon={<Activity className="h-3 w-3" />}>
            <div className="space-y-2">
              {tips.map((t, i) => (
                <div key={i} className="rounded-xl border border-border bg-surface p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-text-primary">{t.metric}</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${t.score >= 70 ? "bg-green-500/10 text-green-500" : t.score >= 40 ? "bg-yellow-500/10 text-yellow-500" : "bg-red-500/10 text-red-500"}`}>{t.score}</span>
                  </div>
                  <p className="text-[10px] text-text-muted leading-relaxed">{t.tip}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Export */}
          <Section title="Export" icon={<Download className="h-3 w-3" />}>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { const svg = document.querySelector("#portfolio-chart svg"); if (!svg) return; const a = document.createElement("a"); a.download = "portfolio-radar.svg"; a.href = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" })); a.click(); }}
                className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-[11px] font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent">SVG</button>
              <button onClick={() => {
                const rows = ["Metric," + profiles.map((p) => p.name).join(",")];
                METRICS.forEach((m, i) => rows.push(m + "," + profiles.map((p) => p.values[i]).join(",")));
                const a = document.createElement("a"); a.download = "portfolio-analytics.csv"; a.href = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv" })); a.click();
              }} className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-[11px] font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent">CSV</button>
            </div>
          </Section>
        </div>
      </aside>
    </ToolLayout>
  );
}
