"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Search,
  TrendingUp,
  BarChart3,
  Download,
  Filter,
  Grid3X3,
  List,
  ChevronDown,
  ExternalLink,
  Loader2,
} from "lucide-react";

// Types from stock-api
interface StockAsset {
  id: string;
  title: string;
  thumbnailUrl: string;
  downloads: number;
  views: number;
  performance: number;
  tags: string[];
  uploadDate: string;
  contributor: string;
  contributorId?: string;
  keywordsCount: number;
  similarImagesCount: number;
  category: string;
  mediaType: "image" | "video" | "vector" | "template" | "3d";
  isAI?: boolean;
  width?: number;
  height?: number;
  description?: string;
}

const QUICK_TAGS = ["robotics", "nature", "business", "coffee", "yoga", "space"];

export function SearchTool() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StockAsset[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const [mediaFilter, setMediaFilter] = useState("all");
  const [aiFilter, setAiFilter] = useState("include");
  const [searched, setSearched] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");
  const [isCreatorResults, setIsCreatorResults] = useState(false);
  const queryRef = useRef("");
  queryRef.current = query;
  const aiFilterRef = useRef("include");
  aiFilterRef.current = aiFilter;
  const prevAiFilterRef = useRef("include");

  // Re-search when AI filter changes (triggers gentech server-side filter)
  useEffect(() => {
    if (searched && prevAiFilterRef.current !== aiFilter) {
      prevAiFilterRef.current = aiFilter;
      doSearch();
    }
  }, [aiFilter, searched]);

  const doSearch = useCallback(async (q?: string) => {
    const searchQ = (q || queryRef.current || "").trim();
    if (!searchQ) return;
    setQuery(searchQ);
    setIsLoading(true);
    setSearched(true);
    setIsCreatorResults(false);

    // Build gentech param for AI filtering
    const aiFilterVal = aiFilterRef.current;
    const gentechParam = aiFilterVal === 'only' ? '&gentech=true' : aiFilterVal === 'exclude' ? '&gentech=false' : '';

    const isNumericId = /^\d{6,}$/.test(searchQ.replace(/\s/g, ""));
    const isExplicitCreator = /^creator[_:]?\d+$/i.test(searchQ.replace(/\s/g, ""));

    try {
      let url: string;
      if (isExplicitCreator) {
        const cid = searchQ.replace(/\D/g, "");
        url = `/api/asset?creator_id=${cid}&limit=100&offset=0${gentechParam}`;
      } else if (isNumericId) {
        // Try as asset ID first — API now uses exact ID lookup
        const resp = await fetch(`/api/asset?id=${encodeURIComponent(searchQ)}${gentechParam}`);
        const data = await resp.json();
        if (data.found && data.assetId && String(data.assetId) === searchQ.replace(/\s/g, "")) {
          const asset: StockAsset = {
            id: data.assetId, title: data.title,
            thumbnailUrl: data.thumbnail || `https://stock.adobe.com/${data.assetId}`,
            downloads: data.downloads ?? 0,
            views: data.views ?? 0,
            performance: data.downloads != null ? Math.min(100, Math.floor((data.downloads / 5) + 20)) : 0,
            tags: data.keywords || [], uploadDate: data.creationDate || "",
            contributor: data.creator || "Unknown", contributorId: data.creatorId || "",
            keywordsCount: data.keywordsCount || 0, similarImagesCount: 0,
            category: data.category || "General",
            mediaType: (data.mediaType?.toLowerCase() || "image") as StockAsset["mediaType"],
            isAI: data.isAI ?? false,
          };
          setResults([asset]); setTotal(1); setIsLoading(false); return;
        }
        // Try as creator
        const resp2 = await fetch(`/api/asset?creator_id=${encodeURIComponent(searchQ)}&limit=100&offset=0${gentechParam}`);
        const data2 = await resp2.json();
        if (data2.found && data2.files && data2.files.length > 0) {
          setIsCreatorResults(true);
          const assets2: StockAsset[] = data2.files.map((f: any) => ({
            id: f.id, title: f.title, thumbnailUrl: f.thumbnail || `https://stock.adobe.com/${f.id}`,
            downloads: f.downloads ?? 0, views: f.views ?? 0, performance: f.downloads != null ? Math.min(100, Math.floor((f.downloads / 5) + 20)) : 0,
            tags: [], uploadDate: f.creationDate || "", contributor: f.creator || data2.creatorName || "Unknown",
            contributorId: data2.creatorId || searchQ, keywordsCount: 0, similarImagesCount: 0,
            category: f.category || "General", mediaType: (f.mediaType?.toLowerCase() || "image") as StockAsset["mediaType"],
            isAI: f.isAI ?? false,
          }));
          assets2.sort((a, b) => b.downloads - a.downloads);
          setResults(assets2); setTotal(data2.total || assets2.length); setIsLoading(false); return;
        }
        // Not found as asset or creator — show clear error, don't silently keyword-search
        setResults([]); setTotal(0); setIsLoading(false); return;
      } else {
        url = `/api/asset?q=${encodeURIComponent(searchQ)}&limit=20&offset=0${gentechParam}`;
      }

      const resp = await fetch(url);
      const data = await resp.json();
      if (data.found && data.files) {
        if (isExplicitCreator) setIsCreatorResults(true);
        const assets: StockAsset[] = data.files.map((f: any) => ({
          id: f.id, title: f.title, thumbnailUrl: f.thumbnail || `https://stock.adobe.com/${f.id}`,          downloads: f.downloads ?? 0,
          views: f.views ?? 0,
          performance: f.downloads != null ? Math.min(100, Math.floor((f.downloads / 5) + 20)) : 0,
          tags: (f.keywords || []).slice(0, 10), uploadDate: f.creationDate || "",
          contributor: f.creator || data.creatorName || "Unknown", contributorId: data.creatorId || "",
          keywordsCount: (f.keywords || []).length, similarImagesCount: 0,
          category: f.category || "General", mediaType: (f.mediaType?.toLowerCase() || "image") as StockAsset["mediaType"],
          isAI: f.isAI ?? false,
        }));
        if (isExplicitCreator) assets.sort((a, b) => b.downloads - a.downloads);
        setResults(assets); setTotal(data.total || assets.length);
      } else {
        setResults([]); setTotal(0);
      }
    } catch (e) {
      console.error("Search failed:", e);
      setResults([]); setTotal(0);
    }
    setIsLoading(false);
  }, []);

  const filteredResults = useMemo(() => {
    let filtered = results;
    if (aiFilter === "exclude") filtered = filtered.filter((r) => !r.isAI);
    else if (aiFilter === "only") filtered = filtered.filter((r) => r.isAI);
    if (mediaFilter !== "all") {
      filtered = filtered.filter((r) => {
        const t = r.mediaType.toLowerCase();
        if (mediaFilter === "image") return t === "photo" || t === "illustration" || t === "image";
        if (mediaFilter === "vector") return t === "vector";
        if (mediaFilter === "video") return t === "video";
        return true;
      });
    }
    return filtered;
  }, [results, mediaFilter, aiFilter]);

  const sortedResults = useMemo(() => {
    const maxDl = Math.max(...filteredResults.map((r) => r.downloads), 1);
    const withPerf = filteredResults.map((r) => ({
      ...r,
      performance: Math.min(100, Math.round((r.downloads / maxDl) * 100)),
    }));
    const sorted = [...withPerf];
    switch (sortBy) {
      case "downloads-desc": sorted.sort((a, b) => b.downloads - a.downloads); break;
      case "downloads-asc": sorted.sort((a, b) => a.downloads - b.downloads); break;
      case "performance-desc": sorted.sort((a, b) => b.performance - a.performance); break;
      case "date-desc": sorted.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()); break;
      case "date-asc": sorted.sort((a, b) => new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime()); break;
      default: sorted.sort((a, b) => b.downloads - a.downloads); break;
    }
    return sorted;
  }, [filteredResults, sortBy]);

  const exportCSV = () => {
    const headers = ["ID", "Title", "Downloads", "Performance", "Tags", "Upload Date", "Contributor", "Category", "Media Type"];
    const rows = sortedResults.map((a) => [a.id, a.title, a.downloads, a.performance, a.tags.join("; "), a.uploadDate, a.contributor, a.category, a.mediaType]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `stockpulse-${query}-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const totalDownloads = useMemo(() => sortedResults.reduce((sum, r) => sum + r.downloads, 0), [sortedResults]);
  const avgDownloads = sortedResults.length > 0 ? (totalDownloads / sortedResults.length).toFixed(1) : "0";
  const topPerformer = sortedResults.length > 0 ? sortedResults[0] : null;

  return (
    <div className="flex flex-1 flex-col overflow-y-auto min-h-0">
      {/* Hero Section */}
      <div className="flex w-full flex-col items-center px-6 pt-6 pb-5 text-center border-b border-border">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent-subtle px-4 py-1.5 text-xs font-semibold text-accent">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          Live Adobe Stock Data
        </div>
        <h1 className="font-heading text-xl font-bold tracking-tight text-text-primary sm:text-2xl lg:text-3xl">
          Analyze Stock <span className="text-accent">Performance</span>
        </h1>
        <p className="mt-2 max-w-lg text-xs leading-relaxed text-text-secondary sm:text-sm">
          Real-time download analytics for contributors. Track, compare, and optimize your portfolio.
        </p>

        {/* Search Bar */}
        <div className="mt-6 flex w-full max-w-xl items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doSearch()}
              placeholder="Search keyword, asset ID, or creator ID..."
              className="w-full rounded-xl border border-border bg-surface py-3 pl-11 pr-4 text-sm text-text-primary outline-none placeholder:text-text-muted transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
            />
          </div>
          <button
            onClick={() => doSearch()}
            disabled={isLoading}
            className="shrink-0 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-md shadow-accent/20 transition-all hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/25 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
          </button>
        </div>

        {/* Quick Tags */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm">
          <span className="text-text-muted">Quick:</span>
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => { setQuery(tag); doSearch(tag); }}
              className="rounded-lg border border-border bg-surface px-3 py-1 text-xs font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Control Bar (sticky - doesn't scroll) */}
      {searched && (
        <div className="sticky top-0 z-10 border-b border-border bg-bg/80 backdrop-blur-sm p-3">
          <div className="flex items-center gap-3 overflow-x-auto">
              {/* Portfolio Info */}
              {isCreatorResults && results.length > 0 && (
                <div className="flex shrink-0 items-center gap-2.5 pr-3 border-r border-border">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-accent/5 text-sm font-bold text-accent ring-1 ring-accent/20">
                    {results[0]?.contributor?.[0] || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary whitespace-nowrap">{results[0]?.contributor}&apos;s Portfolio</p>
                    <p className="text-[11px] text-text-muted">{total} assets</p>
                  </div>
                </div>
              )}

              {/* Stats (compact inline) */}
              {sortedResults.length > 0 && (
                <div className="flex shrink-0 items-center gap-2 pr-3 border-r border-border">
                  <div className="text-center px-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Results</p>
                    <p className="text-sm font-bold text-text-primary leading-tight">{mediaFilter === "all" ? total : sortedResults.length}</p>
                  </div>
                  <div className="text-center px-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Downloads</p>
                    <p className="text-sm font-bold text-accent leading-tight">{totalDownloads.toLocaleString()}</p>
                  </div>
                  <div className="text-center px-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Avg</p>
                    <p className="text-sm font-bold text-text-primary leading-tight">{avgDownloads}</p>
                  </div>
                  <div className="hidden lg:block text-center px-2 max-w-[140px]">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Top Performer</p>
                    <p className="text-xs font-bold text-text-primary truncate leading-tight">{topPerformer?.title?.slice(0, 22) || "—"}</p>
                  </div>
                </div>
              )}

              {/* Filters */}
              <div className="flex shrink-0 items-center gap-1.5 ml-auto">
                <div className="flex rounded-lg border border-border bg-background p-0.5">
                  <button onClick={() => setViewMode("table")} className={`p-1.5 rounded-md transition-all ${viewMode === "table" ? "bg-accent text-white shadow-sm" : "text-text-muted hover:text-text-primary"}`}>
                    <List className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-accent text-white shadow-sm" : "text-text-muted hover:text-text-primary"}`}>
                    <Grid3X3 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <select value={mediaFilter} onChange={(e) => setMediaFilter(e.target.value)} className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-text-secondary outline-none transition-colors hover:border-accent/40">
                  <option value="all">All Types</option>
                  <option value="image">Photos</option>
                  <option value="vector">Vectors</option>
                  <option value="video">Videos</option>
                </select>
                <select value={aiFilter} onChange={(e) => setAiFilter(e.target.value)} className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-text-secondary outline-none transition-colors hover:border-accent/40">
                  <option value="include">All</option>
                  <option value="exclude">Exclude AI</option>
                  <option value="only">AI Only</option>
                </select>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-text-secondary outline-none transition-colors hover:border-accent/40">
                  <option value="default">Best Performance</option>
                  <option value="downloads-desc">Most Downloads</option>
                  <option value="downloads-asc">Least Downloads</option>
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                </select>
                <button onClick={exportCSV} className="flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent-subtle px-2.5 py-1.5 text-xs font-medium text-accent transition-all hover:bg-accent/10">
                  <Download className="h-3.5 w-3.5" />
                  CSV ({sortedResults.length})
                </button>
              </div>
            </div>
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center py-20">
            <div className="relative">
              <div className="h-14 w-14 rounded-2xl bg-accent/10" />
              <Loader2 className="absolute inset-0 m-auto h-7 w-7 animate-spin text-accent" />
            </div>
            <p className="mt-4 text-sm font-medium text-text-primary">Fetching live data...</p>
            <p className="mt-1 text-xs text-text-muted">Searching Adobe Stock database</p>
          </div>
        )}

        {/* No Results */}
        {!isLoading && searched && results.length === 0 && (
          <div className="flex flex-col items-center py-20">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-background">
              <Search className="h-6 w-6 text-text-muted" />
            </div>
            <p className="mt-4 text-sm font-semibold text-text-primary">No results found</p>
            <p className="mt-1 text-xs text-text-muted">Try a different keyword or creator ID</p>
          </div>
        )}

        {/* Empty State */}
        {!searched && !isLoading && (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-accent/10 shadow-lg shadow-accent/10">
              <TrendingUp className="h-8 w-8 text-accent" />
            </div>
            <h3 className="font-heading text-lg font-semibold text-text-primary">Start Analyzing</h3>
            <p className="mt-1 max-w-sm text-sm text-text-muted">
              Search for any Adobe Stock asset ID, creator ID, or keyword to see real download data
            </p>
          </div>
        )}

        {/* List/Table View */}
        {!isLoading && sortedResults.length > 0 && viewMode === "table" && (
          <div className="space-y-2">
            {sortedResults.map((asset, idx) => {
              const d = asset.uploadDate ? new Date(asset.uploadDate) : null;
              const dateStr = d && !isNaN(d.getTime()) ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" }) : "";
              const maxDl = sortedResults[0]?.downloads || 1;
              const perfPct = Math.min(100, Math.round((asset.downloads / Math.max(maxDl, 1)) * 100));
              return (
                <div key={asset.id} className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-3 transition-all duration-200 hover:border-accent/30 hover:shadow-md hover:shadow-accent/5">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-background">
                    <img src={asset.thumbnailUrl} alt={asset.title} className="h-full w-full object-cover" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect fill='%231a1a2e' width='64' height='64'/%3E%3C/svg%3E"; }} />
                    <span className="absolute left-0.5 top-0.5 rounded bg-black/60 px-1 py-px text-[7px] font-bold uppercase text-white/90">{asset.mediaType}</span>
                    {asset.isAI && <span className="absolute bottom-0.5 left-0.5 rounded bg-purple-500/80 px-1 py-px text-[7px] font-bold text-white">AI</span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <button onClick={() => doSearch(asset.id)} className="text-left text-[13px] font-semibold text-text-primary hover:text-accent transition-colors line-clamp-1">{asset.title}</button>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-xs text-text-muted truncate">{asset.contributor}</span>
                      <span className="text-text-muted/40">·</span>
                      <span className="text-xs text-text-muted truncate">{asset.category}</span>
                      <span className="text-text-muted/40">·</span>
                      <span className="text-[10px] text-text-muted">{dateStr}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-center min-w-[50px]">
                      <div className="flex items-center gap-1">
                        <Download className="h-3 w-3 text-accent" />
                        <span className={`text-sm font-bold ${asset.downloads >= 2 ? "text-accent" : "text-text-muted"}`}>{asset.downloads}</span>
                      </div>
                      <p className="text-[9px] text-text-muted">downloads</p>
                    </div>
                    <div className="text-center min-w-[50px]">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-info" />
                        <span className="text-sm font-bold text-text-secondary">{asset.views.toLocaleString()}</span>
                      </div>
                      <p className="text-[9px] text-text-muted">views</p>
                    </div>
                    <div className="w-20">
                      <div className="h-1.5 w-full rounded-full bg-border">
                        <div className="h-full rounded-full bg-gradient-to-r from-accent/60 to-accent" style={{ width: `${perfPct}%` }} />
                      </div>
                    </div>
                    <a href={`https://stock.adobe.com/${asset.id}`} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-accent transition-colors">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Grid View */}
        {!isLoading && sortedResults.length > 0 && viewMode === "grid" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedResults.map((asset, idx) => {
              const d = asset.uploadDate ? new Date(asset.uploadDate) : null;
              const dateStr = d && !isNaN(d.getTime()) ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" }) : "";
              const maxDl = sortedResults[0]?.downloads || 1;
              const perfPct = Math.min(100, Math.round((asset.downloads / Math.max(maxDl, 1)) * 100));
              return (
                <div key={asset.id} className="group overflow-hidden rounded-xl border border-border bg-surface transition-all duration-200 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5">
                  {/* Thumbnail */}
                  <div className="relative h-48 overflow-hidden bg-background">
                    <img src={asset.thumbnailUrl} alt={asset.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 150'%3E%3Crect fill='%231a1a2e' width='200' height='150'/%3E%3Ctext fill='%23444' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E"; }} />
                    {/* Badges */}
                    <div className="absolute left-2 top-2 flex gap-1.5">
                      <span className="rounded-md bg-black/60 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/90 backdrop-blur-md">{asset.mediaType}</span>
                      {idx === 0 && asset.downloads > 0 && <span className="rounded-md bg-accent px-2 py-0.5 text-[9px] font-bold text-white shadow-sm">TOP</span>}
                    </div>
                    {asset.isAI && (
                      <div className="absolute bottom-2 left-2">
                        <span className="inline-flex items-center gap-0.5 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white/90 backdrop-blur-md">
                          <span className="h-1 w-1 rounded-full bg-purple-400" />
                          AI
                        </span>
                      </div>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                  </div>
                  {/* Content */}
                  <div className="p-3.5">
                    <button onClick={() => doSearch(asset.id)} className="text-left text-[13px] font-semibold text-text-primary hover:text-accent transition-colors line-clamp-2 leading-snug">{asset.title}</button>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <button onClick={() => { setQuery(asset.contributorId || asset.contributor); doSearch(asset.contributorId || asset.contributor); }} className="text-xs font-medium text-text-muted hover:text-accent transition-colors">{asset.contributor}</button>
                      <span className="text-text-muted/40">·</span>
                      <span className="text-xs text-text-muted truncate">{asset.category}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Download className="h-3.5 w-3.5 text-accent" />
                          <span className={`text-sm font-bold ${asset.downloads >= 2 ? "text-accent" : "text-text-muted"}`}>{asset.downloads.toLocaleString()}</span>
                          <span className="text-[10px] font-medium text-text-muted">dl</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3.5 w-3.5 text-info" />
                          <span className="text-sm font-bold text-text-secondary">{asset.views.toLocaleString()}</span>
                          <span className="text-[10px] font-medium text-text-muted">views</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-[11px] text-text-muted">{dateStr}</span>
                    </div>
                    <div className="mt-2">
                      <div className="h-1 w-full overflow-hidden rounded-full bg-border">
                        <div className="h-full rounded-full bg-gradient-to-r from-accent/60 to-accent transition-all duration-500" style={{ width: `${perfPct}%` }} />
                      </div>
                    </div>
                    <a href={`https://stock.adobe.com/${asset.id}`} target="_blank" rel="noopener noreferrer" className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-medium text-text-muted hover:text-accent transition-colors">
                      <ExternalLink className="h-3 w-3" />
                      View on Adobe Stock
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color, sub }: { label: string; value: string; color?: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-muted">{label}</p>
      <p className={`mt-1 text-xl font-bold ${color || "text-text-primary"}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-accent">{sub}</p>}
    </div>
  );
}
