"use client";

import { useState, useMemo, useCallback } from "react";
import { CandlestickChart as Chart } from "@/components/candlestick-chart-wrapper";
import { ToolLayout } from "@/components/tool-layout";
import {
  Grid3X3, Download, Copy, Check, RefreshCw, ChevronUp, ChevronDown,
  Palette, Layers, Settings, Eye, EyeOff, Maximize, Minimize,
} from "lucide-react";



interface Category {
  name: string;
  value: number;
  growth: number;
  color: string;
}

const CATEGORIES: Category[] = [
  { name: "AI & Tech", value: 34200, growth: 45, color: "#3fb950" },
  { name: "Nature", value: 28900, growth: 12, color: "#26a69a" },
  { name: "Business", value: 21500, growth: -5, color: "#f85149" },
  { name: "Health", value: 18200, growth: 28, color: "#3fb950" },
  { name: "Food", value: 15600, growth: 8, color: "#26a69a" },
  { name: "Travel", value: 14800, growth: -2, color: "#f85149" },
  { name: "Education", value: 12400, growth: 18, color: "#3fb950" },
  { name: "Sports", value: 11200, growth: 5, color: "#26a69a" },
  { name: "Music", value: 9800, growth: -8, color: "#f85149" },
  { name: "Fashion", value: 8900, growth: 22, color: "#3fb950" },
  { name: "Animals", value: 8200, growth: 15, color: "#3fb950" },
  { name: "Architecture", value: 7600, growth: 3, color: "#26a69a" },
  { name: "Abstract", value: 6800, growth: -12, color: "#f85149" },
  { name: "People", value: 6200, growth: 7, color: "#26a69a" },
  { name: "Vehicles", value: 5400, growth: -3, color: "#f85149" },
  { name: "Science", value: 4800, growth: 35, color: "#3fb950" },
  { name: "Holidays", value: 4200, growth: 10, color: "#26a69a" },
  { name: "Industry", value: 3600, growth: -1, color: "#f85149" },
  { name: "Textures", value: 3100, growth: 5, color: "#26a69a" },
  { name: "Backgrounds", value: 2800, growth: -6, color: "#f85149" },
  { name: "Vintage", value: 2400, growth: 25, color: "#3fb950" },
  { name: "Technology", value: 2100, growth: 42, color: "#3fb950" },
  { name: "Space", value: 1800, growth: 55, color: "#3fb950" },
  { name: "Medical", value: 1500, growth: 19, color: "#3fb950" },
  { name: "Legal", value: 1200, growth: -4, color: "#f85149" },
  { name: "Energy", value: 1000, growth: 30, color: "#3fb950" },
  { name: "Agriculture", value: 800, growth: 6, color: "#26a69a" },
  { name: "Security", value: 600, growth: 14, color: "#3fb950" },
  { name: "Marketing", value: 500, growth: -7, color: "#f85149" },
  { name: "Gaming", value: 400, growth: 60, color: "#3fb950" },
];

const PALETTES = [
  { name: "Performance", getColor: (g: number) => g > 20 ? "#3fb950" : g > 5 ? "#26a69a" : g > -5 ? "#ffd740" : "#f85149" },
  { name: "Ocean", getColor: () => { const colors = ["#0077b6", "#00b4d8", "#90e0ef", "#023e8a", "#48cae4", "#0096c7", "#caf0f8", "#03045e", "#ade8f4", "#005f73"]; return colors[Math.floor(Math.random() * colors.length)]; } },
  { name: "Sunset", getColor: () => { const colors = ["#ff6b6b", "#ee5a24", "#f9ca24", "#ff9ff3", "#feca57", "#ff6348", "#ff4757", "#ffa502", "#ff7f50", "#e17055"]; return colors[Math.floor(Math.random() * colors.length)]; } },
  { name: "Forest", getColor: () => { const colors = ["#2d6a4f", "#40916c", "#52b788", "#74c69d", "#95d5b2", "#b7e4c7", "#1b4332", "#344e41", "#588157", "#a3b18a"]; return colors[Math.floor(Math.random() * colors.length)]; } },
  { name: "Neon", getColor: () => { const colors = ["#00f5d4", "#00bbf9", "#9b5de5", "#f15bb5", "#fee440", "#00f5d4", "#7209b7", "#560bad", "#480ca8", "#3a0ca3"]; return colors[Math.floor(Math.random() * colors.length)]; } },
  { name: "Grayscale", getColor: () => { const v = Math.floor(Math.random() * 200 + 55); return `rgb(${v},${v},${v})`; } },
];

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

export default function MarketHeatmapPage() {
  const [palette, setPalette] = useState(0);
  const [sortBy, setSortBy] = useState<"name" | "value" | "growth">("value");
  const [showLabels, setShowLabels] = useState(true);
  const [showGrowth, setShowGrowth] = useState(true);
  const [minValue, setMinValue] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const paletteColors = useMemo(() => {
    const p = PALETTES[palette];
    return CATEGORIES.map((c) => ({ ...c, color: p.getColor(c.growth) }));
  }, [palette]);

  const sorted = useMemo(() => {
    const s = [...paletteColors];
    if (sortBy === "value") s.sort((a, b) => b.value - a.value);
    else if (sortBy === "growth") s.sort((a, b) => b.growth - a.growth);
    else s.sort((a, b) => a.name.localeCompare(b.name));
    return s.filter((c) => c.value >= minValue * 1000);
  }, [paletteColors, sortBy, minValue]);

  const totalValue = sorted.reduce((s, c) => s + c.value, 0);
  const avgGrowth = sorted.length > 0 ? sorted.reduce((s, c) => s + c.growth, 0) / sorted.length : 0;

  // Generate treeemap-like layout using simple squarified algorithm
  const treemapData = useMemo(() => {
    const total = sorted.reduce((s, c) => s + c.value, 0);
    if (total === 0) return [];
    return sorted.map((c) => ({
      ...c,
      percent: (c.value / total) * 100,
    }));
  }, [sorted]);

  const chartOptions: any = {
    chart: { type: "treemap", height: "100%", background: "#ffffff", toolbar: { show: false }, fontFamily: "Inter, sans-serif" },
    plotOptions: {
      treemap: {
        distributed: true,
        enableShades: false,
        dataLabels: {
          enabled: showLabels,
          style: { fontSize: "11px", fontFamily: "Inter", fontWeight: "600" },
          formatter: (text: string, op: any) => {
            if (!showLabels) return "";
            const item = sorted.find((c) => c.name === op.nodeLabel);
            if (!item) return text;
            return showGrowth ? `${text}\n${item.growth > 0 ? "+" : ""}${item.growth}%` : text;
          },
        },
      },
    },
    colors: sorted.map((c) => c.color),
    tooltip: {
      theme: "light",
      custom: ({ seriesIndex, w }: any) => {
        const item = sorted[seriesIndex];
        if (!item) return "";
        return `<div style="padding:12px;font-family:Inter,sans-serif;">
          <div style="font-size:14px;font-weight:700;margin-bottom:4px;">${item.name}</div>
          <div style="font-size:12px;color:#666;">Assets: ${item.value.toLocaleString()}</div>
          <div style="font-size:12px;color:${item.growth >= 0 ? "#3fb950" : "#f85149"};">
            Growth: ${item.growth >= 0 ? "+" : ""}${item.growth}%
          </div>
          <div style="font-size:12px;color:#666;">Share: ${((item.value / totalValue) * 100).toFixed(1)}%</div>
        </div>`;
      },
    },
    legend: { show: false },
  };

  const series = [{ data: treemapData.map((c) => ({ x: c.name, y: c.value, color: c.color })) }];

  const exportPNG = () => {
    const svg = document.querySelector("#heatmap-chart svg");
    if (!svg) return;
    const canvas = document.createElement("canvas");
    const bbox = svg.getBoundingClientRect();
    canvas.width = bbox.width * 2; canvas.height = bbox.height * 2;
    const ctx = canvas.getContext("2d");
    const img = new window.Image();
    img.onload = () => { if (ctx) { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0, canvas.width, canvas.height); const a = document.createElement("a"); a.download = "market-heatmap.png"; a.href = canvas.toDataURL("image/png"); a.click(); } };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(new XMLSerializer().serializeToString(svg))));
  };

  const exportSVG = () => {
    const svg = document.querySelector("#heatmap-chart svg");
    if (!svg) return;
    const a = document.createElement("a"); a.download = "market-heatmap.svg"; a.href = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" })); a.click();
  };

  return (
    <ToolLayout>
      <main className={`flex flex-1 flex-col overflow-hidden min-h-0 ${fullscreen ? "fixed inset-0 z-50 bg-bg" : ""}`}>
        <div className="flex items-center justify-between border-b border-border bg-bg px-5 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10"><Grid3X3 className="h-4 w-4 text-accent" /></div>
            <div>
              <h1 className="text-sm font-semibold text-text-primary">Market Heatmap</h1>
              <p className="text-[11px] text-text-muted">Visualize category performance at a glance</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setFullscreen(!fullscreen)} className="rounded-lg p-1.5 text-text-muted hover:bg-bg-secondary hover:text-text-primary">
              {fullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 border-b border-border bg-bg px-5 py-2">
          <div><span className="text-[10px] text-text-muted">CATEGORIES</span><p className="text-sm font-semibold text-text-primary">{sorted.length}</p></div>
          <div><span className="text-[10px] text-text-muted">TOTAL ASSETS</span><p className="text-sm font-semibold text-text-primary">{totalValue.toLocaleString()}</p></div>
          <div><span className="text-[10px] text-text-muted">AVG GROWTH</span>
            <p className={`text-sm font-semibold ${avgGrowth >= 0 ? "text-green-600" : "text-red-500"}`}>{avgGrowth >= 0 ? "+" : ""}{avgGrowth.toFixed(1)}%</p>
          </div>
          <div><span className="text-[10px] text-text-muted">TOP CATEGORY</span>
            <p className="text-sm font-semibold text-text-primary">{sorted.length > 0 ? sorted[0].name : "—"}</p>
          </div>
          <div><span className="text-[10px] text-text-muted">GROWING</span>
            <p className="text-sm font-semibold text-green-600">{sorted.filter((c) => c.growth > 0).length}</p>
          </div>
          <div><span className="text-[10px] text-text-muted">DECLINING</span>
            <p className="text-sm font-semibold text-red-500">{sorted.filter((c) => c.growth < 0).length}</p>
          </div>
        </div>

        {/* Heatmap */}
        <div className="flex-1 overflow-auto" style={{ minHeight: 0, background: "#ffffff" }}>
          <div id="heatmap-chart" className="w-full" style={{ minHeight: 500 }}>
            <Chart options={chartOptions} series={series} type="treemap" height={500} />
          </div>
        </div>
      </main>

      <aside className="hidden w-[280px] shrink-0 flex-col overflow-y-auto min-h-0 border-l border-border bg-bg-secondary lg:flex">
        <div className="p-4">
          <div className="mb-4"><h2 className="text-sm font-semibold text-text-primary">Settings</h2><p className="text-[11px] text-text-muted">Heatmap configuration</p></div>

          <Section title="Colors" icon={<Palette className="h-3 w-3" />}>
            <div className="grid grid-cols-3 gap-1.5">
              {PALETTES.map((p, i) => (
                <button key={p.name} onClick={() => setPalette(i)}
                  className={`rounded-lg border px-2 py-2 text-[10px] font-medium transition-colors ${palette === i ? "border-accent bg-accent/10 text-accent" : "border-border text-text-muted hover:border-accent"}`}>
                  {p.name}
                </button>
              ))}
            </div>
            <div className="flex gap-1 mt-2">
              {["#3fb950", "#26a69a", "#ffd740", "#f85149"].map((c) => (
                <div key={c} className="flex-1 h-3 rounded" style={{ background: c }} />
              ))}
              <span className="text-[9px] text-text-muted ml-1">Growth scale</span>
            </div>
          </Section>

          <Section title="Layout" icon={<Layers className="h-3 w-3" />}>
            <div className="space-y-2">
              <span className="text-xs font-medium text-text-secondary">Sort By</span>
              <div className="flex gap-1.5">
                {(["value", "growth", "name"] as const).map((s) => (
                  <button key={s} onClick={() => setSortBy(s)}
                    className={`flex-1 rounded-lg border px-2 py-1.5 text-[10px] font-medium capitalize transition-colors ${sortBy === s ? "border-accent bg-accent/10 text-accent" : "border-border text-text-muted hover:border-accent"}`}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-xs font-medium text-text-secondary">Min Assets: {minValue}K</span>
              <input type="range" min={0} max={20} value={minValue} onChange={(e) => setMinValue(Number(e.target.value))}
                style={{ background: `linear-gradient(to right, var(--accent) ${(minValue / 20) * 100}%, var(--border) ${(minValue / 20) * 100}%)` }} className="w-full mt-1" />
            </div>
            <Toggle checked={showLabels} onChange={setShowLabels} label="Show Labels" />
            <Toggle checked={showGrowth} onChange={setShowGrowth} label="Show Growth %" />
          </Section>

          <Section title="Export" icon={<Download className="h-3 w-3" />}>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={exportPNG} className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-[11px] font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent">
                PNG
              </button>
              <button onClick={exportSVG} className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-[11px] font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent">
                SVG
              </button>
              <button onClick={() => {
                const rows = ["Category,Assets,Growth"];
                sorted.forEach((c) => rows.push(`${c.name},${c.value},${c.growth}%`));
                const a = document.createElement("a"); a.download = "market-heatmap.csv"; a.href = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv" })); a.click();
              }} className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-[11px] font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent">
                CSV
              </button>
            </div>
          </Section>

          {/* Category List */}
          <Section title={`Categories (${sorted.length})`} icon={<Grid3X3 className="h-3 w-3" />} defaultOpen={false}>
            <div className="max-h-60 space-y-1 overflow-y-auto">
              {sorted.map((c) => (
                <div key={c.name} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1.5">
                  <div className="h-3 w-3 rounded-sm" style={{ background: c.color }} />
                  <span className="flex-1 text-[11px] font-medium text-text-primary">{c.name}</span>
                  <span className="text-[10px] text-text-muted">{c.value.toLocaleString()}</span>
                  <span className={`text-[10px] font-bold ${c.growth >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {c.growth >= 0 ? "+" : ""}{c.growth}%
                  </span>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </aside>
    </ToolLayout>
  );
}
