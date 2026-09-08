"use client";

import { useState, useMemo } from "react";
import { CandlestickChart as Chart } from "@/components/candlestick-chart-wrapper";
import { ToolLayout } from "@/components/tool-layout";
import {
  BarChart3, Download, ChevronUp, ChevronDown, RefreshCw, Plus, X,
  GitCompare, TrendingUp, Activity, Maximize, Minimize,
} from "lucide-react";



interface Asset { name: string; symbol: string; color: string; data: number[]; }

const PRESET_ASSETS: Asset[] = [
  { name: "Adobe Stock", symbol: "ADOBE", color: "#ff6b35", data: [] },
  { name: "Shutterstock", symbol: "SSTK", color: "#ee2d2d", data: [] },
  { name: "Getty Images", symbol: "GETY", color: "#0066cc", data: [] },
  { name: "iStock", symbol: "ISTK", color: "#1faa59", data: [] },
  { name: "Canva Stock", symbol: "CNVA", color: "#7b2ff7", data: [] },
  { name: "Dreamstime", symbol: "DTIM", color: "#ffc107", data: [] },
  { name: "123RF", symbol: "123RF", color: "#00bcd4", data: [] },
  { name: "Pond5", symbol: "PND5", color: "#ff4081", data: [] },
];

function generatePriceData(base: number, volatility: number, count = 30): number[] {
  const data: number[] = [base]; let price = base;
  for (let i = 1; i < count; i++) {
    price += (Math.random() - 0.5) * volatility;
    data.push(parseFloat(price.toFixed(2)));
  }
  return data;
}

function calcCorrelation(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  if (n === 0) return 0;
  const meanA = a.slice(0, n).reduce((s, v) => s + v, 0) / n;
  const meanB = b.slice(0, n).reduce((s, v) => s + v, 0) / n;
  let num = 0, denA = 0, denB = 0;
  for (let i = 0; i < n; i++) {
    const da = a[i] - meanA, db = b[i] - meanB;
    num += da * db; denA += da * da; denB += db * db;
  }
  return denA === 0 || denB === 0 ? 0 : num / Math.sqrt(denA * denB);
}

function calcRsi(data: number[], period = 14): number {
  if (data.length < period + 1) return 50;
  let avgGain = 0, avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const d = data[i] - data[i - 1];
    if (d > 0) avgGain += d; else avgLoss -= d;
  }
  avgGain /= period; avgLoss /= period;
  if (avgLoss === 0) return 100;
  return parseFloat((100 - 100 / (1 + avgGain / avgLoss)).toFixed(1));
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

export default function AssetComparisonPage() {
  const [assets, setAssets] = useState<Asset[]>(() =>
    PRESET_ASSETS.slice(0, 4).map((a) => ({
      ...a,
      data: generatePriceData(100 + Math.random() * 50, 5, 30),
    }))
  );
  const [viewType, setViewType] = useState<"line" | "area" | "bar">("line");
  const [normalize, setNormalize] = useState(false);
  const [showCorrelation, setShowCorrelation] = useState(true);
  const [showVolume, setShowVolume] = useState(false);
  const [timeframe, setTimeframe] = useState(2);
  const [fullscreen, setFullscreen] = useState(false);

  const randomize = () => {
    setAssets(assets.map((a) => ({
      ...a,
      data: generatePriceData(80 + Math.random() * 60, 3 + Math.random() * 8, 30),
    })));
  };

  const addAsset = () => {
    const available = PRESET_ASSETS.filter((p) => !assets.find((a) => a.symbol === p.symbol));
    if (available.length > 0) {
      const a = available[0];
      setAssets([...assets, { ...a, data: generatePriceData(80 + Math.random() * 60, 5, 30) }]);
    }
  };

  const removeAsset = (idx: number) => {
    setAssets(assets.filter((_, i) => i !== idx));
  };

  const days = [7, 14, 30, 60][timeframe];

  // Normalize to percentage change
  const normalizedData = useMemo(() => {
    if (!normalize) return assets.map((a) => ({ ...a, data: a.data.slice(-days) }));
    return assets.map((a) => {
      const d = a.data.slice(-days);
      const base = d[0] || 1;
      return { ...a, data: d.map((v) => ((v - base) / base) * 100) };
    });
  }, [assets, normalize, timeframe]);

  const series = useMemo(() => {
    const baseTime = new Date();
    baseTime.setHours(0, 0, 0, 0);
    const baseTs = baseTime.getTime();
    return normalizedData.map((a) => ({
      name: a.symbol,
      data: a.data.map((v, i) => ({ x: baseTs - (days - i) * 86400000, y: parseFloat(v.toFixed(2)) })),
    }));
  }, [normalizedData, days]);

  const chartOptions: any = {
    chart: { type: viewType === "bar" ? "bar" : viewType, height: "100%", background: "#ffffff", toolbar: { show: false }, fontFamily: "Inter, sans-serif", animations: { enabled: true, speed: 800 } },
    colors: assets.map((a) => a.color),
    xaxis: { type: "datetime", labels: { style: { fontSize: "11px" } }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { style: { fontSize: "11px" }, formatter: (v: number) => normalize ? v.toFixed(1) + "%" : "$" + v.toFixed(0) } },
    grid: { borderColor: "var(--border)", strokeDashArray: 4, padding: { left: 10, right: 10 } },
    stroke: { width: 2, curve: "smooth" },
    legend: { show: true, position: "top", fontSize: "11px", labels: { useSeriesColors: true }, markers: { size: 8, strokeWidth: 0 } },
    tooltip: { theme: "light", shared: true },
    fill: viewType === "area" ? { type: "gradient", gradient: { opacityFrom: 0.3, opacityTo: 0.05 } } : undefined,
  };

  // Correlation matrix
  const correlationMatrix = useMemo(() => {
    if (!showCorrelation) return null;
    const matrix: { a: string; b: string; corr: number; color: string }[] = [];
    for (let i = 0; i < assets.length; i++) {
      for (let j = i + 1; j < assets.length; j++) {
        const corr = calcCorrelation(assets[i].data, assets[j].data);
        matrix.push({
          a: assets[i].symbol, b: assets[j].symbol, corr: parseFloat(corr.toFixed(2)),
          color: corr > 0.5 ? "#3fb950" : corr > 0 ? "#ffd740" : corr > -0.5 ? "#ff9800" : "#f85149",
        });
      }
    }
    return matrix;
  }, [assets, showCorrelation]);

  // Stats per asset
  const assetStats = useMemo(() => {
    return assets.map((a) => {
      const d = a.data.slice(-days);
      const current = d[d.length - 1] || 0;
      const start = d[0] || current;
      const change = start !== 0 ? ((current - start) / start) * 100 : 0;
      const high = Math.max(...d);
      const low = Math.min(...d);
      const rsi = calcRsi(d);
      return { ...a, current, change, high, low, rsi };
    });
  }, [assets, timeframe]);

  return (
    <ToolLayout>
      <main className={`flex flex-1 flex-col overflow-hidden min-h-0 ${fullscreen ? "fixed inset-0 z-50 bg-bg" : ""}`}>
        <div className="flex items-center justify-between border-b border-border bg-bg px-5 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10"><GitCompare className="h-4 w-4 text-accent" /></div>
            <div>
              <h1 className="text-sm font-semibold text-text-primary">Asset Comparison</h1>
              <p className="text-[11px] text-text-muted">Compare multiple stocks & analyze correlations</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5 rounded-lg border border-border bg-bg-secondary p-0.5">
              {(["7D", "14D", "30D", "60D"] as const).map((tf, i) => (
                <button key={tf} onClick={() => setTimeframe(i)}
                  className={`rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${timeframe === i ? "bg-accent text-white" : "text-text-muted hover:text-text-primary"}`}>{tf}</button>
              ))}
            </div>
            <div className="h-5 w-px bg-border" />
            {(["line", "area", "bar"] as const).map((t) => (
              <button key={t} onClick={() => setViewType(t)}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors ${viewType === t ? "bg-accent text-white" : "bg-bg-secondary text-text-muted hover:text-text-primary"}`}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
            <div className="h-5 w-px bg-border" />
            <button onClick={() => setNormalize(!normalize)}
              className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors ${normalize ? "bg-accent text-white" : "bg-bg-secondary text-text-muted hover:text-text-primary"}`}>
              {normalize ? "% Change" : "Absolute"}
            </button>
            <button onClick={() => setFullscreen(!fullscreen)} className="rounded-lg p-1.5 text-text-muted hover:bg-bg-secondary hover:text-text-primary">
              {fullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 border-b border-border bg-bg px-5 py-2 overflow-x-auto">
          {assetStats.map((s) => (
            <div key={s.symbol} className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-1.5">
              <div className="h-3 w-3 rounded-full" style={{ background: s.color }} />
              <div>
                <span className="text-[10px] font-bold text-text-primary">{s.symbol}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-text-muted">${s.current.toFixed(2)}</span>
                  <span className={`text-[10px] font-bold ${s.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {s.change >= 0 ? "+" : ""}{s.change.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="flex-1 overflow-auto" style={{ minHeight: 0, background: "#ffffff" }}>
          <div id="comparison-chart" className="h-full w-full" style={{ minHeight: 500 }}>
            <Chart options={chartOptions} series={series} type={viewType === "bar" ? "bar" : "line"} height={500} />
          </div>
        </div>
      </main>

      <aside className="hidden w-[280px] shrink-0 flex-col overflow-y-auto min-h-0 border-l border-border bg-bg-secondary lg:flex">
        <div className="p-4">
          <div className="mb-4"><h2 className="text-sm font-semibold text-text-primary">Settings</h2><p className="text-[11px] text-text-muted">Asset comparison & correlation</p></div>

          <Section title="Assets" icon={<BarChart3 className="h-3 w-3" />}>
            {assets.map((a, i) => (
              <div key={i} className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2">
                <div className="h-3 w-3 rounded-full" style={{ background: a.color }} />
                <div className="flex-1">
                  <p className="text-[11px] font-semibold text-text-primary">{a.symbol}</p>
                  <p className="text-[9px] text-text-muted">{a.name}</p>
                </div>
                <input type="color" value={a.color} onChange={(e) => { const na = [...assets]; na[i] = { ...na[i], color: e.target.value }; setAssets(na); }}
                  className="h-5 w-5 cursor-pointer rounded border-0" />
                <button onClick={() => removeAsset(i)} className="text-text-muted hover:text-red-500"><X className="h-3 w-3" /></button>
              </div>
            ))}
            <button onClick={addAsset}
              className="w-full rounded-xl border border-dashed border-border bg-surface py-2 text-[11px] font-medium text-text-muted transition-colors hover:border-accent hover:text-accent">
              <Plus className="mr-1 inline h-3 w-3" /> Add Asset
            </button>
            <button onClick={randomize}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-[11px] font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent">
              <RefreshCw className="h-3 w-3" /> Randomize
            </button>
          </Section>

          {/* Stats Table */}
          <Section title="Statistics" icon={<Activity className="h-3 w-3" />}>
            <div className="overflow-x-auto">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="text-text-muted">
                    <th className="pb-1 text-left font-medium">Asset</th>
                    <th className="pb-1 text-right font-medium">Price</th>
                    <th className="pb-1 text-right font-medium">Chg</th>
                    <th className="pb-1 text-right font-medium">RSI</th>
                  </tr>
                </thead>
                <tbody>
                  {assetStats.map((s) => (
                    <tr key={s.symbol} className="border-t border-border">
                      <td className="py-1.5 font-semibold text-text-primary">{s.symbol}</td>
                      <td className="py-1.5 text-right text-text-secondary">${s.current.toFixed(2)}</td>
                      <td className={`py-1.5 text-right font-bold ${s.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {s.change >= 0 ? "+" : ""}{s.change.toFixed(2)}%
                      </td>
                      <td className={`py-1.5 text-right font-bold ${s.rsi > 70 ? "text-red-500" : s.rsi < 30 ? "text-green-500" : "text-text-secondary"}`}>
                        {s.rsi}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* Correlation Matrix */}
          {showCorrelation && correlationMatrix && correlationMatrix.length > 0 && (
            <Section title="Correlation Matrix" icon={<GitCompare className="h-3 w-3" />}>
              <div className="space-y-1">
                {correlationMatrix.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1.5">
                    <span className="w-12 text-[10px] font-bold text-text-primary">{c.a}</span>
                    <span className="text-[9px] text-text-muted">↔</span>
                    <span className="w-12 text-[10px] font-bold text-text-primary">{c.b}</span>
                    <div className="flex-1">
                      <div className="h-2 rounded-full bg-border" style={{ width: "100%" }}>
                        <div className="h-full rounded-full" style={{ width: `${Math.abs(c.corr) * 100}%`, background: c.color }} />
                      </div>
                    </div>
                    <span className="w-8 text-right text-[10px] font-bold" style={{ color: c.color }}>{c.corr.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex gap-2 text-[9px] text-text-muted">
                <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-green-500" /> Strong +</span>
                <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-yellow-400" /> Moderate</span>
                <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-red-500" /> Negative</span>
              </div>
            </Section>
          )}

          {/* Export */}
          <Section title="Export" icon={<Download className="h-3 w-3" />}>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { const svg = document.querySelector("#comparison-chart svg"); if (!svg) return; const c = document.createElement("canvas"); const b = svg.getBoundingClientRect(); c.width = b.width * 2; c.height = b.height * 2; const ctx = c.getContext("2d"); const img = new window.Image(); img.onload = () => { if (ctx) { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(img, 0, 0, c.width, c.height); const a = document.createElement("a"); a.download = "comparison.png"; a.href = c.toDataURL("image/png"); a.click(); } }; img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(new XMLSerializer().serializeToString(svg)))); }}
                className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-[11px] font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent">PNG</button>
              <button onClick={() => { const rows = ["Date," + assets.map((a) => a.symbol).join(",")]; const len = assets[0]?.data.length || 0; for (let i = 0; i < len; i++) { const date = new Date(Date.now() - (len - i) * 86400000).toISOString().split("T")[0]; rows.push(date + "," + assets.map((a) => a.data[i]?.toFixed(2) || "").join(",")); } const a = document.createElement("a"); a.download = "comparison.csv"; a.href = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv" })); a.click(); }}
                className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-[11px] font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent">CSV</button>
            </div>
          </Section>
        </div>
      </aside>
    </ToolLayout>
  );
}
