"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ToolLayout } from "@/components/tool-layout";
import {
  Type, Copy, Check, Zap, AlertTriangle, CheckCircle2, TrendingUp,
  BarChart3, Sparkles, ArrowRight, RotateCcw, ChevronDown, ChevronUp,
  Search, Target, Download, FileText, GitCompare, Layers, Eye, History,
} from "lucide-react";

// ─── Constants ───
const FILLER_WORDS = ["beautiful","amazing","stunning","gorgeous","wonderful","lovely","magnificent","breathtaking","4k","8k","hd","uhd","high quality","high resolution","best quality","trending","viral","popular","famous","iconic","lorem","test","sample"];
const COLOR_KEYWORDS = ["red","blue","green","yellow","orange","purple","pink","black","white","gold","silver","teal","navy","coral","mint","turquoise","crimson","emerald","sapphire","amber"];
const STYLE_KEYWORDS = ["minimalist","vintage","retro","modern","flat","3d","isometric","hand-drawn","watercolor","vector","illustration","photography","abstract","geometric","organic","clean","elegant","bold","neon","pastel"];
const PLATFORM_LIMITS: Record<string, { titleMax: number; focus: string; rules: string[] }> = {
  adobestock: { titleMax: 150, focus: "Title-first algorithm, short precise titles", rules: ["Title is king","Keep 50-100 chars","Start with subject","Avoid filler words"] },
  shutterstock: { titleMax: 200, focus: "Detailed descriptions valued", rules: ["Rich descriptions help","Long-tail keywords","Mix broad + specific"] },
  freepik: { titleMax: 80, focus: "Concise, style-focused titles", rules: ["Under 80 chars","Style-focused","Vector terms preferred"] },
  vecteezy: { titleMax: 80, focus: "Trending styles matter", rules: ["Trending styles boost","Concise titles","Vector-specific terms"] },
  istock: { titleMax: 120, focus: "Premium quality keywords", rules: ["Premium descriptors","Professional language"] },
  pond5: { titleMax: 100, focus: "Video-specific terms", rules: ["Motion/action terms","Video format terms"] },
};
const TITLE_FORMULAS = [
  { name: "Icon Set", formula: "[Subject] icon set featuring [icon1], [icon2]... in [style] [color] design.", example: "Review icon set featuring rating, customer feedback, star ratings, user testimonials, and business evaluation symbols in a modern blue flat design." },
  { name: "Isolated Subject", formula: "[Adjective] [Subject] isolated on [background] background.", example: "Purple 3D security camera icon with broadcast waves isolated on transparent background." },
  { name: "Abstract/Texture", formula: "[Style] [material] with [feature]. [Detail].", example: "Abstract vector grainy texture with smooth gradient transition. Dotted halftone pattern with soft dispersion." },
  { name: "3D Illustration", formula: "Colorful 3d illustration of [subject] with [texture].", example: "Colorful 3d illustration of various primitives with vibrant gradient texture and glass material." },
  { name: "Business Icon", formula: "[Subject] icon set. Collection of [topic1], [topic2] [style] icon vector.", example: "Operations management icon set. Collection of workflow optimization, production process, supply chain line icon vector illustration." },
];
const COMPETITOR_TITLES = [
  "Review icon set featuring rating, customer feedback, star ratings, user testimonials, and business evaluation symbols in a modern blue flat design.",
  "Meeting icon set. Featuring corporate meeting, discussion, business training, strategy planning, teamwork, brainstorming, and online video interview.",
  "Abstract vector grainy texture with smooth gradient transition. Dotted halftone pattern with soft dispersion and noise effect.",
  "Golden glowing perspective grid and shiny horizon. Retro-futuristic synthwave product display showcase design, 3d rendering.",
  "Colorful 3d illustration of various 3d primitives with vibrant gradient texture and glass material.",
];
const TRENDING_KEYWORDS = ["ai generated","artificial intelligence","machine learning","metaverse","crypto","blockchain","sustainability","eco friendly","diversity","remote work","3d render","isometric","flat design","gradient","glassmorphism"];
const SEARCH_VOLUME: Record<string, string> = { vector:"Very High",illustration:"Very High",background:"Very High",pattern:"High",texture:"High",icon:"Very High",logo:"Very High",business:"Very High",technology:"High",abstract:"High",minimalist:"Medium",modern:"Medium",flat:"Medium","3d":"High",geometric:"Medium",seamless:"Medium" };
const CATEGORIES = ["Animals/Wildlife","Art","Backgrounds/Textures","Beauty/Fashion","Buildings/Landmarks","Business/Finance","Education","Food and Drink","Healthcare","Industrial","Nature","People","Science","Signs/Symbols","Technology","Transportation","Vectors","Vintage"];

// ─── Analysis ───
interface AnalysisResult { score: number; grade: string; issues: { type: string; message: string }[]; strengths: string[]; suggestions: string[]; optimizedTitle: string; keywordSuggestions: string[]; platformScores: Record<string, number>; charWeightMap: { word: string; color: string }[]; densityCheck: { word: string; count: number; status: string }[]; categoryMatch: { category: string; score: number }[]; searchVolumes: { keyword: string; volume: string }[]; }

function analyzeTitle(title: string, platform: string): AnalysisResult {
  const issues: { type: string; message: string }[] = [];
  const strengths: string[] = [];
  const suggestions: string[] = [];
  let score = 0;
  const lower = title.toLowerCase().trim();
  const words = lower.split(/\s+/).filter(Boolean);
  const charCount = title.length;
  const limits = PLATFORM_LIMITS[platform] || PLATFORM_LIMITS.adobestock;

  if (charCount === 0) return { score: 0, grade: "F", issues: [{ type: "error", message: "Title is empty" }], strengths: [], suggestions: [], optimizedTitle: "", keywordSuggestions: [], platformScores: {}, charWeightMap: [], densityCheck: [], categoryMatch: [], searchVolumes: [] };

  if (charCount <= limits.titleMax) { score += 15; strengths.push(`Length OK (${charCount}/${limits.titleMax})`); } else { issues.push({ type: "error", message: `Too long: ${charCount}/${limits.titleMax}` }); }
  if (words.length >= 5) { score += 10; strengths.push(`${words.length} words`); } else { issues.push({ type: "warning", message: `Only ${words.length} words` }); }
  const fillers = FILLER_WORDS.filter(f => lower.includes(f));
  if (fillers.length === 0) { score += 15; strengths.push("No filler words"); } else { score -= fillers.length * 5; issues.push({ type: "error", message: `Filler: "${fillers.join('", "')}"` }); }
  if (title.charAt(0) === title.charAt(0).toUpperCase()) { score += 5; strengths.push("Proper capitalization"); } else { issues.push({ type: "warning", message: "Start with capital letter" }); }
  if (title.endsWith(".") || title.endsWith("!")) { score += 5; strengths.push("Complete sentence"); } else { issues.push({ type: "info", message: "Add period at end" }); }
  if (words.length >= 3 && !["a","an","the","this","that"].includes(words[0])) { score += 10; strengths.push("Subject at beginning"); } else { issues.push({ type: "warning", message: "Start with subject" }); }
  const foundColors = COLOR_KEYWORDS.filter(c => lower.includes(c));
  if (foundColors.length > 0) { score += 5; strengths.push(`Colors: ${foundColors.join(", ")}`); } else { suggestions.push("Add color descriptors"); }
  const foundStyles = STYLE_KEYWORDS.filter(s => lower.includes(s));
  if (foundStyles.length > 0) { score += 10; strengths.push(`Style: ${foundStyles.join(", ")}`); } else { suggestions.push("Add style descriptors"); }
  if (!lower.match(/\d{4,}/)) score += 5;
  const uniqueWords = new Set(words);
  if (uniqueWords.size / words.length >= 0.8) { score += 5; strengths.push("Low repetition"); }
  if (title.includes(". ")) { score += 5; strengths.push("Period separation"); }
  score = Math.max(0, Math.min(100, score));

  let grade = "F";
  if (score >= 90) grade = "A+"; else if (score >= 80) grade = "A"; else if (score >= 70) grade = "B+"; else if (score >= 60) grade = "B"; else if (score >= 50) grade = "C"; else if (score >= 40) grade = "D";

  const charWeightMap = words.map(w => {
    const isFiller = FILLER_WORDS.some(f => w.includes(f));
    const isColor = COLOR_KEYWORDS.includes(w);
    const isStyle = STYLE_KEYWORDS.includes(w);
    return { word: w, color: isFiller ? "#ef4444" : isColor ? "#10b981" : isStyle ? "#6366f1" : w.length > 4 ? "#f59e0b" : "#64748b" };
  });

  const wordFreq: Record<string, number> = {};
  words.forEach(w => { wordFreq[w] = (wordFreq[w] || 0) + 1; });
  const densityCheck = Object.entries(wordFreq).map(([word, count]) => ({ word, count, status: count >= 3 ? "overstuff" : count >= 2 ? "warning" : "ok" })).sort((a, b) => b.count - a.count);

  const categoryMatch = CATEGORIES.map(cat => ({ category: cat, score: Math.min(100, words.filter(w => cat.toLowerCase().includes(w)).length * 25 + 10) })).sort((a, b) => b.score - a.score).slice(0, 5);
  const searchVolumes = words.filter(w => w.length > 2).map(w => ({ keyword: w, volume: SEARCH_VOLUME[w] || "Low" }));

  let optimized = title;
  for (const f of FILLER_WORDS) optimized = optimized.replace(new RegExp(`\\b${f}\\b`, "gi"), "").replace(/\s{2,}/g, " ").trim();
  if (!optimized.endsWith(".")) optimized += ".";
  optimized = optimized.charAt(0).toUpperCase() + optimized.slice(1);
  if (optimized.length > limits.titleMax) { const sub = optimized.substring(0, limits.titleMax); const lp = sub.lastIndexOf("."); optimized = lp > 0 ? sub.substring(0, lp + 1) : sub.substring(0, sub.lastIndexOf(" ")) + "."; }

  const kwSuggestions: string[] = [];
  for (const s of STYLE_KEYWORDS) { if (!lower.includes(s) && kwSuggestions.length < 5) kwSuggestions.push(s); }
  for (const c of COLOR_KEYWORDS) { if (!lower.includes(c) && kwSuggestions.length < 10) kwSuggestions.push(c); }
  for (const k of ["vector","illustration","design","background","texture","pattern","icon","symbol","graphic"]) { if (!lower.includes(k) && kwSuggestions.length < 15) kwSuggestions.push(k); }

  const platformScores: Record<string, number> = {};
  for (const [key, cfg] of Object.entries(PLATFORM_LIMITS)) {
    let ps = 0;
    if (charCount <= cfg.titleMax) ps += 30; if (words.length >= 5) ps += 20; if (fillers.length === 0) ps += 20; if (foundStyles.length > 0) ps += 15; if (foundColors.length > 0) ps += 15;
    platformScores[key] = Math.min(100, ps);
  }

  return { score, grade, issues, strengths, suggestions, optimizedTitle: optimized, keywordSuggestions: kwSuggestions, platformScores, charWeightMap, densityCheck, categoryMatch, searchVolumes };
}

// ─── Components ───
function ScoreRing({ score, size = 72 }: { score: number; size?: number }) {
  const r = (size - 8) / 2; const c = 2 * Math.PI * r; const o = c - (score / 100) * c;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : score >= 40 ? "#f97316" : "#ef4444";
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="absolute" width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={4} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={4} strokeDasharray={c} strokeDashoffset={o} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      </svg>
      <span className="text-lg font-bold" style={{ color }}>{score}</span>
    </div>
  );
}

function Section({ title, icon, children, defaultOpen = true }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-3 rounded-xl border border-border overflow-hidden">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-2 bg-surface px-4 py-2.5 text-xs font-semibold text-text-primary hover:bg-accent/5 transition-colors">
        {icon}<span className="flex-1 text-left">{title}</span>
        {open ? <ChevronUp className="h-3 w-3 text-text-muted" /> : <ChevronDown className="h-3 w-3 text-text-muted" />}
      </button>
      {open && <div className="border-t border-border bg-bg-secondary/30 p-3">{children}</div>}
    </div>
  );
}

// ─── Main ───
export default function TitleOptimizerPage() {
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("adobestock");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<{ id: number; title: string; platform: string; score: number; grade: string; timestamp: number }[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [abPair, setAbPair] = useState<{ titleA: string; titleB: string; resultA: AnalysisResult | null; resultB: AnalysisResult | null }>({ titleA: "", titleB: "", resultA: null, resultB: null });
  const [activeTab, setActiveTab] = useState<"analyze"|"compare"|"bulk"|"formulas">("analyze");
  const [bulkTitles, setBulkTitles] = useState("");
  const [bulkResults, setBulkResults] = useState<{ title: string; result: AnalysisResult }[]>([]);
  const [selectedFormula, setSelectedFormula] = useState<number | null>(null);
  const [category, setCategory] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (title.trim()) { timerRef.current = setTimeout(() => setResult(analyzeTitle(title, platform)), 300); }
    else setResult(null);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [title, platform]);

  useEffect(() => { try { const s = localStorage.getItem("title-optimizer-history"); if (s) setHistory(JSON.parse(s)); } catch {} }, []);

  const saveHistory = useCallback((t: string, p: string, s: number, g: string) => {
    const item = { id: Date.now(), title: t, platform: p, score: s, grade: g, timestamp: Date.now() };
    const updated = [item, ...history].slice(0, 50);
    setHistory(updated);
    localStorage.setItem("title-optimizer-history", JSON.stringify(updated));
  }, [history]);

  const handleCopy = useCallback((text: string) => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }, []);
  const handleAnalyze = useCallback(() => { if (!title.trim()) return; const r = analyzeTitle(title, platform); setResult(r); saveHistory(title, platform, r.score, r.grade); }, [title, platform, saveHistory]);

  return (
    <ToolLayout>
      {/* ─── Middle: Results ─── */}
      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border bg-bg px-5 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10"><Type className="h-4 w-4 text-accent" /></div>
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Title Optimizer</h2>
            <p className="text-[11px] text-text-muted">SEO analysis & optimization</p>
          </div>
        </div>
        <div className="flex flex-1 flex-col overflow-hidden min-h-0">
          {result ? (
            <div className="flex-1 overflow-y-auto p-5">
              <div className="w-full space-y-3">
                {/* Score Header */}
                <div className="flex items-center gap-5 rounded-2xl border border-border bg-surface p-5">
                  <ScoreRing score={result.score} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2"><span className="text-2xl font-bold text-text-primary">{result.grade}</span><span className="text-sm text-text-muted">Grade</span></div>
                    <p className="mt-1 text-xs text-text-secondary">{result.score >= 80 ? "Excellent!" : result.score >= 60 ? "Good — a few improvements" : result.score >= 40 ? "Needs work" : "Consider rewriting"}</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-center"><p className="text-lg font-bold text-green-500">{result.strengths.length}</p><p className="text-[10px] text-text-muted">Strengths</p></div>
                    <div className="text-center"><p className="text-lg font-bold text-red-500">{result.issues.filter(i => i.type === "error").length}</p><p className="text-[10px] text-text-muted">Errors</p></div>
                    <div className="text-center"><p className="text-lg font-bold text-amber-500">{result.issues.filter(i => i.type === "warning").length}</p><p className="text-[10px] text-text-muted">Warnings</p></div>
                  </div>
                  <button onClick={() => { const csv = `Field,Value\nTitle,"${title}"\nPlatform,${platform}\nScore,${result.score}\nGrade,${result.grade}\nOptimized,"${result.optimizedTitle}"`; const b = new Blob([csv], { type: "text/csv" }); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = `title-analysis-${Date.now()}.csv`; a.click(); }} className="rounded-xl border border-border bg-surface px-3 py-2 text-text-muted transition-all hover:text-accent"><Download className="h-4 w-4" /></button>
                </div>

                {result.issues.length > 0 && <Section title="Issues" icon={<AlertTriangle className="h-3.5 w-3.5 text-red-500" />}><div className="space-y-1.5">{result.issues.map((issue, i) => <div key={i} className="flex items-start gap-2 rounded-lg border border-border bg-surface px-3 py-2">{issue.type === "error" ? <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" /> : issue.type === "warning" ? <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" /> : <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-400" />}<p className="text-xs text-text-secondary">{issue.message}</p></div>)}</div></Section>}

                {result.strengths.length > 0 && <Section title="Strengths" icon={<CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}><div className="flex flex-wrap gap-1.5">{result.strengths.map((s, i) => <span key={i} className="rounded-full bg-green-500/10 px-2.5 py-1 text-[10px] font-medium text-green-600 dark:text-green-400">{s}</span>)}</div></Section>}

                {result.charWeightMap.length > 0 && <Section title="Character Weight" icon={<BarChart3 className="h-3.5 w-3.5 text-accent" />}><div className="flex flex-wrap gap-1">{result.charWeightMap.map((cw, i) => <span key={i} className="rounded-md px-2 py-1 text-[11px] font-medium" style={{ backgroundColor: cw.color + "15", color: cw.color }}>{cw.word}</span>)}</div><div className="mt-2 flex gap-3 text-[9px] text-text-muted"><span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded bg-green-500" /> Color</span><span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded bg-indigo-500" /> Style</span><span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded bg-amber-500" /> Subject</span><span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded bg-red-500" /> Filler</span></div></Section>}

                {result.densityCheck.length > 0 && <Section title="Keyword Density" icon={<Target className="h-3.5 w-3.5 text-accent" />}><div className="space-y-1.5">{result.densityCheck.slice(0, 8).map((d, i) => <div key={i} className="flex items-center gap-2 rounded-lg bg-surface px-3 py-1.5"><span className="text-[11px] text-text-secondary">{d.word}</span><span className={`text-[10px] font-bold ${d.status === "overstuff" ? "text-red-500" : d.status === "warning" ? "text-amber-500" : "text-green-500"}`}>×{d.count}</span>{d.status === "overstuff" && <span className="text-[9px] text-red-400">Overstuff!</span>}</div>)}</div></Section>}

                {result.searchVolumes.length > 0 && <Section title="Search Volume" icon={<TrendingUp className="h-3.5 w-3.5 text-accent" />}><div className="space-y-1">{result.searchVolumes.map((sv, i) => <div key={i} className="flex items-center justify-between rounded-lg bg-surface px-3 py-1.5"><span className="text-[11px] text-text-secondary">{sv.keyword}</span><span className={`text-[10px] font-bold ${sv.volume === "Very High" ? "text-green-500" : sv.volume === "High" ? "text-emerald-400" : sv.volume === "Medium" ? "text-amber-500" : "text-text-muted"}`}>{sv.volume}</span></div>)}</div></Section>}

                <Section title="Platform Compatibility" icon={<BarChart3 className="h-3.5 w-3.5 text-accent" />}><div className="grid grid-cols-3 gap-2">{Object.entries(result.platformScores).map(([key, score]) => <div key={key} className={`rounded-xl border p-3 ${key === platform ? "border-accent bg-accent/5" : "border-border bg-surface"}`}><p className="text-[10px] font-medium text-text-muted capitalize">{key.replace("stock"," Stock").replace("istock","iStock").replace("pond5","Pond5").replace("freepik","Freepik").replace("vecteezy","Vecteezy")}</p><div className="mt-1 flex items-center gap-2"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border"><div className="h-full rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444" }} /></div><span className="text-xs font-bold" style={{ color: score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444" }}>{score}</span></div></div>)}</div></Section>

                {result.categoryMatch.length > 0 && <Section title="Category Match" icon={<Layers className="h-3.5 w-3.5 text-accent" />}><div className="space-y-1">{result.categoryMatch.map((cm, i) => <div key={i} className="flex items-center gap-2 rounded-lg bg-surface px-3 py-1.5"><span className="flex-1 text-[11px] text-text-secondary">{cm.category}</span><div className="h-1.5 w-16 overflow-hidden rounded-full bg-border"><div className="h-full rounded-full bg-accent" style={{ width: `${cm.score}%` }} /></div><span className="text-[10px] font-bold text-accent">{cm.score}%</span></div>)}</div></Section>}

                {result.optimizedTitle && <Section title="Optimized Title" icon={<Sparkles className="h-3.5 w-3.5 text-green-500" />}><div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3"><p className="text-sm text-text-primary">{result.optimizedTitle}</p><button onClick={() => handleCopy(result.optimizedTitle)} className="mt-2 flex items-center gap-1.5 rounded-lg bg-green-500/10 px-3 py-1.5 text-[10px] font-medium text-green-600 dark:text-green-400">{copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} {copied ? "Copied!" : "Copy"}</button></div></Section>}

                {result.keywordSuggestions.length > 0 && <Section title="Keyword Suggestions" icon={<Target className="h-3.5 w-3.5 text-accent" />}><div className="flex flex-wrap gap-1.5">{result.keywordSuggestions.map((kw, i) => <button key={i} onClick={() => handleCopy(kw)} className="rounded-full border border-border bg-surface px-2.5 py-1 text-[10px] font-medium text-text-secondary hover:border-accent/30 hover:text-accent">{kw}</button>)}</div></Section>}
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10"><Search className="h-8 w-8 text-accent" /></div>
              <h3 className="mb-1 text-sm font-semibold text-text-primary">Analyze Your Title</h3>
              <p className="max-w-xs text-[11px] text-text-muted">Enter a title on the left — scoring updates in real-time</p>
            </div>
          )}
        </div>
      </main>

      {/* ─── Right: Controls Sidebar (280px) ─── */}
      <aside className="hidden w-[280px] shrink-0 flex-col overflow-y-auto min-h-0 border-l border-border bg-bg-secondary lg:flex">
        <div className="p-4">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-text-primary">Controls</h2>
            <p className="text-[11px] text-text-muted">Platform, input & export</p>
          </div>

          {/* Platform */}
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-text-muted">Platform</label>
          <div className="mb-4 flex flex-wrap gap-1.5">
            {Object.keys(PLATFORM_LIMITS).map(key => (
              <button key={key} onClick={() => setPlatform(key)} className={`rounded-lg px-2 py-1 text-[10px] font-medium transition-all ${platform === key ? "bg-accent text-white" : "border border-border bg-surface text-text-secondary hover:border-accent/30"}`}>
                {key.replace("stock"," Stock").replace("istock","iStock").replace("pond5","Pond5").replace("freepik","Freepik").replace("vecteezy","Vecteezy")}
              </button>
            ))}
          </div>

          {/* Tabs */}
          <div className="mb-4 flex gap-1 rounded-lg border border-border bg-surface p-1">
            {([["analyze","Analyze"],["compare","A/B"],["bulk","Bulk"],["formulas","Templates"]] as const).map(([id, label]) => (
              <button key={id} onClick={() => setActiveTab(id)} className={`flex-1 rounded-md py-1.5 text-[10px] font-semibold transition-all ${activeTab === id ? "bg-accent text-white shadow-sm" : "text-text-muted hover:text-text-secondary"}`}>{label}</button>
            ))}
          </div>

          {/* ─── ANALYZE ─── */}
          {activeTab === "analyze" && <>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-text-muted">Your Title</label>
            <textarea value={title} onChange={e => setTitle(e.target.value)} placeholder="Paste or type your stock title..." rows={4} className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent focus:outline-none" />
            {title.length > 0 && <div className="mt-2"><div className="h-1.5 rounded-full bg-border overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (title.length / (PLATFORM_LIMITS[platform]?.titleMax || 150)) * 100)}%`, backgroundColor: title.length > (PLATFORM_LIMITS[platform]?.titleMax || 150) ? "#ef4444" : "#10b981" }} /></div><div className="mt-1 flex justify-between text-[10px] text-text-muted"><span>{title.length}/{PLATFORM_LIMITS[platform]?.titleMax || 150}</span><span>{title.split(/\s+/).filter(Boolean).length} words</span></div></div>}
            <label className="mt-3 mb-1 block text-[10px] font-bold uppercase tracking-wider text-text-muted">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text-primary"><option value="">Auto-detect</option>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
            <div className="mt-3 flex gap-2">
              <button onClick={handleAnalyze} disabled={!title.trim()} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-40"><Zap className="h-4 w-4" /> Analyze</button>
              <button onClick={() => { setTitle(""); setResult(null); }} className="rounded-xl border border-border bg-surface px-3 py-2 text-text-muted hover:text-text-primary"><RotateCcw className="h-4 w-4" /></button>
            </div>
            {!result && <div className="mt-4 rounded-xl border border-border bg-surface p-3"><h3 className="mb-2 text-xs font-semibold text-text-primary">Quick Tips</h3><ul className="space-y-1">{["Start with the main subject","Include style + color descriptors","Avoid filler words","End with a period","Keep within platform limits"].map((tip, i) => <li key={i} className="flex items-start gap-2 text-[11px] text-text-secondary"><CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-accent" />{tip}</li>)}</ul></div>}
            <button onClick={() => setShowHistory(!showHistory)} className="mt-3 flex w-full items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-medium text-text-secondary hover:text-accent"><History className="h-3.5 w-3.5" /> History ({history.length}){showHistory ? <ChevronUp className="ml-auto h-3 w-3" /> : <ChevronDown className="ml-auto h-3 w-3" />}</button>
            {showHistory && <div className="mt-2 max-h-40 space-y-1 overflow-y-auto">{history.length === 0 && <p className="text-[10px] text-text-muted text-center py-2">No history</p>}{history.map(h => <button key={h.id} onClick={() => { setTitle(h.title); setPlatform(h.platform); }} className="flex w-full items-center gap-2 rounded-lg border border-border bg-surface px-2 py-1.5 text-left hover:border-accent/30"><span className={`text-xs font-bold ${h.score >= 80 ? "text-green-500" : h.score >= 60 ? "text-amber-500" : "text-red-500"}`}>{h.score}</span><span className="flex-1 truncate text-[10px] text-text-secondary">{h.title}</span></button>)}</div>}
          </>}

          {/* ─── A/B ─── */}
          {activeTab === "compare" && <>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-text-muted">Title A</label>
            <textarea value={abPair.titleA} onChange={e => setAbPair(p => ({ ...p, titleA: e.target.value }))} placeholder="First title..." rows={2} className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent focus:outline-none" />
            <label className="mt-3 mb-1 block text-[10px] font-bold uppercase tracking-wider text-text-muted">Title B</label>
            <textarea value={abPair.titleB} onChange={e => setAbPair(p => ({ ...p, titleB: e.target.value }))} placeholder="Second title..." rows={2} className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent focus:outline-none" />
            <button onClick={() => { if (abPair.titleA.trim()) setAbPair(p => ({ ...p, resultA: analyzeTitle(p.titleA, platform) })); if (abPair.titleB.trim()) setAbPair(p => ({ ...p, resultB: analyzeTitle(p.titleB, platform) })); }} disabled={!abPair.titleA.trim() || !abPair.titleB.trim()} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-40"><GitCompare className="h-4 w-4" /> Compare</button>
          </>}

          {/* ─── BULK ─── */}
          {activeTab === "bulk" && <>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-text-muted">Bulk Titles (one per line)</label>
            <textarea value={bulkTitles} onChange={e => setBulkTitles(e.target.value)} placeholder={"Title 1\nTitle 2\nTitle 3..."} rows={8} className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent focus:outline-none" />
            <div className="mt-2 flex justify-between text-[10px] text-text-muted"><span>{bulkTitles.split("\n").filter(l => l.trim()).length} titles</span></div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => { const lines = bulkTitles.split("\n").filter(l => l.trim()); setBulkResults(lines.map(l => ({ title: l.trim(), result: analyzeTitle(l.trim(), platform) }))); }} disabled={!bulkTitles.trim()} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-40"><Zap className="h-4 w-4" /> Analyze All</button>
            </div>
          </>}

          {/* ─── TEMPLATES ─── */}
          {activeTab === "formulas" && <>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-text-muted">Title Formulas</label>
            <div className="space-y-2">{TITLE_FORMULAS.map((f, i) => <button key={i} onClick={() => setSelectedFormula(i === selectedFormula ? null : i)} className={`w-full rounded-xl border p-2.5 text-left transition-all ${selectedFormula === i ? "border-accent bg-accent/5" : "border-border bg-surface hover:border-accent/30"}`}><div className="flex items-center justify-between"><span className="text-xs font-semibold text-text-primary">{f.name}</span>{selectedFormula === i ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}</div>{selectedFormula === i && <div className="mt-2 space-y-2"><div className="rounded-lg bg-bg-secondary p-2"><p className="text-[10px] font-medium text-accent">Formula</p><p className="text-[11px] text-text-secondary">{f.formula}</p></div><div className="rounded-lg bg-bg-secondary p-2"><p className="text-[10px] font-medium text-green-500">Example</p><p className="text-[11px] text-text-secondary">{f.example}</p></div><button onClick={e => { e.stopPropagation(); setTitle(f.example); setActiveTab("analyze"); }} className="flex items-center gap-1 rounded-lg bg-accent/10 px-2 py-1 text-[10px] font-medium text-accent hover:bg-accent/20"><Copy className="h-3 w-3" /> Use</button></div>}</button>)}</div>
            <div className="mt-4 rounded-xl border border-border bg-surface p-3"><h3 className="mb-2 flex items-center gap-2 text-xs font-semibold"><TrendingUp className="h-3.5 w-3.5 text-accent" /> Trending Keywords</h3><div className="flex flex-wrap gap-1">{TRENDING_KEYWORDS.map((kw, i) => <button key={i} onClick={() => handleCopy(kw)} className="rounded-full border border-border px-2 py-0.5 text-[10px] text-text-secondary hover:border-accent/30 hover:text-accent">{kw}</button>)}</div></div>
            <div className="mt-3 rounded-xl border border-border bg-surface p-3"><h3 className="mb-2 flex items-center gap-2 text-xs font-semibold"><Eye className="h-3.5 w-3.5 text-accent" /> Competitor Titles</h3><div className="space-y-1.5">{COMPETITOR_TITLES.map((t, i) => { const s = analyzeTitle(t, "adobestock"); return <button key={i} onClick={() => { setTitle(t); setActiveTab("analyze"); }} className="w-full rounded-lg border border-border p-2 text-left hover:border-accent/30"><div className="flex items-center gap-2"><span className={`text-xs font-bold ${s.score >= 80 ? "text-green-500" : "text-amber-500"}`}>{s.score}</span><span className="flex-1 text-[10px] text-text-secondary line-clamp-2">{t}</span></div></button>; })}</div></div>
          </>}
        </div>
      </aside>
    </ToolLayout>
  );
}
