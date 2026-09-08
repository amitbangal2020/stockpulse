"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Download, Eye } from "lucide-react";

const SAMPLE_PORTFOLIO = [
  { id: "1935082937", title: "Robotics and AI Outline Icon Set", thumbnailUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop", downloads: 2, performance: 0, tags: ["Technology", "vector"], uploadDate: "2026-03-04", contributor: "habi-jabi", category: "Technology", mediaType: "vector" as const },
  { id: "1823456789", title: "Abstract Purple Fluid Wave", thumbnailUrl: "https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=300&fit=crop", downloads: 156, performance: 85, tags: ["Abstract", "Purple"], uploadDate: "2026-01-15", contributor: "abstractstudio", category: "Abstract", mediaType: "image" as const },
  { id: "1756789012", title: "Business Team Meeting", thumbnailUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop", downloads: 89, performance: 72, tags: ["Business", "Office"], uploadDate: "2025-11-20", contributor: "stockphotos", category: "Business", mediaType: "image" as const },
  { id: "1698765432", title: "Healthy Food Vegetables", thumbnailUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop", downloads: 234, performance: 91, tags: ["Food", "Healthy"], uploadDate: "2025-09-10", contributor: "foodphoto", category: "Food", mediaType: "image" as const },
  { id: "1634567890", title: "Mountain Landscape Sunrise", thumbnailUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=300&fit=crop", downloads: 312, performance: 95, tags: ["Nature", "Mountain"], uploadDate: "2025-07-05", contributor: "natureshots", category: "Nature", mediaType: "image" as const },
  { id: "1572345678", title: "Modern Interior Design", thumbnailUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop", downloads: 67, performance: 54, tags: ["Interior", "Design"], uploadDate: "2025-12-01", contributor: "interiordesign", category: "Interior", mediaType: "image" as const },
];

function PortfolioPage() {
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("downloads-desc");
  const filtered = SAMPLE_PORTFOLIO.filter((a) => filter === "all" || a.mediaType === filter).sort((a, b) => {
    if (sortBy === "downloads-desc") return b.downloads - a.downloads;
    if (sortBy === "performance") return b.performance - a.performance;
    if (sortBy === "date") return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
    return 0;
  });
  const totalDownloads = SAMPLE_PORTFOLIO.reduce((s, a) => s + a.downloads, 0);
  const avgPerf = Math.round(SAMPLE_PORTFOLIO.reduce((s, a) => s + a.performance, 0) / SAMPLE_PORTFOLIO.length);

  return (
    <ToolLayout>
      <div className="flex flex-1 flex-col overflow-y-auto min-h-0">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-text-primary">My Portfolio</h2>
          <p className="text-xs text-text-muted">Track all your Adobe Stock assets</p>
          <div className="mt-3 flex gap-3">
            <div className="rounded-lg border border-border bg-surface px-3 py-1.5 text-center"><p className="text-lg font-bold text-text-primary">{SAMPLE_PORTFOLIO.length}</p><p className="text-[10px] font-medium uppercase tracking-wider text-text-muted">Assets</p></div>
            <div className="rounded-lg border border-border bg-surface px-3 py-1.5 text-center"><p className="text-lg font-bold text-accent">{totalDownloads}</p><p className="text-[10px] font-medium uppercase tracking-wider text-text-muted">Downloads</p></div>
            <div className="rounded-lg border border-border bg-surface px-3 py-1.5 text-center"><p className="text-lg font-bold text-accent">{avgPerf}%</p><p className="text-[10px] font-medium uppercase tracking-wider text-text-muted">Avg Perf</p></div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-1.5">
              {["all", "image", "vector", "video"].map((t) => (
                <button key={t} onClick={() => setFilter(t)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${filter === t ? "bg-accent text-white" : "border border-border bg-surface text-text-secondary hover:border-accent hover:text-accent"}`}>{t === "all" ? "All" : t.toUpperCase()}</button>
              ))}
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text-secondary outline-none">
              <option value="downloads-desc">Most Downloads</option>
              <option value="performance">Performance</option>
              <option value="date">Newest</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((a) => (
              <div key={a.id} className="overflow-hidden rounded-xl border border-border bg-surface transition-all hover:border-accent/40 hover:shadow-md group">
                <div className="relative">
                  <img src={a.thumbnailUrl} alt={a.title} className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <span className="absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5 text-[9px] font-semibold uppercase text-accent backdrop-blur-sm">{a.mediaType}</span>
                </div>
                <div className="p-3.5">
                  <h3 className="mb-2 line-clamp-2 text-sm font-medium leading-snug text-text-primary">{a.title}</h3>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs text-text-muted">{a.downloads} downloads</span>
                    <span className={`text-xs font-bold ${a.performance >= 80 ? "text-accent" : a.performance >= 50 ? "text-yellow-500" : "text-danger"}`}>{a.performance}/100</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {a.tags.map((t, i) => <span key={i} className="rounded border border-border bg-bg-secondary px-1.5 py-0.5 text-[10px] text-text-muted">{t}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

export default PortfolioPage;
