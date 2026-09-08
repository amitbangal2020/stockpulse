"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import {
  Upload, Download, Monitor, Smartphone, Tablet, CreditCard,
  FileImage, RotateCcw, Palette, Sun, Moon, Zap, Copy, Check,
  ChevronDown, ChevronUp, Maximize2, Move, Image as ImageIcon,
  Square, BookOpen, ShoppingBag, MonitorPlay,
} from "lucide-react";

// ─── Types ───
type DeviceType = "iphone" | "ipad" | "macbook" | "imac" | "card" | "poster" | "book" | "bag" | "monitor" | "tv";

interface MockupConfig {
  id: DeviceType;
  label: string;
  icon: React.ReactNode;
  width: number;
  height: number;
  screenX: number;
  screenY: number;
  screenW: number;
  screenH: number;
  borderRadius: number;
  color: string;
  hasShadow: boolean;
}

const MOCKUP_CONFIGS: MockupConfig[] = [
  { id: "iphone", label: "iPhone", icon: <Smartphone className="h-4 w-4" />, width: 280, height: 560, screenX: 18, screenY: 45, screenW: 244, screenH: 470, borderRadius: 36, color: "#1a1a2e", hasShadow: true },
  { id: "ipad", label: "iPad", icon: <Tablet className="h-4 w-4" />, width: 480, height: 380, screenX: 22, screenY: 22, screenW: 436, screenH: 336, borderRadius: 18, color: "#1a1a2e", hasShadow: true },
  { id: "macbook", label: "MacBook", icon: <Monitor className="h-4 w-4" />, width: 560, height: 400, screenX: 30, screenY: 15, screenW: 500, screenH: 310, borderRadius: 12, color: "#c0c0c0", hasShadow: true },
  { id: "imac", label: "iMac", icon: <MonitorPlay className="h-4 w-4" />, width: 480, height: 440, screenX: 25, screenY: 10, screenW: 430, screenH: 290, borderRadius: 10, color: "#d4d4d8", hasShadow: true },
  { id: "monitor", label: "Monitor", icon: <Monitor className="h-4 w-4" />, width: 520, height: 380, screenX: 15, screenY: 10, screenW: 490, screenH: 290, borderRadius: 8, color: "#27272a", hasShadow: true },
  { id: "tv", label: "TV Screen", icon: <MonitorPlay className="h-4 w-4" />, width: 580, height: 360, screenX: 12, screenY: 12, screenW: 556, screenH: 300, borderRadius: 6, color: "#18181b", hasShadow: true },
  { id: "card", label: "Business Card", icon: <CreditCard className="h-4 w-4" />, width: 480, height: 280, screenX: 0, screenY: 0, screenW: 480, screenH: 280, borderRadius: 12, color: "#ffffff", hasShadow: true },
  { id: "poster", label: "Poster", icon: <FileImage className="h-4 w-4" />, width: 360, height: 500, screenX: 0, screenY: 0, screenW: 360, screenH: 500, borderRadius: 4, color: "#ffffff", hasShadow: true },
  { id: "book", label: "Book Cover", icon: <BookOpen className="h-4 w-4" />, width: 340, height: 480, screenX: 0, screenY: 0, screenW: 340, screenH: 480, borderRadius: 4, color: "#f4f4f5", hasShadow: true },
  { id: "bag", label: "Tote Bag", icon: <ShoppingBag className="h-4 w-4" />, width: 400, height: 420, screenX: 60, screenY: 80, screenW: 280, screenH: 300, borderRadius: 8, color: "#fafaf9", hasShadow: true },
];

const BG_PRESETS = [
  { label: "White", color: "#ffffff" },
  { label: "Light Gray", color: "#f4f4f5" },
  { label: "Dark", color: "#18181b" },
  { label: "Black", color: "#000000" },
  { label: "Soft Blue", color: "#e0f2fe" },
  { label: "Soft Green", color: "#dcfce7" },
  { label: "Soft Pink", color: "#fce7f3" },
  { label: "Gradient 1", color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { label: "Gradient 2", color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  { label: "Gradient 3", color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
  { label: "Gradient 4", color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" },
  { label: "Gradient 5", color: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
];

// ─── Device SVG Renderers ───
function DeviceSVG({ config, imageUrl, bg, shadow, rotation }: {
  config: MockupConfig; imageUrl: string; bg: string; shadow: boolean; rotation: number;
}) {
  const isGradient = bg.startsWith("linear-gradient");

  const renderDevice = () => {
    switch (config.id) {
      case "iphone":
        return (
          <g>
            {/* Body */}
            <rect x="10" y="10" width="260" height="540" rx="42" fill="#1a1a2e" stroke="#333" strokeWidth="2" />
            {/* Screen */}
            <rect x="18" y="45" width="244" height="470" rx="32" fill="#000" />
            {/* Image in screen */}
            {imageUrl && <image href={imageUrl} x="18" y="45" width="244" height="470" preserveAspectRatio="xMidYMid slice" clipPath="url(#iphoneClip)" />}
            {/* Notch */}
            <rect x="95" y="15" width="90" height="22" rx="11" fill="#1a1a2e" />
            <circle cx="140" cy="26" r="4" fill="#333" />
            {/* Home indicator */}
            <rect x="110" y="525" width="60" height="4" rx="2" fill="#333" />
          </g>
        );
      case "ipad":
        return (
          <g>
            <rect x="10" y="10" width="460" height="360" rx="22" fill="#1a1a2e" stroke="#333" strokeWidth="2" />
            <rect x="22" y="22" width="436" height="336" rx="14" fill="#000" />
            {imageUrl && <image href={imageUrl} x="22" y="22" width="436" height="336" preserveAspectRatio="xMidYMid slice" clipPath="url(#ipadClip)" />}
            <circle cx="240" cy="16" r="3" fill="#333" />
          </g>
        );
      case "macbook":
        return (
          <g>
            {/* Screen */}
            <rect x="20" y="5" width="520" height="340" rx="14" fill="#c0c0c0" stroke="#999" strokeWidth="1" />
            <rect x="30" y="15" width="500" height="310" rx="8" fill="#000" />
            {imageUrl && <image href={imageUrl} x="30" y="15" width="500" height="310" preserveAspectRatio="xMidYMid slice" clipPath="url(#macbookClip)" />}
            <circle cx="280" cy="10" r="2" fill="#555" />
            {/* Base */}
            <path d="M 120 345 L 440 345 L 460 380 L 100 380 Z" fill="#d4d4d8" stroke="#bbb" strokeWidth="1" />
            <rect x="230" y="345" width="100" height="5" rx="2" fill="#bbb" />
            {/* Hinge */}
            <rect x="20" y="340" width="520" height="8" rx="2" fill="#999" />
          </g>
        );
      case "imac":
        return (
          <g>
            {/* Screen */}
            <rect x="15" y="5" width="450" height="310" rx="12" fill="#d4d4d8" stroke="#bbb" strokeWidth="1" />
            <rect x="25" y="15" width="430" height="280" rx="6" fill="#000" />
            {imageUrl && <image href={imageUrl} x="25" y="15" width="430" height="280" preserveAspectRatio="xMidYMid slice" clipPath="url(#imacClip)" />}
            {/* Chin */}
            <rect x="25" y="295" width="430" height="20" rx="2" fill="#d4d4d8" />
            <text x="240" y="309" textAnchor="middle" fill="#999" fontSize="8">apple</text>
            {/* Stand */}
            <path d="M 200 315 L 280 315 L 300 380 L 180 380 Z" fill="#d4d4d8" />
            <rect x="160" y="378" width="160" height="8" rx="4" fill="#d4d4d8" stroke="#bbb" strokeWidth="1" />
          </g>
        );
      case "monitor":
        return (
          <g>
            <rect x="10" y="5" width="500" height="310" rx="10" fill="#27272a" stroke="#444" strokeWidth="1" />
            <rect x="15" y="10" width="490" height="290" rx="6" fill="#000" />
            {imageUrl && <image href={imageUrl} x="15" y="10" width="490" height="290" preserveAspectRatio="xMidYMid slice" clipPath="url(#monitorClip)" />}
            <rect x="220" y="315" width="80" height="40" rx="2" fill="#3f3f46" />
            <rect x="180" y="350" width="160" height="8" rx="4" fill="#3f3f46" />
          </g>
        );
      case "tv":
        return (
          <g>
            <rect x="5" y="5" width="570" height="320" rx="8" fill="#18181b" stroke="#333" strokeWidth="2" />
            <rect x="12" y="12" width="556" height="300" rx="4" fill="#000" />
            {imageUrl && <image href={imageUrl} x="12" y="12" width="556" height="300" preserveAspectRatio="xMidYMid slice" clipPath="url(#tvClip)" />}
            <rect x="250" y="330" width="80" height="20" rx="2" fill="#27272a" />
            <rect x="200" y="345" width="180" height="6" rx="3" fill="#27272a" />
          </g>
        );
      case "poster":
        return (
          <g>
            <rect x="5" y="5" width="350" height="490" rx="4" fill={config.color} />
            {imageUrl && <image href={imageUrl} x="5" y="5" width="350" height="490" preserveAspectRatio="xMidYMid slice" clipPath="url(#posterClip)" />}
            <rect x="5" y="5" width="350" height="490" rx="4" fill="none" stroke="#e5e5e5" strokeWidth="1" />
          </g>
        );
      case "book":
        return (
          <g>
            {/* Spine shadow */}
            <rect x="0" y="5" width="8" height="470" rx="2" fill="#d4d4d8" />
            {/* Cover */}
            <rect x="5" y="5" width="330" height="470" rx="4" fill={config.color} stroke="#e5e5e5" strokeWidth="1" />
            {imageUrl && <image href={imageUrl} x="5" y="5" width="330" height="470" preserveAspectRatio="xMidYMid slice" clipPath="url(#bookClip)" />}
            {/* Spine line */}
            <line x1="8" y1="5" x2="8" y2="475" stroke="#ccc" strokeWidth="1" />
          </g>
        );
      case "bag":
        return (
          <g>
            {/* Bag body */}
            <rect x="40" y="100" width="320" height="300" rx="8" fill={config.color} stroke="#d4d4d8" strokeWidth="1" />
            {/* Handles */}
            <path d="M 130 100 Q 130 40 200 40 Q 270 40 270 100" fill="none" stroke="#a1a1aa" strokeWidth="8" strokeLinecap="round" />
            {/* Image area */}
            {imageUrl && <image href={imageUrl} x="80" y="140" width="240" height="240" preserveAspectRatio="xMidYMid slice" clipPath="url(#bagClip)" />}
          </g>
        );
      case "card":
        return (
          <g>
            <rect x="5" y="5" width="470" height="270" rx="12" fill={config.color} stroke="#e5e5e5" strokeWidth="1" />
            {imageUrl && <image href={imageUrl} x="5" y="5" width="470" height="270" preserveAspectRatio="xMidYMid slice" clipPath="url(#cardClip)" />}
          </g>
        );
      default:
        return null;
    }
  };

  const clipPaths = () => (
    <defs>
      <clipPath id="iphoneClip"><rect x="18" y="45" width="244" height="470" rx="32" /></clipPath>
      <clipPath id="ipadClip"><rect x="22" y="22" width="436" height="336" rx="14" /></clipPath>
      <clipPath id="macbookClip"><rect x="30" y="15" width="500" height="310" rx="8" /></clipPath>
      <clipPath id="imacClip"><rect x="25" y="15" width="430" height="280" rx="6" /></clipPath>
      <clipPath id="monitorClip"><rect x="15" y="10" width="490" height="290" rx="6" /></clipPath>
      <clipPath id="tvClip"><rect x="12" y="12" width="556" height="300" rx="4" /></clipPath>
      <clipPath id="posterClip"><rect x="5" y="5" width="350" height="490" rx="4" /></clipPath>
      <clipPath id="bookClip"><rect x="5" y="5" width="330" height="470" rx="4" /></clipPath>
      <clipPath id="bagClip"><rect x="80" y="140" width="240" height="240" rx="4" /></clipPath>
      <clipPath id="cardClip"><rect x="5" y="5" width="470" height="270" rx="12" /></clipPath>
    </defs>
  );

  const viewBox = config.id === "iphone" ? "0 0 280 560" :
    config.id === "ipad" ? "0 0 480 380" :
    config.id === "macbook" ? "0 0 560 395" :
    config.id === "imac" ? "0 0 480 395" :
    config.id === "monitor" ? "0 0 520 370" :
    config.id === "tv" ? "0 0 580 360" :
    config.id === "poster" ? "0 0 360 500" :
    config.id === "book" ? "0 0 340 480" :
    config.id === "bag" ? "0 0 400 420" :
    "0 0 480 280";

  const isGradientBg = bg.startsWith("linear-gradient");
  const gradId = `grad-${config.id}`;

  return (
    <svg
      viewBox={viewBox}
      className="max-h-full max-w-full"
      style={{
        filter: shadow ? "drop-shadow(0 25px 50px rgba(0,0,0,0.25))" : "none",
        transform: `rotate(${rotation}deg)`,
        transition: "transform 0.3s ease, filter 0.3s ease",
      }}
    >
      {isGradientBg && (
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#667eea" />
            <stop offset="100%" stopColor="#764ba2" />
          </linearGradient>
        </defs>
      )}
      {clipPaths()}
      {/* Background */}
      <rect
        x="0" y="0"
        width={viewBox.split(" ")[2]}
        height={viewBox.split(" ")[3]}
        fill={isGradientBg ? `url(#${gradId})` : bg}
        rx="4"
      />
      {renderDevice()}
    </svg>
  );
}

// ─── Main Page ───
export default function MockupGeneratorPage() {
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>("iphone");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [bg, setBg] = useState("#f4f4f5");
  const [shadow, setShadow] = useState(true);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [copied, setCopied] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const config = MOCKUP_CONFIGS.find(c => c.id === selectedDevice)!;

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImageUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleExport = useCallback(() => {
    if (!canvasRef.current) return;
    const svgEl = canvasRef.current.querySelector("svg");
    if (!svgEl) return;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.naturalWidth * 2;
      canvas.height = img.naturalHeight * 2;
      ctx?.scale(2, 2);
      ctx?.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `mockup-${selectedDevice}-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  }, [selectedDevice]);

  return (
    <ToolLayout>
      {/* ─── Middle: Preview ─── */}
      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border bg-bg px-5 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10"><Monitor className="h-4 w-4 text-accent" /></div>
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Mockup Generator</h2>
            <p className="text-[11px] text-text-muted">Professional device mockups</p>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center bg-bg-secondary/30 p-8">
          {imageUrl ? (
            <div ref={canvasRef} className="flex items-center justify-center" style={{ filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)` }}>
              <DeviceSVG config={config} imageUrl={imageUrl} bg={bg} shadow={shadow} rotation={rotation} />
            </div>
          ) : (
            <div className="text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/10 mx-auto"><Monitor className="h-10 w-10 text-accent" /></div>
              <h3 className="mb-1 text-sm font-semibold text-text-primary">Upload Your Design</h3>
              <p className="text-[11px] text-text-muted">Upload an image to see it on the mockup</p>
            </div>
          )}
        </div>
      </main>

      {/* ─── Right: Controls Sidebar (280px) ─── */}
      <aside className="hidden w-[280px] shrink-0 flex-col overflow-y-auto min-h-0 border-l border-border bg-bg-secondary lg:flex">
        <div className="p-4">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-text-primary">Settings</h2>
            <p className="text-[11px] text-text-muted">Device, background & export</p>
          </div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-text-muted">Your Design</label>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          <button onClick={() => fileInputRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface py-6 text-xs font-medium text-text-muted transition-all hover:border-accent/40 hover:text-accent cursor-pointer">
            <Upload className="h-4 w-4" />{imageUrl ? "Change Image" : "Upload Design"}
          </button>
          {imageUrl && (<div className="mt-2 flex items-center gap-2"><div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border"><img src={imageUrl} alt="Preview" className="h-full w-full object-cover" /></div><span className="text-[10px] text-text-muted">Image loaded</span><button onClick={() => setImageUrl("")} className="ml-auto text-text-muted hover:text-red-500"><RotateCcw className="h-3 w-3" /></button></div>)}
          <label className="mt-4 mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-text-muted">Device</label>
          <div className="grid grid-cols-5 gap-1.5">
            {MOCKUP_CONFIGS.map(mc => (<button key={mc.id} onClick={() => setSelectedDevice(mc.id)} className={`flex flex-col items-center gap-1 rounded-lg p-2 text-[9px] font-medium transition-all ${selectedDevice === mc.id ? "bg-accent text-white" : "border border-border bg-surface text-text-secondary hover:border-accent/30"}`}>{mc.icon}<span className="truncate w-full text-center">{mc.label}</span></button>))}
          </div>
          <label className="mt-4 mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-text-muted">Background</label>
          <div className="grid grid-cols-6 gap-1.5">
            {BG_PRESETS.map((preset, i) => (<button key={i} onClick={() => setBg(preset.color)} className={`h-7 w-full rounded-lg border transition-all ${bg === preset.color ? "border-accent ring-1 ring-accent/30" : "border-border"}`} style={{ background: preset.color }} title={preset.label} />))}
          </div>
          <div className="mt-2 flex items-center gap-2"><input type="color" value={bg.startsWith("linear") ? "#ffffff" : bg} onChange={e => setBg(e.target.value)} className="h-7 w-7 cursor-pointer rounded border border-border" /><span className="text-[10px] text-text-muted">Custom color</span></div>
          <label className="mt-4 mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-text-muted">Adjustments</label>
          <div className="space-y-2">
            {[{ label: "Rotation", value: rotation, set: setRotation, min: -180, max: 180, unit: "°" },{ label: "Brightness", value: brightness, set: setBrightness, min: 50, max: 150, unit: "%" },{ label: "Contrast", value: contrast, set: setContrast, min: 50, max: 150, unit: "%" },{ label: "Saturation", value: saturation, set: setSaturation, min: 0, max: 200, unit: "%" }].map(adj => (<div key={adj.label} className="flex items-center gap-3"><span className="w-16 text-[10px] text-text-muted">{adj.label}</span><input type="range" min={adj.min} max={adj.max} value={adj.value} onChange={e => adj.set(Number(e.target.value))} className="flex-1 h-1 rounded-full bg-border accent-[var(--accent)]" /><span className="w-10 text-right text-[10px] font-mono text-text-secondary">{adj.value}{adj.unit}</span></div>))}
          </div>
          <div className="mt-3 flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-2"><span className="text-xs font-medium text-text-primary">Drop Shadow</span><button onClick={() => setShadow(!shadow)} className={`relative h-5 w-9 rounded-full transition-all ${shadow ? "bg-accent" : "bg-border"}`}><span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${shadow ? "left-[18px]" : "left-0.5"}`} /></button></div>
          <button onClick={() => { setRotation(0); setBrightness(100); setContrast(100); setSaturation(100); setShadow(true); setBg("#f4f4f5"); }} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-xs font-medium text-text-secondary transition-all hover:text-accent"><RotateCcw className="h-3.5 w-3.5" /> Reset All</button>
        </div>
        <div className="mt-auto border-t border-border p-4">
          <button onClick={handleExport} className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110"><Download className="h-4 w-4" /> Export PNG (2x)</button>
        </div>
      </aside>
    </ToolLayout>
  );
}
