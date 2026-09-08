"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ToolLayout } from "@/components/tool-layout";
import {
  Upload, Download, RotateCcw, ZoomIn, ZoomOut, ChevronUp, ChevronDown,
  Image as ImageIcon, Sliders, Cpu, Layers, Palette, Shuffle,
  Undo2, Redo2, SplitSquareVertical, Grid2X2,
} from "lucide-react";

// ─── Algorithm categories ───
const ALGO_CATEGORIES = [
  { name: "Basic", methods: [{ id: "threshold", name: "Threshold" }, { id: "random-noise", name: "Random Noise" }] },
  { name: "Ordered (Bayer)", methods: [{ id: "bayer-2", name: "Bayer 2×2" }, { id: "bayer-4", name: "Bayer 4×4" }, { id: "bayer-8", name: "Bayer 8×8" }, { id: "bayer-16", name: "Bayer 16×16" }] },
  { name: "Diffusion", methods: [{ id: "floyd-steinberg", name: "Floyd-Steinberg" }, { id: "atkinson", name: "Atkinson" }, { id: "jarvis", name: "Jarvis-Judice-Ninke" }, { id: "stucki", name: "Stucki" }, { id: "burkes", name: "Burkes" }] },
  { name: "Pattern", methods: [{ id: "h-scanlines", name: "Horizontal Scanlines" }, { id: "v-scanlines", name: "Vertical Scanlines" }, { id: "crosshatch", name: "Crosshatch" }, { id: "dot-halftone", name: "Dot Halftone" }] },
];

const BAYER_2 = [[0, 2], [3, 1]];
const BAYER_4 = [[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
const BAYER_8 = [[0,32,8,40,2,34,10,42],[48,16,56,24,50,18,58,26],[12,44,4,36,14,46,6,38],[60,28,52,20,62,30,54,22],[3,35,11,43,1,33,9,41],[51,19,59,27,49,17,57,25],[15,47,7,39,13,45,5,37],[63,31,55,23,61,29,53,21]];
const BAYER_16 = (() => { const m: number[][] = []; for (let y = 0; y < 16; y++) { m[y] = []; for (let x = 0; x < 16; x++) { let v = 0; for (let k = 0; k < 8; k++) { v |= ((x >> k) & 1) << (2 * k + 1); v |= ((y >> k) & 1) << (2 * k); } m[y][x] = v; } } return m; })();

function getBayerMatrix(method: string) {
  if (method === "bayer-2") return { matrix: BAYER_2, size: 2 };
  if (method === "bayer-4") return { matrix: BAYER_4, size: 4 };
  if (method === "bayer-8") return { matrix: BAYER_8, size: 8 };
  if (method === "bayer-16") return { matrix: BAYER_16, size: 16 };
  return null;
}

function clamp(v: number) { return Math.min(255, Math.max(0, v)); }
function hexToRGB(hex: string) { return { r: parseInt(hex.slice(1,3),16), g: parseInt(hex.slice(3,5),16), b: parseInt(hex.slice(5,7),16) }; }
function findClosest(gray: number, pal: {r:number;g:number;b:number}[]) {
  let best = pal[0], bestD = Infinity;
  for (const c of pal) { const d = Math.abs(c.r-gray)+Math.abs(c.g-gray)+Math.abs(c.b-gray); if (d < bestD) { bestD = d; best = c; } }
  return best;
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
  method: string; pixelSize: number; threshold: number; highlights: number; midtones: number;
  shadows: number; brightness: number; contrast: number; invert: boolean; blur: number;
  grain: number; posterize: number; pixelate: number; colorCount: number; palette: string[];
  bgColor: string; channel: string; saturation: number;
}>> = {
  "Game Boy": { method: "bayer-4", threshold: 127, colorCount: 2, palette: ["#0f380f", "#9bbc0f"], bgColor: "#9bbc0f", channel: "luminance", pixelate: 1, pixelSize: 2 },
  "Commodore 64": { method: "bayer-8", threshold: 127, colorCount: 2, palette: ["#40318d", "#7869c4"], bgColor: "#40318d", channel: "luminance", pixelate: 1, pixelSize: 1 },
  "Newspaper": { method: "floyd-steinberg", threshold: 127, colorCount: 0, palette: ["#000000","#ffffff"], bgColor: "#ffffff", channel: "luminance", pixelate: 1, pixelSize: 1, grain: 5 },
  "Risograph": { method: "bayer-8", threshold: 127, colorCount: 2, palette: ["#d62828","#fcbf49"], bgColor: "#fef9ef", channel: "luminance", pixelSize: 2, pixelate: 1, grain: 15 },
  "Pixel Art": { method: "bayer-4", threshold: 127, colorCount: 0, palette: ["#000000","#ffffff"], bgColor: "#ffffff", channel: "luminance", pixelate: 8, pixelSize: 4 },
  "High Contrast": { method: "threshold", threshold: 128, colorCount: 0, palette: ["#000000","#ffffff"], bgColor: "#ffffff", channel: "luminance", pixelate: 1, pixelSize: 1, contrast: 50, brightness: 10 },
  "Grunge": { method: "floyd-steinberg", threshold: 127, colorCount: 0, palette: ["#000000","#ffffff"], bgColor: "#ffffff", channel: "luminance", pixelate: 1, pixelSize: 1, grain: 40, contrast: 20, blur: 0.5 },
};

// ─── Main Processing ───
function processImage(
  srcCanvas: HTMLCanvasElement, method: string, pixelSize: number, threshold: number,
  highlights: number, midtones: number, shadows: number,
  brightness: number, contrast: number, invert: boolean,
  blur: number, grain: number, posterize: number, pixelate: number,
  colorCount: number, palette: string[], bgColor: string,
  channel: string, saturation: number,
  scanlineSpacing: number, dotSize: number, scanlineAngle: number, jitter: number,
  outCanvas: HTMLCanvasElement,
) {
  const sw = srcCanvas.width, sh = srcCanvas.height;
  const px = Math.max(1, pixelate);
  const tw = Math.ceil(sw / px), th = Math.ceil(sh / px);
  const tmp = document.createElement("canvas"); tmp.width = tw; tmp.height = th;
  const tmpCtx = tmp.getContext("2d")!;
  tmpCtx.drawImage(srcCanvas, 0, 0, tw, th);

  if (blur > 0) {
    const bc = document.createElement("canvas"); bc.width = tw; bc.height = th;
    const bCtx = bc.getContext("2d")!; bCtx.filter = `blur(${blur}px)`; bCtx.drawImage(tmp, 0, 0);
    tmpCtx.drawImage(bc, 0, 0);
  }

  let imgData = tmpCtx.getImageData(0, 0, tw, th);
  let data = imgData.data;

  // Apply saturation + brightness + contrast + extract channel
  for (let i = 0; i < data.length; i += 4) {
    let r = clamp(data[i] + brightness * 2.55), g = clamp(data[i+1] + brightness * 2.55), b = clamp(data[i+2] + brightness * 2.55);
    // Saturation
    if (saturation !== 0) {
      const s = saturation / 100;
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = clamp(gray + (1 + s) * (r - gray));
      g = clamp(gray + (1 + s) * (g - gray));
      b = clamp(gray + (1 + s) * (b - gray));
    }
    const f = (259*(contrast+255))/(255*(259-contrast));
    r = clamp(f*(r-128)+128); g = clamp(f*(g-128)+128); b = clamp(f*(b-128)+128);
    // Channel extraction
    let gray: number;
    switch (channel) {
      case "red": gray = r; break;
      case "green": gray = g; break;
      case "blue": gray = b; break;
      default: gray = 0.299*r+0.587*g+0.114*b; break;
    }
    const lum = gray/255;
    if (lum > 0.67) gray += highlights*1.5; else if (lum > 0.33) gray += midtones*1.5; else gray += shadows*1.5;
    gray = clamp(gray); if (invert) gray = 255 - gray;
    data[i] = data[i+1] = data[i+2] = gray; data[i+3] = 255;
  }

  if (posterize > 0) { const step = 255/(Math.max(2,posterize)-1); for (let i=0;i<data.length;i+=4) data[i]=data[i+1]=data[i+2]=Math.round(data[i]/step)*step; }
  if (grain > 0) { for (let i=0;i<data.length;i+=4) { const n=(Math.random()-0.5)*grain*2; data[i]=clamp(data[i]+n); data[i+1]=clamp(data[i+1]+n); data[i+2]=clamp(data[i+2]+n); } }

  const w = tw, h = th;
  const gray = new Float32Array(w*h);
  for (let i=0;i<data.length;i+=4) gray[i/4] = data[i];

  // Scanline/dot parameters
  const sp = Math.max(2, scanlineSpacing);
  const ds = Math.max(1, dotSize);
  const angleRad = (scanlineAngle * Math.PI) / 180;
  const cosA = Math.cos(angleRad), sinA = Math.sin(angleRad);
  const jitterAmt = jitter / 100;

  // Helper: rotate coordinates for scanlines
  function rotateXY(x: number, y: number): [number, number] {
    const cx = w / 2, cy = h / 2;
    return [
      Math.floor((x - cx) * cosA - (y - cy) * sinA + cx),
      Math.floor((x - cx) * sinA + (y - cy) * cosA + cy),
    ];
  }

  // Helper: jitter offset
  function jit(ix: number, iy: number): [number, number] {
    if (jitterAmt <= 0) return [0, 0];
    const seed = ix * 7919 + iy * 104729;
    return [
      ((Math.sin(seed) * 43758.5453) % 1) * jitterAmt * sp * 0.5,
      ((Math.sin(seed + 1) * 43758.5453) % 1) * jitterAmt * sp * 0.5,
    ];
  }

  if (method === "threshold" || method === "random-noise") {
    for (let y=0;y<h;y++) for (let x=0;x<w;x++) { const t = method==="random-noise" ? threshold+(Math.random()-0.5)*60 : threshold; gray[y*w+x] = gray[y*w+x] > t ? 255 : 0; }
  } else if (method.startsWith("bayer")) {
    const b = getBayerMatrix(method);
    if (b) { const {matrix,size} = b; const mv = size*size; for (let y=0;y<h;y++) for (let x=0;x<w;x++) gray[y*w+x] = gray[y*w+x] > (matrix[y%size][x%size]/mv)*255 ? 255 : 0; }
  } else if (["floyd-steinberg","atkinson","jarvis","stucki","burkes"].includes(method)) {
    const k: Record<string,{dx:number[];dy:number[];w:number[];d:number}> = {
      "floyd-steinberg":{dx:[1,0,1,1],dy:[0,1,1,1],w:[7,5,3,1],d:16},
      atkinson:{dx:[1,2,0,1,2,1],dy:[0,0,1,1,1,2],w:[1,1,1,1,1,1],d:8},
      jarvis:{dx:[1,2,3,0,1,2,3,1,2],dy:[0,0,0,1,1,1,1,2,2],w:[7,5,3,5,8,5,3,2,1],d:48},
      stucki:{dx:[1,2,3,0,1,2,3,1,2],dy:[0,0,0,1,1,1,1,2,2],w:[8,4,2,4,8,4,2,1,2],d:42},
      burkes:{dx:[1,2,3,0,1,2,3],dy:[0,0,0,1,1,1,1],w:[8,4,2,4,8,4,2],d:16},
    };
    const kk = k[method];
    for (let y=0;y<h;y++) for (let x=0;x<w;x++) { const idx=y*w+x; const old=gray[idx]; const nv=old>threshold?255:0; gray[idx]=nv; const err=old-nv; for (let j=0;j<kk.dx.length;j++) { const nx=x+kk.dx[j],ny=y+kk.dy[j]; if (nx>=0&&nx<w&&ny>=0&&ny<h) gray[ny*w+nx]+=(err*kk.w[j])/kk.d; } }
  } else if (method === "h-scanlines") {
    for (let y=0;y<h;y++) for (let x=0;x<w;x++) {
      const [rx, ry] = rotateXY(x, y);
      const [jx, jy] = jit(x, y);
      const modY = ((ry + jy) % sp + sp) % sp;
      const s = modY < sp / 2;
      gray[y*w+x] = s ? (gray[y*w+x]>threshold?255:0) : 0;
    }
  } else if (method === "v-scanlines") {
    for (let y=0;y<h;y++) for (let x=0;x<w;x++) {
      const [rx, ry] = rotateXY(x, y);
      const [jx, jy] = jit(x, y);
      const modX = ((rx + jx) % sp + sp) % sp;
      const s = modX < sp / 2;
      gray[y*w+x] = s ? (gray[y*w+x]>threshold?255:0) : 0;
    }
  } else if (method === "crosshatch") {
    for (let y=0;y<h;y++) for (let x=0;x<w;x++) {
      const [rx, ry] = rotateXY(x, y);
      const [jx, jy] = jit(x, y);
      const modY = ((ry + jy) % sp + sp) % sp;
      const modX = ((rx + jx) % sp + sp) % sp;
      const hL = modY < sp / 2, vL = modX < sp / 2, dk = gray[y*w+x] < threshold;
      gray[y*w+x] = (dk && (hL || vL)) ? 0 : 255;
    }
  } else if (method === "dot-halftone") {
    for (let y=0;y<h;y++) for (let x=0;x<w;x++) {
      const [rx, ry] = rotateXY(x, y);
      const [jx, jy] = jit(x, y);
      const modX = ((rx + jx) % sp + sp) % sp;
      const modY = ((ry + jy) % sp + sp) % sp;
      const cx = modX - sp / 2, cy = modY - sp / 2;
      const r = (1 - gray[y*w+x] / 255) * ds;
      gray[y*w+x] = Math.sqrt(cx*cx+cy*cy) < r ? 0 : 255;
    }
  }

  const outCtx = outCanvas.getContext("2d")!;
  const outData = outCtx.createImageData(w, h);
  const palRGB = palette.map(hexToRGB);

  // Parse bgColor
  const bgRGB = hexToRGB(bgColor);

  for (let i=0;i<gray.length;i++) { const pi=i*4; const v=gray[i];
    if (colorCount>0 && palRGB.length>0) {
      const cc = Math.min(colorCount, palRGB.length);
      const idx = Math.min(cc - 1, Math.floor((v / 255) * cc));
      outData.data[pi]=palRGB[idx].r; outData.data[pi+1]=palRGB[idx].g; outData.data[pi+2]=palRGB[idx].b;
    } else {
      if (v > 128) {
        outData.data[pi]=bgRGB.r; outData.data[pi+1]=bgRGB.g; outData.data[pi+2]=bgRGB.b;
      } else {
        outData.data[pi]=0; outData.data[pi+1]=0; outData.data[pi+2]=0;
      }
    }
    outData.data[pi+3]=255;
  }
  outCanvas.width = w; outCanvas.height = h;
  outCtx.putImageData(outData, 0, 0);

  // Scale to original size (pixelate reduces resolution, this restores it)
  const targetW = sw * pixelSize, targetH = sh * pixelSize;
  if (w !== targetW || h !== targetH) {
    const fc = document.createElement("canvas"); fc.width=targetW; fc.height=targetH;
    const fCtx=fc.getContext("2d")!; fCtx.imageSmoothingEnabled=false; fCtx.drawImage(outCanvas,0,0,targetW,targetH);
    outCanvas.width=targetW; outCanvas.height=targetH; outCtx.drawImage(fc,0,0);
  }
}

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

function SliderRow({ label, value, set, min = -50, max = 50, step = 1 }: { label: string; value: number; set: (v: number) => void; min?: number; max?: number; step?: number }) {
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

// ─── Batch Item Type ───
interface BatchItem { id: number; name: string; image: HTMLImageElement; previewUrl: string; }

// ─── Settings Snapshot ───
interface Snap {
  method: string; pixelSize: number; threshold: number; highlights: number; midtones: number;
  shadows: number; brightness: number; contrast: number; invert: boolean; blur: number;
  grain: number; posterize: number; pixelate: number; colorCount: number; palette: string[];
  bgColor: string; channel: string; saturation: number;
  scanlineSpacing: number; dotSize: number; scanlineAngle: number; jitter: number;
}

function snap(s: Snap): Snap { return { ...s, palette: [...s.palette] }; }
function applySnap(s: Snap, setters: Record<string, any>) {
  for (const [k, v] of Object.entries(s)) {
    if (k === "palette") setters.setPalette([...v]);
    else if (setters["set" + k.charAt(0).toUpperCase() + k.slice(1)]) setters["set" + k.charAt(0).toUpperCase() + k.slice(1)](v);
  }
}

// ─── Main Component ───
export default function DitherStudioPage() {
  const [batchImages, setBatchImages] = useState<BatchItem[]>([]);
  const [activeBatchId, setActiveBatchId] = useState<number | null>(null);
  const [fileName, setFileName] = useState("");
  const [zoom, setZoom] = useState(100);

  // Algorithm
  const [method, setMethod] = useState("bayer-8");
  const [pixelSize, setPixelSize] = useState(1);
  const [threshold, setThreshold] = useState(127);

  // Adjustments
  const [highlights, setHighlights] = useState(0);
  const [midtones, setMidtones] = useState(0);
  const [shadows, setShadows] = useState(0);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [invert, setInvert] = useState(false);

  // Effects
  const [blur, setBlur] = useState(0);
  const [grain, setGrain] = useState(0);
  const [posterize, setPosterize] = useState(0);
  const [pixelate, setPixelate] = useState(1);

  // Colors
  const [colorCount, setColorCount] = useState(0);
  const [palette, setPalette] = useState(["#000000", "#ffffff"]);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [channel, setChannel] = useState("luminance");
  const [saturation, setSaturation] = useState(0);

  // Pattern controls
  const [scanlineSpacing, setScanlineSpacing] = useState(4);
  const [dotSize, setDotSize] = useState(4);
  const [scanlineAngle, setScanlineAngle] = useState(0);
  const [jitter, setJitter] = useState(0);

  // View modes
  const [compareMode, setCompareMode] = useState(false);
  const [cmykMode, setCmykMode] = useState(false);
  const [exportScale, setExportScale] = useState(1);

  // Undo/Redo
  const [history, setHistory] = useState<Snap[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

  const srcCanvasRef = useRef<HTMLCanvasElement>(null);
  const outCanvasRef = useRef<HTMLCanvasElement>(null);
  const origCanvasRef = useRef<HTMLCanvasElement>(null);
  const cmykRefs = useRef<[HTMLCanvasElement|null, HTMLCanvasElement|null, HTMLCanvasElement|null, HTMLCanvasElement|null]>([null,null,null,null]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const image = batchImages.find(b => b.id === activeBatchId)?.image || null;

  const captureSnap = (): Snap => snap({ method, pixelSize, threshold, highlights, midtones, shadows, brightness, contrast, invert, blur, grain, posterize, pixelate, colorCount, palette, bgColor, channel, saturation, scanlineSpacing, dotSize, scanlineAngle, jitter });

  const pushHistory = useCallback(() => {
    const s = captureSnap();
    setHistory(prev => [...prev.slice(0, historyIdx + 1), s]);
    setHistoryIdx(prev => prev + 1);
  }, [method, pixelSize, threshold, highlights, midtones, shadows, brightness, contrast, invert, blur, grain, posterize, pixelate, colorCount, palette, bgColor, channel, saturation, scanlineSpacing, dotSize, scanlineAngle, jitter, historyIdx]);

  const doUndo = useCallback(() => {
    if (historyIdx <= 0) return;
    const s = history[historyIdx - 1];
    applyAllSnap(s);
    setHistoryIdx(historyIdx - 1);
  }, [history, historyIdx]);

  const doRedo = useCallback(() => {
    if (historyIdx >= history.length - 1) return;
    const s = history[historyIdx + 1];
    applyAllSnap(s);
    setHistoryIdx(historyIdx + 1);
  }, [history, historyIdx]);

  const applyAllSnap = (s: Snap) => {
    setMethod(s.method); setPixelSize(s.pixelSize); setThreshold(s.threshold);
    setHighlights(s.highlights); setMidtones(s.midtones); setShadows(s.shadows);
    setBrightness(s.brightness); setContrast(s.contrast); setInvert(s.invert);
    setBlur(s.blur); setGrain(s.grain); setPosterize(s.posterize); setPixelate(s.pixelate);
    setColorCount(s.colorCount); setPalette([...s.palette]); setBgColor(s.bgColor);
    setChannel(s.channel); setSaturation(s.saturation);
    setScanlineSpacing(s.scanlineSpacing); setDotSize(s.dotSize);
    setScanlineAngle(s.scanlineAngle); setJitter(s.jitter);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); doUndo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); doRedo(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [doUndo, doRedo]);

  // Batch
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

  // Render
  const renderDither = useCallback(() => {
    if (!image || !srcCanvasRef.current || !outCanvasRef.current) return;
    const src = srcCanvasRef.current;
    const ctx = src.getContext("2d")!;
    src.width = image.width; src.height = image.height;
    ctx.drawImage(image, 0, 0);

    processImage(src, method, pixelSize, threshold, highlights, midtones, shadows,
      brightness, contrast, invert, blur, grain, posterize, pixelate,
      colorCount, palette, bgColor, channel, saturation,
      scanlineSpacing, dotSize, scanlineAngle, jitter, outCanvasRef.current);

    // Original for comparison
    if (origCanvasRef.current) {
      const oCtx = origCanvasRef.current.getContext("2d")!;
      origCanvasRef.current.width = image.width;
      origCanvasRef.current.height = image.height;
      oCtx.drawImage(image, 0, 0);
    }

    // CMYK
    if (cmykMode && cmykRefs.current[0] && cmykRefs.current[1] && cmykRefs.current[2] && cmykRefs.current[3]) {
      const channels = [
        { label: "C", extract: (r: number, g: number, b: number) => 255 - r },
        { label: "M", extract: (r: number, g: number, b: number) => 255 - g },
        { label: "Y", extract: (r: number, g: number, b: number) => 255 - b },
        { label: "K", extract: (r: number, g: number, b: number) => Math.min(255, 255 - Math.min(r, Math.min(g, b))) },
      ];
      channels.forEach((ch, i) => {
        const c = cmykRefs.current[i]!;
        const cCtx = c.getContext("2d")!;
        c.width = image.width; c.height = image.height;
        const tmpC = document.createElement("canvas");
        tmpC.width = image.width; tmpC.height = image.height;
        const tCtx = tmpC.getContext("2d")!;
        tCtx.drawImage(src, 0, 0);
        const imgD = tCtx.getImageData(0, 0, image.width, image.height);
        const d = imgD.data;
        for (let j = 0; j < d.length; j += 4) {
          const v = ch.extract(d[j], d[j+1], d[j+2]);
          d[j] = d[j+1] = d[j+2] = v;
        }
        tCtx.putImageData(imgD, 0, 0);
        processImage(tmpC, method, pixelSize, threshold, highlights, midtones, shadows,
          brightness, contrast, invert, blur, grain, posterize, 1,
          0, ["#000000","#ffffff"], bgColor, "luminance", 0,
          scanlineSpacing, dotSize, scanlineAngle, jitter, c);
      });
    }
  }, [image, method, pixelSize, threshold, highlights, midtones, shadows, brightness, contrast, invert, blur, grain, posterize, pixelate, colorCount, palette, bgColor, channel, saturation, scanlineSpacing, dotSize, scanlineAngle, jitter, cmykMode]);

  useEffect(() => { renderDither(); }, [renderDither]);

  // Capture initial history
  useEffect(() => { if (image && history.length === 0) pushHistory(); }, [image]);

  // Auto-push history on settings change (debounced)
  const lastSnapRef = useRef("");
  useEffect(() => {
    const key = JSON.stringify(captureSnap());
    if (key !== lastSnapRef.current) {
      lastSnapRef.current = key;
      const t = setTimeout(() => pushHistory(), 600);
      return () => clearTimeout(t);
    }
  });

  const handleDownload = () => {
    if (!outCanvasRef.current) return;
    if (exportScale > 1) {
      const w = outCanvasRef.current.width, h = outCanvasRef.current.height;
      const sc = document.createElement("canvas");
      sc.width = w * exportScale; sc.height = h * exportScale;
      const sCtx = sc.getContext("2d")!;
      sCtx.imageSmoothingEnabled = false;
      sCtx.drawImage(outCanvasRef.current, 0, 0, w * exportScale, h * exportScale);
      const link = document.createElement("a");
      link.download = `dithered-${fileName||"image"}-${exportScale}x.png`;
      link.href = sc.toDataURL("image/png");
      link.click();
    } else {
      const link = document.createElement("a");
      link.download = `dithered-${fileName||"image"}.png`;
      link.href = outCanvasRef.current.toDataURL("image/png");
      link.click();
    }
  };

  const handleDownloadSVG = () => {
    if (!outCanvasRef.current) return;
    const w = outCanvasRef.current.width, h = outCanvasRef.current.height;
    const dataUrl = outCanvasRef.current.toDataURL("image/png");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">\n<image href="${dataUrl}" width="${w}" height="${h}" />\n</svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `dithered-${fileName||"image"}.svg`;
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
    } catch { toast("Copy failed — try Download instead"); }
  };

  const applyPreset = (name: string) => {
    const p = PRESETS[name];
    if (!p) return;
    if (p.method) setMethod(p.method);
    if (p.pixelSize !== undefined) setPixelSize(p.pixelSize);
    if (p.threshold !== undefined) setThreshold(p.threshold);
    if (p.highlights !== undefined) setHighlights(p.highlights);
    if (p.midtones !== undefined) setMidtones(p.midtones);
    if (p.shadows !== undefined) setShadows(p.shadows);
    if (p.brightness !== undefined) setBrightness(p.brightness);
    if (p.contrast !== undefined) setContrast(p.contrast);
    if (p.invert !== undefined) setInvert(p.invert);
    if (p.blur !== undefined) setBlur(p.blur);
    if (p.grain !== undefined) setGrain(p.grain);
    if (p.posterize !== undefined) setPosterize(p.posterize);
    if (p.pixelate !== undefined) setPixelate(p.pixelate);
    if (p.colorCount !== undefined) setColorCount(p.colorCount);
    if (p.palette) setPalette(p.palette);
    if (p.bgColor) setBgColor(p.bgColor);
    if (p.channel) setChannel(p.channel);
    if (p.saturation !== undefined) setSaturation(p.saturation);
    pushHistory();
    toast(`Applied "${name}" preset`);
  };

  const handleReset = () => {
    applyAllSnap({ method: "bayer-8", pixelSize: 1, threshold: 127, highlights: 0, midtones: 0, shadows: 0, brightness: 0, contrast: 0, invert: false, blur: 0, grain: 0, posterize: 0, pixelate: 1, colorCount: 0, palette: ["#000000","#ffffff"], bgColor: "#ffffff", channel: "luminance", saturation: 0, scanlineSpacing: 4, dotSize: 4, scanlineAngle: 0, jitter: 0 });
  };

  const randomizePalette = () => {
    setPalette(Array.from({ length: Math.max(2, colorCount) }, () => "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6,"0")));
  };

  const isPattern = method === "h-scanlines" || method === "v-scanlines" || method === "crosshatch" || method === "dot-halftone";

  return (
    <ToolLayout>
      <main className="flex flex-1 flex-col overflow-hidden min-h-0">
        <div className="relative flex flex-1 flex-col overflow-hidden" onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}>
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border bg-bg px-5 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10"><Layers className="h-4 w-4 text-accent" /></div>
            <div>
              <h1 className="text-sm font-semibold text-text-primary">Dither Studio</h1>
              <p className="text-[11px] text-text-muted">Image dithering & halftone effects</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <button onClick={doUndo} disabled={historyIdx <= 0} className="rounded-lg p-1.5 text-text-muted hover:text-text-primary hover:bg-surface disabled:opacity-30"><Undo2 className="h-4 w-4" /></button>
              <button onClick={doRedo} disabled={historyIdx >= history.length - 1} className="rounded-lg p-1.5 text-text-muted hover:text-text-primary hover:bg-surface disabled:opacity-30"><Redo2 className="h-4 w-4" /></button>
              <button onClick={() => setCompareMode(!compareMode)} disabled={!image} className={`rounded-lg p-1.5 transition-colors ${compareMode ? "bg-accent text-white" : "text-text-muted hover:text-text-primary hover:bg-surface"} disabled:opacity-30`} title="Compare"><SplitSquareVertical className="h-4 w-4" /></button>
              <button onClick={() => setCmykMode(!cmykMode)} disabled={!image} className={`rounded-lg p-1.5 transition-colors ${cmykMode ? "bg-accent text-white" : "text-text-muted hover:text-text-primary hover:bg-surface"} disabled:opacity-30`} title="CMYK"><Grid2X2 className="h-4 w-4" /></button>
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
          <div ref={canvasContainerRef} className="flex flex-1 items-center justify-center overflow-auto p-6 bg-bg-secondary">
            {image ? (
              <div className={`flex ${compareMode ? "gap-4" : ""} items-start`}>
                {compareMode && (
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[9px] font-bold uppercase text-text-muted">Original</span>
                    <canvas ref={origCanvasRef} className="max-h-[60vh] rounded-lg border border-border shadow-md bg-white object-contain" style={{ transform: `scale(${zoom/100})`, transformOrigin: "top center" }} />
                  </div>
                )}
                <div className="flex flex-col items-center gap-1">
                  {compareMode && <span className="text-[9px] font-bold uppercase text-text-muted">Dithered</span>}
                  <canvas ref={outCanvasRef} className="max-h-[60vh] rounded-lg border border-border shadow-md bg-white object-contain" style={{ transform: `scale(${zoom/100})`, transformOrigin: "top center", imageRendering: pixelSize > 1 ? "pixelated" : "auto" }} />
                </div>
              </div>
            ) : (
              <div className={`flex w-full max-w-2xl flex-col items-center justify-center rounded-2xl border-2 border-dashed p-20 text-center cursor-pointer transition-all ${isDragging ? "border-accent bg-accent-subtle" : "border-border hover:border-accent/40 bg-surface"}`} onClick={() => fileInputRef.current?.click()}>
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-accent-subtle"><Upload className="h-8 w-8 text-accent" /></div>
                <p className="text-base font-medium text-text-primary">Drop or click to browse</p>
                <p className="mt-1.5 text-xs text-text-muted">JPG, PNG, WEBP, GIF • Multiple files supported • Scroll to zoom</p>
              </div>
            )}
          </div>

          {/* CMYK Canvases */}
          {cmykMode && image && (
            <div className="flex items-center justify-center gap-3 border-t border-border bg-bg px-4 py-3">
              {(["Cyan", "Magenta", "Yellow", "Key (Black)"] as const).map((label, i) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <span className="text-[9px] font-bold uppercase text-text-muted">{label}</span>
                  <canvas ref={(el) => { cmykRefs.current[i] = el; }} className="h-24 w-24 rounded border border-border bg-white object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* Bottom Bar */}
          <div className="flex items-center justify-center gap-6 border-t border-border bg-bg px-4 py-2.5">
            <div className="flex items-center gap-2">
              <button onClick={() => setZoom(Math.max(10, zoom-10))} className="rounded p-1 text-text-muted hover:text-text-primary"><ZoomOut className="h-4 w-4" /></button>
              <span className="min-w-[50px] text-center text-xs font-medium text-text-secondary">{zoom}%</span>
              <button onClick={() => setZoom(Math.min(500, zoom+10))} className="rounded p-1 text-text-muted hover:text-text-primary"><ZoomIn className="h-4 w-4" /></button>
            </div>
            <span className="text-xs text-text-muted">Mode: <span className="text-text-primary">Dithered</span></span>
            {image && <span className="text-xs text-text-muted">Dimensions: <span className="text-text-primary">{outCanvasRef.current?.width||image.width} × {outCanvasRef.current?.height||image.height}</span></span>}
            {batchImages.length > 0 && <span className="text-xs text-text-muted">Images: <span className="text-text-primary">{batchImages.length}</span></span>}
          </div>
          <canvas ref={srcCanvasRef} className="hidden" />
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
        </div>
      </main>

      {/* Right Panel */}
      <aside className="hidden w-[280px] shrink-0 flex-col overflow-y-auto min-h-0 border-l border-border bg-bg-secondary lg:flex">
        <div className="p-4">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-text-primary">Settings</h2>
            <p className="text-[11px] text-text-muted">Adjust algorithm, effects & export options</p>
          </div>
          {image && (
            <div className="mb-4">
              <div className="relative">
                <img src={image.src} alt="" className="w-full rounded-lg border border-border object-cover" style={{ maxHeight: 80 }} />
                <button onClick={() => removeBatchItem(activeBatchId!)} className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-danger/90 text-white text-[10px]">✕</button>
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

          {/* Algorithm */}
          <Section title="Algorithm" icon={<Cpu className="h-3 w-3" />}>
            <Field label="Method">
              <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-accent">
                {ALGO_CATEGORIES.map((cat) => (
                  <optgroup key={cat.name} label={cat.name}>{cat.methods.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</optgroup>
                ))}
              </select>
            </Field>
            <SliderRow label="Pixel Size" value={pixelSize} set={setPixelSize} min={1} max={10} step={1} />
            <SliderRow label="Filter Threshold" value={threshold} set={setThreshold} min={0} max={255} step={1} />
          </Section>

          {/* Image Adjustments */}
          <Section title="Image Adjustments" icon={<Sliders className="h-3 w-3" />}>
            <Field label="Channel">
              <select value={channel} onChange={(e) => setChannel(e.target.value)} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-accent">
                <option value="luminance">Luminance</option>
                <option value="red">Red</option>
                <option value="green">Green</option>
                <option value="blue">Blue</option>
              </select>
            </Field>
            <SliderRow label="Saturation" value={saturation} set={setSaturation} min={-100} max={100} />
            <SliderRow label="Highlights" value={highlights} set={setHighlights} />
            <SliderRow label="Midtones" value={midtones} set={setMidtones} />
            <SliderRow label="Shadows" value={shadows} set={setShadows} />
            <SliderRow label="Brightness" value={brightness} set={setBrightness} />
            <SliderRow label="Contrast" value={contrast} set={setContrast} />
            <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-2.5">
              <div className="flex-1 min-w-0"><p className="text-sm font-medium text-text-primary">Invert Source</p></div>
              <Toggle checked={invert} onChange={setInvert} />
            </div>
          </Section>

          {/* Image Effects */}
          <Section title="Image Effects" icon={<ImageIcon className="h-3 w-3" />}>
            <SliderRow label="Blur" value={blur} set={setBlur} min={0} max={20} />
            <SliderRow label="Grain" value={grain} set={setGrain} min={0} max={100} />
            <SliderRow label="Posterize" value={posterize} set={setPosterize} min={0} max={16} step={1} />
            <SliderRow label="Pixelate" value={pixelate} set={setPixelate} min={1} max={20} step={1} />
          </Section>

          {/* Pattern Controls — only for pattern algorithms */}
          {isPattern && (
          <Section title="Pattern Controls" icon={<Layers className="h-3 w-3" />}>
            <SliderRow label="Spacing" value={scanlineSpacing} set={setScanlineSpacing} min={2} max={20} step={1} />
            {method === "dot-halftone" && <SliderRow label="Dot Size" value={dotSize} set={setDotSize} min={1} max={10} step={0.5} />}
            <SliderRow label="Angle" value={scanlineAngle} set={setScanlineAngle} min={-90} max={90} step={1} />
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
              <select value={colorCount} onChange={(e) => { const v = Number(e.target.value); setColorCount(v); if (v > 0 && palette.length < v) setPalette(Array.from({length:v},(_,i) => i===0?"#000000":i===1?"#ffffff":"#"+Math.floor(Math.random()*16777215).toString(16).padStart(6,"0"))); }} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-accent">
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
                <button onClick={randomizePalette} className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent">
                  <Shuffle className="h-3.5 w-3.5" /> Randomize Palette
                </button>
              </>
            )}
          </Section>

          {/* Export */}
          <Section title="Export" icon={<Download className="h-3 w-3" />}>
            <Field label="PNG Scale">
              <select value={exportScale} onChange={(e) => setExportScale(Number(e.target.value))} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-accent">
                <option value={1}>1x Scale</option>
                <option value={2}>2x Scale</option>
                <option value={3}>3x Scale</option>
                <option value={4}>4x Scale</option>
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
