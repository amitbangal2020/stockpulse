// Download history tracking store
// Stores snapshots of asset download counts over time in localStorage

export interface DownloadSnapshot {
  assetId: string;
  timestamp: string;
  downloads: number;
  views: number;
  title?: string;
  thumbnail?: string;
  creator?: string;
}

export interface AssetTrend {
  assetId: string;
  title: string;
  thumbnail: string;
  creator: string;
  currentDownloads: number;
  previousDownloads: number;
  downloadDelta: number;
  history: DownloadSnapshot[];
  trendDirection: 'rising' | 'stable' | 'declining';
}

const STORAGE_KEY = 'stocktracker_download_history';
const TRACKED_ASSETS_KEY = 'stocktracker_tracked_assets';

function getAllHistory(): DownloadSnapshot[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

function saveAllHistory(snapshots: DownloadSnapshot[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots));
}

function getTrackedAssetIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(TRACKED_ASSETS_KEY) || '[]');
  } catch { return []; }
}

function saveTrackedAssetIds(ids: string[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TRACKED_ASSETS_KEY, JSON.stringify(ids));
}

// Add a snapshot for an asset
export function recordSnapshot(snapshot: DownloadSnapshot) {
  const history = getAllHistory();
  // Don't duplicate if we already have a snapshot within the last hour
  const lastHour = Date.now() - 3600000;
  const recent = history.find(
    s => s.assetId === snapshot.assetId && new Date(s.timestamp).getTime() > lastHour
  );
  if (recent) {
    // Update existing snapshot instead of adding new one
    recent.downloads = snapshot.downloads;
    recent.views = snapshot.views;
    recent.title = snapshot.title || recent.title;
    recent.thumbnail = snapshot.thumbnail || recent.thumbnail;
    recent.creator = snapshot.creator || recent.creator;
  } else {
    history.push(snapshot);
  }
  saveAllHistory(history);
}

// Add an asset to tracked list
export function trackAsset(assetId: string) {
  const ids = getTrackedAssetIds();
  if (!ids.includes(assetId)) {
    ids.push(assetId);
    saveTrackedAssetIds(ids);
  }
}

// Remove an asset from tracked list
export function untrackAsset(assetId: string) {
  const ids = getTrackedAssetIds().filter(id => id !== assetId);
  saveTrackedAssetIds(ids);
}

// Check if an asset is tracked
export function isTracked(assetId: string): boolean {
  return getTrackedAssetIds().includes(assetId);
}

// Get all tracked asset IDs
export function getTrackedAssets(): string[] {
  return getTrackedAssetIds();
}

// Get history for a specific asset
export function getAssetHistory(assetId: string): DownloadSnapshot[] {
  return getAllHistory()
    .filter(s => s.assetId === assetId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

// Get trends for all tracked assets
export function getAllTrends(): AssetTrend[] {
  const trackedIds = getTrackedAssetIds();
  const history = getAllHistory();
  const trends: AssetTrend[] = [];

  for (const assetId of trackedIds) {
    const assetHistory = history
      .filter(s => s.assetId === assetId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    if (assetHistory.length === 0) continue;

    const latest = assetHistory[assetHistory.length - 1];
    const previous = assetHistory.length > 1 ? assetHistory[assetHistory.length - 2] : latest;
    const delta = latest.downloads - previous.downloads;

    let trendDirection: 'rising' | 'stable' | 'declining' = 'stable';
    if (delta > 0) trendDirection = 'rising';
    else if (delta < 0) trendDirection = 'declining';

    trends.push({
      assetId,
      title: latest.title || `Asset #${assetId}`,
      thumbnail: latest.thumbnail || '',
      creator: latest.creator || 'Unknown',
      currentDownloads: latest.downloads,
      previousDownloads: previous.downloads,
      downloadDelta: delta,
      history: assetHistory,
      trendDirection,
    });
  }

  return trends.sort((a, b) => b.currentDownloads - a.currentDownloads);
}

// Get summary stats
export function getDashboardStats() {
  const trends = getAllTrends();
  const totalDownloads = trends.reduce((sum, t) => sum + t.currentDownloads, 0);
  const totalTracked = trends.length;
  const risingCount = trends.filter(t => t.trendDirection === 'rising').length;
  const avgDownloads = totalTracked > 0 ? Math.round(totalDownloads / totalTracked) : 0;

  // Get all history grouped by date for overall trend
  const history = getAllHistory();
  const byDate: Record<string, number> = {};
  for (const s of history) {
    const date = s.timestamp.split('T')[0];
    byDate[date] = (byDate[date] || 0) + s.downloads;
  }

  const overallTrend = Object.entries(byDate)
    .map(([date, downloads]) => ({ date, downloads }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalTracked,
    totalDownloads,
    risingCount,
    avgDownloads,
    overallTrend,
    trends,
  };
}
