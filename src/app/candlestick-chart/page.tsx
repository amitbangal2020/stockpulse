"use client";

import { useState, useRef, useCallback } from "react";
import { CandlestickChart as CandlestickChartWidget } from "@/components/candlestick-chart-wrapper";
import { ToolLayout } from "@/components/tool-layout";
import {
  TrendingUp, Download, Copy, Check, RefreshCw, FileImage, FileCode, Image,
  ChevronUp, ChevronDown, Upload, Activity, Layers, Palette, Settings,
  BarChart3, Minus, Plus, Maximize, Minimize, Eye, EyeOff, Clock, Zap,
  Search, Hash, Triangle, AlertCircle, Crosshair as CrosshairIcon,
} from "lucide-react";

interface OHLCPoint { x: Date; y: [number, number, number, number]; }

function generateRandomOHLC(count = 60): OHLCPoint[] {
  const data: OHLCPoint[] = [];
  let price = 50000;
  const date = new Date();
  date.setHours(date.getHours() - count);
  for (let i = 0; i < count; i++) {
    const open = price + (Math.random() - 0.5) * 1000;
    const close = open + (Math.random() - 0.5) * 800;
    const high = Math.max(open, close) + Math.random() * 400;
    const low = Math.min(open, close) - Math.random() * 400;
    price = close;
    date.setMinutes(date.getMinutes() + 15);
    data.push({ x: new Date(date), y: [parseFloat(open.toFixed(2)), parseFloat(high.toFixed(2)), parseFloat(low.toFixed(2)), parseFloat(close.toFixed(2))] });
  }
  return data;
}

// Technical calculations
function calcSMA(data: number[], period: number): (number | null)[] {
  const r: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) { r.push(null); continue; }
    let s = 0; for (let j = i - period + 1; j <= i; j++) s += data[j];
    r.push(parseFloat((s / period).toFixed(2)));
  }
  return r;
}

function calcEMA(data: number[], period: number): (number | null)[] {
  const k = 2 / (period + 1); const r: (number | null)[] = []; let ema: number | null = null;
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) { r.push(null); continue; }
    if (ema === null) { let s = 0; for (let j = i - period + 1; j <= i; j++) s += data[j]; ema = s / period; }
    else ema = data[i] * k + ema * (1 - k);
    r.push(parseFloat(ema.toFixed(2)));
  }
  return r;
}

function calcWMA(data: number[], period: number): (number | null)[] {
  const r: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) { r.push(null); continue; }
    let s = 0, w = 0;
    for (let j = 0; j < period; j++) { s += data[i - period + 1 + j] * (j + 1); w += (j + 1); }
    r.push(parseFloat((s / w).toFixed(2)));
  }
  return r;
}

function calcDEMA(data: number[], period: number): (number | null)[] {
  const ema1 = calcEMA(data, period);
  const ema1Clean = ema1.map((v) => v ?? 0);
  const ema2 = calcEMA(ema1Clean, period);
  return data.map((_, i) => ema1[i] !== null && ema2[i] !== null ? parseFloat(((2 * ema1[i]!) - ema2[i]!).toFixed(2)) : null);
}

function calcTEMA(data: number[], period: number): (number | null)[] {
  const ema1 = calcEMA(data, period);
  const c1 = ema1.map((v) => v ?? 0);
  const ema2 = calcEMA(c1, period);
  const c2 = ema2.map((v) => v ?? 0);
  const ema3 = calcEMA(c2, period);
  return data.map((_, i) => ema1[i] !== null && ema2[i] !== null && ema3[i] !== null
    ? parseFloat(((3 * ema1[i]!) - (3 * ema2[i]!) + ema3[i]!).toFixed(2)) : null);
}

function calcVWAP(data: OHLCPoint[]): (number | null)[] {
  const r: (number | null)[] = []; let cumVol = 0, cumTP = 0;
  for (const d of data) {
    const tp = (d.y[1] + d.y[2] + d.y[3]) / 3;
    const vol = Math.floor(Math.random() * 10000) + 1000;
    cumTP += tp * vol; cumVol += vol;
    r.push(cumVol > 0 ? parseFloat((cumTP / cumVol).toFixed(2)) : null);
  }
  return r;
}

function calcRSI(closes: number[], period = 14): (number | null)[] {
  const r: (number | null)[] = [null];
  let avgGain = 0, avgLoss = 0;
  for (let i = 1; i <= period && i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) avgGain += diff; else avgLoss -= diff;
    r.push(null);
  }
  if (period < closes.length) {
    avgGain /= period; avgLoss /= period;
    r[period] = avgLoss === 0 ? 100 : parseFloat((100 - 100 / (1 + avgGain / avgLoss)).toFixed(2));
  }
  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    r.push(avgLoss === 0 ? 100 : parseFloat((100 - 100 / (1 + avgGain / avgLoss)).toFixed(2)));
  }
  return r;
}

function calcMACD(closes: number[], fast = 12, slow = 26, signal = 9) {
  const emaFast = calcEMA(closes, fast);
  const emaSlow = calcEMA(closes, slow);
  const macdLine = closes.map((_, i) => {
    if (emaFast[i] === null || emaSlow[i] === null) return null;
    return parseFloat((emaFast[i]! - emaSlow[i]!).toFixed(2));
  });
  const macdClean = macdLine.map((v) => v ?? 0);
  const signalLine = calcEMA(macdClean, signal);
  const histogram = closes.map((_, i) => {
    if (macdLine[i] === null || signalLine[i] === null) return null;
    return parseFloat((macdLine[i]! - signalLine[i]!).toFixed(2));
  });
  return { macdLine, signalLine, histogram };
}

function calcBollinger(data: number[], period = 20, stdDev = 2) {
  const upper: (number | null)[] = [], middle: (number | null)[] = [], lower: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) { upper.push(null); middle.push(null); lower.push(null); continue; }
    let sum = 0; for (let j = i - period + 1; j <= i; j++) sum += data[j];
    const mean = sum / period;
    let sq = 0; for (let j = i - period + 1; j <= i; j++) sq += Math.pow(data[j] - mean, 2);
    const std = Math.sqrt(sq / period);
    middle.push(parseFloat(mean.toFixed(2)));
    upper.push(parseFloat((mean + stdDev * std).toFixed(2)));
    lower.push(parseFloat((mean - stdDev * std).toFixed(2)));
  }
  return { upper, middle, lower };
}

// Pattern detection
interface Pattern { name: string; type: "bullish" | "bearish" | "neutral"; index: number; date: string; }
function detectPatterns(data: OHLCPoint[]): Pattern[] {
  const patterns: Pattern[] = [];
  for (let i = 2; i < data.length; i++) {
    const [o, h, l, c] = data[i].y;
    const body = Math.abs(c - o);
    const range = h - l;
    const upperWick = h - Math.max(o, c);
    const lowerWick = Math.min(o, c) - l;
    const dateStr = data[i].x.toLocaleDateString();
    // Doji
    if (body < range * 0.1 && range > 0) patterns.push({ name: "Doji", type: "neutral", index: i, date: dateStr });
    // Hammer (bullish)
    if (lowerWick > body * 2 && upperWick < body * 0.5 && c > o) patterns.push({ name: "Hammer", type: "bullish", index: i, date: dateStr });
    // Inverted Hammer
    if (upperWick > body * 2 && lowerWick < body * 0.5 && c > o) patterns.push({ name: "Inverted Hammer", type: "bullish", index: i, date: dateStr });
    // Engulfing Bullish
    if (i >= 1) {
      const [po, , , pc] = data[i - 1].y;
      if (pc < po && c > o && o < pc && c > po) patterns.push({ name: "Bullish Engulfing", type: "bullish", index: i, date: dateStr });
      if (pc > po && c < o && o > pc && c < po) patterns.push({ name: "Bearish Engulfing", type: "bearish", index: i, date: dateStr });
    }
    // Morning Star
    if (i >= 2) {
      const [po2, , , pc2] = data[i - 2].y;
      const [po1, h1, l1, pc1] = data[i - 1].y;
      const body1 = Math.abs(pc1 - po1);
      const body2 = Math.abs(pc2 - po2);
      if (pc2 < po2 && body1 < body2 * 0.3 && c > o && c > (pc2 + po2) / 2) patterns.push({ name: "Morning Star", type: "bullish", index: i, date: dateStr });
      if (pc2 > po2 && body1 < body2 * 0.3 && c < o && c < (pc2 + po2) / 2) patterns.push({ name: "Evening Star", type: "bearish", index: i, date: dateStr });
    }
    // Three White Soldiers / Three Black Crows
    if (i >= 2) {
      const d1 = data[i - 2], d2 = data[i - 1], d3 = data[i];
      if (d1.y[3] > d1.y[0] && d2.y[3] > d2.y[0] && d3.y[3] > d3.y[0] && d2.y[0] > d1.y[0] && d3.y[0] > d2.y[0])
        patterns.push({ name: "Three White Soldiers", type: "bullish", index: i, date: dateStr });
      if (d1.y[3] < d1.y[0] && d2.y[3] < d2.y[0] && d3.y[3] < d3.y[0] && d2.y[0] < d1.y[0] && d3.y[0] < d2.y[0])
        patterns.push({ name: "Three Black Crows", type: "bearish", index: i, date: dateStr });
    }
  }
  return patterns;
}

const COLOR_PRESETS = [
  { up: "#3fb950", down: "#f85149", label: "Classic" },
  { up: "#00c853", down: "#ff1744", label: "Vibrant" },
  { up: "#26a69a", down: "#ef5350", label: "TradingView" },
  { up: "#4caf50", down: "#e53935", label: "Minimal" },
  { up: "#00e676", down: "#ff5252", label: "Neon" },
  { up: "#69f0ae", down: "#ff8a80", label: "Pastel" },
  { up: "#ffffff", down: "#9e9e9e", label: "Mono" },
  { up: "#ffd740", down: "#7c4dff", label: "Royal" },
];

const CHART_THEMES = [
  { bg: "transparent", grid: "var(--border)", label: "Default" },
  { bg: "#0d1117", grid: "#21262d", label: "GitHub" },
  { bg: "#131722", grid: "#1e222d", label: "TradingView" },
  { bg: "#1a1a2e", grid: "#16213e", label: "Midnight" },
  { bg: "#fafbfc", grid: "#e1e4e8", label: "White" },
  { bg: "#2d2d2d", grid: "#404040", label: "Slate" },
];

const TIME_INTERVALS = [
  { label: "1m", minutes: 1 }, { label: "5m", minutes: 5 }, { label: "15m", minutes: 15 },
  { label: "1H", minutes: 60 }, { label: "4H", minutes: 240 }, { label: "1D", minutes: 1440 },
  { label: "1W", minutes: 10080 }, { label: "1M", minutes: 43200 },
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (<div><label className="mb-1.5 block text-xs font-medium tracking-tight text-text-secondary">{label}</label>{children}</div>);
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

export default function CandlestickChartPage() {
  const [data, setData] = useState<OHLCPoint[]>(() => generateRandomOHLC());
  const [jsonInput, setJsonInput] = useState(() =>
    JSON.stringify(data.map((d) => ({ x: d.x.toISOString().split("T")[0], y: d.y })), null, 2));
  const [copied, setCopied] = useState(false);
  const [upColor, setUpColor] = useState("#3fb950");
  const [downColor, setDownColor] = useState("#f85149");
  const [chartType, setChartType] = useState<"candlestick" | "line" | "area" | "heikin-ashi">("candlestick");
  const [interval, setInterval] = useState("15m");
  const [fullscreen, setFullscreen] = useState(false);
  const [showRSI, setShowRSI] = useState(false);
  const [showMACD, setShowMACD] = useState(false);

  // Indicators
  const [showVolume, setShowVolume] = useState(true);
  const [maType, setMaType] = useState<"SMA" | "EMA" | "WMA" | "DEMA" | "TEMA">("EMA");
  const [showMA, setShowMA] = useState(true);
  const [maPeriod, setMaPeriod] = useState(20);
  const [showMA2, setShowMA2] = useState(false);
  const [ma2Period, setMa2Period] = useState(50);
  const [showBollinger, setShowBollinger] = useState(false);
  const [bollingerPeriod, setBollingerPeriod] = useState(20);
  const [showVWAP, setShowVWAP] = useState(false);
  const [showParabolic, setShowParabolic] = useState(false);

  // Style
  const [wickWidth, setWickWidth] = useState(1);
  const [borderRadius, setBorderRadius] = useState(0);
  const [gridStyle, setGridStyle] = useState<"dashed" | "dotted" | "solid" | "none">("dashed");
  const [themePreset, setThemePreset] = useState(0);
  const [showCrosshair, setShowCrosshair] = useState(true);
  const [showDataLabels, setShowDataLabels] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [lineWidth, setLineWidth] = useState(2);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  const chartRef = useRef<any>(null);

  const updateChart = () => {
    try { setData(JSON.parse(jsonInput).map((item: any) => ({ x: new Date(item.x), y: item.y }))); }
    catch { alert("Invalid JSON data format."); }
  };

  const randomize = () => {
    const n = generateRandomOHLC(); setData(n);
    setJsonInput(JSON.stringify(n.map((d) => ({ x: d.x.toISOString().split("T")[0], y: d.y })), null, 2));
  };

  const handleImport = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => { const t = e.target?.result as string; setJsonInput(t); try { setData(JSON.parse(t).map((item: any) => ({ x: new Date(item.x), y: item.y }))); } catch {} };
    reader.readAsText(file);
  }, []);

  const copyJSON = async () => { await navigator.clipboard.writeText(jsonInput); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  // Heikin-Ashi
  const heikinAshiData: OHLCPoint[] = data.map((d, i) => {
    if (i === 0) return d;
    const haClose = (d.y[0] + d.y[1] + d.y[2] + d.y[3]) / 4;
    const haOpen = (data[i - 1].y[0] + data[i - 1].y[3]) / 2;
    const haHigh = Math.max(d.y[1], haOpen, haClose);
    const haLow = Math.min(d.y[2], haOpen, haClose);
    return { x: d.x, y: [haOpen, haHigh, haLow, haClose] };
  });

  const activeData = chartType === "heikin-ashi" ? heikinAshiData : data;
  const seriesData = activeData.map((d) => ({ x: d.x.getTime(), y: d.y }));
  const closes = activeData.map((d) => d.y[3]);
  const dates = activeData.map((d) => d.x.getTime());
  const patterns = detectPatterns(activeData);

  const volumeData = activeData.map((d) => ({ x: d.x.getTime(), y: Math.floor(Math.random() * 50000) + 10000, fillColor: d.y[3] >= d.y[0] ? upColor + "80" : downColor + "80" }));

  // Calculate indicators
  const maCalc = maType === "SMA" ? calcSMA : maType === "EMA" ? calcEMA : maType === "WMA" ? calcWMA : maType === "DEMA" ? calcDEMA : calcTEMA;
  const maData = maCalc(closes, maPeriod);
  const ma2Data = maCalc(closes, ma2Period);
  const bollinger = calcBollinger(closes, bollingerPeriod);
  const vwapData = calcVWAP(activeData);
  const rsiData = calcRSI(closes);
  const macdData = calcMACD(closes);

  const toSeries = (vals: (number | null)[]) => dates.map((d, i) => vals[i] !== null ? { x: d, y: vals[i] } : null).filter(Boolean);

  const isCandle = chartType === "candlestick" || chartType === "heikin-ashi";
  const series: any[] = [];

  if (isCandle) series.push({ name: "Price", type: "candlestick", data: seriesData });
  else series.push({ name: "Price", type: chartType, data: seriesData.map((d: any) => ({ x: d.x, y: d.y[3] })) });
  if (showVolume) series.push({ name: "Volume", type: "bar", data: volumeData });
  if (showMA) series.push({ name: `${maType} ${maPeriod}`, type: "line", data: toSeries(maData) });
  if (showMA2) series.push({ name: `${maType} ${ma2Period}`, type: "line", data: toSeries(ma2Data) });
  if (showVWAP) series.push({ name: "VWAP", type: "line", data: toSeries(vwapData) });
  if (showBollinger) {
    series.push({ name: "BB Upper", type: "line", data: toSeries(bollinger.upper) });
    series.push({ name: "BB Lower", type: "line", data: toSeries(bollinger.lower) });
  }
  if (showParabolic) {
    const sarData: { x: number; y: number }[] = [];
    let af = 0.02, ep = activeData[0].y[1], sar = activeData[0].y[2];
    for (let i = 0; i < activeData.length; i++) {
      const [o, h, l] = activeData[i].y;
      sarData.push({ x: dates[i], y: parseFloat(sar.toFixed(2)) });
      const nextSar = sar + af * (ep - sar);
      if (i < activeData.length - 1) {
        if (nextSar < l) { sar = nextSar; if (h > ep) { ep = h; af = Math.min(af + 0.02, 0.2); } }
        else { sar = ep; af = 0.02; ep = h; }
      }
    }
    series.push({ name: "Parabolic SAR", type: "scatter", data: sarData });
  }

  // RSI series for sub-chart
  const rsiSeries = showRSI ? [{ name: "RSI", type: "line", data: toSeries(rsiData) }] : [];
  const macdSeries = showMACD ? [
    { name: "MACD", type: "line", data: toSeries(macdData.macdLine) },
    { name: "Signal", type: "line", data: toSeries(macdData.signalLine) },
    { name: "Histogram", type: "bar", data: toSeries(macdData.histogram).map((d: any) => ({ ...d, fillColor: d.y >= 0 ? upColor + "80" : downColor + "80" })) },
  ] : [];

  const theme = CHART_THEMES[themePreset];
  const foreColor = themePreset <= 0 ? "var(--text-muted)" : themePreset <= 3 ? "#8b949e" : "#57606a";

  const chartOptions: any = {
    chart: {
      type: isCandle ? "candlestick" : chartType,
      height: "100%",
      background: theme.bg,
      foreColor,
      animations: { enabled: animationsEnabled, easing: "easeinout", speed: 800 },
      toolbar: { show: false },
      fontFamily: "Inter, sans-serif",
      stacked: false,
      brush: { enabled: true, target: "price" },
      selection: { enabled: true },
    },
    xaxis: { type: "datetime", labels: { style: { fontSize: "11px" } }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: [
      { tooltip: { enabled: true }, labels: { formatter: (v: number) => "$" + v.toLocaleString(), style: { fontSize: "11px" } } },
      ...(showVolume ? [{ opposite: true, show: false }] : []),
    ],
    grid: { show: showGrid, borderColor: theme.grid, strokeDashArray: gridStyle === "none" ? 0 : gridStyle === "dashed" ? 4 : gridStyle === "dotted" ? 2 : 0, padding: { left: 10, right: 10 } },
    plotOptions: {
      candlestick: { colors: { upward: upColor, downward: downColor }, wick: { useFillColor: true, strokeWidth: wickWidth } },
      bar: { columnWidth: "60%", borderRadius },
    },
    stroke: { width: Array(series.length).fill(isCandle && series[0]?.type === "candlestick" ? 1 : lineWidth), curve: "smooth" },
    colors: ["#2196f3", "#ff9800", "#e91e63", "#00bcd4", "#8bc34a", "#9c27b0", "#ff5722"],
    tooltip: { theme: themePreset <= 0 ? "light" : themePreset <= 3 ? "dark" : "light", shared: true },
    theme: { mode: themePreset <= 3 ? "dark" : "light" },
    crosshairs: { show: showCrosshair, xaxis: { crosshairs: { show: showCrosshair } }, yaxis: { crosshairs: { show: showCrosshair } } },
    legend: { show: showLegend, position: "top", horizontalAlign: "left", fontSize: "11px", labels: { useSeriesColors: true }, markers: { strokeWidth: 0, size: 8 } },
    dataLabels: { enabled: showDataLabels },
    annotations: {
      yaxis: showParabolic ? [] : [],
      xaxis: patterns.slice(0, 8).map((p) => ({
        x: activeData[p.index]?.x.getTime(),
        borderColor: p.type === "bullish" ? upColor : p.type === "bearish" ? downColor : "#9e9e9e",
        label: { text: p.name, style: { fontSize: "9px", padding: { left: 4, right: 4, top: 2, bottom: 2 }, background: p.type === "bullish" ? upColor + "20" : p.type === "bearish" ? downColor + "20" : "#9e9e9e20" } },
      })),
    },
  };

  if (!isCandle) { chartOptions.stroke.width = Array(series.length).fill(lineWidth); }
  if (showVolume) { const vi = series.findIndex((s: any) => s.name === "Volume"); if (vi >= 0) chartOptions.stroke.width[vi] = 0; }

  // Stats
  const latestClose = activeData.length > 0 ? activeData[activeData.length - 1].y[3] : 0;
  const prevClose = activeData.length > 1 ? activeData[activeData.length - 2].y[3] : latestClose;
  const change = latestClose - prevClose;
  const changePct = prevClose !== 0 ? (change / prevClose) * 100 : 0;
  const high24h = Math.max(...activeData.slice(-6).map((d) => d.y[1]));
  const low24h = Math.min(...activeData.slice(-6).map((d) => d.y[2]));
  const latestRSI = rsiData.filter((v) => v !== null).pop();
  const latestMACD = macdData.macdLine.filter((v) => v !== null).pop();
  const latestSignal = macdData.signalLine.filter((v) => v !== null).pop();

  const bullishPatterns = patterns.filter((p) => p.type === "bullish");
  const bearishPatterns = patterns.filter((p) => p.type === "bearish");

  return (
    <ToolLayout>
      <main className={`flex flex-1 flex-col overflow-hidden min-h-0 ${fullscreen ? "fixed inset-0 z-50 bg-bg" : ""}`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-bg px-5 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10"><TrendingUp className="h-4 w-4 text-accent" /></div>
            <div>
              <h1 className="text-sm font-semibold text-text-primary">Candlestick Chart</h1>
              <p className="text-[11px] text-text-muted">Analyze OHLC price data with interactive charts</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Time intervals */}
            <div className="flex items-center gap-0.5 rounded-lg border border-border bg-bg-secondary p-0.5">
              {TIME_INTERVALS.map((t) => (
                <button key={t.label} onClick={() => setInterval(t.label)}
                  className={`rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${interval === t.label ? "bg-accent text-white" : "text-text-muted hover:text-text-primary"}`}>
                  {t.label}
                </button>
              ))}
            </div>
            <div className="h-5 w-px bg-border" />
            {(["candlestick", "heikin-ashi", "line", "area"] as const).map((t) => (
              <button key={t} onClick={() => setChartType(t)}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors ${chartType === t ? "bg-accent text-white" : "bg-bg-secondary text-text-muted hover:text-text-primary"}`}>
                {t === "heikin-ashi" ? "HA" : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
            <div className="h-5 w-px bg-border" />
            <button onClick={() => setFullscreen(!fullscreen)} className="rounded-lg p-1.5 text-text-muted hover:bg-bg-secondary hover:text-text-primary">
              {fullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-5 border-b border-border bg-bg px-5 py-2">
          <div>
            <span className="text-[10px] text-text-muted">LAST</span>
            <p className="text-sm font-semibold text-text-primary">${latestClose.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <span className="text-[10px] text-text-muted">CHG</span>
            <p className={`text-sm font-semibold ${change >= 0 ? "text-green-600" : "text-red-500"}`}>
              {change >= 0 ? "+" : ""}{changePct.toFixed(2)}%
            </p>
          </div>
          <div><span className="text-[10px] text-text-muted">HIGH</span><p className="text-xs font-medium text-text-primary">${high24h.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p></div>
          <div><span className="text-[10px] text-text-muted">LOW</span><p className="text-xs font-medium text-text-primary">${low24h.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p></div>
          {showMA && maData.filter((v) => v !== null).length > 0 && (
            <div><span className="text-[10px] text-blue-400">{maType} {maPeriod}</span><p className="text-xs font-medium text-blue-500">${maData.filter((v) => v !== null).pop()?.toLocaleString()}</p></div>
          )}
          {showVWAP && vwapData.filter((v) => v !== null).length > 0 && (
            <div><span className="text-[10px] text-purple-400">VWAP</span><p className="text-xs font-medium text-purple-500">${vwapData.filter((v) => v !== null).pop()?.toLocaleString()}</p></div>
          )}
          {showRSI && latestRSI !== null && latestRSI !== undefined && (
            <div><span className={`text-[10px] ${latestRSI > 70 ? "text-red-400" : latestRSI < 30 ? "text-green-400" : "text-text-muted"}`}>RSI</span><p className={`text-xs font-medium ${latestRSI > 70 ? "text-red-500" : latestRSI < 30 ? "text-green-500" : "text-text-primary"}`}>{latestRSI}</p></div>
          )}
          {showMACD && latestMACD !== null && latestMACD !== undefined && (
            <div><span className="text-[10px] text-orange-400">MACD</span><p className="text-xs font-medium text-orange-500">{latestMACD}</p></div>
          )}
          {patterns.length > 0 && (
            <div className="ml-auto flex items-center gap-1.5">
              {bullishPatterns.length > 0 && <span className="rounded-full bg-green-500/10 px-1.5 py-0.5 text-[9px] font-bold text-green-500">▲ {bullishPatterns.length}</span>}
              {bearishPatterns.length > 0 && <span className="rounded-full bg-red-500/10 px-1.5 py-0.5 text-[9px] font-bold text-red-500">▼ {bearishPatterns.length}</span>}
            </div>
          )}
        </div>

        {/* Chart Area */}
        <div className="flex-1 overflow-auto" style={{ minHeight: 0, background: theme.bg === "transparent" ? undefined : theme.bg }}>
          <div id="candlestick-chart" style={{ width: "100%", minHeight: "500px" }}>
            <CandlestickChartWidget options={chartOptions} series={series} type={isCandle ? "candlestick" : chartType} height={showRSI || showMACD ? 400 : 500} />
          </div>
          {/* RSI Sub-chart */}
          {showRSI && (
            <div style={{ width: "100%", height: "120px", background: theme.bg === "transparent" ? undefined : theme.bg }}>
              <CandlestickChartWidget
                options={{
                  chart: { type: "line", height: 120, background: theme.bg === "transparent" ? "transparent" : theme.bg, foreColor, toolbar: { show: false }, animations: { enabled: animationsEnabled, speed: 400 } },
                  xaxis: { type: "datetime", labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
                  yaxis: { min: 0, max: 100, labels: { style: { fontSize: "10px" }, formatter: (v: number) => v.toFixed(0) } },
                  grid: { show: showGrid, borderColor: theme.grid, strokeDashArray: gridStyle === "none" ? 0 : 4 },
                  stroke: { width: 1.5, curve: "smooth" },
                  colors: [latestRSI !== null && latestRSI !== undefined && latestRSI > 70 ? downColor : latestRSI !== null && latestRSI !== undefined && latestRSI < 30 ? upColor : "#2196f3"],
                  tooltip: { theme: themePreset <= 0 ? "light" : "dark" },
                  legend: { show: false },
                  annotations: { yaxis: [{ y: 70, borderColor: downColor + "60", strokeDashArray: 2, label: { text: "Overbought (70)", style: { fontSize: "9px" } } }, { y: 30, borderColor: upColor + "60", strokeDashArray: 2, label: { text: "Oversold (30)", style: { fontSize: "9px" } } }] },
                }}
                series={rsiSeries} type="line" height={120}
              />
            </div>
          )}
          {/* MACD Sub-chart */}
          {showMACD && (
            <div style={{ width: "100%", height: "120px", background: theme.bg === "transparent" ? undefined : theme.bg }}>
              <CandlestickChartWidget
                options={{
                  chart: { type: "bar", height: 120, background: theme.bg === "transparent" ? "transparent" : theme.bg, foreColor, toolbar: { show: false }, animations: { enabled: animationsEnabled, speed: 400 }, stacked: true },
                  xaxis: { type: "datetime", labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
                  yaxis: { labels: { style: { fontSize: "10px" }, formatter: (v: number) => v.toFixed(1) } },
                  grid: { show: showGrid, borderColor: theme.grid, strokeDashArray: gridStyle === "none" ? 0 : 4 },
                  stroke: { width: [1.5, 1.5, 0], curve: "smooth" },
                  colors: ["#2196f3", "#ff9800", upColor],
                  tooltip: { theme: themePreset <= 0 ? "light" : "dark" },
                  legend: { show: false },
                }}
                series={macdSeries} type="bar" height={120}
              />
            </div>
          )}
        </div>
      </main>

      {/* Right Panel */}
      <aside className="hidden w-[280px] shrink-0 flex-col overflow-y-auto min-h-0 border-l border-border bg-bg-secondary lg:flex">
        <div className="p-4">
          <div className="mb-4"><h2 className="text-sm font-semibold text-text-primary">Settings</h2><p className="text-[11px] text-text-muted">Data, indicators, styles & export</p></div>

          {/* Data Input */}
          <Section title="Data Input" icon={<FileCode className="h-3 w-3" />}>
            <Field label="OHLC JSON Data">
              <textarea value={jsonInput} onChange={(e) => setJsonInput(e.target.value)}
                className="h-40 w-full rounded-xl border border-border bg-surface p-3 font-mono text-[11px] text-text-primary focus:border-accent focus:outline-none"
                placeholder='[{"x":"2024-01-01","y":[30,40,25,35]}]' />
            </Field>
            <div className="flex gap-2">
              <button onClick={updateChart} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-accent-hover">
                <TrendingUp className="h-3.5 w-3.5" /> Update
              </button>
              <button onClick={randomize} className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent">
                <RefreshCw className="h-3.5 w-3.5" /> Random
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { const i = document.createElement("input"); i.type = "file"; i.accept = ".json,.txt"; i.onchange = (e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) handleImport(f); }; i.click(); }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-[11px] font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent">
                <Upload className="h-3 w-3" /> Import
              </button>
              <button onClick={copyJSON} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-[11px] font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent">
                {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </Section>

          {/* Indicators */}
          <Section title="Indicators" icon={<Activity className="h-3 w-3" />}>
            <Toggle checked={showVolume} onChange={setShowVolume} label="Volume" />
            <div className="h-1" />
            <Toggle checked={showMA} onChange={setShowMA} label={`${maType} ${maPeriod}`} />
            {showMA && (
              <div className="flex items-center gap-2">
                <select value={maType} onChange={(e) => setMaType(e.target.value as any)}
                  className="rounded-lg border border-border bg-surface px-2 py-1 text-[10px] text-text-primary focus:border-accent focus:outline-none">
                  <option value="SMA">SMA</option><option value="EMA">EMA</option><option value="WMA">WMA</option><option value="DEMA">DEMA</option><option value="TEMA">TEMA</option>
                </select>
                <div className="flex flex-1 items-center gap-1">
                  <button onClick={() => setMaPeriod(Math.max(2, maPeriod - 1))} className="rounded border border-border p-0.5 text-text-muted hover:text-accent"><Minus className="h-2.5 w-2.5" /></button>
                  <input type="range" min={2} max={100} value={maPeriod} onChange={(e) => setMaPeriod(Number(e.target.value))} className="flex-1" />
                  <button onClick={() => setMaPeriod(Math.min(100, maPeriod + 1))} className="rounded border border-border p-0.5 text-text-muted hover:text-accent"><Plus className="h-2.5 w-2.5" /></button>
                </div>
                <span className="text-[10px] font-bold text-accent w-6 text-right">{maPeriod}</span>
              </div>
            )}
            <Toggle checked={showMA2} onChange={setShowMA2} label={`${maType} ${ma2Period}`} />
            {showMA2 && (
              <div className="flex items-center gap-2">
                <div className="flex flex-1 items-center gap-1">
                  <button onClick={() => setMa2Period(Math.max(2, ma2Period - 1))} className="rounded border border-border p-0.5 text-text-muted hover:text-accent"><Minus className="h-2.5 w-2.5" /></button>
                  <input type="range" min={2} max={200} value={ma2Period} onChange={(e) => setMa2Period(Number(e.target.value))} className="flex-1" />
                  <button onClick={() => setMa2Period(Math.min(200, ma2Period + 1))} className="rounded border border-border p-0.5 text-text-muted hover:text-accent"><Plus className="h-2.5 w-2.5" /></button>
                </div>
                <span className="text-[10px] font-bold text-accent w-6 text-right">{ma2Period}</span>
              </div>
            )}
            <Toggle checked={showVWAP} onChange={setShowVWAP} label="VWAP" />
            <Toggle checked={showBollinger} onChange={setShowBollinger} label={`Bollinger (${bollingerPeriod})`} />
            {showBollinger && (
              <div className="flex items-center gap-2">
                <div className="flex flex-1 items-center gap-1">
                  <button onClick={() => setBollingerPeriod(Math.max(5, bollingerPeriod - 1))} className="rounded border border-border p-0.5 text-text-muted hover:text-accent"><Minus className="h-2.5 w-2.5" /></button>
                  <input type="range" min={5} max={50} value={bollingerPeriod} onChange={(e) => setBollingerPeriod(Number(e.target.value))} className="flex-1" />
                  <button onClick={() => setBollingerPeriod(Math.min(50, bollingerPeriod + 1))} className="rounded border border-border p-0.5 text-text-muted hover:text-accent"><Plus className="h-2.5 w-2.5" /></button>
                </div>
                <span className="text-[10px] font-bold text-accent w-6 text-right">{bollingerPeriod}</span>
              </div>
            )}
            <Toggle checked={showParabolic} onChange={setShowParabolic} label="Parabolic SAR" />
            <div className="h-1" />
            <Toggle checked={showRSI} onChange={setShowRSI} label="RSI (14)" />
            <Toggle checked={showMACD} onChange={setShowMACD} label="MACD (12,26,9)" />
          </Section>

          {/* Colors */}
          <Section title="Colors" icon={<Palette className="h-3 w-3" />}>
            <div className="flex gap-3">
              <Field label="Bullish">
                <div className="flex items-center gap-2">
                  <input type="color" value={upColor} onChange={(e) => setUpColor(e.target.value)} className="h-8 w-8 cursor-pointer rounded-lg border border-border" />
                  <span className="text-[11px] text-text-muted">{upColor}</span>
                </div>
              </Field>
              <Field label="Bearish">
                <div className="flex items-center gap-2">
                  <input type="color" value={downColor} onChange={(e) => setDownColor(e.target.value)} className="h-8 w-8 cursor-pointer rounded-lg border border-border" />
                  <span className="text-[11px] text-text-muted">{downColor}</span>
                </div>
              </Field>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {COLOR_PRESETS.map((p) => (
                <button key={p.label} onClick={() => { setUpColor(p.up); setDownColor(p.down); }}
                  className={`flex flex-col items-center gap-1 rounded-lg border p-1.5 text-[8px] font-medium transition-colors ${upColor === p.up && downColor === p.down ? "border-accent bg-accent/10 text-accent" : "border-border text-text-muted hover:border-accent"}`}>
                  <div className="flex gap-0.5"><div className="h-2.5 w-2.5 rounded-sm" style={{ background: p.up }} /><div className="h-2.5 w-2.5 rounded-sm" style={{ background: p.down }} /></div>
                  {p.label}
                </button>
              ))}
            </div>
          </Section>

          {/* Chart Style */}
          <Section title="Chart Style" icon={<Layers className="h-3 w-3" />}>
            <Field label="Theme">
              <div className="grid grid-cols-3 gap-1.5">
                {CHART_THEMES.map((t, i) => (
                  <button key={t.label} onClick={() => setThemePreset(i)}
                    className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-[8px] font-medium transition-colors ${themePreset === i ? "border-accent bg-accent/10 text-accent" : "border-border text-text-muted hover:border-accent"}`}>
                    <div className="h-4 w-full rounded" style={{ background: t.bg === "transparent" ? "#f8fafc" : t.bg, border: `1px solid ${t.grid}` }} />
                    {t.label}
                  </button>
                ))}
              </div>
            </Field>
            <Field label={`Line Width: ${lineWidth}px`}>
              <input type="range" min={1} max={5} value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))}
                style={{ background: `linear-gradient(to right, var(--accent) ${((lineWidth - 1) / 4) * 100}%, var(--border) ${((lineWidth - 1) / 4) * 100}%)` }} className="w-full" />
            </Field>
            {isCandle && (
              <>
                <Field label={`Wick Width: ${wickWidth}px`}>
                  <input type="range" min={0} max={4} step={0.5} value={wickWidth} onChange={(e) => setWickWidth(Number(e.target.value))}
                    style={{ background: `linear-gradient(to right, var(--accent) ${(wickWidth / 4) * 100}%, var(--border) ${(wickWidth / 4) * 100}%)` }} className="w-full" />
                </Field>
                <Field label={`Border Radius: ${borderRadius}px`}>
                  <input type="range" min={0} max={10} value={borderRadius} onChange={(e) => setBorderRadius(Number(e.target.value))}
                    style={{ background: `linear-gradient(to right, var(--accent) ${(borderRadius / 10) * 100}%, var(--border) ${(borderRadius / 10) * 100}%)` }} className="w-full" />
                </Field>
              </>
            )}
            <Field label="Grid">
              <div className="flex gap-1.5">
                {(["dashed", "dotted", "solid", "none"] as const).map((g) => (
                  <button key={g} onClick={() => setGridStyle(g)}
                    className={`flex-1 rounded-lg border px-2 py-1.5 text-[10px] font-medium capitalize transition-colors ${gridStyle === g ? "border-accent bg-accent/10 text-accent" : "border-border text-text-muted hover:border-accent"}`}>{g}</button>
                ))}
              </div>
            </Field>
            <Toggle checked={showCrosshair} onChange={setShowCrosshair} label="Crosshair" />
            <Toggle checked={showDataLabels} onChange={setShowDataLabels} label="Data Labels" />
            <Toggle checked={showGrid} onChange={setShowGrid} label="Grid Lines" />
            <Toggle checked={showLegend} onChange={setShowLegend} label="Legend" />
            <Toggle checked={animationsEnabled} onChange={setAnimationsEnabled} label="Animations" />
          </Section>

          {/* Patterns */}
          {patterns.length > 0 && (
            <Section title={`Patterns (${patterns.length})`} icon={<Triangle className="h-3 w-3" />}>
              <div className="max-h-40 space-y-1 overflow-y-auto">
                {patterns.slice(-15).reverse().map((p, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-border bg-surface px-2.5 py-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${p.type === "bullish" ? "bg-green-500" : p.type === "bearish" ? "bg-red-500" : "bg-gray-400"}`} />
                      <span className="text-[11px] font-medium text-text-primary">{p.name}</span>
                    </div>
                    <span className="text-[9px] text-text-muted">{p.date}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Export */}
          <Section title="Export" icon={<Download className="h-3 w-3" />}>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { const svg = document.querySelector("#candlestick-chart svg"); if (!svg) return; const c = document.createElement("canvas"); const b = svg.getBoundingClientRect(); c.width = b.width * 2; c.height = b.height * 2; const ctx = c.getContext("2d"); const img = new window.Image(); img.onload = () => { if (ctx) { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(img, 0, 0, c.width, c.height); const a = document.createElement("a"); a.download = "chart.png"; a.href = c.toDataURL("image/png"); a.click(); } }; img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(new XMLSerializer().serializeToString(svg)))); }}
                className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-[11px] font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent"><Image className="h-3 w-3" /> PNG</button>
              <button onClick={() => { const svg = document.querySelector("#candlestick-chart svg"); if (!svg) return; const a = document.createElement("a"); a.download = "chart.svg"; a.href = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" })); a.click(); }}
                className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-[11px] font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent"><FileCode className="h-3 w-3" /> SVG</button>
              <button onClick={() => { const svg = document.querySelector("#candlestick-chart svg"); if (!svg) return; const c = document.createElement("canvas"); const b = svg.getBoundingClientRect(); c.width = b.width * 2; c.height = b.height * 2; const ctx = c.getContext("2d"); const img = new window.Image(); img.onload = () => { if (ctx) { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(img, 0, 0, c.width, c.height); const a = document.createElement("a"); a.download = "chart.jpeg"; a.href = c.toDataURL("image/jpeg", 0.9); a.click(); } }; img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(new XMLSerializer().serializeToString(svg)))); }}
                className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-[11px] font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent"><FileImage className="h-3 w-3" /> JPEG</button>
              <button onClick={() => { const rows = ["Date,Open,High,Low,Close"]; data.forEach((d) => rows.push(`${d.x.toISOString().split("T")[0]},${d.y.join(",")}`)); const a = document.createElement("a"); a.download = "ohlc.csv"; a.href = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv" })); a.click(); }}
                className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-[11px] font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent"><Download className="h-3 w-3" /> CSV</button>
            </div>
          </Section>
        </div>
      </aside>
    </ToolLayout>
  );
}
