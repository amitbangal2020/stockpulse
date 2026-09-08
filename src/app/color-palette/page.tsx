"use client";

import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Upload, Copy, Download, Shuffle, Trash2, Check, Palette } from "lucide-react";

interface ExtractedColor {
  hex: string;
  rgb: string;
  name: string;
  percentage: number;
}

function getHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
}

function getColorName(r: number, g: number, b: number): string {
  const hsl = rgbToHsl(r, g, b);
  const h = hsl[0], s = hsl[1], l = hsl[2];
  if (s < 10) {
    if (l < 15) return "Black";
    if (l < 30) return "Dark Gray";
    if (l < 60) return "Gray";
    if (l < 85) return "Light Gray";
    return "White";
  }
  let name = "";
  if (l < 25) name = "Dark ";
  else if (l > 75) name = "Light ";
  if (h < 15) name += "Red";
  else if (h < 40) name += "Orange";
  else if (h < 65) name += "Yellow";
  else if (h < 150) name += "Green";
  else if (h < 195) name += "Cyan";
  else if (h < 260) name += "Blue";
  else if (h < 290) name += "Purple";
  else if (h < 340) name += "Pink";
  else name += "Red";
  return name;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
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

function extractColors(imageData: ImageData, numColors: number): ExtractedColor[] {
  const data = imageData.data;
  const colorMap = new Map<string, { r: number; g: number; b: number; count: number }>();

  // Sample every 5th pixel for performance
  for (let i = 0; i < data.length; i += 20) {
    const r = Math.round(data[i] / 32) * 32;
    const g = Math.round(data[i + 1] / 32) * 32;
    const b = Math.round(data[i + 2] / 32) * 32;
    const key = `${r},${g},${b}`;
    const existing = colorMap.get(key) || { r, g, b, count: 0 };
    existing.count++;
    colorMap.set(key, existing);
  }

  const sorted = Array.from(colorMap.values()).sort((a, b) => b.count - a.count);
  const totalPixels = sorted.reduce((sum, c) => sum + c.count, 0);

  // Merge similar colors
  const merged: { r: number; g: number; b: number; count: number }[] = [];
  for (const color of sorted) {
    if (merged.length >= numColors) break;
    const isSimilar = merged.some(m => {
      const dist = Math.sqrt((m.r - color.r) ** 2 + (m.g - color.g) ** 2 + (m.b - color.b) ** 2);
      return dist < 60;
    });
    if (!isSimilar) merged.push(color);
  }

  return merged.slice(0, numColors).map(c => ({
    hex: getHex(c.r, c.g, c.b),
    rgb: `rgb(${c.r}, ${c.g}, ${c.b})`,
    name: getColorName(c.r, c.g, c.b),
    percentage: Math.round((c.count / totalPixels) * 100),
  }));
}

export default function ColorPalettePage() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState("");
  const [colors, setColors] = useState<ExtractedColor[]>([]);
  const [numColors, setNumColors] = useState(6);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [extracted, setExtracted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setFileName(file.name);
    const img = new window.Image();
    img.onload = () => {
      setImage(img);
      setExtracted(false);
      setColors([]);
    };
    img.src = URL.createObjectURL(file);
  };

  const doExtract = useCallback(() => {
    if (!image || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const maxDim = 200;
    const scale = Math.min(maxDim / image.width, maxDim / image.height, 1);
    canvas.width = image.width * scale;
    canvas.height = image.height * scale;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const extracted = extractColors(imgData, numColors);
    setColors(extracted);
    setExtracted(true);
  }, [image, numColors]);

  const copyColor = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const randomize = () => {
    if (colors.length === 0) return;
    setColors(prev => [...prev].sort(() => Math.random() - 0.5));
  };

  return (
    <ToolLayout>
      <main className="flex flex-1 flex-col overflow-hidden min-h-0">
        <div className="flex items-center gap-3 border-b border-border bg-bg px-5 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10"><Palette className="h-4 w-4 text-accent" /></div>
          <div>
            <h1 className="text-sm font-semibold text-text-primary">Color Palette</h1>
            <p className="text-[11px] text-text-muted">Extract and pick colors from images</p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center overflow-auto p-8" style={{ backgroundColor: "#f1f5f9" }}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}>
          {!image ? (
            <div className={`flex w-full max-w-2xl flex-col items-center justify-center rounded-2xl border-2 border-dashed p-20 text-center transition-all ${isDragging ? "border-accent bg-accent-subtle" : "border-border hover:border-accent/40 bg-surface"}`}
              onClick={() => fileInputRef.current?.click()}>
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-accent-subtle"><Upload className="h-8 w-8 text-accent" /></div>
              <p className="text-2xl font-semibold text-text-primary">Image color picker</p>
              <p className="mt-2 text-sm text-text-muted">Extract beautiful color palettes from your photos instantly.</p>
              <p className="mt-4 text-xs text-text-muted">Drop your image here or click to browse</p>
            </div>
          ) : (
            <div className="w-full max-w-4xl">
              <div className="mb-6 rounded-xl border border-border bg-surface p-4">
                <img src={image.src} alt="" className="mx-auto max-h-64 rounded-lg object-contain" />
                <p className="mt-2 text-center text-xs text-text-muted">{fileName}</p>
              </div>

              {colors.length > 0 && (
                <div className="space-y-4">
                  <div className="flex gap-2">
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
                          <p className="text-[10px] text-text-muted">{c.name} · {c.percentage}%</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 rounded-xl border border-border bg-surface p-3">
                    {colors.map((c, i) => (
                      <div key={i} className="flex-1 text-center">
                        <p className="text-[10px] text-text-muted">{c.hex}</p>
                        <p className="text-[10px] text-text-muted">{c.rgb}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <aside className="hidden w-[280px] shrink-0 flex-col overflow-y-auto min-h-0 border-l border-border bg-bg-secondary lg:flex">
        <div className="p-4">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-text-primary">Settings</h2>
            <p className="text-[11px] text-text-muted">Extract colors & manage palette</p>
          </div>
          <Section title="Settings" icon={<Palette className="h-3 w-3" />}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">Number of Colors</span>
              <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold text-accent">{numColors}</span>
            </div>
            <input type="range" min={3} max={12} value={numColors} onChange={(e) => setNumColors(Number(e.target.value))} className="w-full" style={{ background: `linear-gradient(to right, var(--accent) ${((numColors - 3) / 9) * 100}%, var(--border) ${((numColors - 3) / 9) * 100}%)` }} />
          </Section>

          <div className="mb-4 space-y-2">
            <button onClick={doExtract} disabled={!image} className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-50">
              <Palette className="h-4 w-4" /> Extract Colors
            </button>
            <button onClick={randomize} disabled={colors.length === 0} className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-medium text-text-secondary hover:border-accent hover:text-accent disabled:opacity-50">
              <Shuffle className="h-3.5 w-3.5" /> Shuffle
            </button>
            <button onClick={() => { setImage(null); setColors([]); setFileName(""); setExtracted(false); }} disabled={!image} className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-medium text-text-secondary hover:border-danger hover:text-danger disabled:opacity-50">
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </button>
          </div>

          {colors.length > 0 && (
            <Section title="Palette" icon={<Palette className="h-3 w-3" />}>
              <div className="space-y-1.5">
                {colors.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2 py-1.5">
                    <div className="h-6 w-6 rounded-md shadow-sm" style={{ backgroundColor: c.hex }} />
                    <span className="flex-1 text-[11px] font-medium text-text-primary">{c.hex}</span>
                    <button onClick={() => copyColor(c.hex, i)} className="rounded p-1 text-text-muted hover:text-accent">
                      {copiedIdx === i ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {colors.length > 0 && (
            <Section title="CSS Variables" icon={<Copy className="h-3 w-3" />}>
              <div className="rounded-lg bg-bg p-3 font-mono text-[10px] text-text-secondary">
                <p className="text-text-muted">:root {"{"}</p>
                {colors.map((c, i) => (
                  <p key={i}>  --color-{i + 1}: {c.hex};</p>
                ))}
                <p>{"}"}</p>
              </div>
              <button onClick={() => {
                const css = `:root {\n${colors.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join("\n")}\n}`;
                navigator.clipboard.writeText(css);
              }} className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-medium text-text-secondary hover:border-accent hover:text-accent">
                <Copy className="h-3.5 w-3.5" /> Copy CSS
              </button>
            </Section>
          )}
        </div>
      </aside>

      <canvas ref={canvasRef} className="hidden" />
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
    </ToolLayout>
  );
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-accent">{icon}{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
