"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { useAuth } from "@/lib/auth-context";
import { Star, Trash2 } from "lucide-react";

interface WatchlistItem {
  id: string;
  title: string;
  thumbnailUrl: string;
  downloads: number;
  performance: number;
  tags: string[];
  category: string;
}

function WatchlistPage() {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [sortBy, setSortBy] = useState("added");

  useEffect(() => {
    const wl = JSON.parse(localStorage.getItem("stocktracker_watchlist") || "[]");
    setWatchlist(wl);
  }, []);

  const removeFromWatchlist = (id: string) => {
    const updated = watchlist.filter((a) => a.id !== id);
    setWatchlist(updated);
    localStorage.setItem("stocktracker_watchlist", JSON.stringify(updated));
  };

  const sorted = [...watchlist].sort((a, b) => {
    if (sortBy === "downloads") return b.downloads - a.downloads;
    if (sortBy === "performance") return b.performance - a.performance;
    return 0;
  });

  if (!user) {
    return (
      <ToolLayout>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-border">
              <Star className="h-8 w-8 text-text-muted" />
            </div>
            <h3 className="font-heading text-lg font-semibold text-text-primary">Sign in to use Watchlist</h3>
            <p className="mt-1 text-sm text-text-muted">Track your favorite assets by signing in</p>
          </div>
        </div>
      </ToolLayout>
    );
  }

  return (
    <ToolLayout>
      <div className="flex flex-1 flex-col overflow-y-auto min-h-0">
        <div className="border-b border-border bg-bg-secondary px-5 py-2.5">
          <h2 className="font-heading text-sm font-semibold tracking-tight text-text-primary">My Watchlist</h2>
          <p className="text-[11px] text-text-muted">Track your favorite Adobe Stock assets</p>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {sorted.length === 0 ? (
            <div className="py-20 text-center">
              <Star className="mx-auto mb-4 h-12 w-12 text-text-muted" />
              <h3 className="font-heading text-lg font-semibold text-text-primary">Your watchlist is empty</h3>
              <p className="mt-1 text-sm text-text-muted">Search for assets and add them to your watchlist</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sorted.map((asset) => (
                <div key={asset.id} className="overflow-hidden rounded-xl border border-border bg-surface transition-all hover:border-accent/40 group">
                  <div className="relative">
                    <img src={asset.thumbnailUrl} alt={asset.title} className="h-40 w-full object-cover" />
                    <button onClick={() => removeFromWatchlist(asset.id)} className="absolute right-2 top-2 rounded-full bg-danger p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="p-3">
                    <h3 className="mb-2 line-clamp-2 text-sm font-medium text-text-primary">{asset.title}</h3>
                    <div className="flex items-center justify-between text-xs text-text-muted">
                      <span>{asset.downloads} downloads</span>
                      <span className={`font-medium ${asset.performance >= 80 ? "text-accent" : asset.performance >= 50 ? "text-yellow-500" : "text-danger"}`}>{asset.performance}/100</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}

export default WatchlistPage;
