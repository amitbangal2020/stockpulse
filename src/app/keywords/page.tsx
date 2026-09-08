"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { analyzeKeyword, KeywordAnalysis } from "@/lib/stock-api";
import { Search, BarChart3, Target, Lightbulb, TrendingUp, History } from "lucide-react";

const VOLUME_COLORS: Record<string, string> = { very_high: "bg-green-500", high: "bg-green-400", medium: "bg-yellow-400", low: "bg-orange-400", very_low: "bg-red-400" };
const COMP_COLORS: Record<string, string> = { very_high: "bg-red-500", high: "bg-red-400", medium: "bg-yellow-400", low: "bg-green-400", very_low: "bg-green-500" };
const POPULAR_KEYWORDS = ["business", "technology", "nature", "abstract", "food", "travel", "health", "finance", "education", "marketing", "coffee", "minimal", "space", "yoga", "robotics", "sustainability"];

function KeywordsPage() {
  const [keyword, setKeyword] = useState("");
  const [analysis, setAnalysis] = useState<KeywordAnalysis | null>(null);
  const [history, setHistory] = useState<KeywordAnalysis[]>([]);

  const analyze = (q?: string) => {
    const k = q || keyword;
    if (!k.trim()) return;
    const result = analyzeKeyword(k);
    setAnalysis(result);
    setHistory((prev) => [result, ...prev.filter((h) => h.keyword !== k)].slice(0, 10));
  };

  return (
    <ToolLayout>
      <div className="flex flex-1 flex-col overflow-y-auto min-h-0">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-text-primary">Keyword Analyzer</h2>
          <p className="text-xs text-text-muted">Analyze any keyword to find competition levels, trending niches, and optimization tips</p>
          <div className="mt-3 flex max-w-xl gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && analyze()} placeholder="Enter a keyword (e.g., 'business', 'nature')" className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-text-primary outline-none placeholder:text-text-muted transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10" />
            </div>
            <button onClick={() => analyze()} className="rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-accent/20 transition-all hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/25">Analyze</button>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {POPULAR_KEYWORDS.map((k) => (
              <button key={k} onClick={() => { setKeyword(k); analyze(k); }} className="rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-medium text-text-secondary transition-all hover:border-accent hover:text-accent">{k}</button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {analysis ? (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <div className="space-y-5 lg:col-span-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border bg-surface p-5">
                    <p className="mb-2 text-xs uppercase tracking-wider text-text-muted">Search Volume</p>
                    <div className="flex items-center gap-2.5"><div className={`h-2.5 w-2.5 rounded-full ${VOLUME_COLORS[analysis.searchVolume]}`} /><span className="text-xl font-bold capitalize text-text-primary">{analysis.searchVolume.replace("_", " ")}</span></div>
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border"><div className="h-1.5 rounded-full bg-accent transition-all" style={{ width: `${analysis.demandScore}%` }} /></div>
                    <p className="mt-1 text-[10px] text-text-muted">Demand Score: {analysis.demandScore}/100</p>
                  </div>
                  <div className="rounded-xl border border-border bg-surface p-5">
                    <p className="mb-2 text-xs uppercase tracking-wider text-text-muted">Competition Level</p>
                    <div className="flex items-center gap-2.5"><div className={`h-2.5 w-2.5 rounded-full ${COMP_COLORS[analysis.competition]}`} /><span className="text-xl font-bold capitalize text-text-primary">{analysis.competition.replace("_", " ")}</span></div>
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border"><div className="h-1.5 rounded-full bg-danger transition-all" style={{ width: `${analysis.competitionScore}%` }} /></div>
                    <p className="mt-1 text-[10px] text-text-muted">Competition Score: {analysis.competitionScore}/100</p>
                  </div>
                </div>

                <div className="rounded-xl border border-accent/20 bg-accent-subtle p-5">
                  <p className="mb-2 text-xs uppercase tracking-wider text-text-muted">Suggested Niche</p>
                  <p className="text-lg font-semibold text-text-primary">{analysis.suggestedNiche}</p>
                  <div className="mt-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${analysis.trendDirection === "rising" ? "bg-accent/10 text-accent" : analysis.trendDirection === "declining" ? "bg-danger/10 text-danger" : "bg-border text-text-secondary"}`}>
                      {analysis.trendDirection === "rising" ? "📈" : analysis.trendDirection === "declining" ? "📉" : "➡️"} {analysis.trendDirection} ({analysis.monthlyGrowth > 0 ? "+" : ""}{analysis.monthlyGrowth}%)
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-surface p-5">
                  <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted"><Lightbulb className="h-3.5 w-3.5" /> Optimization Tips</p>
                  <div className="space-y-2.5">
                    {analysis.tips.map((tip, i) => (
                      <div key={i} className="flex gap-3">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-accent-subtle text-[10px] font-bold text-accent">{i + 1}</span>
                        <p className="text-sm text-text-secondary">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-border bg-surface p-5">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Related Keywords</p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.relatedKeywords.map((rk, i) => (
                      <button key={i} onClick={() => { setKeyword(rk); analyze(rk); }} className="rounded-md border border-accent/20 bg-accent-subtle px-2.5 py-1 text-xs text-accent transition-all hover:bg-accent/10">{rk}</button>
                    ))}
                  </div>
                </div>

                {history.length > 1 && (
                  <div className="rounded-xl border border-border bg-surface p-5">
                    <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted"><History className="h-3.5 w-3.5" /> Recent Searches</p>
                    <div className="space-y-1.5">
                      {history.slice(1).map((h, i) => (
                        <button key={i} onClick={() => { setKeyword(h.keyword); analyze(h.keyword); }} className="flex w-full items-center justify-between rounded-lg p-2 text-left transition-all hover:bg-bg-secondary">
                          <span className="text-xs font-medium text-text-secondary">{h.keyword}</span>
                          <div className="flex items-center gap-1.5"><div className={`h-2 w-2 rounded-full ${VOLUME_COLORS[h.searchVolume]}`} /><div className={`h-2 w-2 rounded-full ${COMP_COLORS[h.competition]}`} /></div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-xl border border-accent/20 bg-accent-subtle p-5">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-accent">Quick Summary</p>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between"><span className="text-text-muted">Keyword</span><span className="font-bold text-text-primary">{analysis.keyword}</span></div>
                    <div className="flex justify-between"><span className="text-text-muted">Volume</span><span className="font-bold capitalize text-text-primary">{analysis.searchVolume.replace("_", " ")}</span></div>
                    <div className="flex justify-between"><span className="text-text-muted">Competition</span><span className="font-bold capitalize text-text-primary">{analysis.competition.replace("_", " ")}</span></div>
                    <div className="flex justify-between"><span className="text-text-muted">Trend</span><span className="font-bold capitalize text-text-primary">{analysis.trendDirection}</span></div>
                    <div className="flex justify-between"><span className="text-text-muted">Opportunity</span><span className="font-bold text-accent">{analysis.demandScore > analysis.competitionScore ? "✅ High" : "⚠️ Low"}</span></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
                <BarChart3 className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-base font-semibold text-text-primary">Analyze Any Keyword</h3>
              <p className="mt-1.5 max-w-xs text-sm text-text-muted leading-relaxed">Enter a keyword above to see competition levels, demand scores, trending niches, and optimization tips</p>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}

export default KeywordsPage;
