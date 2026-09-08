"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/tool-layout";
import {
  Upload, Play, Square, Video, RefreshCw, FileCode, Sliders, Settings,
  Download, Image as ImageIcon, Volume2, Sparkles, Layers, CheckCircle2, ChevronRight, Edit3, Trash2,
  ChevronUp, ChevronDown, Loader2, AlertTriangle,
} from "lucide-react";
import { preprocessSvg, createRenderHost, sampleFrameStats, isFrameBlank, describeFrameStats } from "@/lib/renderHost";

// Local native encoder (server.cjs) that runs FFmpeg on this machine.
const ENCODER_URL = "http://127.0.0.1:3030";

const DEFAULT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="100%" height="100%">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#a855f7" />
      <stop offset="50%" stop-color="#ec4899" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <rect width="800" height="800" fill="#070913" rx="30" />
  
  <!-- Outer animated circle -->
  <circle cx="400" cy="400" r="280" fill="none" stroke="url(#gradient)" stroke-width="4" stroke-dasharray="10 15" opacity="0.3">
    <animateTransform 
      attributeName="transform" 
      type="rotate" 
      from="0 400 400" 
      to="360 400 400" 
      dur="20s" 
      repeatCount="indefinite" />
  </circle>

  <!-- Pulsing ambient glow -->
  <circle cx="400" cy="400" r="180" fill="url(#gradient)" opacity="0.15" filter="url(#glow)">
    <animate 
      attributeName="r" 
      values="150;210;150" 
      dur="6s" 
      repeatCount="indefinite" />
  </circle>

  <!-- Spinning core shape -->
  <g transform="translate(400, 400)">
    <rect x="-80" y="-80" width="160" height="160" rx="40" fill="none" stroke="url(#gradient)" stroke-width="8" filter="url(#glow)">
      <animateTransform 
        attributeName="transform" 
        type="rotate" 
        values="0; 360" 
        dur="8s" 
        repeatCount="indefinite" />
    </rect>
    <circle cx="0" cy="0" r="20" fill="#ffffff" filter="url(#glow)">
      <animate 
        attributeName="opacity" 
        values="0.5;1;0.5" 
        dur="2s" 
        repeatCount="indefinite" />
    </circle>
  </g>

  <!-- Orbital particles -->
  <circle cx="400" cy="400" r="100" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
  <circle cx="400" cy="300" r="10" fill="#06b6d4" filter="url(#glow)">
    <animateTransform 
      attributeName="transform" 
      type="rotate" 
      from="0 400 400" 
      to="-360 400 400" 
      dur="4s" 
      repeatCount="indefinite" />
  </circle>

  <text x="400" y="700" fill="#9ca3af" font-family="system-ui, sans-serif" font-size="20" font-weight="600" letter-spacing="4" text-anchor="middle" opacity="0.8">
    VECTRAVIDEO STUDIO
    <animate attributeName="opacity" values="0.3;0.9;0.3" dur="4s" repeatCount="indefinite" />
  </text>
</svg>`;

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

export default function SvgToVideoPage() {
  // Editor states (EXACT from original)
  const [svgCode, setSvgCode] = useState(DEFAULT_SVG);
  const [svgError, setSvgError] = useState("");
  const [activeTab, setActiveTab] = useState<"single" | "batch">("single");

  // Render & Format options (EXACT from original)
  const [format, setFormat] = useState("mp4"); // webm, mp4, gif
  const [resolution, setResolution] = useState("4k"); // 720, 1080, 4k, square, vertical
  const [fps, setFps] = useState(60);
  const [duration, setDuration] = useState(5);
  const [durationAutoDetected, setDurationAutoDetected] = useState(false);
  const [durationSource, setDurationSource] = useState("fallback");

  // Custom backgrounds (EXACT from original)
  const [bgType, setBgType] = useState("transparent"); // transparent, color, gradient
  const [bgColor, setBgColor] = useState("#ffffff");
  const [gradStart, setGradStart] = useState("#0b0f19");
  const [gradEnd, setGradEnd] = useState("#1e1b4b");

  // Canvas Filters (EXACT from original)
  const [filters, setFilters] = useState({
    blur: 0,
    brightness: 100,
    contrast: 100,
    hueRotate: 0,
    sepia: 0,
    invert: 0
  });

  // Audio track states (EXACT from original)
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioName, setAudioName] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);

  // Watermark state (EXACT from original - with x, y position)
  const [watermark, setWatermark] = useState({
    text: "",
    size: 24,
    opacity: 50,
    x: 50,
    y: 50
  });

  // Batch states (EXACT from original)
  const [batchQueue, setBatchQueue] = useState<{ id: string; name: string; file?: File; status: string; code: string }[]>([]);
  const [isBatchRunning, setIsBatchRunning] = useState(false);

  // Conversion process states (EXACT from original)
  const [isConverting, setIsConverting] = useState(false);
  const [exportWarnings, setExportWarnings] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const [estimatedSize, setEstimatedSize] = useState("0 KB");

  const [customBitrate, setCustomBitrate] = useState(40);
  const [codecProfile, setCodecProfile] = useState("high"); // high, main, baseline
  const [showAdvancedEncoding, setShowAdvancedEncoding] = useState(false);

  // Encoder lifecycle (EXACT from original)
  const [encoderStatus, setEncoderStatus] = useState<"checking" | "starting" | "ready" | "error">("checking");
  const [encoderError, setEncoderError] = useState("");

  // Auto-set bitrate based on resolution (EXACT from original)
  useEffect(() => {
    if (resolution === "4k") setCustomBitrate(40);
    else if (resolution === "1080") setCustomBitrate(15);
    else if (resolution === "720") setCustomBitrate(8);
    else setCustomBitrate(12);
  }, [resolution]);

  // Poll encoder (EXACT from original)
  useEffect(() => {
    let cancelled = false;
    let failedAttempts = 0;

    const check = async () => {
      if (cancelled) return;
      try {
        const res = await fetch(`${ENCODER_URL}/health`, {
          signal: AbortSignal.timeout(1500),
        });
        if (res.ok) {
          failedAttempts = 0;
          setEncoderStatus("ready");
          setEncoderError("");
        } else {
          const body = await res.json().catch(() => ({}));
          failedAttempts = 0;
          setEncoderError(body.error || `Encoder health check failed (HTTP ${res.status}).`);
          setEncoderStatus("error");
        }
      } catch {
        failedAttempts += 1;
        if (failedAttempts <= 2) {
          setEncoderStatus("starting");
        } else if (failedAttempts > 20) {
          setEncoderError(
            'The local FFmpeg encoder is not responding. Start the project with "npm run dev" (it starts the encoder automatically), then reload this page.'
          );
          setEncoderStatus("error");
        }
      }
    };

    check();
    const timer = setInterval(check, 1000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  // Refs (EXACT from original)
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewSvgRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Helper to extract SVG element from HTML-wrapped content (EXACT from original)
  const cleanAndExtractSvg = (input: string): string => {
    if (!input) return "";
    const trimmed = input.trim();

    if (trimmed.toLowerCase().includes("<html") || trimmed.toLowerCase().includes("<!doctype html>") || trimmed.toLowerCase().includes("<body")) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(trimmed, "text/html");
        const svgElement = doc.querySelector("svg");
        if (svgElement) {
          const styles = doc.querySelectorAll("style");
          styles.forEach(style => {
            svgElement.appendChild(style.cloneNode(true));
          });
          const serializer = new XMLSerializer();
          return serializer.serializeToString(svgElement);
        }
      } catch (e) {
        console.error("Failed to extract SVG from HTML:", e);
      }
    }
    return input;
  };

  // ---------------------------------------------------------------------------
  // SVG TIMELINE DETECTION (EXACT from original - ALL helper functions)
  // ---------------------------------------------------------------------------
  const parseTime = (timeStr: string | null): number => {
    if (!timeStr || timeStr === "indefinite") return 0;
    const cleanStr = timeStr.trim().toLowerCase();
    if (cleanStr.endsWith("ms")) return parseFloat(cleanStr) / 1000;
    if (cleanStr.endsWith("min")) return parseFloat(cleanStr) * 60;
    if (cleanStr.endsWith("s")) return parseFloat(cleanStr);
    return parseFloat(cleanStr) || 0;
  };

  const parseCssTimeList = (value: string | undefined): number[] => {
    if (!value) return [];
    return String(value)
      .split(",")
      .map(v => v.trim())
      .map(v => parseTime(v))
      .filter(Number.isFinite);
  };

  const parseIterationList = (value: string | undefined): number[] => {
    if (!value) return [1];
    return String(value)
      .split(",")
      .map(v => v.trim().toLowerCase())
      .map(v => v === "infinite" ? Infinity : Math.max(1, parseFloat(v) || 1));
  };

  const getAnimationShorthandParts = (value: string | undefined) => {
    return String(value || "")
      .split(",")
      .map(animation => {
        const matches = animation.match(/-?(?:\d+(?:\.\d*)?|\.\d+)(?:ms|s|min)/gi) || [];
        return {
          duration: parseTime(matches[0] || "0s"),
          delay: parseTime(matches[1] || "0s")
        };
      });
  };

  const detectAnimationDurationFromSvg = (source: string): { duration: number; source: string } => {
    if (!source) return { duration: 0, source: "none" };

    let maxDuration = 0;
    let finiteFound = false;

    // ---------------- SMIL (EXACT from original) ----------------
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(source, "image/svg+xml");
      const animationNodes = Array.from(doc.querySelectorAll("animate, animateTransform, animateMotion, animateColor, set"));

      animationNodes.forEach(node => {
        const durAttr = node.getAttribute("dur");
        if (!durAttr || durAttr.toLowerCase() === "indefinite") return;

        const dur = parseTime(durAttr);
        if (!Number.isFinite(dur) || dur <= 0) return;

        const beginAttr = node.getAttribute("begin") || "0s";
        const beginValues = beginAttr.split(";").map(v => v.trim());
        const begin = Math.max(0, ...beginValues.map(v => {
          const m = v.match(/(-?(?:\d+(?:\.\d*)?|\.\d+)(?:ms|s|min))/i);
          return m ? Math.max(0, parseTime(m[1])) : 0;
        }));

        const repeatCountAttr = (node.getAttribute("repeatCount") || "1").trim().toLowerCase();
        const repeatDurAttr = (node.getAttribute("repeatDur") || "").trim().toLowerCase();

        let iterations = repeatCountAttr === "indefinite"
          ? 1
          : Math.max(1, parseFloat(repeatCountAttr) || 1);

        let activeDuration = dur * iterations;

        if (repeatDurAttr === "indefinite") {
          activeDuration = dur;
        } else if (repeatDurAttr) {
          const repeatDur = parseTime(repeatDurAttr);
          if (Number.isFinite(repeatDur) && repeatDur > 0) {
            activeDuration = repeatCountAttr === "indefinite"
              ? Math.min(dur, repeatDur)
              : Math.min(activeDuration, repeatDur);
          }
        }

        const end = begin + activeDuration;
        if (end > maxDuration) maxDuration = end;
        finiteFound = true;
      });
    } catch (e) {
      console.warn("SMIL duration detection failed:", e);
    }

    // ---------------- CSS (EXACT from original) ----------------
    try {
      const styleBlocks = Array.from(String(source).matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi))
        .map(match => match[1]);

      styleBlocks.forEach(css => {
        const durationDeclarations = Array.from(css.matchAll(/animation-duration\s*:\s*([^;}]*)/gi));
        const delayDeclarations = Array.from(css.matchAll(/animation-delay\s*:\s*([^;}]*)/gi));
        const iterationDeclarations = Array.from(css.matchAll(/animation-iteration-count\s*:\s*([^;}]*)/gi));

        durationDeclarations.forEach((match, index) => {
          const durations = parseCssTimeList(match[1]);
          const delays = parseCssTimeList(delayDeclarations[index]?.[1] || "0s");
          const iterations = parseIterationList(iterationDeclarations[index]?.[1] || "1");

          durations.forEach((dur, i) => {
            if (!Number.isFinite(dur) || dur <= 0) return;
            const delay = Math.max(0, delays[i] ?? delays[0] ?? 0);
            const rawCount = iterations[i] ?? iterations[0] ?? 1;
            const count = Number.isFinite(rawCount) ? rawCount : 1;
            maxDuration = Math.max(maxDuration, delay + dur * count);
            finiteFound = true;
          });
        });

        // CSS animation shorthand (EXACT from original)
        Array.from(css.matchAll(/(?:^|[;}])[^{}]*\banimation\s*:\s*([^;}]*)/gim)).forEach(match => {
          getAnimationShorthandParts(match[1]).forEach(part => {
            if (!Number.isFinite(part.duration) || part.duration <= 0) return;
            maxDuration = Math.max(maxDuration, Math.max(0, part.delay) + part.duration);
            finiteFound = true;
          });
        });
      });
    } catch (e) {
      console.warn("CSS duration detection failed:", e);
    }

    if (!finiteFound || !Number.isFinite(maxDuration) || maxDuration <= 0) {
      return { duration: 0, source: "fallback" };
    }

    const rounded = Math.max(0.01, Math.ceil((maxDuration + 1e-6) * 1000) / 1000);
    return { duration: rounded, source: "svg" };
  };

  // Preview-based detection (EXACT from original)
  const detectAnimationDurationFromPreview = (): boolean => {
    try {
      const iframeDoc = iframeRef.current?.contentDocument || iframeRef.current?.contentWindow?.document;
      const liveSvg = iframeDoc?.querySelector("svg");
      if (!liveSvg) return false;

      let maxDuration = 0;
      let finiteFound = false;
      const nodes = [liveSvg, ...liveSvg.querySelectorAll("*")];

      nodes.forEach(node => {
        try {
          const computed = iframeRef.current!.contentWindow!.getComputedStyle(node);
          const durations = parseCssTimeList(computed.animationDuration || (computed as any).webkitAnimationDuration);
          const delays = parseCssTimeList(computed.animationDelay || (computed as any).webkitAnimationDelay);
          const iterations = parseIterationList(computed.animationIterationCount || (computed as any).webkitAnimationIterationCount);

          durations.forEach((dur, i) => {
            const rawCount = iterations[i] ?? iterations[0] ?? 1;
            const count = Number.isFinite(rawCount) ? rawCount : 1;
            if (!Number.isFinite(dur) || dur <= 0) return;
            const delay = Math.max(0, delays[i] ?? delays[0] ?? 0);
            maxDuration = Math.max(maxDuration, delay + dur * count);
            finiteFound = true;
          });
        } catch {}

        const smilNodes = node.matches?.("animate, animateTransform, animateMotion, animateColor, set") ? [node] : [];
        smilNodes.forEach(anim => {
          const dur = parseTime(anim.getAttribute("dur") || "0s");
          const repeat = (anim.getAttribute("repeatCount") || "1").toLowerCase();
          if (dur > 0) {
            const count = repeat === "indefinite" ? 1 : Math.max(1, parseFloat(repeat) || 1);
            maxDuration = Math.max(maxDuration, dur * count);
            finiteFound = true;
          }
        });
      });

      if (!finiteFound || maxDuration <= 0) return false;
      const rounded = Math.max(0.01, Math.ceil((maxDuration + 1e-6) * 1000) / 1000);
      setDuration(rounded);
      setDurationAutoDetected(true);
      setDurationSource("svg");
      return true;
    } catch {
      return false;
    }
  };

  const autoDetectDuration = (source?: string) => {
    const src = source || svgCode;
    const detected = detectAnimationDurationFromSvg(src);
    if (detected.source === "svg") {
      setDuration(detected.duration);
      setDurationAutoDetected(true);
      setDurationSource("svg");
    } else {
      setDuration(5);
      setDurationAutoDetected(false);
      setDurationSource("fallback");
    }
  };

  // Re-detect on SVG change (EXACT from original)
  useEffect(() => {
    if (!svgCode) return;
    autoDetectDuration(svgCode);
  }, [svgCode]); // eslint-disable-line

  const handlePreviewLoad = () => {
    if (!detectAnimationDurationFromPreview()) {
      autoDetectDuration(svgCode);
    }
  };

  // SVG validation (EXACT from original)
  useEffect(() => {
    if (!svgCode) return;
    try {
      const cleaned = cleanAndExtractSvg(svgCode);
      if (cleaned !== svgCode) {
        setSvgCode(cleaned);
        return;
      }
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgCode, "image/svg+xml");
      const parserError = doc.querySelector("parsererror");
      if (parserError) {
        setSvgError("Invalid SVG XML: " + parserError.textContent);
      } else {
        setSvgError("");
      }
    } catch (err: any) {
      setSvgError("Error parsing SVG: " + err.message);
    }
  }, [svgCode]);

  // Drag & Drop (EXACT from original)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer?.files[0];
    if (file) loadSvgFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadSvgFile(file);
  };

  const loadSvgFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const rawText = event.target?.result as string;
      setSvgCode(cleanAndExtractSvg(rawText));
    };
    reader.readAsText(file);
  };

  // Audio File Handler (EXACT from original)
  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setAudioName(file.name);
      if (audioRef.current) {
        audioRef.current.src = URL.createObjectURL(file);
      }
    }
  };

  // Get dimensions (EXACT from original)
  const getDimensions = () => {
    switch (resolution) {
      case "720": return { width: 1280, height: 720 };
      case "1080": return { width: 1920, height: 1080 };
      case "4k": return { width: 3840, height: 2160 };
      case "square": return { width: 1080, height: 1080 };
      case "vertical": return { width: 1080, height: 1920 };
      default: return { width: 1920, height: 1080 };
    }
  };

  // Main Conversion / Video Rendering Loop (EXACT from original)
  const startConversion = async (customSvgCode?: string, filename?: string) => {
    const svgToExport = customSvgCode || svgCode;
    const exportFilename = filename || "animation";

    if (isConverting) return;

    setIsConverting(true);
    setProgress(0);
    setCurrentFrame(0);
    setExportWarnings([]);

    let host: any = null;
    let mediaRecorder: any = null;
    let legacyAudioContext: AudioContext | null = null;

    try {
      const { width, height } = getDimensions();
      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Render canvas is not available.");

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d", { alpha: true });
      if (!ctx) throw new Error("Could not create a 2D canvas context.");

      // Always resolve duration from the SVG being exported (EXACT from original)
      const detectedExportDuration = detectAnimationDurationFromSvg(svgToExport);
      const resolvedDuration = detectedExportDuration.source === "svg"
        ? detectedExportDuration.duration
        : Math.max(0.1, Number(duration) || 1);

      // Keep the UI duration in sync (EXACT from original)
      if (customSvgCode === svgCode && detectedExportDuration.source === "svg") {
        setDuration(detectedExportDuration.duration);
        setDurationAutoDetected(true);
        setDurationSource("svg");
      }

      const totalSeconds = Math.max(0.1, resolvedDuration);
      const exportFps = Math.max(1, Number(fps) || 30);
      const totalFramesCount = Math.max(1, Math.ceil(totalSeconds * exportFps));
      const frameDurationSeconds = 1 / exportFps;

      setTotalFrames(totalFramesCount);

      const needsNativeEncoder = format === "mp4";

      // MP4 requires the local FFmpeg encoder (EXACT from original)
      if (needsNativeEncoder && encoderStatus !== "ready") {
        throw new Error(
          encoderError ||
          'The FFmpeg encoder is still starting. Wait for the green "Encoder: Ready" indicator, then try again.'
        );
      }

      // Fetches a remote resource for inlining (EXACT from original)
      const fetchBytes = async (url: string) => {
        try {
          const direct = await fetch(url, { mode: "cors" });
          if (direct.ok) return await direct.blob();
        } catch {}
        if (!needsNativeEncoder) {
          throw new Error("CORS blocked the request and no local encoder server is running.");
        }
        const proxied = await fetch(`${ENCODER_URL}/api/fetch?url=${encodeURIComponent(url)}`);
        if (!proxied.ok) {
          const err = await proxied.json().catch(() => ({}));
          throw new Error(err.error || `HTTP ${proxied.status}`);
        }
        return await proxied.blob();
      };

      const pre = await preprocessSvg(svgToExport, {
        fetchBytes: needsNativeEncoder ? fetchBytes : null,
        warn: (message: string) => setExportWarnings((prev) => [...prev, message]),
      });
      if (pre.warnings.length) {
        console.warn("[VectraVideo] Export notes:", pre.warnings);
      }

      // Warm font cache (EXACT from original)
      for (const font of pre.fonts) {
        try {
          const face = new FontFace(font.family, font.src);
          document.fonts.add(face);
          face.load().catch(() => {});
        } catch {}
      }

      host = await createRenderHost({
        svg: pre.svg,
        targetW: width,
        targetH: height,
        geometry: pre.geometry,
      });
      const { isStatic } = host;

      const staticFrameStr = isStatic ? host.captureFrame(0) : null;

      // Analysis canvas (EXACT from original)
      const analysisCanvas = document.createElement("canvas");
      analysisCanvas.width = 128;
      analysisCanvas.height = 72;
      const analysisCtx = analysisCanvas.getContext("2d", { willReadFrequently: true })!;

      // Render SVG frame (EXACT from original)
      const renderSvgFrame = async (svgStr: string, frameIdx: number) => {
        const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
        const svgUrl = URL.createObjectURL(svgBlob);
        try {
          const img = new Image();
          img.decoding = "async";
          img.src = svgUrl;
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error(`Could not decode SVG frame ${frameIdx + 1}.`));
          });

          analysisCtx.clearRect(0, 0, analysisCanvas.width, analysisCanvas.height);
          analysisCtx.drawImage(img, 0, 0, analysisCanvas.width, analysisCanvas.height);

          ctx.clearRect(0, 0, width, height);
          if (bgType === "color") {
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, width, height);
          } else if (bgType === "gradient") {
            const grad = ctx.createLinearGradient(0, 0, width, height);
            grad.addColorStop(0, gradStart);
            grad.addColorStop(1, gradEnd);
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);
          }

          ctx.filter = `blur(${filters.blur}px) brightness(${filters.brightness}%) contrast(${filters.contrast}%) hue-rotate(${filters.hueRotate}deg) sepia(${filters.sepia}%) invert(${filters.invert}%)`.replace(/\s+/g, " ");

          const imgW = img.naturalWidth || width;
          const imgH = img.naturalHeight || height;
          const ratioImg = imgW / imgH;
          const ratioCanvas = width / height;

          let destW = width;
          let destH = height;
          let destX = 0;
          let destY = 0;

          if (ratioImg > ratioCanvas) {
            destW = width;
            destH = width / ratioImg;
            destY = (height - destH) / 2;
          } else {
            destH = height;
            destW = height * ratioImg;
            destX = (width - destW) / 2;
          }

          ctx.drawImage(img, destX, destY, destW, destH);
          ctx.filter = "none";

          if (watermark.text) {
            ctx.fillStyle = `rgba(255, 255, 255, ${watermark.opacity / 100})`;
            ctx.font = `bold ${watermark.size}px Inter, system-ui, sans-serif`;
            const xPos = (watermark.x / 100) * width;
            const yPos = (watermark.y / 100) * height;
            ctx.fillText(watermark.text, xPos, yPos);
          }

          return { stats: sampleFrameStats(analysisCanvas) };
        } finally {
          URL.revokeObjectURL(svgUrl);
        }
      };

      // Blank error builder (EXACT from original)
      const buildBlankError = (preInfo: any, stats: any, blankFrames: number) => {
        const lines = [
          "Export aborted: every rendered frame was blank.",
          `Frame analysis: ${describeFrameStats(stats)}.`,
        ];
        if (preInfo.hasForeignObject) {
          lines.push("The SVG uses <foreignObject>, which browsers do not render inside video frames.");
        }
        if (preInfo.hasScript) {
          lines.push("The SVG contains <script>; if all content is generated by script it may not render during export.");
        }
        if (preInfo.warnings.some((w: string) => /could not be (loaded|resolved)|too large|not supported/i.test(w))) {
          lines.push("Some external resources could not be loaded (missing images, fonts or CSS can cause a blank result).");
        }
        if (blankFrames > 0) lines.push(`${blankFrames} of the rendered frames were blank.`);
        lines.push("Check the SVG for a viewBox, visible fill/stroke, and supported features, then retry.");
        return lines.join(" ");
      };

      const frameStats: any[] = [];

      // --- MP4: Native local FFmpeg path (EXACT from original) ---
      if (format === "mp4") {
        const targetBitrate = Math.max(1, Number(customBitrate) || 40) * 1_000_000;

        const health = await fetch(`${ENCODER_URL}/health`).catch(() => null);
        if (!health || !health.ok) {
          throw new Error("The FFmpeg encoder is not responding right now. Check the Encoder status above and try again.");
        }

        const startResponse = await fetch(`${ENCODER_URL}/api/encode/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            width, height, fps: exportFps, duration: totalSeconds,
            bitrate: targetBitrate, totalFrames: totalFramesCount, filename: exportFilename
          })
        });

        if (!startResponse.ok) {
          const err = await startResponse.json().catch(() => ({}));
          throw new Error(err.error || "Could not start the native MP4 encoder.");
        }

        const { id: encodeId } = await startResponse.json();
        let encodeFinished = false;

        try {
          // Upload audio (EXACT from original)
          if (audioFile) {
            const audioResponse = await fetch(`${ENCODER_URL}/api/encode/${encodeId}/audio`, {
              method: "POST",
              headers: { "Content-Type": audioFile.type || "application/octet-stream" },
              body: audioFile
            });
            if (!audioResponse.ok) {
              const err = await audioResponse.json().catch(() => ({}));
              throw new Error(err.error || "Could not upload the audio track.");
            }
          }

          for (let frameIdx = 0; frameIdx < totalFramesCount; frameIdx++) {
            const timeSeconds = frameIdx / exportFps;
            const svgStr = staticFrameStr || host.captureFrame(timeSeconds);
            const { stats } = await renderSvgFrame(svgStr, frameIdx);
            frameStats.push(stats);

            if (frameIdx === 0 && isStatic && isFrameBlank(stats)) {
              throw new Error(buildBlankError(pre, stats, 1));
            }

            const pngBlob = await new Promise<Blob>((resolve, reject) => {
              canvas.toBlob(blob => {
                if (blob) resolve(blob);
                else reject(new Error(`Could not encode rendered frame ${frameIdx + 1} as PNG.`));
              }, "image/png");
            });

            const frameResponse = await fetch(`${ENCODER_URL}/api/encode/${encodeId}/frame`, {
              method: "POST",
              headers: { "Content-Type": "image/png" },
              body: pngBlob
            });

            if (!frameResponse.ok) {
              const err = await frameResponse.json().catch(() => ({}));
              throw new Error(err.error || `Native encoder rejected frame ${frameIdx + 1}.`);
            }

            setCurrentFrame(frameIdx + 1);
            setProgress(Math.round(((frameIdx + 1) / totalFramesCount) * 100));
            const estimatedBytes = ((frameIdx + 1) / exportFps) * targetBitrate / 8;
            setEstimatedSize(`${(estimatedBytes / (1024 * 1024)).toFixed(1)} MB`);
          }

          // Blank validation (EXACT from original)
          const blankFrames = frameStats.filter((s) => isFrameBlank(s)).length;
          if (blankFrames > 0 && blankFrames === frameStats.length) {
            throw new Error(buildBlankError(pre, frameStats[0], blankFrames));
          }
          if (blankFrames > 0) {
            const sample = frameStats
              .map((s, i) => (isFrameBlank(s) ? i + 1 : -1))
              .filter((i) => i >= 0)
              .slice(0, 5)
              .join(", ");
            console.warn(`[VectraVideo] ${blankFrames} of ${frameStats.length} frames were blank (e.g. frames ${sample}).`);
            setExportWarnings((prev) => [...prev, `${blankFrames} of ${frameStats.length} frames rendered blank; the video may start empty or lose elements.`]);
          }

          const finishResponse = await fetch(`${ENCODER_URL}/api/encode/${encodeId}/finish`, {
            method: "POST"
          });

          if (!finishResponse.ok) {
            const err = await finishResponse.json().catch(() => ({}));
            throw new Error(err.error || "Native FFmpeg export failed.");
          }

          const fileBlob = await finishResponse.blob();
          const videoUrl = URL.createObjectURL(fileBlob);
          triggerDownload(videoUrl, `${exportFilename}.mp4`);
          setTimeout(() => URL.revokeObjectURL(videoUrl), 30_000);
          encodeFinished = true;

          console.info("VectraVideo native MP4 export complete", {
            resolution: `${width}x${height}`, fps: exportFps, duration: totalSeconds,
            targetBitrateMbps: targetBitrate / 1_000_000, bytes: fileBlob.size, codec: "H.264 / libx264 CBR"
          });

          host.destroy();
          setIsConverting(false);
          return;
        } finally {
          if (!encodeFinished) {
            fetch(`${ENCODER_URL}/api/encode/${encodeId}/cancel`, { method: "POST" }).catch(() => {});
          }
        }
      }

      // --- WebM / GIF path (EXACT from original) ---
      let chunks: Blob[] = [];
      let audioStream: MediaStream | null = null;
      let audioSource: MediaElementAudioSourceNode | null = null;
      let audioDestination: MediaStreamAudioDestinationNode | null = null;

      if (audioFile && format !== "gif" && audioRef.current) {
        try {
          legacyAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          audioDestination = legacyAudioContext.createMediaStreamDestination();
          audioSource = legacyAudioContext.createMediaElementSource(audioRef.current);
          audioSource.connect(audioDestination);
          audioSource.connect(legacyAudioContext.destination);
          audioStream = audioDestination.stream;
        } catch (err) {
          console.warn("Audio Context creation failed:", err);
        }
      }

      const canvasStream = canvas.captureStream(exportFps);
      let combinedStream: MediaStream = canvasStream;

      if (audioStream) {
        combinedStream = new MediaStream([
          ...canvasStream.getVideoTracks(),
          ...audioStream.getAudioTracks()
        ]);
      }

      if (format !== "gif") {
        const mimeTypes = format === "webm"
          ? ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"]
          : [];

        let selectedMime = "";
        for (const mime of mimeTypes) {
          if (MediaRecorder.isTypeSupported(mime)) {
            selectedMime = mime;
            break;
          }
        }

        const options: any = {};
        if (selectedMime) options.mimeType = selectedMime;
        options.videoBitsPerSecond = Math.max(1, Number(customBitrate) || 10) * 1_000_000;

        try {
          mediaRecorder = new MediaRecorder(combinedStream, options);
        } catch {
          mediaRecorder = new MediaRecorder(combinedStream);
        }

        mediaRecorder.ondataavailable = (e: any) => {
          if (e.data.size > 0) chunks.push(e.data);
        };
        mediaRecorder.start(1000);

        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch((e: any) => console.log("Audio playback failed:", e));
        }
      }

      for (let frameIdx = 0; frameIdx < totalFramesCount; frameIdx++) {
        const frameStartTime = performance.now();
        const timeSeconds = frameIdx / exportFps;

        const svgStr = staticFrameStr || host.captureFrame(timeSeconds);
        const { stats } = await renderSvgFrame(svgStr, frameIdx);
        frameStats.push(stats);

        if (frameIdx === 0 && isStatic && isFrameBlank(stats)) {
          throw new Error(buildBlankError(pre, stats, 1));
        }

        if (format === "gif") {
          // Collect data URLs for GIF
          const framesData: string[] = (window as any).__gifFrames || [];
          framesData.push(canvas.toDataURL("image/png"));
          (window as any).__gifFrames = framesData;
        }

        setCurrentFrame(frameIdx + 1);
        setProgress(Math.round(((frameIdx + 1) / totalFramesCount) * 100));

        const elapsed = performance.now() - frameStartTime;
        const delay = Math.max(0, (1000 / exportFps) - elapsed);
        await new Promise(r => setTimeout(r, delay));
      }

      if (audioRef.current) audioRef.current.pause();

      // Blank validation (EXACT from original)
      const blankFrames = frameStats.filter((s) => isFrameBlank(s)).length;
      if (blankFrames > 0 && blankFrames === frameStats.length) {
        throw new Error(buildBlankError(pre, frameStats[0], blankFrames));
      }
      if (blankFrames > 0) {
        const sample = frameStats
          .map((s, i) => (isFrameBlank(s) ? i + 1 : -1))
          .filter((i) => i >= 0)
          .slice(0, 5)
          .join(", ");
        console.warn(`[VectraVideo] ${blankFrames} of ${frameStats.length} frames were blank (e.g. frames ${sample}).`);
        setExportWarnings((prev) => [...prev, `${blankFrames} of ${frameStats.length} frames rendered blank; the video may start empty or lose elements.`]);
      }

      if (format === "gif") {
        const framesData = (window as any).__gifFrames || [];
        delete (window as any).__gifFrames;
        try {
          const gifshot = (await import("gifshot")).default;
          gifshot.createGIF({
            images: framesData,
            gifWidth: width,
            gifHeight: height,
            interval: 1 / exportFps,
            numFrames: totalFramesCount,
            frameDuration: 1
          }, (obj: any) => {
            setIsConverting(false);
            if (!obj.error) triggerDownload(obj.image, `${exportFilename}.gif`);
            else alert("GIF conversion failed: " + obj.error);
          });
        } catch {
          setIsConverting(false);
        }
      } else if (mediaRecorder) {
        mediaRecorder.onstop = () => {
          const mime = mediaRecorder.mimeType || "video/webm";
          const fileBlob = new Blob(chunks, { type: mime });
          const videoUrl = URL.createObjectURL(fileBlob);
          triggerDownload(videoUrl, `${exportFilename}.webm`);
          setTimeout(() => URL.revokeObjectURL(videoUrl), 30_000);
          setIsConverting(false);
        };
        mediaRecorder.stop();
      } else {
        setIsConverting(false);
      }

      if (legacyAudioContext) await legacyAudioContext.close().catch(() => {});
    } catch (err: any) {
      console.error("Video export failed:", err);
      if (host) host.destroy();
      try { if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop(); } catch {}
      try { if (legacyAudioContext) legacyAudioContext.close(); } catch {}
      alert(`Video export failed: ${err?.message || err}`);
      setIsConverting(false);
    }
  };

  const triggerDownload = (url: string, name: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Batch (EXACT from original)
  const handleBatchFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(f => f.type === "image/svg+xml" || f.name.endsWith(".svg"));

    const newItems = validFiles.map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      file,
      status: "pending",
      code: ""
    }));

    newItems.forEach(item => {
      if (!item.file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        item.code = evt.target?.result as string;
        setBatchQueue(prev => [...prev]);
      };
      reader.readAsText(item.file);
    });

    setBatchQueue(prev => [...prev, ...newItems]);
  };

  const runBatchConversion = async () => {
    if (batchQueue.length === 0 || isBatchRunning) return;
    setIsBatchRunning(true);

    for (let i = 0; i < batchQueue.length; i++) {
      const item = batchQueue[i];
      if (item.status === "completed") continue;

      batchQueue[i].status = "converting";
      setBatchQueue([...batchQueue]);

      try {
        await startConversion(item.code, item.name.replace(".svg", ""));
        batchQueue[i].status = "completed";
      } catch {
        batchQueue[i].status = "error";
      }
      setBatchQueue([...batchQueue]);
    }

    setIsBatchRunning(false);
  };

  const removeBatchItem = (id: string) => {
    setBatchQueue(prev => prev.filter(item => item.id !== id));
  };

  return (
    <ToolLayout>
      <main className="flex flex-1 flex-col overflow-hidden min-h-0">
        {/* Header (all in one row) */}
        <div className="flex items-center justify-between border-b border-border bg-bg px-5 py-2.5">
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
              <span className="text-xs font-bold text-accent">SVG</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-text-primary">SVG to Video</h1>
              <p className="text-[11px] text-text-muted">Advanced Browser-Based Vector Animator & Exporter</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              className={`rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors ${activeTab === "single" ? "bg-accent text-white" : "text-text-muted hover:text-text-primary"}`}
              onClick={() => setActiveTab("single")}>
              <FileCode className="mr-1 inline h-3 w-3" />Single SVG Converter
            </button>
            <button
              className={`rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors ${activeTab === "batch" ? "bg-accent text-white" : "text-text-muted hover:text-text-primary"}`}
              onClick={() => setActiveTab("batch")}>
              <Layers className="mr-1 inline h-3 w-3" />Batch Queue ({batchQueue.length})
            </button>
            <div className="mx-1 h-4 w-px bg-border" />
            <button onClick={() => setSvgCode(DEFAULT_SVG)}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-[10px] font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent">
              <RefreshCw className="h-3 w-3" /> Reset Default
            </button>
            <div className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-medium ${encoderStatus === "ready" ? "bg-green-500/10 text-green-600" : encoderStatus === "error" ? "bg-red-500/10 text-red-500" : "bg-yellow-500/10 text-yellow-600"}`}>
              <div className={`h-2 w-2 rounded-full ${encoderStatus === "ready" ? "bg-green-500" : encoderStatus === "error" ? "bg-red-500" : "bg-yellow-500 animate-pulse"}`} />
              Encoder: {encoderStatus === "ready" ? "Ready" : encoderStatus === "error" ? "Offline" : "Starting..."}
            </div>
          </div>
        </div>

        {/* Progress (EXACT from original) */}
        {isConverting && (
          <div className="border-b border-border bg-bg px-5 py-2">
            <div className="flex items-center gap-3">
              <Loader2 className="h-4 w-4 animate-spin text-accent" />
              <div className="flex-1">
                <div className="h-2 rounded-full bg-border">
                  <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <span className="text-xs font-bold text-text-primary">{progress}%</span>
              <span className="text-[10px] text-text-muted">Frame {currentFrame} / {totalFrames}</span>
              <span className="text-[10px] text-text-muted">~{estimatedSize}</span>
            </div>
          </div>
        )}

        {/* Export Warnings (EXACT from original) */}
        {exportWarnings.length > 0 && (
          <div className="border-b border-border bg-yellow-500/5 px-5 py-2">
            <div className="flex items-center justify-between mb-1">
              <strong className="text-[10px] text-yellow-600">Export Notes</strong>
              <button onClick={() => setExportWarnings([])} className="text-text-muted hover:text-text-primary text-xs">&times;</button>
            </div>
            <ul className="list-disc pl-4">
              {exportWarnings.map((warning, index) => (
                <li key={index} className="text-[10px] text-yellow-600">{warning}</li>
              ))}
            </ul>
          </div>
        )}



        {/* Main Content: Editor + Preview (EXACT from original layout) */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Left: Code Editor / Batch Queue */}
          <div className="flex w-[40%] flex-col border-r border-border min-h-0">
            {activeTab === "single" ? (
              <div className="flex flex-1 flex-col min-h-0">
                {/* Upload zone (EXACT from original) */}
                <div className="border-b border-border p-4"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("svg-file-input")?.click()}>
                  <div className="flex items-center gap-3 rounded-xl border-2 border-dashed border-border p-4 transition-colors hover:border-accent/40 cursor-pointer">
                    <Upload className="h-5 w-5 text-accent" />
                    <div>
                      <p className="text-xs font-semibold text-text-primary">Drag & Drop SVG or Click to Upload</p>
                      <p className="text-[10px] text-text-muted">Supports raw vector files with SMIL and CSS animations</p>
                    </div>
                  </div>
                  <input id="svg-file-input" type="file" accept=".svg" className="hidden" onChange={handleFileChange} />
                </div>

                {/* Code editor (EXACT from original) */}
                <div className="flex-1 min-h-0 p-4">
                  <textarea
                    value={svgCode}
                    onChange={(e) => setSvgCode(e.target.value)}
                    className="h-full w-full rounded-xl border border-border bg-surface p-3 font-mono text-[11px] text-text-primary focus:border-accent focus:outline-none resize-none"
                    placeholder="Paste your SVG XML code here..."
                    spellCheck={false}
                  />
                </div>
                {svgError && (
                  <div className="px-4 pb-2 text-[10px] text-red-500 font-mono">{svgError}</div>
                )}
                {/* Duration info (EXACT from original) */}
                <div className="flex items-center gap-2 border-t border-border px-4 py-2">
                  <span className="text-[10px] text-text-muted">
                    Duration: {duration}s {durationAutoDetected ? `• Auto detected from SVG • ${durationSource.toUpperCase()}` : "• No finite animation duration found • using 5s fallback"}
                  </span>
                  <span className="text-[10px] text-text-muted">•</span>
                  <span className="text-[10px] text-text-muted">~{Math.ceil(duration * fps)} frames @ {fps}fps</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 flex-col min-h-0 p-4">
                <div className="mb-3 flex gap-2">
                  <button onClick={() => document.getElementById("batch-input")?.click()}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-3 text-xs font-medium text-text-muted transition-colors hover:border-accent/40 hover:text-accent">
                    <Upload className="h-4 w-4" /> Upload Multiple SVGs
                  </button>
                  <button onClick={runBatchConversion} disabled={isBatchRunning || batchQueue.length === 0}
                    className="flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-50">
                    {isBatchRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    Run Batch ({batchQueue.length} files)
                  </button>
                  <input id="batch-input" type="file" accept=".svg" multiple className="hidden" onChange={handleBatchFiles} />
                </div>
                <div className="flex-1 space-y-2 overflow-y-auto">
                  {batchQueue.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5">
                      <FileCode className="h-4 w-4 shrink-0 text-accent" />
                      <span className="flex-1 truncate text-xs font-medium text-text-primary">{item.name}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${item.status === "completed" ? "bg-green-500/10 text-green-600" : item.status === "error" ? "bg-red-500/10 text-red-500" : item.status === "converting" ? "bg-accent/10 text-accent" : "bg-border text-text-muted"}`}>
                        {item.status}
                      </span>
                      <button onClick={() => removeBatchItem(item.id)} className="text-text-muted hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  ))}
                  {batchQueue.length === 0 && <p className="py-8 text-center text-xs text-text-muted">No files queued</p>}
                </div>
              </div>
            )}
          </div>

          {/* Right: Preview + Controls (EXACT from original layout) */}
          <div className="flex flex-1 flex-col min-h-0">
            {/* Preview Window (EXACT from original) */}
            <div className="flex-1 relative flex items-center justify-center" style={{ backgroundColor: "#090c15" }}>
              <div className="absolute top-2 right-2 flex gap-2 z-10">
                <span className="rounded-full bg-black/60 backdrop-blur px-3 py-1 text-[10px] font-bold text-white">{format.toUpperCase()}</span>
                <span className="rounded-full bg-black/60 backdrop-blur px-3 py-1 text-[10px] font-bold text-white">{getDimensions().width}x{getDimensions().height}</span>
                <span className="rounded-full bg-black/60 backdrop-blur px-3 py-1 text-[10px] font-bold text-white">{fps} FPS</span>
              </div>

              {/* Live SVG Preview (EXACT from original) */}
              <iframe
                ref={iframeRef}
                title="SVG Preview"
                onLoad={handlePreviewLoad}
                srcDoc={`<!DOCTYPE html><html><head><style>html,body{margin:0;padding:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:${bgType === "color" ? bgColor : bgType === "gradient" ? `linear-gradient(135deg, ${gradStart}, ${gradEnd})` : "transparent"};overflow:hidden;}svg{max-width:100%;max-height:100%;width:auto !important;height:auto !important;object-fit:contain;overflow:visible;filter:blur(${filters.blur}px) brightness(${filters.brightness}%) contrast(${filters.contrast}%) hue-rotate(${filters.hueRotate}deg) sepia(${filters.sepia}%) invert(${filters.invert}%);}</style></head><body>${svgCode}</body></html>`}
                className="w-full border-0"
                style={{ height: isConverting ? "0px" : "100%", display: isConverting ? "none" : "block" }}
                sandbox="allow-scripts"
              />
              <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" style={{ display: isConverting ? "block" : "none" }} />

              {/* Conversion overlay (EXACT from original) */}
              {isConverting && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 z-10" style={{ background: "rgba(11,15,25,0.9)", backdropFilter: "blur(10px)" }}>
                  <div className="text-lg font-bold text-accent">{progress}%</div>
                  <div className="w-full max-w-xs h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: "linear-gradient(90deg, #a855f7, #06b6d4)" }} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 w-full max-w-xs text-center text-xs text-text-secondary">
                    <div>Frame<div className="font-mono font-bold text-text-primary">{currentFrame} / {totalFrames}</div></div>
                    <div>Estimated Size<div className="font-mono font-bold text-text-primary">{estimatedSize}</div></div>
                  </div>
                  <div className="text-[10px] text-text-muted">Compiling High-Quality {format.toUpperCase()} File...</div>
                </div>
              )}
            </div>

            {/* Audio hidden element (EXACT from original) */}
            <audio ref={audioRef} style={{ display: "none" }} />

            {/* Bottom bar (EXACT from original) */}
            <div className="flex items-center justify-center gap-3 border-t border-border bg-bg px-4 py-2">
              <button
                onClick={() => startConversion()}
                disabled={isConverting || !!svgError || (format === "mp4" && encoderStatus !== "ready")}
                title={format === "mp4" && encoderStatus !== "ready" ? "Waiting for the local FFmpeg encoder to become ready" : ""}
                className="flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
              >
                {isConverting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {isConverting ? `Exporting ${progress}%` : `Convert & Export ${format.toUpperCase()}`}
              </button>
              <button onClick={() => setSvgCode(DEFAULT_SVG)}
                className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent">
                <RefreshCw className="h-3.5 w-3.5" /> Reset
              </button>
            </div>
          </div>
        </div>
      </main>

      <canvas ref={canvasRef} className="hidden" />

      {/* Right Panel (EXACT from original controls) */}
      <aside className="hidden w-[280px] shrink-0 flex-col overflow-y-auto min-h-0 border-l border-border bg-bg-secondary lg:flex">
        <div className="p-4">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-text-primary">Engine Controls</h2>
            <p className="text-[11px] text-text-muted">Format, resolution, filters & export</p>
          </div>

          {/* Format (EXACT from original) */}
          <Section title="Export Format" icon={<Video className="h-3 w-3" />}>
            <select className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
              value={format} onChange={(e) => setFormat(e.target.value)}>
              <option value="mp4">MP4 (Standard Video)</option>
              <option value="webm">WebM (Fastest, High Quality)</option>
              <option value="gif">GIF (Animated Loop)</option>
            </select>
          </Section>

          {/* Resolution (EXACT from original) */}
          <Section title="Resolution" icon={<ImageIcon className="h-3 w-3" />}>
            <select className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
              value={resolution} onChange={(e) => setResolution(e.target.value)}>
              <option value="720">720p HD (1280x720)</option>
              <option value="1080">1080p Full HD (1920x1080)</option>
              <option value="4k">4K Ultra HD (3840x2160)</option>
              <option value="square">1:1 Square (1080x1080)</option>
              <option value="vertical">9:16 Vertical Story (1080x1920)</option>
            </select>
          </Section>

          {/* Frame Rate (EXACT from original) */}
          <Section title="Frame Rate" icon={<Play className="h-3 w-3" />}>
            <select className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
              value={fps} onChange={(e) => setFps(Number(e.target.value))}>
              <option value={24}>24 FPS (Cinematic)</option>
              <option value={30}>30 FPS (Standard)</option>
              <option value={60}>60 FPS (Ultra Smooth)</option>
            </select>
          </Section>

          {/* Duration (EXACT from original) */}
          <Section title="Duration" icon={<Sliders className="h-3 w-3" />}>
            <div>
              <input type="number" className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
                value={duration} min={0.01} max={600} step={0.001} readOnly
                title="Automatically detected from the SVG animation timeline" />
              <div className="mt-1.5 text-[10px] text-text-muted">
                {durationAutoDetected ? `Auto detected from SVG • ${durationSource.toUpperCase()}` : "No finite animation duration found • using 5s fallback"}
              </div>
            </div>
          </Section>

          {/* Background (EXACT from original) */}
          <Section title="Background" icon={<span className="inline-block h-3 w-3 rounded" style={{ background: bgType === "color" ? bgColor : bgType === "gradient" ? `linear-gradient(135deg, ${gradStart}, ${gradEnd})` : "repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50% / 12px 12px" }} />}>
            <div className="flex gap-1.5">
              {(["transparent", "color", "gradient"] as const).map((t) => (
                <button key={t} onClick={() => setBgType(t)}
                  className={`flex-1 rounded-lg border px-2 py-1.5 text-[10px] font-medium capitalize transition-colors ${bgType === t ? "border-accent bg-accent/10 text-accent" : "border-border text-text-muted hover:border-accent"}`}>{t}</button>
              ))}
            </div>
            {bgType === "color" && (
              <div className="flex items-center gap-2">
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-8 w-8 cursor-pointer rounded-lg border border-border" />
                <span className="text-[11px] text-text-muted">{bgColor}</span>
              </div>
            )}
            {bgType === "gradient" && (
              <div className="flex items-center gap-2">
                <input type="color" value={gradStart} onChange={(e) => setGradStart(e.target.value)} className="h-8 w-8 cursor-pointer rounded-lg border border-border" title="Gradient Start" />
                <span className="text-[10px] text-text-muted">→</span>
                <input type="color" value={gradEnd} onChange={(e) => setGradEnd(e.target.value)} className="h-8 w-8 cursor-pointer rounded-lg border border-border" title="Gradient End" />
              </div>
            )}
          </Section>

          {/* Audio (EXACT from original) */}
          <Section title="Background Soundtrack" icon={<Volume2 className="h-3 w-3" />} defaultOpen={format !== "gif"}>
            <div>
              <button onClick={() => document.getElementById("audio-input")?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface px-3 py-2.5 text-[11px] font-medium text-text-muted transition-colors hover:border-accent hover:text-accent">
                <Upload className="h-3 w-3" /> {audioName || "Upload MP3 / WAV"}
              </button>
              <input id="audio-input" type="file" accept="audio/*" className="hidden" onChange={handleAudioChange} />
            </div>
            {audioName && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-text-muted truncate">{audioName}</span>
                <button onClick={() => { setAudioFile(null); setAudioName(""); }} className="text-[10px] text-red-500 hover:text-red-600">Remove</button>
              </div>
            )}
          </Section>

          {/* Advanced Encoding (EXACT from original) */}
          {format !== "gif" && (
            <Section title="Advanced Encoding" icon={<Sliders className="h-3 w-3" />} defaultOpen={false}>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs text-text-secondary">Target Bitrate (Mbps)</span>
                  <span className="text-[10px] font-bold text-accent">{customBitrate}</span>
                </div>
                <input type="range" min={1} max={100} value={customBitrate} onChange={(e) => setCustomBitrate(Number(e.target.value))}
                  className="w-full" style={{ background: `linear-gradient(to right, var(--accent) ${((customBitrate - 1) / 99) * 100}%, var(--border) ${((customBitrate - 1) / 99) * 100}%)` }} />
              </div>
              <div className="flex gap-1.5">
                <span className="text-xs text-text-secondary mb-1">Codec Profile</span>
              </div>
              <div className="flex gap-1.5">
                {(["high", "main", "baseline"] as const).map((p) => (
                  <button key={p} onClick={() => setCodecProfile(p)}
                    className={`flex-1 rounded-lg border px-2 py-1.5 text-[10px] font-medium capitalize transition-colors ${codecProfile === p ? "border-accent bg-accent/10 text-accent" : "border-border text-text-muted hover:border-accent"}`}>{p}</button>
                ))}
              </div>
              <div className="rounded-lg border border-border bg-surface p-2 text-[10px] text-text-muted">
                * Native MP4 export uses FFmpeg/libx264 CBR with the configured target bitrate.
              </div>
            </Section>
          )}

          {/* Canvas Filters (EXACT from original) */}
          <Section title="Canvas Filters" icon={<Settings className="h-3 w-3" />}>
            {[
              { key: "blur", label: "Blur", min: 0, max: 20, unit: "px" },
              { key: "brightness", label: "Brightness", min: 50, max: 200, unit: "%" },
              { key: "contrast", label: "Contrast", min: 50, max: 200, unit: "%" },
              { key: "hueRotate", label: "Hue Rotate", min: 0, max: 360, unit: "deg" },
              { key: "sepia", label: "Sepia", min: 0, max: 100, unit: "%" },
              { key: "invert", label: "Invert", min: 0, max: 100, unit: "%" },
            ].map((f) => (
              <div key={f.key} className="flex items-center gap-2">
                <span className="w-16 text-[10px] text-text-secondary">{f.label}</span>
                <input type="range" min={f.min} max={f.max} value={(filters as any)[f.key]}
                  onChange={(e) => setFilters({ ...filters, [f.key]: Number(e.target.value) })}
                  className="flex-1" style={{ background: `linear-gradient(to right, var(--accent) ${(((filters as any)[f.key] - f.min) / (f.max - f.min)) * 100}%, var(--border) ${(((filters as any)[f.key] - f.min) / (f.max - f.min)) * 100}%)` }} />
                <span className="w-10 text-right font-mono text-[10px] text-accent">{(filters as any)[f.key]}{f.unit}</span>
              </div>
            ))}
          </Section>

          {/* Watermark (EXACT from original - with x, y position) */}
          <Section title="Watermark" icon={<Edit3 className="h-3 w-3" />} defaultOpen={false}>
            <input value={watermark.text} onChange={(e) => setWatermark({ ...watermark, text: e.target.value })}
              placeholder="Enter watermark text..."
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text-primary focus:border-accent focus:outline-none" />
            {watermark.text && (
              <>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <span className="text-[10px] text-text-secondary">Size (px)</span>
                    <input type="number" className="w-full rounded-lg border border-border bg-surface px-2 py-1 text-[10px] text-text-primary" value={watermark.size}
                      onChange={(e) => setWatermark({ ...watermark, size: Number(e.target.value) })} />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] text-text-secondary">Opacity (%)</span>
                    <input type="range" min={10} max={100} value={watermark.opacity}
                      onChange={(e) => setWatermark({ ...watermark, opacity: Number(e.target.value) })}
                      className="w-full mt-1" style={{ background: `linear-gradient(to right, var(--accent) ${((watermark.opacity - 10) / 90) * 100}%, var(--border) ${((watermark.opacity - 10) / 90) * 100}%)` }} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <span className="text-[10px] text-text-secondary">X Position (%)</span>
                    <input type="number" className="w-full rounded-lg border border-border bg-surface px-2 py-1 text-[10px] text-text-primary" value={watermark.x}
                      onChange={(e) => setWatermark({ ...watermark, x: Number(e.target.value) })} />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] text-text-secondary">Y Position (%)</span>
                    <input type="number" className="w-full rounded-lg border border-border bg-surface px-2 py-1 text-[10px] text-text-primary" value={watermark.y}
                      onChange={(e) => setWatermark({ ...watermark, y: Number(e.target.value) })} />
                  </div>
                </div>
              </>
            )}
          </Section>
        </div>
      </aside>
    </ToolLayout>
  );
}
