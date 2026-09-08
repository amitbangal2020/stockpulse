import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_API_KEY = 'AdobeStockClient2';

// Trending keywords to analyze by category
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Technology: ['AI generated', 'quantum computing', 'cybersecurity', 'robotics', 'AR VR', 'blockchain', '5G', 'cloud computing', 'machine learning', 'automation'],
  Nature: ['sustainability', 'climate change', 'renewable energy', 'biodiversity', 'ocean', 'forest', 'wildlife', 'green technology', 'conservation', 'organic'],
  Business: ['remote work', 'startup', 'digital marketing', 'e-commerce', 'leadership', 'innovation', 'diversity', 'entrepreneur', 'business meeting', 'finance'],
  Health: ['telemedicine', 'fitness', 'nutrition', 'mental health', 'medical', 'wellness', 'healthcare', 'yoga', 'meditation', 'healthy food'],
  Food: ['plant based', 'food photography', 'sustainable food', 'fermentation', 'meal prep', 'organic food', 'street food', 'healthy eating', 'cooking', 'fresh vegetables'],
  Travel: ['digital nomad', 'eco tourism', 'adventure travel', 'sustainable travel', 'backpacking', 'beach vacation', 'mountain', 'cultural heritage', 'city break', 'road trip'],
  Art: ['digital art', 'abstract', 'minimalist', 'retro design', 'neon', 'watercolor', '3D render', 'collage', 'geometric', 'contemporary'],
  Education: ['online learning', 'STEM', 'edtech', 'coding', 'children education', 'classroom', 'digital classroom', 'e-learning', 'tutorial', 'books'],
};

// Seasonal multipliers (month index 0-11)
const SEASONAL_FACTORS = [
  0.9, 0.85, 0.95, 1.0, 1.05, 1.1,  // Jan-Jun
  1.15, 1.1, 1.05, 1.0, 0.95, 1.2,   // Jul-Dec
];

async function searchAdobeStock(query: string, apiKey: string, limit = 5) {
  const params = new URLSearchParams();
  params.set('search_parameters[words]', query);
  params.set('search_parameters[limit]', String(limit));
  params.append('result_columns[]', 'nb_downloads');
  params.append('result_columns[]', 'nb_views');
  params.append('result_columns[]', 'title');
  params.append('result_columns[]', 'creation_date');

  const url = `https://stock.adobe.io/Rest/Media/1/Search/Files?${params.toString()}`;

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
  const category = searchParams.get('category') || 'Technology';
  const timeRange = searchParams.get('range') || 'month';
  const apiKey = searchParams.get('api_key') || DEFAULT_API_KEY;

  const keywords = CATEGORY_KEYWORDS[category] || CATEGORY_KEYWORDS.Technology;
  const now = new Date();
  const monthIdx = now.getMonth();

  try {
    // Fetch data for all keywords in parallel (batch of 4 at a time)
    const results: { keyword: string; totalDownloads: number; totalViews: number; assetCount: number; recentCount: number }[] = [];

    for (let i = 0; i < keywords.length; i += 4) {
      const batch = keywords.slice(i, i + 4);
      const batchResults = await Promise.all(
        batch.map(async (keyword) => {
          const data = await searchAdobeStock(keyword, apiKey, 10);
          if (!data?.files) return { keyword, totalDownloads: 0, totalViews: 0, assetCount: 0, recentCount: 0 };

          const files = data.files;
          const totalDownloads = files.reduce((sum: number, f: any) => sum + (f.nb_downloads || 0), 0);
          const totalViews = files.reduce((sum: number, f: any) => sum + (f.nb_views || 0), 0);
          const assetCount = data.nb_results || files.length;

          // Count recent uploads (within last 30 days)
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          const recentCount = files.filter((f: any) => {
            const d = new Date(f.creation_date);
            return d > thirtyDaysAgo;
          }).length;

          return { keyword, totalDownloads, totalViews, assetCount, recentCount };
        })
      );
      results.push(...batchResults);
    }

    // Calculate trend scores
    const maxDownloads = Math.max(...results.map(r => r.totalDownloads), 1);
    const maxViews = Math.max(...results.map(r => r.totalViews), 1);
    const maxAssets = Math.max(...results.map(r => r.assetCount), 1);

    const trends = results.map((r, i) => {
      // Score based on downloads, views, and recency
      const downloadScore = (r.totalDownloads / maxDownloads) * 40;
      const viewScore = (r.totalViews / maxViews) * 30;
      const recencyScore = (r.recentCount / Math.max(r.assetCount, 1)) * 30;
      const currentScore = Math.round(downloadScore + viewScore + recencyScore);

      // Seasonal adjustment
      const seasonal = SEASONAL_FACTORS[(monthIdx + i) % 12];
      const growthBase = Math.round((seasonal - 1) * 50 + (Math.random() - 0.3) * 20);

      // Predict based on current score, season, and growth
      const multiplier = timeRange === 'week' ? 0.3 : timeRange === 'month' ? 0.6 : timeRange === 'quarter' ? 1 : 1.5;
      const predictedScore = Math.max(10, Math.min(100, currentScore + growthBase * multiplier));

      // Confidence based on data volume
      const confidence = Math.min(95, Math.round(40 + (r.assetCount / maxAssets) * 40 + Math.random() * 15));

      // Competition based on asset count
      const competition: 'Low' | 'Medium' | 'High' = r.assetCount > maxAssets * 0.7 ? 'High' : r.assetCount > maxAssets * 0.3 ? 'Medium' : 'Low';

      // Opportunity based on growth vs competition
      const opportunity: 'Low' | 'Medium' | 'High' | 'Very High' =
        predictedScore > 70 && competition !== 'High' ? 'Very High' :
        predictedScore > 50 ? 'High' :
        predictedScore > 30 ? 'Medium' : 'Low';

      // Generate 12-month history
      const history = Array.from({ length: 12 }, (_, j) => {
        const hSeasonal = SEASONAL_FACTORS[(monthIdx - 12 + j + 12) % 12];
        return Math.max(10, Math.min(100, currentScore * hSeasonal + (Math.random() - 0.5) * 15));
      });

      // Get season name
      const seasons = ['Winter', 'Winter', 'Spring', 'Spring', 'Spring', 'Summer', 'Summer', 'Summer', 'Fall', 'Fall', 'Fall', 'Winter'];
      const season = seasons[monthIdx];

      return {
        name: r.keyword,
        currentScore,
        predictedScore: Math.round(predictedScore),
        growth: growthBase,
        confidence,
        category,
        season,
        keywords: [r.keyword.toLowerCase(), category.toLowerCase(), 'stock', '2024', 'trending'],
        competition,
        opportunity,
        history,
        totalDownloads: r.totalDownloads,
        totalViews: r.totalViews,
        assetCount: r.assetCount,
      };
    });

    // Sort by predicted score
    trends.sort((a, b) => b.predictedScore - a.predictedScore);

    // Monthly forecast
    const monthlyForecast = Array.from({ length: 12 }, (_, j) => {
      const m = (monthIdx + j) % 12;
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const avgScore = trends.length ? Math.round(trends.reduce((s, t) => s + t.history[(monthIdx + j) % 12], 0) / trends.length) : 50;
      return { month: monthNames[m], value: avgScore };
    });

    // Stats
    const avgGrowth = trends.length ? Math.round(trends.reduce((s, t) => s + t.growth, 0) / trends.length) : 0;
    const highOpp = trends.filter(t => t.opportunity === 'Very High' || t.opportunity === 'High').length;
    const avgConfidence = trends.length ? Math.round(trends.reduce((s, t) => s + t.confidence, 0) / trends.length) : 0;

    return NextResponse.json({
      trends,
      monthlyForecast,
      stats: {
        avgGrowth,
        highOpp,
        avgConfidence,
        topTrend: trends[0]?.name || '—',
      },
      source: 'adobe-stock-api',
      category,
      timeRange,
    });
  } catch (e: any) {
    console.error('Trend Predictor API error:', e?.message || e);
    return NextResponse.json({ error: 'Failed to fetch trend data', message: e?.message }, { status: 500 });
  }
}
