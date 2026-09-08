"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ToolLayout } from "@/components/tool-layout";
import {
  Upload, Download, RotateCcw, ZoomIn, ZoomOut, ChevronUp, ChevronDown,
  Image as ImageIcon, Sliders, Grid3X3, Palette, Shuffle, Layers,
  Undo2, Redo2, SplitSquareVertical, Grid2X2,
} from "lucide-react";

// ─── UI Components ───
function Section({ title, icon, defaultOpen = true, children }: { title: string; icon: React.ReactNode; defaultOpen?: boolean; children: React.ReactNode }) {
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

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? "bg-accent" : "bg-border"}`}>
      <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-4" : ""}`} />
    </button>
  );
}

function SliderRow({ label, value, set, min = 0, max = 100, step = 1 }: { label: string; value: number; set: (v: number) => void; min?: number; max?: number; step?: number }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs text-text-secondary">{label}</span>
        <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold text-accent">{value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(Number(e.target.value))} className="w-full" style={{ background: `linear-gradient(to right, var(--accent) ${pct}%, var(--border) ${pct}%)` }} />
    </div>
  );
}

function toast(msg: string) {
  const el = document.createElement("div");
  el.textContent = msg;
  el.className = "fixed bottom-4 left-1/2 z-[999] -translate-x-1/2 rounded-lg border border-border bg-surface px-4 py-2 text-xs font-medium text-text-primary shadow-lg";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}

// ─── Presets ───
const PRESETS: Record<string, Partial<{
  algorithm: string; blur: number; gamma: number; contrast: number; brightness: number;
  saturation: number; gridType: string; spacing: number; rotation: number;
  dotStyle: string; globalSize: number; maxSize: number; minSize: number;
  colorCount: number; palette: string[]; bgColor: string;
}>> = {
  "Newspaper": { algorithm: "amplitude-modulation", blur: 0.5, gamma: 12, contrast: 20, brightness: 5, saturation: 0, gridType: "linear", spacing: 8, rotation: 22, dotStyle: "circle", globalSize: 1.5, colorCount: 0, palette: ["#000000","#ffffff"], bgColor: "#ffffff" },
  "Pop Art": { algorithm: "amplitude-modulation", blur: 0, gamma: 8, contrast: 40, brightness: 0, saturation: 80, gridType: "linear", spacing: 14, rotation: 0, dotStyle: "circle", globalSize: 2.5, colorCount: 4, palette: ["#ff0000","#00ff00","#0000ff","#ffff00"], bgColor: "#ffffff" },
  "Risograph": { algorithm: "frequency-modulation", blur: 0, gamma: 14, contrast: 15, brightness: 0, saturation: 30, gridType: "linear", spacing: 10, rotation: 15, dotStyle: "circle", globalSize: 1.8, colorCount: 3, palette: ["#d62828","#003049","#fcbf49"], bgColor: "#fef9ef" },
  "CMYK Print": { algorithm: "amplitude-modulation", blur: 0, gamma: 10, contrast: 0, brightness: 0, saturation: 0, gridType: "linear", spacing: 10, rotation: 15, dotStyle: "circle", globalSize: 1.8, colorCount: 0, palette: ["#000000","#ffffff"], bgColor: "#ffffff" },
  "Dot Matrix": { algorithm: "amplitude-modulation", blur: 0, gamma: 10, contrast: 10, brightness: 0, saturation: 0, gridType: "linear", spacing: 6, rotation: 0, dotStyle: "square", globalSize: 1.2, colorCount: 0, palette: ["#000000","#ffffff"], bgColor: "#ffffff" },
  "Organic": { algorithm: "frequency-modulation", blur: 1, gamma: 12, contrast: 10, brightness: 0, saturation: 0, gridType: "hexagonal", spacing: 16, rotation: 0, dotStyle: "circle", globalSize: 2, colorCount: 0, palette: ["#000000","#ffffff"], bgColor: "#ffffff" },
  "High Contrast": { algorithm: "error-diffusion", blur: 0, gamma: 15, contrast: 60, brightness: 0, saturation: 0, gridType: "linear", spacing: 10, rotation: 0, dotStyle: "circle", globalSize: 2, colorCount: 0, palette: ["#000000","#ffffff"], bgColor: "#ffffff" },
};

// ─── Halftone Processing ───
function processHalftone(
  srcCanvas: HTMLCanvasElement, outCanvas: HTMLCanvasElement,
  settings: {
    algorithm: string; fitMode: string; blur: number; gamma: number; contrast: number;
    brightness: number; saturation: number; bgColor: string;
    gridType: string; spacing: number; rotation: number;
    channel: string; invertChannel: boolean;
    dotStyle: string; outlineMode: boolean; minSize: number; maxSize: number; globalSize: number;
    dotRotation: number; jitter: number;
    colorCount: number; palette: string[];
  }
) {
  const srcCtx = srcCanvas.getContext("2d")!;
  const w = srcCanvas.width, h = srcCanvas.height;

  let imgData = srcCtx.getImageData(0, 0, w, h);
  let data = imgData.data;

  // Apply blur
  if (settings.blur > 0) {
    const tmp = document.createElement("canvas"); tmp.width = w; tmp.height = h;
    const tmpCtx = tmp.getContext("2d")!;
    tmpCtx.filter = `blur(${settings.blur}px)`;
    tmpCtx.drawImage(srcCanvas, 0, 0);
    data = tmpCtx.getImageData(0, 0, w, h).data;
  }

  // Apply gamma
  const gamma = settings.gamma / 10;
  if (gamma !== 1) {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 * Math.pow(data[i] / 255, 1 / gamma);
      data[i + 1] = 255 * Math.pow(data[i + 1] / 255, 1 / gamma);
      data[i + 2] = 255 * Math.pow(data[i + 2] / 255, 1 / gamma);
    }
  }

  // Apply contrast
  const cf = (259 * (settings.contrast + 255)) / (255 * (259 - settings.contrast));
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, cf * (data[i] - 128) + 128));
    data[i + 1] = Math.min(255, Math.max(0, cf * (data[i + 1] - 128) + 128));
    data[i + 2] = Math.min(255, Math.max(0, cf * (data[i + 2] - 128) + 128));
  }

  // Apply brightness
  if (settings.brightness !== 0) {
    const b = settings.brightness * 2.55;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, data[i] + b));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + b));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + b));
    }
  }

  // Apply saturation
  if (settings.saturation !== 0) {
    const s = settings.saturation / 100;
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] = Math.min(255, Math.max(0, gray + (1 + s) * (data[i] - gray)));
      data[i + 1] = Math.min(255, Math.max(0, gray + (1 + s) * (data[i + 1] - gray)));
      data[i + 2] = Math.min(255, Math.max(0, gray + (1 + s) * (data[i + 2] - gray)));
    }
  }

  // Extract channel
  const gray = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const pi = i * 4;
    let val: number;
    switch (settings.channel) {
      case "red": val = data[pi]; break;
      case "green": val = data[pi + 1]; break;
      case "blue": val = data[pi + 2]; break;
      case "alpha": val = data[pi + 3]; break;
      case "inverse-luminance": val = 255 - (0.299 * data[pi] + 0.587 * data[pi + 1] + 0.114 * data[pi + 2]); break;
      default: val = 0.299 * data[pi] + 0.587 * data[pi + 1] + 0.114 * data[pi + 2]; break;
    }
    gray[i] = settings.invertChannel ? 255 - val : val;
  }

  // Common grid setup
  const outCtx = outCanvas.getContext("2d")!;
  outCanvas.width = w; outCanvas.height = h;
  const spacing = Math.max(2, settings.spacing);
  const rot = (settings.rotation * Math.PI) / 180;
  const cosV = Math.cos(rot), sinV = Math.sin(rot);
  const gs = settings.globalSize;
  const bgC = settings.bgColor || "#ffffff";

  // Pre-generate jitter offsets for the image (seeded by position for consistency)
  const jitterAmount = settings.jitter || 0;

  function getJitterOffset(ix: number, iy: number): [number, number] {
    if (jitterAmount <= 0) return [0, 0];
    // Deterministic pseudo-random based on position
    const seed = ix * 7919 + iy * 104729;
    const jx = ((Math.sin(seed) * 43758.5453) % 1) * jitterAmount * spacing * 0.5;
    const jy = ((Math.sin(seed + 1) * 43758.5453) % 1) * jitterAmount * spacing * 0.5;
    return [jx, jy];
  }

  if (settings.algorithm === "error-diffusion") {
    // Floyd-Steinberg Error Diffusion
    outCtx.fillStyle = bgC;
    outCtx.fillRect(0, 0, w, h);
    const errBuf = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) errBuf[i] = gray[i];

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = y * w + x;
        const old = errBuf[idx];
        const nw = old > 128 ? 255 : 0;
        errBuf[idx] = nw;
        const err = old - nw;
        if (x + 1 < w) errBuf[idx + 1] += err * 7 / 16;
        if (y + 1 < h) {
          if (x - 1 >= 0) errBuf[(y + 1) * w + x - 1] += err * 3 / 16;
          errBuf[(y + 1) * w + x] += err * 5 / 16;
          if (x + 1 < w) errBuf[(y + 1) * w + x + 1] += err * 1 / 16;
        }
      }
    }

    const outData = outCtx.getImageData(0, 0, w, h);
    const od = outData.data;
    // Parse bgColor
    const bgHex = bgC.replace("#", "");
    const bgR = parseInt(bgHex.substring(0, 2), 16);
    const bgG = parseInt(bgHex.substring(2, 4), 16);
    const bgB = parseInt(bgHex.substring(4, 6), 16);

    for (let i = 0; i < w * h; i++) {
      const v = errBuf[i];
      let c: string;
      if (settings.colorCount > 0 && settings.palette.length > 0) {
        const brightness = gray[i] / 255;
        const ci = Math.min(settings.colorCount - 1, Math.floor(brightness * settings.colorCount));
        c = ci === settings.colorCount - 1 ? bgC : settings.palette[ci];
      } else {
        c = v > 128 ? bgC : "#000000";
      }
      const hex = c.replace("#", "");
      od[i * 4] = parseInt(hex.substring(0, 2), 16);
      od[i * 4 + 1] = parseInt(hex.substring(2, 4), 16);
      od[i * 4 + 2] = parseInt(hex.substring(4, 6), 16);
      od[i * 4 + 3] = 255;
    }
    outCtx.putImageData(outData, 0, 0);

  } else if (settings.algorithm === "frequency-modulation") {
    // FM: fixed-size dots, variable density via Bayer ordered dithering
    outCtx.fillStyle = bgC;
    outCtx.fillRect(0, 0, w, h);
    const bayer = [[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
    const dotR = settings.maxSize * gs * 0.4;
    if (dotR >= settings.minSize * gs) {
      for (let gy = 0; gy < h; gy += spacing) {
        for (let gx = 0; gx < w; gx += spacing) {
          const [jx, jy] = getJitterOffset(gx, gy);
          const rx = Math.floor(gx * cosV - gy * sinV + w / 2 * (1 - cosV) + h / 2 * sinV + jx);
          const ry = Math.floor(gx * sinV + gy * cosV + w / 2 * sinV + h / 2 * (1 - cosV) + jy);
          if (rx < 0 || rx >= w || ry < 0 || ry >= h) continue;
          const idx = ry * w + rx;
          const brightness = gray[idx] / 255;
          const threshold = bayer[ry % 4][rx % 4] / 16;
          if (brightness > threshold) continue;
          drawDot(outCtx, rx, ry, dotR, settings, brightness);
        }
      }
    }

  } else {
    // AM: Amplitude Modulation (default)
    outCtx.fillStyle = bgC;
    outCtx.fillRect(0, 0, w, h);
    if (settings.gridType === "radial") {
      const cx = w / 2, cy = h / 2;
      const maxR = Math.sqrt(cx * cx + cy * cy);
      for (let r = spacing / 2; r < maxR; r += spacing) {
        const circumference = 2 * Math.PI * r;
        const dots = Math.max(1, Math.floor(circumference / spacing));
        for (let a = 0; a < dots; a++) {
          const angle = (a / dots) * 2 * Math.PI;
          const baseX = cx + r * Math.cos(angle);
          const baseY = cy + r * Math.sin(angle);
          const [jx, jy] = getJitterOffset(Math.floor(baseX), Math.floor(baseY));
          const x = Math.floor(baseX + jx);
          const y = Math.floor(baseY + jy);
          if (x < 0 || x >= w || y < 0 || y >= h) continue;
          const idx = y * w + x;
          const brightness = gray[idx] / 255;
          const dotR = (1 - brightness) * settings.maxSize * gs;
          if (dotR < settings.minSize * gs) continue;
          drawDot(outCtx, x, y, dotR, settings, brightness);
        }
      }
    } else if (settings.gridType === "hexagonal") {
      const rowH = spacing * 0.866;
      for (let row = -1; row < h / rowH + 1; row++) {
        const offset = row % 2 === 0 ? 0 : spacing / 2;
        for (let col = -1; col < w / spacing + 1; col++) {
          const baseX = col * spacing + offset;
          const baseY = row * rowH;
          const [jx, jy] = getJitterOffset(col, row);
          const x = Math.floor(baseX + jx);
          const y = Math.floor(baseY + jy);
          if (x < 0 || x >= w || y < 0 || y >= h) continue;
          const idx = y * w + x;
          const brightness = gray[idx] / 255;
          const dotR = (1 - brightness) * settings.maxSize * gs;
          if (dotR < settings.minSize * gs) continue;
          drawDot(outCtx, x, y, dotR, settings, brightness);
        }
      }
    } else {
      for (let y = spacing / 2; y < h; y += spacing) {
        for (let x = spacing / 2; x < w; x += spacing) {
          const rx = Math.floor(x * cosV - y * sinV + w / 2 * (1 - cosV) + h / 2 * sinV);
          const ry = Math.floor(x * sinV + y * cosV + w / 2 * sinV + h / 2 * (1 - cosV));
          const [jx, jy] = getJitterOffset(Math.floor(x), Math.floor(y));
          const fx = rx + jx, fy = ry + jy;
          const ix = Math.floor(fx), iy = Math.floor(fy);
          if (ix < 0 || ix >= w || iy < 0 || iy >= h) continue;
          const idx = iy * w + ix;
          const brightness = gray[idx] / 255;
          const dotR = (1 - brightness) * settings.maxSize * gs;
          if (dotR < settings.minSize * gs) continue;
          drawDot(outCtx, fx, fy, dotR, settings, brightness);
        }
      }
    }
  }
}

function drawDot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, settings: { dotStyle: string; outlineMode: boolean; colorCount: number; palette: string[]; dotRotation: number }, brightness: number) {
  let fillColor: string;
  if (settings.colorCount > 0 && settings.palette.length > 0) {
    const idx = Math.min(settings.colorCount - 1, Math.floor(brightness * settings.colorCount));
    fillColor = settings.palette[idx];
  } else {
    fillColor = "#000000";
  }

  // Per-dot rotation based on position
  const dotRot = ((settings.dotRotation || 0) * Math.PI) / 180;
  const posAngle = Math.atan2(y, x);
  const totalRot = dotRot + posAngle * (settings.dotRotation ? 0.3 : 0);

  ctx.save();
  if (totalRot !== 0) {
    ctx.translate(x, y);
    ctx.rotate(totalRot);
    ctx.translate(-x, -y);
  }

  ctx.beginPath();
  if (settings.dotStyle === "hexagon") {
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const px = x + r * Math.cos(angle);
      const py = y + r * Math.sin(angle);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
  } else if (settings.dotStyle === "diamond") {
    ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y); ctx.closePath();
  } else if (settings.dotStyle === "square") {
    ctx.rect(x - r, y - r, r * 2, r * 2);
  } else {
    ctx.arc(x, y, r, 0, Math.PI * 2);
  }

  if (settings.outlineMode) {
    ctx.strokeStyle = fillColor;
    ctx.lineWidth = 1;
    ctx.stroke();
  } else {
    ctx.fillStyle = fillColor;
    ctx.fill();
  }
  ctx.restore();
}

// ─── CMYK Separation Helper ───
function processCMYKSeparation(
  srcCanvas: HTMLCanvasElement,
  cmykCanvases: [HTMLCanvasElement, HTMLCanvasElement, HTMLCanvasElement, HTMLCanvasElement],
  settings: { blur: number; gamma: number; contrast: number; brightness: number; spacing: number; rotation: number; globalSize: number; minSize: number; maxSize: number; bgColor: string }
) {
  const srcCtx = srcCanvas.getContext("2d")!;
  const w = srcCanvas.width, h = srcCanvas.height;
  const imgData = srcCtx.getImageData(0, 0, w, h);
  const data = imgData.data;

  const channels = [
    { label: "Cyan", color: "#00ffff", extract: (r: number, g: number, b: number) => 255 - r },
    { label: "Magenta", color: "#ff00ff", extract: (r: number, g: number, b: number) => 255 - g },
    { label: "Yellow", color: "#ffff00", extract: (r: number, g: number, b: number) => 255 - b },
    { label: "Key (Black)", color: "#000000", extract: (r: number, g: number, b: number) => Math.min(255, 255 - Math.min(r, Math.min(g, b))) },
  ];

  cmykCanvases.forEach((c, i) => {
    const ctx = c.getContext("2d")!;
    c.width = w; c.height = h;
    const ch = channels[i];

    // Extract channel
    const gray = new Float32Array(w * h);
    for (let j = 0; j < w * h; j++) {
      const pi = j * 4;
      gray[j] = ch.extract(data[pi], data[pi + 1], data[pi + 2]);
    }

    // Draw dots
    ctx.fillStyle = settings.bgColor || "#ffffff";
    ctx.fillRect(0, 0, w, h);
    const spacing = Math.max(2, settings.spacing);
    const rot = ((settings.rotation + i * 15) * Math.PI) / 180; // Each channel rotated differently
    const cosV = Math.cos(rot), sinV = Math.sin(rot);
    const gs = settings.globalSize;

    for (let y = spacing / 2; y < h; y += spacing) {
      for (let x = spacing / 2; x < w; x += spacing) {
        const rx = Math.floor(x * cosV - y * sinV + w / 2 * (1 - cosV) + h / 2 * sinV);
        const ry = Math.floor(x * sinV + y * cosV + w / 2 * sinV + h / 2 * (1 - cosV));
        if (rx < 0 || rx >= w || ry < 0 || ry >= h) continue;
        const idx = ry * w + rx;
        const brightness = gray[idx] / 255;
        const dotR = (1 - brightness) * settings.maxSize * gs;
        if (dotR < settings.minSize * gs) continue;
        ctx.beginPath();
        ctx.arc(rx, ry, dotR, 0, Math.PI * 2);
        ctx.fillStyle = ch.color;
        ctx.fill();
      }
    }
  });
}

// ─── Settings snapshot type for undo/redo ───
interface SettingsSnapshot {
  algorithm: string; fitMode: string; blur: number; gamma: number; contrast: number;
  brightness: number; saturation: number; bgColor: string;
  gridType: string; spacing: number; rotation: number;
  channel: string; invertChannel: boolean;
  dotStyle: string; outlineMode: boolean; minSize: number; maxSize: number; globalSize: number;
  dotRotation: number; jitter: number;
  colorCount: number; palette: string[];
}

function captureSettings(s: SettingsSnapshot): SettingsSnapshot {
  return { ...s, palette: [...s.palette] };
}

// ─── Batch Image Item ───
interface BatchItem {
  id: number; name: string; image: HTMLImageElement; previewUrl: string;
}

// ─── Main Component ───
export default function HalftoneStudioPage() {
  // Batch
  const [batchImages, setBatchImages] = useState<BatchItem[]>([]);
  const [activeBatchId, setActiveBatchId] = useState<number | null>(null);

  // Legacy single image state (derived from batch)
  const [fileName, setFileName] = useState("");
  const [zoom, setZoom] = useState(100);

  // Canvas & Adjustments
  const [algorithm, setAlgorithm] = useState("amplitude-modulation");
  const [fitMode, setFitMode] = useState("stretch");
  const [blur, setBlur] = useState(0);
  const [gamma, setGamma] = useState(10);
  const [contrast, setContrast] = useState(0);
  const [brightness, setBrightness] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [bgColor, setBgColor] = useState("#ffffff");

  // Grid Settings
  const [gridType, setGridType] = useState("linear");
  const [spacing, setSpacing] = useState(12);
  const [rotation, setRotation] = useState(0);

  // Sampling & Channels
  const [channel, setChannel] = useState("luminance");
  const [invertChannel, setInvertChannel] = useState(false);

  // Dots & Patterns
  const [dotStyle, setDotStyle] = useState("circle");
  const [outlineMode, setOutlineMode] = useState(false);
  const [minSize, setMinSize] = useState(0.1);
  const [maxSize, setMaxSize] = useState(1);
  const [globalSize, setGlobalSize] = useState(2);
  const [dotRotation, setDotRotation] = useState(0);
  const [jitter, setJitter] = useState(0);

  // Colors & Palette
  const [colorCount, setColorCount] = useState(0);
  const [palette, setPalette] = useState(["#000000", "#ffffff"]);

  // View modes
  const [compareMode, setCompareMode] = useState(false);
  const [cmykMode, setCmykMode] = useState(false);

  // Undo/Redo
  const [history, setHistory] = useState<SettingsSnapshot[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

  const srcCanvasRef = useRef<HTMLCanvasElement>(null);
  const outCanvasRef = useRef<HTMLCanvasElement>(null);
  const cmykCanvasRefs = useRef<[HTMLCanvasElement | null, HTMLCanvasElement | null, HTMLCanvasElement | null, HTMLCanvasElement | null]>([null, null, null, null]);
  const origCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Current image getter
  const image = batchImages.find(b => b.id === activeBatchId)?.image || null;

  // Push settings to undo history
  const pushHistory = useCallback(() => {
    const snap = captureSettings({ algorithm, fitMode, blur, gamma, contrast, brightness, saturation, bgColor, gridType, spacing, rotation, channel, invertChannel, dotStyle, outlineMode, minSize, maxSize, globalSize, dotRotation, jitter, colorCount, palette });
    setHistory(prev => {
      const trimmed = prev.slice(0, historyIdx + 1);
      return [...trimmed, snap];
    });
    setHistoryIdx(prev => prev + 1);
  }, [algorithm, fitMode, blur, gamma, contrast, brightness, saturation, bgColor, gridType, spacing, rotation, channel, invertChannel, dotStyle, outlineMode, minSize, maxSize, globalSize, dotRotation, jitter, colorCount, palette, historyIdx]);

  const undo = useCallback(() => {
    if (historyIdx <= 0) return;
    const prev = history[historyIdx - 1];
    applySnapshot(prev);
    setHistoryIdx(historyIdx - 1);
  }, [history, historyIdx]);

  const redo = useCallback(() => {
    if (historyIdx >= history.length - 1) return;
    const next = history[historyIdx + 1];
    applySnapshot(next);
    setHistoryIdx(historyIdx + 1);
  }, [history, historyIdx]);

  const applySnapshot = (s: SettingsSnapshot) => {
    setAlgorithm(s.algorithm); setFitMode(s.fitMode);
    setBlur(s.blur); setGamma(s.gamma); setContrast(s.contrast);
    setBrightness(s.brightness); setSaturation(s.saturation); setBgColor(s.bgColor);
    setGridType(s.gridType); setSpacing(s.spacing); setRotation(s.rotation);
    setChannel(s.channel); setInvertChannel(s.invertChannel);
    setDotStyle(s.dotStyle); setOutlineMode(s.outlineMode);
    setMinSize(s.minSize); setMaxSize(s.maxSize); setGlobalSize(s.globalSize);
    setDotRotation(s.dotRotation); setJitter(s.jitter);
    setColorCount(s.colorCount); setPalette([...s.palette]);
  };

  // Batch file handling
  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    Array.from(fileList).forEach(file => {
      if (!file.type.startsWith("image/")) return;
      const img = new window.Image();
      img.onload = () => {
        const item: BatchItem = { id: Date.now() + Math.random(), name: file.name, image: img, previewUrl: URL.createObjectURL(file) };
        setBatchImages(prev => [...prev, item]);
        if (activeBatchId === null) setActiveBatchId(item.id);
        setFileName(file.name);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const removeBatchItem = (id: number) => {
    setBatchImages(prev => {
      const next = prev.filter(b => b.id !== id);
      if (activeBatchId === id) setActiveBatchId(next.length > 0 ? next[0].id : null);
      return next;
    });
  };

  // Mouse wheel zoom
  useEffect(() => {
    const el = canvasContainerRef.current;
    if (!el) return;
    const h = (e: WheelEvent) => { e.preventDefault(); setZoom(z => Math.min(500, Math.max(10, z + (e.deltaY < 0 ? 10 : -10)))); };
    el.addEventListener("wheel", h, { passive: false });
    return () => el.removeEventListener("wheel", h);
  }, []);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [undo, redo]);

  // Render
  const renderHalftone = useCallback(() => {
    if (!image || !srcCanvasRef.current || !outCanvasRef.current) return;
    const src = srcCanvasRef.current;
    const ctx = src.getContext("2d")!;
    src.width = image.width; src.height = image.height;
    ctx.drawImage(image, 0, 0);

    processHalftone(src, outCanvasRef.current, {
      algorithm, fitMode, blur, gamma, contrast, brightness, saturation, bgColor,
      gridType, spacing, rotation, channel, invertChannel,
      dotStyle, outlineMode, minSize, maxSize, globalSize, dotRotation, jitter,
      colorCount, palette,
    });

    // Original comparison canvas
    if (origCanvasRef.current) {
      const oCtx = origCanvasRef.current.getContext("2d")!;
      origCanvasRef.current.width = image.width;
      origCanvasRef.current.height = image.height;
      oCtx.drawImage(image, 0, 0);
    }

    // CMYK separation
    if (cmykMode) {
      const refs = cmykCanvasRefs.current;
      if (refs[0] && refs[1] && refs[2] && refs[3]) {
        processCMYKSeparation(src, [refs[0], refs[1], refs[2], refs[3]], {
          blur, gamma, contrast, brightness, spacing, rotation, globalSize, minSize, maxSize, bgColor,
        });
      }
    }
  }, [image, algorithm, fitMode, blur, gamma, contrast, brightness, saturation, bgColor, gridType, spacing, rotation, channel, invertChannel, dotStyle, outlineMode, minSize, maxSize, globalSize, dotRotation, jitter, colorCount, palette, cmykMode]);

  useEffect(() => { renderHalftone(); }, [renderHalftone]);

  // Capture initial history on first image load
  useEffect(() => {
    if (image && history.length === 0) {
      pushHistory();
    }
  }, [image]);

  const handleDownload = () => {
    if (!outCanvasRef.current) return;
    const link = document.createElement("a");
    link.download = `halftone-${fileName || "image"}.png`;
    link.href = outCanvasRef.current.toDataURL("image/png");
    link.click();
  };

  const handleDownloadSVG = () => {
    if (!outCanvasRef.current) return;
    const w = outCanvasRef.current.width, h = outCanvasRef.current.height;
    const dataUrl = outCanvasRef.current.toDataURL("image/png");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">\n<image href="${dataUrl}" width="${w}" height="${h}" />\n</svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `halftone-${fileName || "image"}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyClipboard = async () => {
    if (!outCanvasRef.current) return;
    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        outCanvasRef.current!.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png");
      });
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      toast("Copied to clipboard!");
    } catch {
      toast("Copy failed — try Download instead");
    }
  };

  const handleReset = () => {
    applySnapshot({ algorithm: "amplitude-modulation", fitMode: "stretch", blur: 0, gamma: 10, contrast: 0, brightness: 0, saturation: 0, bgColor: "#ffffff", gridType: "linear", spacing: 12, rotation: 0, channel: "luminance", invertChannel: false, dotStyle: "circle", outlineMode: false, minSize: 0.1, maxSize: 1, globalSize: 2, dotRotation: 0, jitter: 0, colorCount: 0, palette: ["#000000", "#ffffff"] });
  };

  const applyPreset = (name: string) => {
    const p = PRESETS[name];
    if (!p) return;
    if (p.algorithm) setAlgorithm(p.algorithm);
    if (p.blur !== undefined) setBlur(p.blur);
    if (p.gamma !== undefined) setGamma(p.gamma);
    if (p.contrast !== undefined) setContrast(p.contrast);
    if (p.brightness !== undefined) setBrightness(p.brightness);
    if (p.saturation !== undefined) setSaturation(p.saturation);
    if (p.gridType) setGridType(p.gridType);
    if (p.spacing !== undefined) setSpacing(p.spacing);
    if (p.rotation !== undefined) setRotation(p.rotation);
    if (p.dotStyle) setDotStyle(p.dotStyle);
    if (p.globalSize !== undefined) setGlobalSize(p.globalSize);
    if (p.maxSize !== undefined) setMaxSize(p.maxSize);
    if (p.minSize !== undefined) setMinSize(p.minSize);
    if (p.colorCount !== undefined) setColorCount(p.colorCount);
    if (p.palette) setPalette(p.palette);
    if (p.bgColor) setBgColor(p.bgColor);
    pushHistory();
    toast(`Applied "${name}" preset`);
  };

  const randomizePalette = () => {
    setPalette(Array.from({ length: Math.max(2, colorCount) }, () => "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")));
  };

  // Snapshot for undo on any settings change (debounced)
  const lastSnapRef = useRef("");
  useEffect(() => {
    const key = JSON.stringify({ algorithm, fitMode, blur, gamma, contrast, brightness, saturation, bgColor, gridType, spacing, rotation, channel, invertChannel, dotStyle, outlineMode, minSize, maxSize, globalSize, dotRotation, jitter, colorCount, palette });
    if (key !== lastSnapRef.current) {
      lastSnapRef.current = key;
      const t = setTimeout(() => pushHistory(), 600);
      return () => clearTimeout(t);
    }
  });

  return (
    <ToolLayout>
      <main className="flex flex-1 flex-col overflow-hidden min-h-0">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border bg-bg px-5 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10"><Grid3X3 className="h-4 w-4 text-accent" /></div>
          <div>
            <h1 className="text-sm font-semibold text-text-primary">Halftone Studio</h1>
            <p className="text-[11px] text-text-muted">Convert images to halftone dot patterns</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            {/* Undo / Redo */}
            <button onClick={undo} disabled={historyIdx <= 0} className="rounded-lg p-1.5 text-text-muted hover:text-text-primary hover:bg-surface disabled:opacity-30"><Undo2 className="h-4 w-4" /></button>
            <button onClick={redo} disabled={historyIdx >= history.length - 1} className="rounded-lg p-1.5 text-text-muted hover:text-text-primary hover:bg-surface disabled:opacity-30"><Redo2 className="h-4 w-4" /></button>
            {/* Compare */}
            <button onClick={() => setCompareMode(!compareMode)} disabled={!image} className={`rounded-lg p-1.5 transition-colors ${compareMode ? "bg-accent text-white" : "text-text-muted hover:text-text-primary hover:bg-surface"} disabled:opacity-30`} title="Compare"><SplitSquareVertical className="h-4 w-4" /></button>
            {/* CMYK */}
            <button onClick={() => setCmykMode(!cmykMode)} disabled={!image} className={`rounded-lg p-1.5 transition-colors ${cmykMode ? "bg-accent text-white" : "text-text-muted hover:text-text-primary hover:bg-surface"} disabled:opacity-30`} title="CMYK Separation"><Grid2X2 className="h-4 w-4" /></button>
          </div>
        </div>

        {/* Batch Tabs */}
        {batchImages.length > 1 && (
          <div className="flex items-center gap-1 overflow-x-auto border-b border-border bg-bg px-4 py-1.5">
            {batchImages.map(b => (
              <button key={b.id} onClick={() => setActiveBatchId(b.id)} className={`group relative flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-medium transition-all ${activeBatchId === b.id ? "bg-accent text-white" : "bg-surface text-text-secondary hover:bg-accent/10"}`}>
                <span className="max-w-[100px] truncate">{b.name}</span>
                <span onClick={(e) => { e.stopPropagation(); removeBatchItem(b.id); }} className="ml-0.5 hidden rounded-full p-0.5 hover:bg-danger/20 hover:text-danger group-hover:inline">&times;</span>
              </button>
            ))}
          </div>
        )}

        {/* Canvas */}
        <div ref={canvasContainerRef} className="flex flex-1 items-center justify-center overflow-auto p-6 bg-bg-secondary"
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}>
          {image ? (
            <div className={`flex ${compareMode ? "gap-4" : ""} items-start`}>
              {compareMode && (
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[9px] font-bold uppercase text-text-muted">Original</span>
                  <canvas ref={origCanvasRef} className="max-h-[60vh] rounded-lg border border-border shadow-md bg-white object-contain" style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }} />
                </div>
              )}
              <div className="flex flex-col items-center gap-1">
                {compareMode && <span className="text-[9px] font-bold uppercase text-text-muted">Halftone</span>}
                <canvas ref={outCanvasRef} className="max-h-[60vh] rounded-lg border border-border shadow-md bg-white object-contain"
                  style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }} />
              </div>
            </div>
          ) : (
            <div className={`flex w-full max-w-2xl flex-col items-center justify-center rounded-2xl border-2 border-dashed p-20 text-center cursor-pointer transition-all ${isDragging ? "border-accent bg-accent-subtle" : "border-border hover:border-accent/40 bg-surface"}`}
              onClick={() => fileInputRef.current?.click()}>
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-accent-subtle"><Upload className="h-8 w-8 text-accent" /></div>
              <p className="text-base font-medium text-text-primary">Drop or click to browse</p>
              <p className="mt-1.5 text-xs text-text-muted">JPG, PNG, WEBP, GIF • Multiple files supported • Scroll to zoom</p>
            </div>
          )}
        </div>

        {/* CMYK Mini Canvases */}
        {cmykMode && image && (
          <div className="flex items-center justify-center gap-3 border-t border-border bg-bg px-4 py-3">
            {(["Cyan", "Magenta", "Yellow", "Key (Black)"] as const).map((label, i) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <span className="text-[9px] font-bold uppercase text-text-muted">{label}</span>
                <canvas ref={(el) => { cmykCanvasRefs.current[i] = el; }} className="h-24 w-24 rounded border border-border bg-white object-cover" />
              </div>
            ))}
          </div>
        )}

        {/* Bottom Bar */}
        <div className="flex items-center justify-center gap-6 border-t border-border bg-bg px-4 py-2.5">
          <div className="flex items-center gap-2">
            <button onClick={() => setZoom(Math.max(10, zoom - 10))} className="rounded p-1 text-text-muted hover:text-text-primary"><ZoomOut className="h-4 w-4" /></button>
            <span className="min-w-[50px] text-center text-xs font-medium text-text-secondary">{zoom}%</span>
            <button onClick={() => setZoom(Math.min(500, zoom + 10))} className="rounded p-1 text-text-muted hover:text-text-primary"><ZoomIn className="h-4 w-4" /></button>
          </div>
          <span className="text-xs text-text-muted">Mode: <span className="text-text-primary">Halftone</span></span>
          {image && <span className="text-xs text-text-muted">Dimensions: <span className="text-text-primary">{outCanvasRef.current?.width || image.width} × {outCanvasRef.current?.height || image.height}</span></span>}
          {batchImages.length > 0 && <span className="text-xs text-text-muted">Images: <span className="text-text-primary">{batchImages.length}</span></span>}
        </div>
        <canvas ref={srcCanvasRef} className="hidden" />
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      </main>

      {/* Right Panel */}
      <aside className="hidden w-[280px] shrink-0 flex-col overflow-y-auto min-h-0 border-l border-border bg-bg-secondary lg:flex">
        <div className="p-4">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-text-primary">Settings</h2>
            <p className="text-[11px] text-text-muted">Canvas, grid, channels & export options</p>
          </div>
          {image && (
            <div className="mb-4">
              <div className="relative">
                <img src={image.src} alt="" className="w-full rounded-lg border border-border object-cover" style={{ maxHeight: 80 }} />
                <button onClick={() => { removeBatchItem(activeBatchId!); }} className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-danger/90 text-white text-[10px]">✕</button>
              </div>
              <p className="mt-1 truncate text-[10px] text-text-muted">{fileName}</p>
            </div>
          )}

          {/* Presets */}
          <Section title="Presets" icon={<Shuffle className="h-3 w-3" />} defaultOpen={false}>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.keys(PRESETS).map(name => (
                <button key={name} onClick={() => applyPreset(name)} className="rounded-lg border border-border bg-surface px-2 py-2 text-[10px] font-medium text-text-secondary transition-all hover:border-accent hover:text-accent">
                  {name}
                </button>
              ))}
            </div>
          </Section>

          {/* Canvas & Adjustments */}
          <Section title="Canvas & Adjustments" icon={<Sliders className="h-3 w-3" />}>
            <Field label="Algorithm">
              <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-accent">
                <option value="amplitude-modulation">Amplitude Modulation</option>
                <option value="frequency-modulation">Frequency Modulation</option>
                <option value="error-diffusion">Error Diffusion</option>
              </select>
            </Field>
            <Field label="Fit Mode">
              <select value={fitMode} onChange={(e) => setFitMode(e.target.value)} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-accent">
                <option value="stretch">Stretch</option>
                <option value="contain">Contain</option>
                <option value="cover">Cover</option>
              </select>
            </Field>
            <SliderRow label="Brightness" value={brightness} set={setBrightness} min={-100} max={100} />
            <SliderRow label="Contrast" value={contrast} set={setContrast} min={-100} max={100} />
            <SliderRow label="Gamma" value={gamma} set={setGamma} min={1} max={30} step={0.5} />
            <SliderRow label="Saturation" value={saturation} set={setSaturation} min={-100} max={100} />
            <SliderRow label="Blur" value={blur} set={setBlur} min={0} max={20} step={0.5} />
          </Section>

          {/* Grid Settings */}
          {algorithm !== "error-diffusion" && (
          <Section title="Grid Settings" icon={<Grid3X3 className="h-3 w-3" />}>
            <Field label="Grid Type">
              <select value={gridType} onChange={(e) => setGridType(e.target.value)} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-accent">
                <option value="linear">Linear</option>
                <option value="radial">Radial</option>
                <option value="hexagonal">Hexagonal</option>
              </select>
            </Field>
            <SliderRow label="Spacing" value={spacing} set={setSpacing} min={3} max={50} />
            <SliderRow label="Rotation" value={rotation} set={setRotation} min={-360} max={360} />
          </Section>
          )}

          {/* Sampling & Channels */}
          <Section title="Sampling & Channels" icon={<Layers className="h-3 w-3" />}>
            <Field label="Channel">
              <select value={channel} onChange={(e) => setChannel(e.target.value)} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-accent">
                <option value="luminance">Luminance</option>
                <option value="inverse-luminance">Inverse Luminance</option>
                <option value="red">Red</option>
                <option value="green">Green</option>
                <option value="blue">Blue</option>
                <option value="alpha">Alpha</option>
              </select>
            </Field>
            <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-2.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">Invert Channel</p>
              </div>
              <Toggle checked={invertChannel} onChange={setInvertChannel} />
            </div>
          </Section>

          {/* Dots & Patterns */}
          {algorithm !== "error-diffusion" && (
          <Section title="Dots & Patterns" icon={<ImageIcon className="h-3 w-3" />}>
            <Field label="Style">
              <select value={dotStyle} onChange={(e) => setDotStyle(e.target.value)} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-accent">
                <option value="circle">Circle</option>
                <option value="square">Square</option>
                <option value="diamond">Diamond</option>
                <option value="hexagon">Hexagon</option>
              </select>
            </Field>
            <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-2.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">Outline Mode</p>
              </div>
              <Toggle checked={outlineMode} onChange={setOutlineMode} />
            </div>
            <SliderRow label="Min Size" value={minSize} set={setMinSize} min={0} max={5} step={0.1} />
            <SliderRow label="Max Size" value={maxSize} set={setMaxSize} min={0.1} max={5} step={0.05} />
            <SliderRow label="Global Size" value={globalSize} set={setGlobalSize} min={0.5} max={10} step={0.1} />
            <SliderRow label="Dot Rotation" value={dotRotation} set={setDotRotation} min={0} max={360} />
            <SliderRow label="Jitter" value={jitter} set={setJitter} min={0} max={100} step={1} />
          </Section>
          )}

          {/* Colors & Palette */}
          <Section title="Colors & Palette" icon={<Palette className="h-3 w-3" />}>
            <Field label="Background Color">
              <div className="flex items-center gap-2">
                <label className="relative cursor-pointer">
                  <div className="h-8 w-8 rounded-lg border-2 border-border shadow-sm" style={{ backgroundColor: bgColor }} />
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" />
                </label>
                <span className="text-[10px] text-text-muted font-mono">{bgColor}</span>
                <button onClick={() => setBgColor("#ffffff")} className="ml-auto rounded border border-border px-2 py-1 text-[9px] text-text-muted hover:text-text-primary">Reset</button>
              </div>
            </Field>
            <Field label="Color Count">
              <select value={colorCount} onChange={(e) => { const v = Number(e.target.value); setColorCount(v); if (v > 0 && palette.length < v) setPalette(Array.from({ length: v }, (_, i) => i === 0 ? "#000000" : i === 1 ? "#ffffff" : "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0"))); }} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-accent">
                <option value={0}>Full Color (No Palette)</option>
                <option value={2}>2 Colors</option>
                <option value={3}>3 Colors</option>
                <option value={4}>4 Colors</option>
                <option value={6}>6 Colors</option>
                <option value={8}>8 Colors</option>
              </select>
            </Field>
            {colorCount > 0 && (
              <>
                <div className="flex flex-wrap gap-2">
                  {palette.slice(0, colorCount).map((c, i) => (
                    <label key={i} className="relative cursor-pointer">
                      <div className="h-9 w-9 rounded-xl border-2 border-border shadow-sm transition-all hover:scale-110" style={{ backgroundColor: c }} />
                      <input type="color" value={c} onChange={(e) => { const p = [...palette]; p[i] = e.target.value; setPalette(p); }} className="absolute inset-0 cursor-pointer opacity-0" />
                    </label>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={randomizePalette} className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-border bg-surface py-2 text-xs font-medium text-text-secondary hover:border-accent hover:text-accent">
                    <Shuffle className="h-3.5 w-3.5" /> Randomize
                  </button>
                  <button onClick={() => setPalette(Array.from({ length: colorCount }, (_, i) => i === 0 ? "#000000" : "#ffffff"))} className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-medium text-text-secondary hover:border-accent hover:text-accent">
                    Reset
                  </button>
                </div>
              </>
            )}
          </Section>

          {/* Export */}
          <Section title="Export" icon={<Download className="h-3 w-3" />}>
            <Field label="PNG Scale">
              <select className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-accent">
                <option value="1">1x Scale</option>
                <option value="2">2x Scale</option>
                <option value="3">3x Scale</option>
                <option value="4">4x Scale</option>
              </select>
            </Field>
            <button onClick={handleDownload} disabled={!image} className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-50">
              <Download className="h-4 w-4" /> Download PNG
            </button>
            <button onClick={handleDownloadSVG} disabled={!image} className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-xs font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent disabled:opacity-50">
              Download SVG (Vector)
            </button>
            <button onClick={handleCopyClipboard} disabled={!image} className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-xs font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent disabled:opacity-50">
              Copy to Clipboard
            </button>
          </Section>
        </div>
      </aside>
    </ToolLayout>
  );
}
