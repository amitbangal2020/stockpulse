import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_API_KEY = 'AdobeStockClient2';

// Different query sets per time range — ensures each tab shows different niches
const QUERIES_BY_RANGE: Record<string, string[]> = {
  // All-time: classic evergreen topics
  all: [
    'AI generated art',
    'sustainability green',
    'remote work home office',
    'mental health wellness',
    'cryptocurrency bitcoin',
    'vintage retro aesthetic',
  ],
  // This week: newest/emerging uploads use fresh, trending keywords
  week: [
    'new 2026 design',
    'trending social media',
    'creative abstract colorful',
    'modern lifestyle people',
    'digital illustration modern',
    'fresh modern graphic',
    'minimal clean aesthetic',
    'bold vibrant pattern',
  ],
  // This month: mid-term trending with broader topics
  month: [
    'popular photography stunning',
    'creative business marketing',
    'nature beautiful landscape',
    'technology innovation future',
    'health fitness wellness',
    'travel adventure explore',
    'food delicious gourmet',
    'fashion style trendy',
  ],
  // This quarter: quality featured content
  quarter: [
    'premium editorial photo',
    'professional corporate business',
    'artistic creative concept',
    'stunning nature photography',
    'innovative technology abstract',
    'healthy lifestyle active',
    'scenic travel destination',
    'appetizing food plating',
  ],
};

// Sort orders per time range — each produces completely different result sets
// nb_downloads = all-time popular, creation = newest, relevance = keyword match, featured = quality
const SORT_BY_RANGE: Record<string, string> = {
  all: 'nb_downloads',
  week: 'creation',
  month: 'relevance',
  quarter: 'featured',
};

const RANGE_LABELS: Record<string, string> = {
  all: 'All Time',
  week: 'This Week',
  month: 'This Month',
  quarter: 'This Quarter',
};

// Build URL without encoding brackets (Adobe Stock API requires literal brackets)
function buildStockUrl(base: string, params: Record<string, string | string[]>) {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const v of value) parts.push(`${key}=${encodeURIComponent(v)}`);
    } else {
      parts.push(`${key}=${encodeURIComponent(value)}`);
    }
  }
  return `${base}?${parts.join('&')}`;
}

// Fetch search results from Adobe Stock
async function searchAdobeStock(query: string, apiKey: string, limit = 5, order = 'relevance') {
  const params: Record<string, string | string[]> = {
    'search_parameters[words]': query,
    'search_parameters[limit]': String(limit),
    'search_parameters[order]': order,
    'result_columns[]': ['nb_downloads', 'creator_name', 'creator_id', 'category', 'nb_results'],
  };

  const url = buildStockUrl('https://stock.adobe.io/Rest/Media/1/Search/Files', params);

  try {
    const resp = await fetch(url, {
      headers: { 'x-api-key': apiKey, 'x-product': 'StockTracker/1.0' },
      signal: AbortSignal.timeout(10000),
    });
    if (!resp.ok) return null;
    return await resp.json();
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const timeRange = searchParams.get('range') || 'all';
  const apiKey = searchParams.get('api_key') || DEFAULT_API_KEY;

  const sortOrder = SORT_BY_RANGE[timeRange] || 'nb_downloads';
  const queries = QUERIES_BY_RANGE[timeRange] || QUERIES_BY_RANGE.all;
  const rangeLabel = RANGE_LABELS[timeRange] || 'All Time';
  const isRecent = timeRange !== 'all';
  const searchLimit = isRecent ? 15 : 10;

  try {
    // Fetch trending niches using time-range-specific queries
    const nicheResults = await Promise.all(
      queries.map(async (query) => {
        const data = await searchAdobeStock(query, apiKey, searchLimit, sortOrder);
        const files = data?.files || [];
        const totalDownloads = files.reduce((sum: number, f: any) => sum + (f.nb_downloads || 0), 0);
        const uniqueCreators = new Set(files.map((f: any) => f.creator_id).filter(Boolean)).size;
        const avgDownloads = files.length > 0 ? Math.round(totalDownloads / files.length) : 0;
        const topDownload = files.length > 0 ? Math.max(...files.map((f: any) => f.nb_downloads || 0)) : 0;

        return {
          name: query.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          downloads: totalDownloads,
          avgDownloads,
          topDownload,
          uniqueCreators,
          competition: uniqueCreators > 2 ? 'High' : uniqueCreators > 1 ? 'Medium' : 'Low',
          opportunity: totalDownloads > 1000 ? 'Very High' : totalDownloads > 500 ? 'High' : 'Medium',
        };
      })
    );

    nicheResults.sort((a, b) => b.downloads - a.downloads);

    // Calculate trending score
    const maxAvg = Math.max(...nicheResults.map(n => n.avgDownloads), 1);
    const maxTop = Math.max(...nicheResults.map(n => n.topDownload), 1);
    const maxTotal = Math.max(...nicheResults.map(n => n.downloads), 1);
    const maxCreators = Math.max(...nicheResults.map(n => n.uniqueCreators), 1);

    const nichesWithScore = nicheResults.map(n => {
      if (isRecent) {
        const diversityScore = (n.uniqueCreators / maxCreators) * 50;
        const volumeScore = (n.downloads / maxTotal) * 30;
        const densityScore = (n.avgDownloads / maxAvg) * 20;
        const score = Math.round(diversityScore + volumeScore + densityScore);
        return { ...n, score };
      } else {
        const densityScore = (n.avgDownloads / maxAvg) * 40;
        const ceilingScore = (n.topDownload / maxTop) * 30;
        const volumeScore = (n.downloads / maxTotal) * 30;
        const score = Math.round(densityScore + ceilingScore + volumeScore);
        return { ...n, score };
      }
    });

    // Fetch contributors using time-range queries
    const contributorMap = new Map<string, { name: string; assets: number; downloads: number }>();
    for (const query of queries.slice(0, 5)) {
      const data = await searchAdobeStock(query, apiKey, searchLimit, sortOrder);
      for (const f of data?.files || []) {
        const id = f.creator_id;
        if (id) {
          const existing = contributorMap.get(id) || { name: f.creator_name || 'Unknown', assets: 0, downloads: 0 };
          existing.assets += 1;
          existing.downloads += f.nb_downloads || 0;
          contributorMap.set(id, existing);
        }
      }
    }

    const allContributors = Array.from(contributorMap.values());
    if (isRecent) {
      allContributors.sort((a, b) => b.assets - a.assets || b.downloads - a.downloads);
    } else {
      allContributors.sort((a, b) => b.downloads - a.downloads);
    }
    const topContributors = allContributors.slice(0, 5);

    const avgMetric = topContributors.length > 0
      ? topContributors.reduce((s, c) => s + (isRecent ? c.assets : c.downloads), 0) / topContributors.length
      : 1;

    const contributorsWithMomentum = topContributors.map(c => {
      const metric = isRecent ? c.assets : c.downloads;
      return {
        ...c,
        momentum: avgMetric > 0
          ? Math.round(((metric / avgMetric) - 1) * 100)
          : 0,
      };
    });

    // Fetch categories — use same sort order for consistency
    const categoryQueries = [
      { query: 'nature landscape', name: 'Nature', color: 'from-emerald-400 to-teal-500' },
      { query: 'business office', name: 'Business', color: 'from-blue-400 to-indigo-500' },
      { query: 'technology digital', name: 'Technology', color: 'from-cyan-400 to-blue-500' },
      { query: 'design creative', name: 'Design', color: 'from-pink-400 to-rose-500' },
      { query: 'health wellness', name: 'Health', color: 'from-teal-400 to-emerald-500' },
      { query: 'food cuisine', name: 'Food', color: 'from-orange-400 to-amber-500' },
      { query: 'travel destination', name: 'Travel', color: 'from-sky-400 to-blue-500' },
      { query: 'AI generated', name: 'AI Generated', color: 'from-violet-400 to-purple-500' },
    ];

    const categoryResults = await Promise.all(
      categoryQueries.map(async (cat) => {
        const data = await searchAdobeStock(cat.query, apiKey, 1, sortOrder);
        const count = data?.nb_results || 0;
        const topDownload = data?.files?.[0]?.nb_downloads || 0;
        return {
          name: cat.name,
          count,
          topDownload,
          color: cat.color,
        };
      })
    );

    // Calculate insights
    const allDownloads = nicheResults.reduce((sum, n) => sum + n.downloads, 0);
    const avgDownloads = Math.floor(allDownloads / Math.max(nicheResults.length * 10, 1));
    const topPerformer = topContributors[0]?.name || '—';
    const fastestGrowing = nichesWithScore[0]?.name || 'Technology';
    const bestOpportunity = nicheResults.find(n => n.opportunity === 'Very High')?.name || nicheResults[0]?.name || 'Sustainability';

    return NextResponse.json({
      niches: nichesWithScore.map(n => ({
        name: n.name,
        score: n.score,
        downloads: n.downloads,
        competition: n.competition,
        opportunity: n.opportunity,
      })),
      contributors: contributorsWithMomentum,
      categories: categoryResults,
      insights: [
        { label: 'Avg Downloads/Asset', value: String(avgDownloads) },
        { label: 'Top Contributor', value: topPerformer, highlight: true },
        { label: 'Top Trending', value: fastestGrowing, highlight: true },
        { label: 'Best Opportunity', value: bestOpportunity, highlight: true },
      ],
      source: 'adobe-stock-api',
      timeRange,
      rangeLabel,
      sortOrder,
    });
  } catch (e: any) {
    console.error('Trending API error:', e?.message || e);
    return NextResponse.json({ error: 'Failed to fetch trending data', message: e?.message }, { status: 500 });
  }
}
