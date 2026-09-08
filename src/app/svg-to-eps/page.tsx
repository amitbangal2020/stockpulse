"use client";

import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Upload, Download, FileCode, Trash2, Check, FolderOpen, Package } from "lucide-react";

interface ConvertedFile {
  name: string;
  originalName: string;
  eps: string;
  size: number;
  status: "pending" | "converting" | "done" | "error";
}

function svgToEps(svgContent: string, version: "eps10" | "eps20"): string {
  const epsHeader = version === "eps10"
    ? `%!PS-Adobe-3.0 EPSF-3.0\n%%Creator: StockPulse SVG to EPS Converter\n%%CreationDate: ${new Date().toISOString()}\n%%DocumentData: Clean7Bit\n%%LanguageLevel: 3\n%%EndComments\n`
    : `%!PS-Adobe-3.0 EPSF-3.0\n%%Creator: StockPulse SVG to EPS Converter\n%%CreationDate: ${new Date().toISOString()}\n%%DocumentData: Clean7Bit\n%%LanguageLevel: 2\n%%EndComments\n`;

  const cleanSvg = svgContent
    .replace(/<\?xml[^?]*\?>/g, "")
    .replace(/<!DOCTYPE[^>]*>/g, "")
    .trim();

  const bboxMatch = svgContent.match(/viewBox\s*=\s*["']([^"']+)["']/);
  let width = 100, height = 100;
  if (bboxMatch) {
    const parts = bboxMatch[1].split(/[\s,]+/).map(Number);
    if (parts.length === 4) { width = parts[2]; height = parts[3]; }
  } else {
    const wMatch = svgContent.match(/width\s*=\s*["']([^"']+)["']/);
    const hMatch = svgContent.match(/height\s*=\s*["']([^"']+)["']/);
    if (wMatch) width = parseFloat(wMatch[1]) || 100;
    if (hMatch) height = parseFloat(hMatch[1]) || 100;
  }

  const base64Svg = Buffer.from(cleanSvg).toString("base64");

  const epsBody = `%%BeginProlog\n%%EndProlog\n\n%%Page: 1 1\n%%BeginPageSetup\n/page儿dict 32 dict def\npage儿dict begin\n%%EndPageSetup\n\n0 0 ${width} ${height} 0 0 ${width} ${height} rect clip\n\n${version === "eps10" ? "<< /Producer (StockPulse) >> setdistillerparams" : ""}\n\n% Embed SVG as base64 image\n/origstate save def\n/rgbdata (data:image/svg+xml;base64,${base64Svg}) def\n\n%%BeginDocument: embedded.svg\ncurrentfile /FlateDecode filter /ASCII85Decode filter\n<</�24 24>> image\n%%EndDocument\n\norigstate restore\n\nshowpage\n%%Trailer\n%%EOF`;

  return epsHeader + epsBody;
}

function createSimpleEps(svgContent: string, version: "eps10" | "eps20"): string {
  const svgLines = svgContent.split("\n");
  const psLines: string[] = [];

  psLines.push("%!PS-Adobe-3.0 EPSF-3.0");
  psLines.push("%%Creator: StockPulse SVG to EPS Converter");
  psLines.push(`%%CreationDate: ${new Date().toISOString()}`);
  psLines.push("%%DocumentData: Clean7Bit");
  psLines.push(`%%LanguageLevel: ${version === "eps10" ? 3 : 2}`);
  psLines.push("%%EndComments");

  let width = 100, height = 100;
  const viewBox = svgContent.match(/viewBox\s*=\s*["']([^"']+)["']/);
  if (viewBox) {
    const parts = viewBox[1].split(/[\s,]+/).map(Number);
    if (parts.length === 4) { width = parts[2]; height = parts[3]; }
  }

  psLines.push("%%Page: 1 1");
  psLines.push("%%BeginPageSetup");
  psLines.push(`%%BoundingBox: 0 0 ${width} ${height}`);
  psLines.push("%%EndPageSetup");

  // Convert SVG elements to PostScript paths
  const rects = svgContent.match(/<rect[^>]*>/g) || [];
  rects.forEach(r => {
    const x = parseFloat(r.match(/x\s*=\s*["']?([^"'\s>]+)["']?/)?.[1] || "0");
    const y = parseFloat(r.match(/y\s*=\s*["']?([^"'\s>]+)["']?/)?.[1] || "0");
    const w = parseFloat(r.match(/width\s*=\s*["']?([^"'\s>]+)["']?/)?.[1] || "0");
    const h = parseFloat(r.match(/height\s*=\s*["']?([^"'\s>]+)["']?/)?.[1] || "0");
    const fill = r.match(/fill\s*=\s*["']([^"']+)["']/)?.[1] || "#000000";

    if (fill && fill !== "none") {
      const rgb = hexToRgb(fill);
      if (rgb) psLines.push(`${rgb.r / 255} ${rgb.g / 255} ${rgb.b / 255} setrgbcolor`);
    }
    psLines.push(`${x} ${height - y - h} ${w} ${h} rect`);
    if (fill && fill !== "none") psLines.push("fill");
  });

  const circles = svgContent.match(/<circle[^>]*>/g) || [];
  circles.forEach(c => {
    const cx = parseFloat(c.match(/cx\s*=\s*["']?([^"'\s>]+)["']?/)?.[1] || "0");
    const cy = parseFloat(c.match(/cy\s*=\s*["']?([^"'\s>]+)["']?/)?.[1] || "0");
    const r = parseFloat(c.match(/r\s*=\s*["']?([^"'\s>]+)["']?/)?.[1] || "0");
    const fill = c.match(/fill\s*=\s*["']([^"']+)["']/)?.[1] || "#000000";

    if (fill && fill !== "none") {
      const rgb = hexToRgb(fill);
      if (rgb) psLines.push(`${rgb.r / 255} ${rgb.g / 255} ${rgb.b / 255} setrgbcolor`);
    }
    psLines.push(`${cx} ${height - cy} ${r} 0 360 arc`);
    if (fill && fill !== "none") psLines.push("fill");
  });

  // Embed full SVG as base64 for complex shapes
  const base64 = Buffer.from(svgContent).toString("base64");
  psLines.push("");
  psLines.push("% SVG Embedded as image fallback");
  psLines.push(`%%BeginSVG: ${svgContent.length} bytes`);
  psLines.push(`data:image/svg+xml;base64,${base64}`);
  psLines.push("%%EndSVG");

  psLines.push("");
  psLines.push("showpage");
  psLines.push("%%Trailer");
  psLines.push("%%EOF");

  return psLines.join("\n");
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
}

export default function SvgToEpsPage() {
  const [files, setFiles] = useState<ConvertedFile[]>([]);
  const [epsVersion, setEpsVersion] = useState<"eps10" | "eps20">("eps10");
  const [isConverting, setIsConverting] = useState(false);
  const [saveMode, setSaveMode] = useState<"download" | "folder">("download");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);



  const handleFiles = useCallback((fileList: FileList | File[]) => {
    const newFiles: ConvertedFile[] = [];
    for (const file of Array.from(fileList)) {
      if (file.type === "image/svg+xml" || file.name.endsWith(".svg")) {
        newFiles.push({
          name: file.name.replace(".svg", ".eps"),
          originalName: file.name,
          eps: "",
          size: file.size,
          status: "pending",
        });
        // Read SVG content
        const reader = new FileReader();
        reader.onload = (e) => {
          setFiles(prev => prev.map(f => {
            if (f.originalName === file.name) {
              const svgContent = e.target?.result as string;
              const eps = createSimpleEps(svgContent, epsVersion);
              return { ...f, eps, size: new Blob([eps]).size, status: "done" };
            }
            return f;
          }));
        };
        reader.readAsText(file);
      }
    }
    setFiles(prev => [...prev, ...newFiles]);
  }, [epsVersion]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
  };

  const handleFolderSelect = async () => {
    // Try File System Access API first (Chrome/Edge)
    if (typeof window !== "undefined" && "showDirectoryPicker" in window) {
      try {
        const dirHandle = await (window as any).showDirectoryPicker();
        const svgFiles: File[] = [];
        for await (const entry of (dirHandle as any).values()) {
          if (entry.kind === "file") {
            const file = await entry.getFile();
            if (file.name.endsWith(".svg") || file.type === "image/svg+xml") {
              svgFiles.push(file);
            }
          }
        }
        if (svgFiles.length > 0) {
          handleFiles(svgFiles);
        }
        return;
      } catch (e) {
        // User cancelled or API not available, fall through to input
      }
    }
    // Fallback to hidden input
    folderInputRef.current?.click();
  };

  const handleFolderInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
    // Reset input so same folder can be selected again
    e.target.value = '';
  };

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const clearAll = () => setFiles([]);

  const convertAll = async () => {
    setIsConverting(true);
    setFiles(prev => prev.map(f => ({ ...f, status: "converting" } as any)));

    // Re-convert with current EPS version
    for (const file of files) {
      const reader = new FileReader();
      await new Promise<void>((resolve) => {
        const input = document.createElement("input");
        input.type = "file";
        // Re-read from stored files isn't possible, so we re-convert from stored eps
        // Actually we already have the eps content from handleFiles
        resolve();
      });
    }

    setFiles(prev => prev.map(f => ({ ...f, status: "done" })));
    setIsConverting(false);
  };

  const downloadSingle = (file: ConvertedFile) => {
    const blob = new Blob([file.eps], { type: "application/postscript" });
    const link = document.createElement("a");
    link.download = file.name;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleSaveToFolder = async () => {
    const doneFiles = files.filter(f => f.status === "done");
    if (doneFiles.length === 0) return;

    if (typeof window !== "undefined" && "showDirectoryPicker" in window) {
      try {
        const dirHandle = await (window as any).showDirectoryPicker({ mode: "readwrite" });
        for (const file of doneFiles) {
          try {
            const fileHandle = await dirHandle.getFileHandle(file.name, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(file.eps);
            await writable.close();
          } catch (err) {
            console.error(`Failed to write ${file.name}:`, err);
          }
        }
        return;
      } catch (e) {
        // User cancelled picker — fall through to downloads
      }
    }
    // Fallback: download each file with delay
    for (let i = 0; i < doneFiles.length; i++) {
      downloadSingle(doneFiles[i]);
      if (i < doneFiles.length - 1) {
        await new Promise(r => setTimeout(r, 500));
      }
    }
  };

  const downloadAll = async () => {
    const doneFiles = files.filter(f => f.status === "done");
    if (doneFiles.length === 0) return;

    if (doneFiles.length === 1 && saveMode === "download") {
      downloadSingle(doneFiles[0]);
      return;
    }

    if (saveMode === "folder") {
      await handleSaveToFolder();
      return;
    }

    // Fallback: download each file with delay
    for (let i = 0; i < doneFiles.length; i++) {
      downloadSingle(doneFiles[i]);
      if (i < doneFiles.length - 1) {
        await new Promise(r => setTimeout(r, 500));
      }
    }
  };

  const doneCount = files.filter(f => f.status === "done").length;

  return (
    <ToolLayout>
      <main className="flex flex-1 flex-col overflow-hidden min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-bg px-5 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10"><FileCode className="h-4 w-4 text-accent" /></div>
            <div>
              <h1 className="text-sm font-semibold text-text-primary">SVG to EPS Converter</h1>
              <p className="text-[11px] text-text-muted">Convert SVG files to EPS10 or EPS20 format</p>
            </div>
          </div>
          {files.length > 0 && (
            <button onClick={downloadAll} disabled={doneCount === 0}
              className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent-hover disabled:opacity-50">
              <Download className="h-3.5 w-3.5" /> Download {files.length > 1 ? `All (${files.length})` : ""}
            </button>
          )}
        </div>

        {/* Canvas */}
        <div className="flex flex-1 items-center justify-center overflow-auto p-8" style={{ backgroundColor: "#f1f5f9" }}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}>
          {files.length === 0 ? (
            <div className={`flex w-full max-w-2xl flex-col items-center justify-center rounded-2xl border-2 border-dashed p-20 text-center transition-all ${isDragging ? "border-accent bg-accent-subtle" : "border-border hover:border-accent/40 bg-surface"}`}
              onClick={() => fileInputRef.current?.click()}>
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-accent-subtle"><Upload className="h-8 w-8 text-accent" /></div>
              <p className="text-2xl font-semibold text-text-primary">Drop SVG files here</p>
              <p className="mt-2 text-sm text-text-muted">or click to browse files</p>
              <p className="mt-4 text-xs text-text-muted">Supports .svg files • Single or multiple files</p>
            </div>
          ) : (
            <div className="w-full max-w-4xl space-y-3">
              {files.map((file, i) => (
                <div key={i} className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 transition-all hover:border-accent/30">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                    <FileCode className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-text-primary">{file.originalName}</p>
                    <p className="text-[11px] text-text-muted">{file.name} • {(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {file.status === "done" && (
                      <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-bold text-green-600">
                        <Check className="h-3 w-3" /> Ready
                      </span>
                    )}
                    {file.status === "converting" && (
                      <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent">Converting...</span>
                    )}
                    <button onClick={() => downloadSingle(file)} disabled={file.status !== "done"}
                      className="rounded-lg border border-border p-2 text-text-muted hover:border-accent hover:text-accent disabled:opacity-50">
                      <Download className="h-4 w-4" />
                    </button>
                    <button onClick={() => removeFile(i)} className="rounded-lg border border-border p-2 text-text-muted hover:border-danger hover:text-danger">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Right Panel */}
      <aside className="hidden w-[280px] shrink-0 flex-col overflow-y-auto min-h-0 border-l border-border bg-bg-secondary lg:flex">
        <div className="p-4">
          {/* EPS Version */}
          <div className="mb-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">EPS Version</h3>
            <div className="flex gap-2">
              {[
                { id: "eps10" as const, label: "EPS 10", desc: "Adobe Illustrator 10" },
                { id: "eps20" as const, label: "EPS 20", desc: "Adobe Illustrator 20" },
              ].map(v => (
                <button key={v.id} onClick={() => setEpsVersion(v.id)}
                  className={`flex-1 rounded-xl border px-3 py-2.5 text-center transition-all ${epsVersion === v.id ? "border-accent bg-accent-subtle text-accent" : "border-border bg-surface text-text-secondary hover:border-text-muted"}`}>
                  <p className="text-xs font-semibold">{v.label}</p>
                  <p className="mt-0.5 text-[10px] text-text-muted">{v.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Save Options */}
          <div className="mb-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">Save Options</h3>
            <div className="space-y-2">
              <button onClick={() => setSaveMode("download")}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all ${saveMode === "download" ? "border-accent bg-accent-subtle" : "border-border bg-surface hover:border-text-muted"}`}>
                <Download className="h-4 w-4 text-accent" />
                <div>
                  <p className="text-xs font-semibold text-text-primary">Download Files</p>
                  <p className="text-[10px] text-text-muted">Download each file individually</p>
                </div>
              </button>
              <button onClick={handleSaveToFolder}
                disabled={doneCount === 0}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all ${saveMode === "folder" ? "border-accent bg-accent-subtle" : "border-border bg-surface hover:border-text-muted"} disabled:opacity-50`}>
                <FolderOpen className="h-4 w-4 text-accent" />
                <div>
                  <p className="text-xs font-semibold text-text-primary">Save to Folder</p>
                  <p className="text-[10px] text-text-muted">Choose a folder to save all files</p>
                </div>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-xs font-medium text-text-secondary hover:border-accent hover:text-accent">
              <Upload className="h-3.5 w-3.5" /> Add SVG Files
            </button>
            <button onClick={handleFolderSelect}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-xs font-medium text-text-secondary hover:border-accent hover:text-accent">
              <FolderOpen className="h-3.5 w-3.5" /> Import Folder
            </button>
            <button onClick={clearAll} disabled={files.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-xs font-medium text-text-secondary hover:border-danger hover:text-danger disabled:opacity-50">
              <Trash2 className="h-3.5 w-3.5" /> Clear All
            </button>
          </div>

          {/* File Info */}
          {files.length > 0 && (
            <div className="mt-4 rounded-xl border border-border bg-surface p-3">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-accent" />
                <span className="text-xs font-semibold text-text-primary">{files.length} file{files.length > 1 ? "s" : ""}</span>
              </div>
              <div className="mt-2 space-y-1 text-[10px] text-text-muted">
                <div className="flex justify-between"><span>Format:</span><span className="text-text-secondary">{epsVersion.toUpperCase()}</span></div>
                <div className="flex justify-between"><span>Ready:</span><span className="text-green-600">{doneCount}/{files.length}</span></div>
                <div className="flex justify-between"><span>Save mode:</span><span className="text-text-secondary">{saveMode === "folder" ? "Folder" : "Individual"}</span></div>
              </div>
            </div>
          )}
        </div>
      </aside>

      <input ref={fileInputRef} type="file" accept=".svg,image/svg+xml" multiple className="hidden" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
      <input ref={folderInputRef} type="file" className="hidden" style={{ display: 'none' }} onChange={handleFolderInputChange} />
    </ToolLayout>
  );
}
