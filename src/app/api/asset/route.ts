import { NextRequest, NextResponse } from 'next/server';

// Adobe Stock public API key with gentech (Generative AI) filter support
// gentech=true → AI-only results, gentech=false → non-AI results, no filter → all results
const DEFAULT_API_KEY = 'AdobeStockClient2';

function getMediaTypeName(id: number): string {
  const map: Record<number, string> = { 1: 'Photo', 2: 'Illustration', 3: 'Vector', 4: 'Video', 6: 'Template', 7: '3D' };
  return map[id] || 'Image';
}

// Build Adobe Stock API URL with proper bracket encoding
function buildApiUrl(base: string, params: Record<string, string | string[]>) {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const v of value) {
        parts.push(`${key}=${encodeURIComponent(v)}`);
      }
    } else {
      parts.push(`${key}=${encodeURIComponent(value)}`);
    }
  }
  return `${base}?${parts.join('&')}`;
}

const SEARCH_COLUMNS = [
  'id', 'title', 'nb_downloads', 'nb_views', 'creator_name', 'creator_id',
  'keywords', 'thumbnail_500_url', 'creation_date', 'category', 'media_type_id',
  'width', 'height', 'content_type', 'is_editorial',
];

// Fetch from Adobe Stock with optional gentech filter
async function searchAdobeStock(query: string, apiKey: string, limit = 1, offset = 0, gentech?: string) {
  const params: Record<string, string | string[]> = {
    'search_parameters[words]': query,
    'search_parameters[limit]': String(limit),
    'search_parameters[offset]': String(offset),
    'result_columns[]': SEARCH_COLUMNS,
  };

  // Add gentech filter: "true" = AI only, "false" = exclude AI
  if (gentech === 'true' || gentech === 'false') {
    params['search_parameters[filters][gentech]'] = gentech;
  }

  const url = buildApiUrl('https://stock.adobe.io/Rest/Media/1/Search/Files', params);

  const resp = await fetch(url, {
    headers: { 'x-api-key': apiKey, 'x-product': 'StockTracker/1.0' },
    signal: AbortSignal.timeout(15000),
  });
  if (!resp.ok) {
    const text = await resp.text();
    console.error(`Adobe Stock API error ${resp.status}: ${text}`);
    return null;
  }
  return await resp.json();
}

// Fetch creator assets with optional gentech filter
async function searchByCreator(creatorId: string, apiKey: string, limit = 20, offset = 0, gentech?: string) {
  const params: Record<string, string | string[]> = {
    'search_parameters[creator_id]': creatorId.replace(/[^0-9]/g, ''),
    'search_parameters[limit]': String(Math.min(limit, 100)),
    'search_parameters[offset]': String(offset),
    'result_columns[]': [...SEARCH_COLUMNS, 'nb_results'],
  };

  if (gentech === 'true' || gentech === 'false') {
    params['search_parameters[filters][gentech]'] = gentech;
  }

  const url = buildApiUrl('https://stock.adobe.io/Rest/Media/1/Search/Files', params);

  const resp = await fetch(url, {
    headers: { 'x-api-key': apiKey, 'x-product': 'StockTracker/1.0' },
    signal: AbortSignal.timeout(20000),
  });
  if (!resp.ok) {
    throw new Error(`Creator search failed: ${resp.status}`);
  }
  return await resp.json();
}

function mapFile(f: any, isAIFilter?: string) {
  return {
    id: String(f.id),
    title: f.title || '',
    thumbnail: f.thumbnail_500_url || '',
    creator: f.creator_name || 'Unknown',
    mediaType: getMediaTypeName(f.media_type_id || 1),
    category: f.category?.name || '',
    keywords: (f.keywords || []).map((k: any) => k.name || k.keyword || k),
    downloads: f.nb_downloads ?? 0,
    views: f.nb_views ?? 0,
    creationDate: f.creation_date?.split(' ')[0] || '',
    width: f.width,
    height: f.height,
    contentType: f.content_type || '',
    // When gentech=true filter is active, ALL results are AI-generated
    isAI: isAIFilter === 'true',
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const assetId = searchParams.get('id');
  const query = searchParams.get('q');
  const creatorId = searchParams.get('creator_id');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');
  const gentech = searchParams.get('gentech') || undefined; // "true" or "false"

  if (!assetId && !query && !creatorId) {
    return NextResponse.json({ error: 'Asset ID, query, or creator_id is required' }, { status: 400 });
  }

  const apiKey = searchParams.get('api_key') || DEFAULT_API_KEY;

  try {
    // Creator search
    if (creatorId) {
      const data = await searchByCreator(creatorId, apiKey, limit, offset, gentech);
      const files = (data.files || []).map((f: any) => mapFile(f, gentech));

      return NextResponse.json({
        found: files.length > 0,
        total: data.nb_results || files.length,
        creatorId: creatorId.replace(/[^0-9]/g, ''),
        creatorName: files[0]?.creator || 'Unknown',
        files,
        source: 'adobe-stock-api',
      });
    }

    // Single asset lookup by exact ID (uses ids[] parameter, not words)
    if (assetId) {
      const cleanId = assetId.replace(/[^0-9]/g, '');
      const params: Record<string, string | string[]> = {
        'search_parameters[ids][]': cleanId,
        'search_parameters[limit]': '1',
        'result_columns[]': SEARCH_COLUMNS,
      };
      if (gentech === 'true' || gentech === 'false') {
        params['search_parameters[filters][gentech]'] = gentech;
      }
      const url = buildApiUrl('https://stock.adobe.io/Rest/Media/1/Search/Files', params);
      const resp = await fetch(url, {
        headers: { 'x-api-key': apiKey, 'x-product': 'StockTracker/1.0' },
        signal: AbortSignal.timeout(15000),
      });
      if (!resp.ok) {
        return NextResponse.json({ found: false, assetId: cleanId, error: 'Asset not found' });
      }
      const data = await resp.json();

      // Verify the returned asset actually has the requested ID
      if (!data || !data.files || data.files.length === 0 || String(data.files[0].id) !== cleanId) {
        return NextResponse.json({ found: false, assetId: cleanId, error: 'Asset not found' });
      }

      const file = data.files[0];
      return NextResponse.json({
        found: true,
        assetId: String(file.id),
        title: file.title || `Asset #${cleanId}`,
        thumbnail: file.thumbnail_500_url || '',
        creator: file.creator_name || 'Unknown',
        creatorId: file.creator_id || '',
        mediaType: getMediaTypeName(file.media_type_id || 1),
        category: file.category?.name || '',
        keywords: (file.keywords || []).map((k: any) => k.name || k.keyword || k),
        keywordsCount: (file.keywords || []).length,
        width: file.width,
        height: file.height,
        creationDate: file.creation_date?.split(' ')[0] || '',
        downloads: file.nb_downloads ?? 0,
        views: file.nb_views ?? 0,
        contentType: file.content_type || '',
        isAI: gentech === 'true',
        source: 'adobe-stock-api',
        hasApiKey: true,
      });
    }

    // Keyword search
    const searchQuery = query!;
    const searchLimit = Math.min(limit, 50);
    const data = await searchAdobeStock(searchQuery, apiKey, searchLimit, offset, gentech);

    if (!data || !data.files || data.files.length === 0) {
      return NextResponse.json({
        found: false,
        error: 'No results found',
      });
    }

    const files = data.files.map((f: any) => mapFile(f, gentech));

    return NextResponse.json({
      found: files.length > 0,
      total: data.nb_results || files.length,
      files,
      source: 'adobe-stock-api',
    });
  } catch (e: any) {
    console.error('API error:', e?.message || e);
    return NextResponse.json({ error: 'Internal error', message: e?.message }, { status: 500 });
  }
}
