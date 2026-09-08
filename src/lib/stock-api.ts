// Adobe Stock API client
// Supports real API (requires enterprise key) + smart mock fallback

export interface StockAsset {
  id: string;
  title: string;
  thumbnailUrl: string;
  previewUrl?: string;
  downloads: number;
  performance: number;
  tags: string[];
  uploadDate: string;
  contributor: string;
  contributorId?: string;
  keywordsCount: number;
  similarImagesCount: number;
  category: string;
  mediaType: 'image' | 'video' | 'vector' | 'template' | '3d';
  width?: number;
  height?: number;
  filesize?: string;
  description?: string;
}

export interface SearchParams {
  query: string;
  page?: number;
  limit?: number;
  sort?: string;
  mediaType?: string;
}

export interface SearchResult {
  assets: StockAsset[];
  total: number;
  page: number;
  hasMore: boolean;
}

export interface KeywordAnalysis {
  keyword: string;
  searchVolume: 'very_high' | 'high' | 'medium' | 'low' | 'very_low';
  competition: 'very_high' | 'high' | 'medium' | 'low' | 'very_low';
  competitionScore: number;
  demandScore: number;
  suggestedNiche: string;
  relatedKeywords: string[];
  topCategories: { name: string; count: number }[];
  trendDirection: 'rising' | 'stable' | 'declining';
  monthlyGrowth: number;
  tips: string[];
}

// Large realistic dataset for mock mode
const MOCK_ASSETS: StockAsset[] = [
  { id: "1935082937", title: "Robotics and Artificial Intelligence Outline Icon Set", thumbnailUrl: "https://as2.ftcdn.net/jpg/19/35/08/29/1000_F_1935082937_0L01yR9bvPhWQAqTfb2LoMbOWr9LfUyY.jpg", downloads: 2, performance: 0, tags: ["robotic", "artificial intelligence", "ai", "technology", "automation", "robot", "industry", "factory"], uploadDate: "2026-03-04", contributor: "habi-jabi", keywordsCount: 34, similarImagesCount: 12, category: "Technology", mediaType: "vector" },
  { id: "1823456789", title: "Abstract Purple Fluid Wave Background", thumbnailUrl: "https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=300&fit=crop", downloads: 156, performance: 85, tags: ["Abstract", "Background", "Purple", "wave", "fluid"], uploadDate: "2026-01-15", contributor: "abstractstudio", keywordsCount: 42, similarImagesCount: 28, category: "Abstract", mediaType: "image" },
  { id: "1756789012", title: "Business Team Meeting Office Setting", thumbnailUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop", downloads: 89, performance: 72, tags: ["Business", "Office", "Team", "meeting", "corporate"], uploadDate: "2025-11-20", contributor: "stockphotos", keywordsCount: 38, similarImagesCount: 45, category: "Business", mediaType: "image" },
  { id: "1698765432", title: "Healthy Food Fresh Vegetables Basket", thumbnailUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop", downloads: 234, performance: 91, tags: ["Food", "Healthy", "Vegetables", "organic", "nutrition"], uploadDate: "2025-09-10", contributor: "foodphoto", keywordsCount: 45, similarImagesCount: 67, category: "Food", mediaType: "image" },
  { id: "1634567890", title: "Mountain Landscape Sunrise Photography", thumbnailUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=300&fit=crop", downloads: 312, performance: 95, tags: ["Nature", "Mountain", "Sunrise", "landscape", "travel"], uploadDate: "2025-07-05", contributor: "natureshots", keywordsCount: 32, similarImagesCount: 89, category: "Nature", mediaType: "image" },
  { id: "1572345678", title: "Modern Interior Design Living Room", thumbnailUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop", downloads: 67, performance: 54, tags: ["Interior", "Design", "Modern", "home", "decor"], uploadDate: "2025-12-01", contributor: "interiordesign", keywordsCount: 41, similarImagesCount: 34, category: "Interior", mediaType: "image" },
  { id: "1489123456", title: "Digital Marketing Analytics Dashboard", thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop", downloads: 178, performance: 82, tags: ["Marketing", "Analytics", "Dashboard", "data", "digital"], uploadDate: "2026-02-14", contributor: "techstock", keywordsCount: 37, similarImagesCount: 41, category: "Business", mediaType: "image" },
  { id: "1456789012", title: "Cyber Security Shield Protection Icon", thumbnailUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=300&fit=crop", downloads: 95, performance: 68, tags: ["Security", "Cyber", "Shield", "protection", "technology"], uploadDate: "2025-10-22", contributor: "securicon", keywordsCount: 29, similarImagesCount: 23, category: "Technology", mediaType: "vector" },
  { id: "1423456789", title: "Colorful Tropical Beach Sunset Scene", thumbnailUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop", downloads: 445, performance: 97, tags: ["Beach", "Sunset", "Tropical", "vacation", "travel"], uploadDate: "2025-06-18", contributor: "travelshots", keywordsCount: 36, similarImagesCount: 112, category: "Travel", mediaType: "image" },
  { id: "1390123456", title: "Minimal Geometric Logo Template Set", thumbnailUrl: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=300&fit=crop", downloads: 321, performance: 93, tags: ["Logo", "Geometric", "Minimal", "template", "branding"], uploadDate: "2026-01-08", contributor: "designhub", keywordsCount: 44, similarImagesCount: 78, category: "Design", mediaType: "vector" },
  { id: "1367890123", title: "Medical Healthcare Doctor Consultation", thumbnailUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop", downloads: 134, performance: 76, tags: ["Medical", "Health", "Doctor", "healthcare", "hospital"], uploadDate: "2025-08-30", contributor: "medicalstock", keywordsCount: 39, similarImagesCount: 56, category: "Health", mediaType: "image" },
  { id: "1345678901", title: "Coffee Shop Cozy Morning Atmosphere", thumbnailUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop", downloads: 198, performance: 84, tags: ["Coffee", "Shop", "Morning", "cozy", "cafe"], uploadDate: "2025-10-05", contributor: "lifestock", keywordsCount: 33, similarImagesCount: 47, category: "Lifestyle", mediaType: "image" },
  { id: "1323456789", title: "Electric Vehicle Charging Station Future", thumbnailUrl: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=300&fit=crop", downloads: 87, performance: 65, tags: ["Electric", "Vehicle", "Charging", "green", "future"], uploadDate: "2026-03-01", contributor: "greentech", keywordsCount: 28, similarImagesCount: 19, category: "Technology", mediaType: "image" },
  { id: "1301234567", title: "Watercolor Floral Pattern Seamless Background", thumbnailUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop", downloads: 567, performance: 98, tags: ["Floral", "Watercolor", "Pattern", "seamless", "botanical"], uploadDate: "2025-05-12", contributor: "artfloral", keywordsCount: 48, similarImagesCount: 134, category: "Design", mediaType: "vector" },
  { id: "1289012345", title: "Startup Entrepreneur Working Laptop Coffee", thumbnailUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop", downloads: 256, performance: 89, tags: ["Startup", "Entrepreneur", "Laptop", "work", "coworking"], uploadDate: "2026-02-20", contributor: "bizstock", keywordsCount: 40, similarImagesCount: 62, category: "Business", mediaType: "image" },
  { id: "1267890123", title: "Space Galaxy Nebula Deep Space Photography", thumbnailUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&h=300&fit=crop", downloads: 189, performance: 87, tags: ["Space", "Galaxy", "Nebula", "astronomy", "cosmos"], uploadDate: "2025-09-28", contributor: "spacephoto", keywordsCount: 31, similarImagesCount: 38, category: "Science", mediaType: "image" },
  { id: "1245678901", title: "Isometric 3D City Building Model", thumbnailUrl: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&h=300&fit=crop", downloads: 42, performance: 48, tags: ["Isometric", "3D", "City", "architecture", "model"], uploadDate: "2026-04-02", contributor: "3dstudio", keywordsCount: 26, similarImagesCount: 15, category: "Architecture", mediaType: "3d" },
  { id: "1223456789", title: "Yoga Meditation Wellness Peaceful Scene", thumbnailUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop", downloads: 378, performance: 94, tags: ["Yoga", "Meditation", "Wellness", "peace", "mindfulness"], uploadDate: "2025-08-15", contributor: "wellstock", keywordsCount: 43, similarImagesCount: 91, category: "Health", mediaType: "image" },
  { id: "1201234567", title: "Social Media Marketing Icons Collection", thumbnailUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop", downloads: 213, performance: 86, tags: ["Social", "Media", "Marketing", "icons", "digital"], uploadDate: "2026-01-25", contributor: "socialstock", keywordsCount: 35, similarImagesCount: 44, category: "Technology", mediaType: "vector" },
  { id: "1189012345", title: "Real Estate Modern House Architecture Exterior", thumbnailUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop", downloads: 167, performance: 80, tags: ["Real Estate", "House", "Architecture", "modern", "exterior"], uploadDate: "2025-11-10", contributor: "archstock", keywordsCount: 38, similarImagesCount: 53, category: "Architecture", mediaType: "image" },
  { id: "1167890123", title: "Cute Cartoon Animal Characters Set", thumbnailUrl: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=300&fit=crop", downloads: 456, performance: 96, tags: ["Cartoon", "Animal", "Characters", "cute", "illustration"], uploadDate: "2025-07-20", contributor: "cartoonart", keywordsCount: 46, similarImagesCount: 103, category: "Illustration", mediaType: "vector" },
];

// Unsplash image URLs for dynamically generated results
const UNSPLASH_IMAGES = [
  "photo-1506744038136-46273834b3fb",
  "photo-1470071459604-3b5ec3a7fe05",
  "photo-1441974231531-c6227db76b6e",
  "photo-1518495973542-4542c06a5843",
  "photo-1507003211169-0a1dd7228f2d",
  "photo-1504674900247-0877df9cc836",
  "photo-1517248135467-4c7edcad34c4",
  "photo-1551434678-e076c223a692",
  "photo-1573164713988-8665fc963095",
  "photo-1542744173-8e7e53415bb0",
  "photo-1519125323398-675f0ddb6308",
  "photo-1498050108023-c5249f4df085",
  "photo-1516321318423-f06f85e504b3",
  "photo-1545239351-ef35f43d514b",
  "photo-1558618666-fcd25c85f82e",
  "photo-1551650975-87deedd944c3",
  "photo-1563986768609-322da13575f2",
  "photo-1517841905240-472988babdf9",
  "photo-1485827404703-89b55fcc595e",
  "photo-1550745165-9bc0b252726f",
  "photo-1501785888041-af3ef285b470",
  "photo-1504198453319-5ce911bafcde",
  "photo-1476362174823-3a23f4aa6d76",
  "photo-1497436072909-60f360e1d4b1",
  "photo-1541701494587-cb58502866ab",
];

function generateMockAssets(query: string, count: number = 20): StockAsset[] {
  const q = query.toLowerCase();
  const results: StockAsset[] = [];
  
  // Seed based on query for consistent results
  let seed = 0;
  for (let i = 0; i < q.length; i++) seed += q.charCodeAt(i);
  
  const categories = ["Technology", "Business", "Nature", "Design", "Health", "Travel", "Food", "Architecture", "Illustration", "Science", "Lifestyle", "Education"];
  const mediaTypes: StockAsset['mediaType'][] = ["image", "vector", "image", "image", "vector", "3d", "video"];
  const contributors = ["stockpro", "creativeart", "photostudio", "designlab", "naturepix", "bizstock", "techstock", "artfloral", "travelfoto", "medstock"];
  const titles = [
    `${query} Professional Photography`,
    `${query} Vector Illustration Set`,
    `${query} Abstract Background Design`,
    `${query} Modern Concept Art`,
    `${query} Creative Stock Photo`,
    `${query} High Quality Image`,
    `${query} Digital Art Collection`,
    `${query} Premium Stock Asset`,
    `${query} Artistic Composition`,
    `${query} Professional Stock Image`,
    `${query} Creative Design Element`,
    `${query} Beautiful Scene Photography`,
    `${query} Modern Visual Asset`,
    `${query} Professional Illustration`,
    `${query} Stock Photography Collection`,
    `${query} Creative Visual Content`,
    `${query} High Resolution Image`,
    `${query} Premium Design Asset`,
    `${query} Artistic Stock Photo`,
    `${query} Professional Visual Set`,
  ];

  for (let i = 0; i < count; i++) {
    const r = ((seed + i * 7919) % 10000) / 10000;
    const imgIdx = (seed + i) % UNSPLASH_IMAGES.length;
    const daysAgo = Math.floor(r * 365 * 2);
    const date = new Date(Date.now() - daysAgo * 86400000);
    const downloads = Math.floor(r * 500) + Math.floor(Math.random() * 50);
    const pf = Math.min(100, Math.max(0, Math.floor(downloads / 5 + r * 40)));
    const numTags = 3 + (i % 5);
    const tagPool = ["trending", "popular", "modern", "creative", "professional", "abstract", "minimal", "colorful", "elegant", "dynamic", "natural", "digital", "bold", "classic", "fresh"];
    
    results.push({
      id: String(1000000000 + seed + i * 12345),
      title: titles[i % titles.length],
      thumbnailUrl: `https://images.unsplash.com/${UNSPLASH_IMAGES[imgIdx]}?w=400&h=300&fit=crop`,
      downloads,
      performance: pf,
      tags: [query, ...tagPool.slice(i % tagPool.length, i % tagPool.length + numTags)],
      uploadDate: date.toISOString().split('T')[0],
      contributor: contributors[i % contributors.length],
      keywordsCount: 20 + Math.floor(r * 30),
      similarImagesCount: Math.floor(r * 80) + 5,
      category: categories[i % categories.length],
      mediaType: mediaTypes[i % mediaTypes.length],
      width: [1920, 2400, 3000, 4000][i % 4],
      height: [1080, 1600, 2000, 3000][i % 4],
      filesize: ["1.2 MB", "2.5 MB", "890 KB", "3.1 MB"][i % 4],
    });
  }
  
  return results;
}

// Try real Adobe Stock API first, fallback to mock
export async function searchStock(params: SearchParams): Promise<SearchResult> {
  // Always try the real Adobe Stock API first via our API route
  try {
    const apiKey = typeof window !== 'undefined' ? localStorage.getItem('stocktracker_api_key') || '' : '';
    const offset = ((params.page || 1) - 1) * (params.limit || 20);
    const resp = await fetch(`/api/asset?q=${encodeURIComponent(params.query)}&limit=${params.limit || 20}&offset=${offset}${apiKey ? `&api_key=${encodeURIComponent(apiKey)}` : ''}`);
    if (resp.ok) {
      const data = await resp.json();
      if (data.found && data.files) {
        const assets: StockAsset[] = data.files.map((f: any) => ({
          id: f.id,
          title: f.title,
          thumbnailUrl: f.thumbnail || `https://stock.adobe.com/${f.id}`,
          downloads: f.downloads ?? 0,
          performance: f.downloads != null ? Math.min(100, Math.floor((f.downloads / 5) + 20)) : 0,
          tags: (f.keywords || []).slice(0, 10),
          uploadDate: f.creationDate || '',
          contributor: f.creator || 'Unknown',
          keywordsCount: (f.keywords || []).length,
          similarImagesCount: 0,
          category: f.category || 'General',
          mediaType: (f.mediaType?.toLowerCase() || 'image') as StockAsset['mediaType'],
        }));
        return {
          assets,
          total: data.total || assets.length,
          page: params.page || 1,
          hasMore: offset + assets.length < (data.total || assets.length),
        };
      }
    }
  } catch (e) {
    console.warn('Real API search failed:', e);
  }
  
  // Mock fallback with realistic behavior
  await new Promise(r => setTimeout(r, 300 + Math.random() * 400));
  const allAssets = generateMockAssets(params.query, 50);
  const page = params.page || 1;
  const limit = params.limit || 20;
  const start = (page - 1) * limit;
  const assets = allAssets.slice(start, start + limit);
  
  return {
    assets,
    total: allAssets.length,
    page,
    hasMore: start + limit < allAssets.length,
  };
}

async function searchWithRealAPI(params: SearchParams, apiKey: string): Promise<SearchResult | null> {
  const url = new URL('https://stock.adobe.io/Rest/Media/1/Search/Files');
  url.searchParams.set('search_parameters[words]', params.query);
  url.searchParams.set('search_parameters[limit]', String(params.limit || 20));
  url.searchParams.set('search_parameters[offset]', String(((params.page || 1) - 1) * (params.limit || 20)));
  
  if (params.mediaType && params.mediaType !== 'all') {
    url.searchParams.set('search_parameters[filters][media_id]', params.mediaType);
  }
  
  if (params.sort) {
    url.searchParams.set('search_parameters[order_by]', params.sort);
  }

  const resp = await fetch(url.toString(), {
    headers: {
      'x-api-key': apiKey,
      'x-product': 'StockTracker/1.0',
    },
  });
  
  if (!resp.ok) return null;
  const data = await resp.json();
  
  const assets: StockAsset[] = (data.data || []).map((item: any) => ({
    id: String(item.id),
    title: item.title || 'Untitled',
    thumbnailUrl: item.thumbnail_url || item.url || '',
    previewUrl: item.comp?.size_640x640 || item.comp?.size_1280x960 || '',
    downloads: 0, // API doesn't expose this publicly
    performance: 0,
    tags: (item.keywords || []).slice(0, 10).map((k: any) => k.keyword || k),
    uploadDate: item.created_date || new Date().toISOString().split('T')[0],
    contributor: item.contributor?.name || 'Unknown',
    contributorId: item.contributor?.id || '',
    keywordsCount: (item.keywords || []).length,
    similarImagesCount: 0,
    category: item.category?.name || 'General',
    mediaType: getMediaType(item.media_type_id),
    width: item.width,
    height: item.height,
    filesize: item.filesize ? `${(item.filesize / 1048576).toFixed(1)} MB` : '',
    description: item.description || '',
  }));

  return {
    assets,
    total: data.total_count || assets.length,
    page: params.page || 1,
    hasMore: assets.length === (params.limit || 20),
  };
}

function getMediaType(id: number): StockAsset['mediaType'] {
  const map: Record<number, StockAsset['mediaType']> = {
    1: 'image', 2: 'vector', 3: 'vector', 4: 'video', 6: 'template', 7: '3d',
  };
  return map[id] || 'image';
}

// Fetch real asset details by ID from our API route
export async function fetchAssetById(assetId: string): Promise<StockAsset | null> {
  // First check if we have this asset in our known database
  const known = MOCK_ASSETS.find(a => a.id === assetId);
  
  try {
    const apiKey = localStorage.getItem('stocktracker_api_key') || '';
    const resp = await fetch(`/api/asset?id=${assetId}&api_key=${encodeURIComponent(apiKey)}`);
    if (!resp.ok) return known || null;
    const data = await resp.json();
    
    // If we got real data from scraping/API, use it
    if (data.found && data.title && data.title !== `Asset #${assetId}`) {
      // Calculate performance from downloads if available
      let performance = known?.performance ?? 0;
      if (data.downloads != null && data.downloads > 0) {
        performance = Math.min(100, Math.floor((data.downloads / 5) + 20));
      }
      
      return {
        id: data.assetId,
        title: data.title,
        thumbnailUrl: data.thumbnail || known?.thumbnailUrl || `https://stock.adobe.com/${data.assetId}`,
        downloads: data.downloads ?? known?.downloads ?? 0,
        performance,
        tags: data.keywords?.slice(0, 10) || known?.tags || [],
        uploadDate: data.creationDate || known?.uploadDate || '',
        contributor: data.creator || known?.contributor || 'Unknown',
        contributorId: data.creatorId || known?.contributorId || '',
        keywordsCount: data.keywordsCount || known?.keywordsCount || 0,
        similarImagesCount: known?.similarImagesCount || 0,
        category: data.category || known?.category || 'General',
        mediaType: (data.mediaType?.toLowerCase() || known?.mediaType || 'image') as StockAsset['mediaType'],
        width: data.width || known?.width,
        height: data.height || known?.height,
        description: data.description || known?.description || '',
      };
    }
    
    // If API/scraping didn't get good data, use known mock data
    if (known) return known;
    
    // Last resort: return basic info with the ID
    return {
      id: assetId,
      title: data.title || `Asset #${assetId}`,
      thumbnailUrl: data.thumbnail || `https://stock.adobe.com/${assetId}`,
      downloads: data.downloads ?? 0,
      performance: 0,
      tags: data.keywords || [],
      uploadDate: data.creationDate || '',
      contributor: data.creator || 'Unknown',
      keywordsCount: data.keywordsCount || 0,
      similarImagesCount: 0,
      category: data.category || 'General',
      mediaType: 'image',
    };
  } catch (e) {
    console.error('Failed to fetch asset:', e);
    return known || null;
  }
}

// Keyword analysis
export function analyzeKeyword(keyword: string): KeywordAnalysis {
  const q = keyword.toLowerCase().trim();
  let seed = 0;
  for (let i = 0; i < q.length; i++) seed += q.charCodeAt(i);
  const r = (n: number) => ((seed * n) % 1000) / 1000;
  
  const volumes: KeywordAnalysis['searchVolume'][] = ['very_high', 'high', 'medium', 'low', 'very_low'];
  const competitions: KeywordAnalysis['competition'][] = ['very_high', 'high', 'medium', 'low', 'very_low'];
  const trends: KeywordAnalysis['trendDirection'][] = ['rising', 'stable', 'declining'];
  
  const volIdx = Math.min(4, Math.floor(r(1) * 5));
  const compIdx = Math.min(4, Math.floor(r(2) * 5));
  const trendIdx = Math.min(2, Math.floor(r(3) * 3));
  
  const relatedPool = [
    `${keyword} vector`, `${keyword} illustration`, `${keyword} photo`,
    `${keyword} background`, `${keyword} icon`, `${keyword} design`,
    `${keyword} abstract`, `${keyword} minimal`, `${keyword} pattern`,
    `${keyword} template`, `${keyword} 3d`, `${keyword} flat`,
  ];
  
  const catPool = [
    { name: "Technology", count: Math.floor(r(4) * 500) + 10 },
    { name: "Business", count: Math.floor(r(5) * 400) + 10 },
    { name: "Design", count: Math.floor(r(6) * 600) + 10 },
    { name: "Nature", count: Math.floor(r(7) * 300) + 10 },
    { name: "Illustration", count: Math.floor(r(8) * 350) + 10 },
  ].sort((a, b) => b.count - a.count);

  const tipPool = [
    `Focus on long-tail variations of "${keyword}" to reduce competition`,
    `Add seasonal modifiers (summer, winter, holiday) to ${keyword} keywords`,
    `Combine "${keyword}" with trending styles like flat or isometric`,
    `Target underserved sub-niches within ${keyword} category`,
    `Use all 49 keyword slots with related terms for maximum reach`,
    `Consider video content for ${keyword} — growing demand segment`,
    `${keyword} performs best with clean, professional compositions`,
    `Monitor download trends weekly to spot emerging ${keyword} patterns`,
  ];

  return {
    keyword,
    searchVolume: volumes[volIdx],
    competition: competitions[compIdx],
    competitionScore: Math.floor(r(9) * 100),
    demandScore: Math.floor(r(10) * 100),
    suggestedNiche: `${keyword} for ${catPool[0]?.name || 'Business'} — ${Math.floor(r(11) * 50) + 10}K monthly searches`,
    relatedKeywords: relatedPool.slice(0, 6),
    topCategories: catPool,
    trendDirection: trends[trendIdx],
    monthlyGrowth: Math.floor(r(12) * 40) - 10,
    tips: tipPool.slice(0, 4),
  };
}
