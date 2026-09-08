"use client";

import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Download, RefreshCw, Grid3X3, Shuffle, ChevronUp, ChevronDown, LayoutGrid, SlidersHorizontal, Move, Settings } from "lucide-react";

// ─── UI Components ───
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

function SliderRow({ label, value, set, min, max, step = 1 }: { label: string; value: number; set: (v: number) => void; min: number; max: number; step?: number }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 text-xs text-text-secondary">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(Number(e.target.value))} className="flex-1" style={{ background: `linear-gradient(to right, var(--accent) ${pct}%, var(--border) ${pct}%)` }} />
      <span className="w-10 rounded border border-border bg-surface px-2 py-1 text-center text-xs text-text-primary">{value}</span>
    </div>
  );
}

// ─── Grid Layout Generators ───
interface Cell { x: number; y: number; w: number; h: number; shade: number; }

function generateBentoGrid(cols: number, rows: number): Cell[] {
  const cells: Cell[] = [];
  const used = Array.from({ length: rows }, () => Array(cols).fill(false));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (used[r][c]) continue;
      const maxW = Math.min(cols - c, 3);
      const maxH = Math.min(rows - r, 2);
      const w = Math.floor(Math.random() * maxW) + 1;
      const h = Math.floor(Math.random() * maxH) + 1;
      let canPlace = true;
      for (let dr = 0; dr < h && canPlace; dr++)
        for (let dc = 0; dc < w && canPlace; dc++)
          if (r + dr >= rows || c + dc >= cols || used[r + dr][c + dc]) canPlace = false;
      if (canPlace) {
        for (let dr = 0; dr < h; dr++) for (let dc = 0; dc < w; dc++) used[r + dr][c + dc] = true;
        cells.push({ x: c, y: r, w, h, shade: Math.floor(Math.random() * 40) + 55 });
      } else {
        used[r][c] = true;
        cells.push({ x: c, y: r, w: 1, h: 1, shade: Math.floor(Math.random() * 40) + 55 });
      }
    }
  }
  return cells;
}

function generateUniformGrid(cols: number, rows: number): Cell[] {
  const cells: Cell[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      cells.push({ x: c, y: r, w: 1, h: 1, shade: Math.floor(Math.random() * 40) + 55 });
  return cells;
}

function generateMondrian(cols: number, rows: number): Cell[] {
  const cells: Cell[] = [];
  function split(x: number, y: number, w: number, h: number) {
    if (w <= 1 && h <= 1) { cells.push({ x, y, w: 1, h: 1, shade: Math.floor(Math.random() * 70) + 50 }); return; }
    if (Math.random() < 0.3 || w <= 1) { cells.push({ x, y, w, h, shade: Math.floor(Math.random() * 70) + 50 }); return; }
    if (w > h || (w === h && Math.random() > 0.5)) {
      const sp = Math.floor(Math.random() * (w - 1)) + 1;
      split(x, y, sp, h); split(x + sp, y, w - sp, h);
    } else {
      const sp = Math.floor(Math.random() * (h - 1)) + 1;
      split(x, y, w, sp); split(x, y + sp, w, h - sp);
    }
  }
  split(0, 0, cols, rows);
  return cells;
}

function generateMasonry(cols: number, rows: number): Cell[] {
  const heights = Array(cols).fill(0);
  const cells: Cell[] = [];
  for (let i = 0; i < cols * rows; i++) {
    const col = heights.indexOf(Math.min(...heights));
    const h = Math.floor(Math.random() * 2) + 1;
    cells.push({ x: col, y: heights[col], w: 1, h, shade: Math.floor(Math.random() * 40) + 55 });
    heights[col] += h;
  }
  return cells;
}

function generateFibonacci(cols: number, rows: number): Cell[] {
  const fibs = [1, 1, 2, 3, 5, 8];
  const cells: Cell[] = [];
  let x = 0, y = 0;
  for (let i = Math.min(fibs.length - 1, cols); i >= 0; i--) {
    const sz = Math.min(fibs[i], cols - x, rows - y);
    if (sz > 0) {
      cells.push({ x, y, w: sz, h: sz, shade: Math.floor(Math.random() * 40) + 55 });
      x += sz; if (x >= cols) { x = 0; y += sz; }
    }
  }
  return cells;
}

type GridStyle = "bento" | "uniform" | "mondrian" | "masonry" | "fibonacci" | "abstract" | "mosaic" | "partition" | "rectangles" | "recursive";
const GRID_STYLES: { id: GridStyle; label: string }[] = [
  { id: "bento", label: "Bento" }, { id: "uniform", label: "Uniform" },
  { id: "abstract", label: "Abstract" }, { id: "mondrian", label: "Mondrian" },
  { id: "fibonacci", label: "Fibonacci" }, { id: "recursive", label: "Recursive" },
  { id: "masonry", label: "Masonry" }, { id: "mosaic", label: "Mosaic" },
  { id: "partition", label: "Partition" }, { id: "rectangles", label: "Rectangles" },
];

function generateGrid(style: GridStyle, cols: number, rows: number): Cell[] {
  switch (style) {
    case "uniform": return generateUniformGrid(cols, rows);
    case "mondrian": return generateMondrian(cols, rows);
    case "masonry": return generateMasonry(cols, rows);
    case "fibonacci": return generateFibonacci(cols, rows);
    default: return generateBentoGrid(cols, rows);
  }
}

// ─── Main Component ───
export default function BentoBuilderPage() {
  const [gridStyle, setGridStyle] = useState<GridStyle>("bento");
  const [width, setWidth] = useState(400);
  const [height, setHeight] = useState(300);
  const [columns, setColumns] = useState(4);
  const [rows, setRows] = useState(3);
  const [gap, setGap] = useState(8);
  const [margins, setMargins] = useState(20);
  const [radius, setRadius] = useState(8);
  const [complexity, setComplexity] = useState(40);
  const [horizontalBias, setHorizontalBias] = useState(60);
  const [maxColSpan, setMaxColSpan] = useState(4);
  const [maxRowSpan, setMaxRowSpan] = useState(4);
  const [cells, setCells] = useState<Cell[]>(() => generateBentoGrid(4, 3));
  const [seed, setSeed] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);

  const randomize = useCallback(() => {
    setSeed(s => s + 1);
    setCells(generateGrid(gridStyle, columns, rows));
  }, [gridStyle, columns, rows]);

  const exportPNG = useCallback(() => {
    const canvas = document.createElement("canvas");
    canvas.width = width * 2; canvas.height = height * 2;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(2, 2);
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, width, height);

    const cellW = (width - margins * 2 - gap * (columns - 1)) / columns;
    const cellH = (height - margins * 2 - gap * (rows - 1)) / rows;

    cells.forEach((cell) => {
      const x = margins + cell.x * (cellW + gap);
      const y = margins + cell.y * (cellH + gap);
      const w = cell.w * cellW + (cell.w - 1) * gap;
      const h = cell.h * cellH + (cell.h - 1) * gap;
      ctx.fillStyle = `rgb(${cell.shade}, ${cell.shade}, ${cell.shade + 10})`;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, radius);
      ctx.fill();
    });

    const link = document.createElement("a");
    link.download = `bento-${gridStyle}-${width}x${height}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [cells, width, height, columns, rows, gap, margins, radius, gridStyle]);

  const cellW = `calc((100% - ${(columns - 1) * gap}px - ${margins * 2}px) / ${columns})`;
  const cellH = `calc((100% - ${(rows - 1) * gap}px - ${margins * 2}px) / ${rows})`;

  return (
    <ToolLayout>
      <main className="flex flex-1 flex-col overflow-hidden min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-bg px-5 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10"><Grid3X3 className="h-4 w-4 text-accent" /></div>
            <div>
              <h1 className="text-sm font-semibold text-text-primary">Bento Grid Builder</h1>
              <p className="text-[11px] text-text-muted">Design layouts — export PNG, JPG, or SVG</p>
            </div>
          </div>

        </div>

        {/* Canvas */}
        <div className="flex flex-1 items-center justify-center overflow-auto p-8" style={{ backgroundColor: "#f1f5f9" }}>
          <div ref={canvasRef} className="relative bg-white shadow-xl rounded-xl" style={{ width, height, padding: margins }}>
            {cells.map((cell, i) => {
              const innerW = width - margins * 2;
              const innerH = height - margins * 2;
              const cw = (innerW - (columns - 1) * gap) / columns;
              const ch = (innerH - (rows - 1) * gap) / rows;
              return (
                <div key={`${seed}-${i}`} className="absolute transition-all duration-300" style={{
                  left: margins + cell.x * (cw + gap),
                  top: margins + cell.y * (ch + gap),
                  width: cell.w * cw + (cell.w - 1) * gap,
                  height: cell.h * ch + (cell.h - 1) * gap,
                  backgroundColor: `rgb(${cell.shade}, ${cell.shade}, ${cell.shade + 10})`,
                  borderRadius: radius,
                }} />
              );
            })}
          </div>
        </div>
      </main>

      {/* Right Panel */}
      <aside className="hidden w-[280px] shrink-0 flex-col overflow-y-auto min-h-0 border-l border-border bg-bg-secondary lg:flex">
        <div className="p-4">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-text-primary">Settings</h2>
            <p className="text-[11px] text-text-muted">Layout, spacing & export from the header</p>
          </div>

          {/* Grid Style */}
          <Section title="Grid Style" icon={<LayoutGrid className="h-3 w-3" />}>
            <div className="grid grid-cols-2 gap-1.5">
              {GRID_STYLES.map((s) => (
                <button key={s.id} onClick={() => { setGridStyle(s.id); setCells(generateGrid(s.id, columns, rows)); setSeed(seed + 1); }}
                  className={`rounded-lg border px-2 py-1.5 text-[11px] font-semibold transition-all ${gridStyle === s.id ? "border-accent bg-accent text-white" : "border-border bg-surface text-text-secondary hover:border-text-muted"}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </Section>

          {/* Dimensions */}
          <Section title="Dimensions" icon={<SlidersHorizontal className="h-3 w-3" />}>
            <SliderRow label="Width" value={width} set={setWidth} min={200} max={800} step={10} />
            <SliderRow label="Height" value={height} set={setHeight} min={200} max={600} step={10} />
          </Section>

          {/* Grid Layout */}
          <Section title="Grid Layout" icon={<Grid3X3 className="h-3 w-3" />}>
            <SliderRow label="Columns" value={columns} set={(v) => { setColumns(v); setCells(generateGrid(gridStyle, v, rows)); setSeed(seed + 1); }} min={2} max={8} />
            <SliderRow label="Rows" value={rows} set={(v) => { setRows(v); setCells(generateGrid(gridStyle, columns, v)); setSeed(seed + 1); }} min={2} max={8} />
            <button onClick={randomize} className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover">
              <RefreshCw className="h-4 w-4" /> Randomize grid
            </button>
          </Section>

          {/* Spacing & Corners */}
          <Section title="Spacing & Corners" icon={<Move className="h-3 w-3" />}>
            <SliderRow label="Gap" value={gap} set={setGap} min={0} max={30} />
            <SliderRow label="Margins" value={margins} set={setMargins} min={0} max={50} />
            <SliderRow label="Radius" value={radius} set={setRadius} min={0} max={30} />
          </Section>

          {/* Advanced */}
          <Section title="Advanced" icon={<Settings className="h-3 w-3" />}>
            <SliderRow label="Complexity" value={complexity} set={setComplexity} min={10} max={100} />
            <SliderRow label="Horizontal bias" value={horizontalBias} set={setHorizontalBias} min={0} max={100} />
            <SliderRow label="Max col span" value={maxColSpan} set={setMaxColSpan} min={1} max={6} />
            <SliderRow label="Max row span" value={maxRowSpan} set={setMaxRowSpan} min={1} max={4} />
          </Section>

          {/* Export */}
          <Section title="Export" icon={<Download className="h-3 w-3" />}>
            <div>
              <label className="mb-1.5 block text-xs font-medium tracking-tight text-text-secondary">PNG Scale</label>
              <select className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-accent">
                <option value="1">1x Scale</option>
                <option value="2">2x Scale</option>
                <option value="3">3x Scale</option>
                <option value="4">4x Scale</option>
              </select>
            </div>
            <button onClick={exportPNG} className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover">
              <Download className="h-4 w-4" /> Download PNG
            </button>
            <button disabled className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-xs font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent disabled:opacity-50">
              Download SVG (Vector)
            </button>
            <button disabled className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-xs font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent disabled:opacity-50">
              Copy to Clipboard
            </button>
          </Section>
        </div>
      </aside>
    </ToolLayout>
  );
}
