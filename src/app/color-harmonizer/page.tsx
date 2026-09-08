"use client";

import { useState, useCallback } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Palette, Copy, Check, Download, Shuffle, RotateCcw, ChevronUp, ChevronDown } from "lucide-react";

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hslToRgb(h: number, s: number, l: number): string {
  const hex = hslToHex(h, s, l);
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

type HarmonyType = "complementary" | "analogous" | "triadic" | "split" | "square" | "tetradic" | "monochromatic";

function generateHarmony(hex: string, type: HarmonyType): { hex: string; hsl: string; role: string }[] {
  const [h, s, l] = hexToHsl(hex);
  const base = { hex, hsl: `hsl(${h}, ${s}%, ${l}%)`, role: "Base" };

  const addColor = (dh: number, ds: number, dl: number, role: string) => {
    const nh = (h + dh + 360) % 360;
    const ns = Math.max(0, Math.min(100, s + ds));
    const nl = Math.max(0, Math.min(100, l + dl));
    return { hex: hslToHex(nh, ns, nl), hsl: `hsl(${nh}, ${ns}%, ${nl}%)`, role };
  };

  switch (type) {
    case "complementary":
      return [base, addColor(180, 0, 0, "Complement")];
    case "analogous":
      return [addColor(-30, 0, 0, "Analogous -30°"), base, addColor(30, 0, 0, "Analogous +30°")];
    case "triadic":
      return [base, addColor(120, 0, 0, "Triadic 120°"), addColor(240, 0, 0, "Triadic 240°")];
    case "split":
      return [base, addColor(150, 0, 0, "Split +150°"), addColor(210, 0, 0, "Split +210°")];
    case "square":
      return [base, addColor(90, 0, 0, "Square 90°"), addColor(180, 0, 0, "Square 180°"), addColor(270, 0, 0, "Square 270°")];
    case "tetradic":
      return [addColor(0, 0, 0, "Tetradic 0°"), addColor(60, 0, 0, "Tetradic 60°"), addColor(180, 0, 0, "Tetradic 180°"), addColor(240, 0, 0, "Tetradic 240°")];
    case "monochromatic":
      return [
        addColor(0, 0, -30, "Dark"),
        addColor(0, 0, -15, "Shade"),
        base,
        addColor(0, 0, 15, "Tint"),
        addColor(0, 0, 30, "Light"),
      ];
    default:
      return [base];
  }
}

function ColorWheel({ colors, baseHex }: { colors: { hex: string }[]; baseHex: string }) {
  const [h] = hexToHsl(baseHex);
  return (
    <div className="relative mx-auto h-48 w-48">
      <svg viewBox="0 0 200 200" className="h-full w-full">
        <defs>
          {Array.from({ length: 360 }, (_, i) => (
            <stop key={i} offset={`${(i / 360) * 100}%`} stopColor={`hsl(${i}, 70%, 55%)`} />
          )).reduce((acc, stop, i, arr) => {
            if (i % 10 === 0) acc.push(stop);
            return acc;
          }, [] as React.ReactElement[])}
        </defs>
        <circle cx="100" cy="100" r="90" fill="none" stroke="var(--border)" strokeWidth="30" />
        <circle cx="100" cy="100" r="90" fill="none" strokeWidth="25" strokeDasharray="1 1.5" opacity="0.8">
          <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="120s" repeatCount="indefinite" />
        </circle>
        {colors.map((c, i) => {
          const [ch] = hexToHsl(c.hex);
          const rad = ((ch - 90) * Math.PI) / 180;
          const x = 100 + 75 * Math.cos(rad);
          const y = 100 + 75 * Math.sin(rad);
          const isBase = c.hex === baseHex;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={isBase ? 14 : 10} fill={c.hex} stroke="white" strokeWidth="3" className="drop-shadow-md" />
              {isBase && <circle cx={x} cy={y} r={17} fill="none" stroke={c.hex} strokeWidth="2" strokeDasharray="4 2" />}
            </g>
          );
        })}
        <line x1="100" y1="100" x2={100 + 75 * Math.cos(((h - 90) * Math.PI) / 180)} y2={100 + 75 * Math.sin(((h - 90) * Math.PI) / 180)} stroke="var(--accent)" strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />
      </svg>
    </div>
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

export default function ColorHarmonizerPage() {
  const [baseColor, setBaseColor] = useState("#0d9488");
  const [harmony, setHarmony] = useState<HarmonyType>("complementary");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const colors = generateHarmony(baseColor, harmony);

  const copyColor = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const exportCSS = () => {
    const css = `:root {\n${colors.map((c, i) => `  --harmony-${i + 1}: ${c.hex};`).join("\n")}\n}`;
    const blob = new Blob([css], { type: "text/css" });
    const link = document.createElement("a");
    link.download = `color-harmony-${harmony}.css`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const randomize = () => {
    setBaseColor("#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0"));
  };

  return (
    <ToolLayout>
      <main className="flex flex-1 flex-col overflow-hidden min-h-0">
        <div className="flex items-center gap-3 border-b border-border bg-bg px-5 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10"><Palette className="h-4 w-4 text-accent" /></div>
          <div>
            <h1 className="text-sm font-semibold text-text-primary">Color Harmonizer</h1>
            <p className="text-[11px] text-text-muted">Generate harmonious color schemes for your designs</p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center overflow-auto p-8" style={{ backgroundColor: "#f1f5f9" }}>
          <div className="w-full max-w-3xl space-y-8">
            {/* Color Wheel */}
            <div className="flex justify-center">
              <ColorWheel colors={colors} baseHex={baseColor} />
            </div>

            {/* Color Strip */}
            <div className="flex gap-3">
              {colors.map((c, i) => (
                <div key={i} className="flex-1 group">
                  <div className="relative h-24 rounded-xl shadow-md transition-transform hover:scale-105 cursor-pointer" style={{ backgroundColor: c.hex }}
                    onClick={() => copyColor(c.hex, i)}>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-xl">
                      {copiedIdx === i ? <Check className="h-5 w-5 text-white" /> : <Copy className="h-5 w-5 text-white" />}
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-xs font-semibold text-text-primary">{c.hex}</p>
                    <p className="text-[10px] text-text-muted">{c.role}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Color Details */}
            <div className="rounded-xl border border-border bg-surface p-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {colors.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-2">
                    <div className="h-10 w-10 shrink-0 rounded-lg shadow-sm" style={{ backgroundColor: c.hex }} />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-text-primary">{c.hex}</p>
                      <p className="truncate text-[10px] text-text-muted">{c.hsl}</p>
                      <p className="text-[10px] text-text-muted">{c.role}</p>
                    </div>
                    <button onClick={() => copyColor(c.hex, i)} className="ml-auto shrink-0 rounded p-1 text-text-muted hover:text-accent">
                      {copiedIdx === i ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <aside className="hidden w-[280px] shrink-0 flex-col overflow-y-auto min-h-0 border-l border-border bg-bg-secondary lg:flex">
        <div className="p-4">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-text-primary">Settings</h2>
            <p className="text-[11px] text-text-muted">Base color, harmony type & export</p>
          </div>

          <Section title="Base Color" icon={<Palette className="h-3 w-3" />}>
            <div className="flex items-center gap-3">
              <label className="relative cursor-pointer">
                <div className="h-12 w-12 rounded-xl border-2 border-border shadow-sm" style={{ backgroundColor: baseColor }} />
                <input type="color" value={baseColor} onChange={(e) => setBaseColor(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" />
              </label>
              <div className="flex-1">
                <input type="text" value={baseColor} onChange={(e) => { if (/^#[0-9a-f]{6}$/i.test(e.target.value)) setBaseColor(e.target.value); }}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm text-text-primary outline-none transition-colors focus:border-accent" />
                <p className="mt-1 text-[10px] text-text-muted">{hslToRgb(...hexToHsl(baseColor))}</p>
              </div>
            </div>
            <button onClick={randomize} className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent">
              <Shuffle className="h-3.5 w-3.5" /> Random Color
            </button>
          </Section>

          <Section title="Harmony Type" icon={<Palette className="h-3 w-3" />}>
            <div className="grid grid-cols-2 gap-1.5">
              {([
                { id: "complementary" as const, label: "Complementary" },
                { id: "analogous" as const, label: "Analogous" },
                { id: "triadic" as const, label: "Triadic" },
                { id: "split" as const, label: "Split" },
                { id: "square" as const, label: "Square" },
                { id: "tetradic" as const, label: "Tetradic" },
                { id: "monochromatic" as const, label: "Monochrome" },
              ]).map(h => (
                <button key={h.id} onClick={() => setHarmony(h.id)}
                  className={`rounded-lg border px-2 py-1.5 text-[11px] font-semibold transition-all ${harmony === h.id ? "border-accent bg-accent text-white" : "border-border bg-surface text-text-secondary hover:border-text-muted"}`}>
                  {h.label}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Export" icon={<Download className="h-3 w-3" />}>
            <button onClick={exportCSS} className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover">
              <Download className="h-4 w-4" /> Download CSS
            </button>
            <button onClick={() => {
              const css = colors.map(c => c.hex).join(", ");
              navigator.clipboard.writeText(css);
            }} className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-xs font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent">
              <Copy className="h-3.5 w-3.5" /> Copy All Hex
            </button>
          </Section>
        </div>
      </aside>
    </ToolLayout>
  );
}
