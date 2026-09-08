"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Upload, Download, Copy, Check, RefreshCw, Type, ChevronUp, ChevronDown } from "lucide-react";

const CHARSETS = {
  standard: " .:-=+*#%@",
  detailed: " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
  simple: " .oO@",
  blocks: " ░▒▓█",
  dots: " ·•●",
  binary: " 01",
};

type CharsetKey = keyof typeof CHARSETS;

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

export default function AsciiVisionPage() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState("");
  const [asciiArt, setAsciiArt] = useState("");
  const [width, setWidth] = useState(100);
  const [charset, setCharset] = useState<CharsetKey>("standard");
  const [invert, setInvert] = useState(false);
  const [colored, setColored] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setFileName(file.name);
    const img = new window.Image();
    img.onload = () => setImage(img);
    img.src = URL.createObjectURL(file);
  };

  const generateAscii = useCallback(() => {
    if (!image || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;

    const ratio = image.height / image.width;
    const cols = width;
    const rows = Math.floor(cols * ratio * 0.55);
    canvas.width = cols;
    canvas.height = rows;
    ctx.drawImage(image, 0, 0, cols, rows);

    const imgData = ctx.getImageData(0, 0, cols, rows);
    const data = imgData.data;
    const chars = CHARSETS[charset];
    const lines: string[] = [];

    for (let y = 0; y < rows; y++) {
      let line = "";
      for (let x = 0; x < cols; x++) {
        const idx = (y * cols + x) * 4;
        const r = data[idx], g = data[idx + 1], b = data[idx + 2];
        let brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        if (invert) brightness = 1 - brightness;
        const charIdx = Math.floor(brightness * (chars.length - 1));
        line += chars[Math.max(0, Math.min(charIdx, chars.length - 1))];
      }
      lines.push(line);
    }

    setAsciiArt(lines.join("\n"));
  }, [image, width, charset, invert]);

  useEffect(() => { generateAscii(); }, [generateAscii]);

  const downloadAscii = () => {
    const blob = new Blob([asciiArt], { type: "text/plain" });
    const link = document.createElement("a");
    link.download = `${fileName.replace(/\.[^.]+$/, "") || "ascii"}.txt`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const copyAscii = async () => {
    await navigator.clipboard.writeText(asciiArt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <ToolLayout>
      <main className="flex flex-1 flex-col overflow-hidden min-h-0">
        <div className="flex items-center gap-3 border-b border-border bg-bg px-5 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10"><Type className="h-4 w-4 text-accent" /></div>
          <div>
            <h1 className="text-sm font-semibold text-text-primary">ASCII Vision</h1>
            <p className="text-[11px] text-text-muted">Convert images to ASCII art</p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center overflow-auto p-6" style={{ backgroundColor: "#f1f5f9" }}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}>
          {!image ? (
            <div className={`flex w-full max-w-2xl flex-col items-center justify-center rounded-2xl border-2 border-dashed p-20 text-center cursor-pointer transition-all ${isDragging ? "border-accent bg-accent-subtle" : "border-border hover:border-accent/40 bg-surface"}`}
              onClick={() => fileInputRef.current?.click()}>
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-accent-subtle"><Upload className="h-8 w-8 text-accent" /></div>
              <p className="text-2xl font-semibold text-text-primary">Drop an image here</p>
              <p className="mt-2 text-sm text-text-muted">or click to browse • JPG, PNG, WEBP, GIF</p>
            </div>
          ) : (
            <div className="w-full max-w-5xl">
              <div className="mb-4 flex items-center gap-3">
                <img src={image.src} alt="" className="h-16 rounded-lg border border-border object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">{fileName}</p>
                  <p className="text-[11px] text-text-muted">{image.width}×{image.height} → {width} chars wide</p>
                </div>
                <button onClick={() => { setImage(null); setAsciiArt(""); setFileName(""); }}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs text-text-secondary hover:border-danger hover:text-danger">
                  Clear
                </button>
              </div>

              <div className="rounded-xl border border-border bg-surface p-1 overflow-auto max-h-[60vh]">
                {colored ? (
                  <pre className="font-mono text-[6px] leading-[6px] sm:text-[7px] sm:leading-[7px] md:text-[8px] md:leading-[8px] p-3 whitespace-pre overflow-auto"
                    style={{ imageRendering: "pixelated" }}>
                    {asciiArt.split("\n").map((line, y) => (
                      <div key={y}>
                        {line.split("").map((char, x) => {
                          if (char === " ") return <span key={x}> </span>;
                          const brightness = CHARSETS[charset].indexOf(char) / (CHARSETS[charset].length - 1);
                          const hue = brightness * 120;
                          return <span key={x} style={{ color: `hsl(${hue}, 70%, ${30 + brightness * 40}%)` }}>{char}</span>;
                        })}
                      </div>
                    ))}
                  </pre>
                ) : (
                  <pre className="font-mono text-[6px] leading-[6px] sm:text-[7px] sm:leading-[7px] md:text-[8px] md:leading-[8px] p-3 whitespace-pre text-text-primary overflow-auto">
                    {asciiArt}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <aside className="hidden w-[280px] shrink-0 flex-col overflow-y-auto min-h-0 border-l border-border bg-bg-secondary lg:flex">
        <div className="p-4">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-text-primary">Settings</h2>
            <p className="text-[11px] text-text-muted">Adjust ASCII output & export</p>
          </div>

          <Section title="Output" icon={<Type className="h-3 w-3" />}>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs text-text-secondary">Width (chars)</span>
                <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold text-accent">{width}</span>
              </div>
              <input type="range" min={30} max={200} value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-full" style={{ background: `linear-gradient(to right, var(--accent) ${((width - 30) / 170) * 100}%, var(--border) ${((width - 30) / 170) * 100}%)` }} />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium tracking-tight text-text-secondary">Character Set</label>
              <select value={charset} onChange={(e) => setCharset(e.target.value as CharsetKey)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-accent">
                {Object.keys(CHARSETS).map(k => (
                  <option key={k} value={k}>{k.charAt(0).toUpperCase() + k.slice(1)}</option>
                ))}
              </select>
              <p className="mt-1 font-mono text-[10px] text-text-muted truncate">{CHARSETS[charset]}</p>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-2.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">Invert</p>
              </div>
              <button onClick={() => setInvert(!invert)} className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${invert ? "bg-accent" : "bg-border"}`}>
                <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${invert ? "translate-x-4" : ""}`} />
              </button>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-2.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">Colored</p>
              </div>
              <button onClick={() => setColored(!colored)} className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${colored ? "bg-accent" : "bg-border"}`}>
                <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${colored ? "translate-x-4" : ""}`} />
              </button>
            </div>
          </Section>

          <Section title="Export" icon={<Download className="h-3 w-3" />}>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={copyAscii} disabled={!asciiArt} className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-[11px] font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent disabled:opacity-50">
                {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />} Copy text
              </button>
              <button onClick={downloadAscii} disabled={!asciiArt} className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-[11px] font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent disabled:opacity-50">
                <Download className="h-3.5 w-3.5" /> Save TXT
              </button>
              <button disabled className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-[11px] font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent disabled:opacity-50">
                <Download className="h-3.5 w-3.5" /> Save PNG
              </button>
              <button disabled className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-[11px] font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent disabled:opacity-50">
                <Copy className="h-3.5 w-3.5" /> Copy PNG
              </button>
            </div>
            <button disabled className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2.5 text-[11px] font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent disabled:opacity-50">
              {'</>'} Save SVG
            </button>
          </Section>

          {asciiArt && (
            <div className="rounded-xl border border-border bg-surface p-3">
              <p className="text-[10px] text-text-muted">Preview</p>
              <pre className="mt-1 font-mono text-[7px] leading-[8px] text-text-primary whitespace-pre overflow-hidden max-h-20">
                {asciiArt.split("\n").slice(0, 10).join("\n")}
              </pre>
            </div>
          )}
        </div>
      </aside>

      <canvas ref={canvasRef} className="hidden" />
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
    </ToolLayout>
  );
}
