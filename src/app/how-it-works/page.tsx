"use client";

import { useState } from "react";
import Link from "next/link";
import { ToolLayout } from "@/components/tool-layout";
import {
  Sparkles, BarChart3, Video, Layers, CircleDot, LayoutGrid, Palette,
  Grid3X3, Type, FileCode, TrendingUp, GitCompare, Calendar, Monitor,
  ChevronDown, ExternalLink, FolderOpen, Star, Tag, Globe, Check,
  Lightbulb, Zap,
} from "lucide-react";

// ─── Tool Data ───
interface ToolInfo {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
  category: string;
  features: string[];
  steps: { title: string; detail: string }[];
  tips: string[];
  output: string;
}

const TOOLS: ToolInfo[] = [
  // ─── Main Tools ───
  {
    id: "generator",
    name: "Metadata Generator (MetaGen)",
    description: "AI-powered batch metadata generation for microstock platforms — titles, keywords, descriptions and prompts from your files.",
    href: "/metagen",
    icon: <Sparkles className="h-5 w-5" />,
    color: "#10b981",
    category: "Main",
    features: [
      "6 AI providers: OpenAI, Gemini, Claude, Grok, Mistral & OpenRouter",
      "Multiple API keys per provider with round-robin rotation, validation & bulk import",
      "Batch upload images, videos, EPS, AI, PDF & SVG — thumbnails auto-extracted",
      "Automatic transparent-background detection for PNG/SVG/EPS files",
      "6 platforms: Adobe Stock, Shutterstock, Freepik, Vecteezy, iStock & Pond5",
      "7 output languages incl. English, Spanish, German, French, Japanese & Chinese",
      "Adjustable title (74–135 chars), keyword (35–45) & description (184–238) ranges",
      "7 prompt styles: Highly Optimized, Keyword Priority, SEO Focus, Adobe Stock Special, Shutterstock Special, Human Search Psychology + Custom",
      "Title prefix/suffix, custom keywords, banned words & IP filtering",
      "Vision AI pre-analysis pass for image-aware metadata",
      "A/B dual-pass generation with automatic quality scoring & version switching",
      "Parallel generation with configurable concurrency (1–10 requests)",
      "Per-file quality score with strengths & weaknesses",
      "Prompt tab: AI image-generation prompts with camera params & negative prompts",
      "Platform-perfect CSV export — or multi-platform ZIP",
      "Auto-download CSV when batch finishes",
    ],
    steps: [
      { title: "Add API Key", detail: "Click 'Add API Key', pick a provider (OpenAI, Gemini, Claude, Grok, Mistral, OpenRouter) and paste your key. Add several keys — they rotate automatically. Validate them with one click or bulk-import a list." },
      { title: "Select Platforms", detail: "Check the target platforms (Adobe Stock, Shutterstock, Freepik, Vecteezy, iStock, Pond5). Multiple platforms produce separate platform-format CSVs bundled in a ZIP." },
      { title: "Upload Files", detail: "Drag & drop images (JPG, PNG, WEBP), videos (MP4, MOV, AVI…), EPS/AI/PDF or SVG files. Video frames and EPS previews are extracted automatically, and transparency is detected for you." },
      { title: "Configure Settings", detail: "Set title/keyword/description length ranges, output language, tone, prompt style, title prefix & suffix, custom keywords, banned words and parallel-generation concurrency." },
      { title: "Generate Metadata", detail: "Click 'Generate All'. The AI first runs a vision analysis on each file, then writes a title, description and keywords. A live timer and per-file status track progress." },
      { title: "Generate Image Prompts Too", detail: "Switch to the 'Prompt' tab to create AI image-generation prompts (Midjourney/DALL-E style) from the same files — with optional camera parameters, prompt prefix/suffix and negative prompts." },
      { title: "Review & Copy", detail: "Check each file's quality score, copy individual fields, compare and switch between A/B versions, then retry any failures." },
      { title: "Export CSV", detail: "Click 'Download CSV' for one platform or get a ZIP with a correctly formatted CSV per platform. Enable Auto Download to grab it the moment generation ends." },
    ],
    tips: ["Enable Parallel Generation with 3–5 concurrency for the fastest batches", "Use Single Pass to halve token usage when you don't need A/B testing", "The Prompt tab turns any existing asset into a fresh AI-generation brief", "Try 'Adobe Stock Special' style for Adobe-focused uploads"],
    output: "Platform-specific CSV files (title, description, keywords, category) + AI image prompts",
  },
  {
    id: "tracker",
    name: "Adobe Tracker",
    description: "Search, track and analyze Adobe Stock assets in real time — live download counts, AI detection, filters and competitor research.",
    href: "/search",
    icon: <BarChart3 className="h-5 w-5" />,
    color: "#6366f1",
    category: "Main",
    features: [
      "3 search modes: Keyword, Contributor ID & Asset ID",
      "Live download counts straight from Adobe Stock",
      "Contributor portfolio scan — up to 300 assets with creator name & totals",
      "AI content filter: All / Exclude AI / AI Only (server-side gentech filter)",
      "Media-type filter: Photos, Vectors & Videos",
      "5 sort orders: Best Performance, Most/Least Downloads, Newest/Oldest",
      "Grid & table result views with relative performance bars",
      "Stats bar: Results, Total Downloads, Average & Top Performer",
      "AI-generated content badge on every asset",
      "One-click CSV export of any result set",
      "Click any title or contributor to deep-dive instantly",
      "Direct 'View on Adobe Stock' links",
    ],
    steps: [
      { title: "Pick a Search Mode", detail: "Choose Keyword (discover what sells in a niche), Contributor ID (analyze a whole portfolio) or Asset ID (exact downloads for one file)." },
      { title: "Search", detail: "Type a keyword (e.g. 'summer travel icons'), a contributor ID from the Adobe Stock URL, or an asset ID (e.g. 1935082937) and hit Search." },
      { title: "Filter & Sort", detail: "Narrow with the AI filter and media-type filter, then sort by performance, downloads or date to surface winners fast." },
      { title: "Analyze Results", detail: "Read the stats bar for total downloads, average and top performer. Each card shows downloads, upload date, category and an AI badge where applicable." },
      { title: "Deep-Dive or Export", detail: "Click a title to search that asset, click a contributor name to open their portfolio, or export everything to CSV for spreadsheet analysis." },
    ],
    tips: ["Asset ID = exact download count for a single file", "Contributor ID = spy on competitor portfolios & keyword strategy", "AI Only / Exclude AI filter reveals how much of a niche is now AI-generated"],
    output: "Live download counts, portfolio analysis, competitor insights, CSV export",
  },
  {
    id: "dashboard",
    name: "Dashboard",
    description: "Your tracking home base — portfolio stats, download trends and top performers for every asset you track.",
    href: "/dashboard",
    icon: <BarChart3 className="h-5 w-5" />,
    color: "#f59e0b",
    category: "Main",
    features: [
      "4 headline stats: Total Tracked, Total Downloads, Rising count & Average",
      "Overall download trend chart across all tracked assets",
      "Top Performing Assets bar chart",
      "One-click Refresh pulls live data for every tracked asset",
      "Snapshot history stored per asset — watch downloads grow over time",
      "Last-refresh timestamp",
      "Empty-state guidance linking straight to Adobe Tracker",
    ],
    steps: [
      { title: "Track Assets First", detail: "Search an asset ID on the Adobe Tracker page to start tracking it — tracked assets appear here automatically." },
      { title: "Review Your Stats", detail: "See total tracked assets, total downloads, how many are rising and your per-asset average." },
      { title: "Read the Trends", detail: "The Overall Trend chart aggregates your downloads over time; the bar chart ranks your top 5 assets." },
      { title: "Refresh Data", detail: "Click 'Refresh Data' to fetch the latest download counts for all tracked assets and record a new snapshot." },
    ],
    tips: ["Refresh regularly — more snapshots mean smoother trend charts", "The Rising stat shows how many assets gained downloads since last check"],
    output: "Portfolio overview, aggregated trend chart, top performers",
  },
  {
    id: "portfolio",
    name: "Portfolio Manager",
    description: "Browse and organize your stock assets in one grid — filter by media type and sort by what matters.",
    href: "/portfolio",
    icon: <FolderOpen className="h-5 w-5" />,
    color: "#a855f7",
    category: "Main",
    features: [
      "Asset cards with thumbnails and media-type badges",
      "Filter: All / Image / Vector / Video",
      "Sort by Most Downloads, Performance or Newest",
      "Header stats: total assets, total downloads & average performance",
      "Per-asset tags, upload date, download count & performance score",
      "Color-coded performance score (green 80+, yellow 50+, red below)",
    ],
    steps: [
      { title: "Open Your Portfolio", detail: "All your assets appear in a responsive card grid with thumbnails and badges." },
      { title: "Filter by Type", detail: "Toggle between All, Image, Vector and Video to focus on one asset kind." },
      { title: "Sort", detail: "Order by Most Downloads, Performance score or Upload date (Newest first)." },
      { title: "Inspect Assets", detail: "Each card shows tags, upload date, downloads and a 0–100 performance score." },
    ],
    tips: ["Sort by Performance to find under-performers worth re-keywording", "Compare newest uploads against your average to gauge early traction"],
    output: "Organized asset grid with performance scoring",
  },
  {
    id: "watchlist",
    name: "Watchlist",
    description: "Star and monitor your favorite Adobe Stock assets — a personal shortlist you control.",
    href: "/watchlist",
    icon: <Star className="h-5 w-5" />,
    color: "#eab308",
    category: "Main",
    features: [
      "Star any asset from search results to save it here",
      "Persistent list tied to your signed-in account",
      "Sort by downloads or performance",
      "One-click remove with hover trash button",
      "Works fully offline with local storage",
    ],
    steps: [
      { title: "Sign In", detail: "The Watchlist requires a (free) account — sign in to unlock it." },
      { title: "Add Favorites", detail: "Find assets via Adobe Tracker and star them to add to your watchlist." },
      { title: "Monitor & Sort", detail: "Sort your saved assets by downloads or performance to keep an eye on the ones you care about." },
      { title: "Remove Anytime", detail: "Hover a card and click the trash icon to drop it from the list." },
    ],
    tips: ["Use it as a moodboard of competitors' best sellers you want to beat"],
    output: "Personal watchlist of favorite assets",
  },

  // ─── Creative Tools ───
  {
    id: "svg-video",
    name: "SVG to Video",
    description: "Turn animated SVGs into real video files — MP4, WebM or GIF with filters, soundtrack, watermark and batch queue.",
    href: "/svg-to-video",
    icon: <Video className="h-5 w-5" />,
    color: "#f59e0b",
    category: "Creative",
    features: [
      "Export formats: MP4 (FFmpeg encoder), WebM & GIF",
      "MP4 auto-selects when the encoder is available; WebM works everywhere",
      "Resolutions: 720p, 1080p, 4K Ultra HD, 1:1 Square & 9:16 Vertical Story",
      "Frame rate up to 60 FPS for ultra-smooth motion",
      "Duration auto-detected from the SVG's own animation timeline",
      "Background options: Transparent, solid Color or Gradient",
      "Canvas filters: Blur, Brightness, Contrast, Hue Rotate, Sepia & Invert",
      "Background soundtrack — upload MP3/WAV and it's mixed into the video",
      "Text watermark with size, opacity & position control",
      "Advanced encoding: custom bitrate & H.264 codec profile (High/Main/Baseline)",
      "Batch Queue for converting many SVGs in one run",
      "Paste raw SVG code or drag & drop a file with instant live preview",
    ],
    steps: [
      { title: "Upload or Paste SVG", detail: "Drag & drop an animated SVG or paste its XML code. The live preview renders immediately — SMIL and CSS animations are supported." },
      { title: "Choose Format & Quality", detail: "Pick MP4, WebM or GIF, set resolution (up to 4K), FPS (up to 60) and optionally a custom bitrate and codec profile." },
      { title: "Style the Canvas", detail: "Set a transparent, colored or gradient background, dial in filters (blur, brightness, contrast, hue, sepia, invert) and add a watermark." },
      { title: "Add Sound (Optional)", detail: "Upload an MP3/WAV soundtrack — it's mixed into the exported video." },
      { title: "Convert & Export", detail: "Click 'Convert & Export'. A progress bar tracks frames and estimated size, then your video downloads automatically." },
    ],
    tips: ["60 FPS + 1080p is the sweet spot for motion graphics", "Transparent backgrounds are perfect for overlays", "Use the Batch Queue tab to convert a whole folder of SVGs", "MP4 appears automatically only when the encoder is online — otherwise WebM is pre-selected"],
    output: "MP4 / WebM / GIF video files with audio & watermark",
  },
  {
    id: "dither",
    name: "Dither Studio",
    description: "Retro dithering effects with 9 algorithms, Game Boy & Commodore presets, custom palettes and pixelation.",
    href: "/dither-studio",
    icon: <Layers className="h-5 w-5" />,
    color: "#ec4899",
    category: "Creative",
    features: [
      "Ordered (Bayer) dithering: 2×2, 4×4, 8×8 & 16×16 matrices",
      "Error-diffusion algorithms: Floyd-Steinberg, Atkinson, Jarvis-Judice-Ninke, Stucki & Burkes",
      "One-click presets: Game Boy, Commodore 64 and more",
      "Threshold, grain, posterize & pixelate controls",
      "Custom color palettes with adjustable color count (duotone output)",
      "Channel selection (luminance and more)",
      "Live preview with instant re-render on every change",
      "PNG export",
    ],
    steps: [
      { title: "Upload Image", detail: "Drag & drop any image (PNG, JPG, WEBP) — the preview renders instantly." },
      { title: "Pick an Algorithm", detail: "Choose a Bayer matrix for classic ordered dithering or an error-diffusion method for photographic looks." },
      { title: "Dial In the Look", detail: "Adjust threshold, grain, posterize levels and pixelate. Apply a preset like Game Boy or set your own 2-color palette." },
      { title: "Export", detail: "Download the dithered result as a PNG." },
    ],
    tips: ["Bayer 4×4 gives the retro pixel-art feel", "Atkinson mimics classic Macintosh dithering", "Game Boy preset + pixelate = instant nostalgia"],
    output: "Dithered PNG image",
  },
  {
    id: "halftone",
    name: "Halftone Studio",
    description: "Halftone dot art from any image — 3 halftone engines, 7 print-inspired presets, hexagonal grids and duotone palettes.",
    href: "/halftone-studio",
    icon: <CircleDot className="h-5 w-5" />,
    color: "#8b5cf6",
    category: "Creative",
    features: [
      "3 halftone engines: Amplitude Modulation, Frequency Modulation & Error Diffusion",
      "Linear & hexagonal grid types",
      "Circle & square dot styles",
      "7 presets: Newspaper, Pop Art, Risograph, CMYK Print, Dot Matrix, Organic & High Contrast",
      "Control dot spacing, rotation angle, global size, gamma, blur",
      "Contrast, brightness & saturation adjustments",
      "Limited color palettes — duotone up to multicolor — plus custom background",
      "Real-time re-render preview",
    ],
    steps: [
      { title: "Upload Image", detail: "Drop any photo or graphic — the halftone preview re-renders in real time as you tweak." },
      { title: "Choose Engine & Grid", detail: "Pick amplitude/frequency modulation or error diffusion, then a linear or hexagonal grid with circle or square dots." },
      { title: "Style It", detail: "Set spacing, rotation, gamma and color corrections. Load a preset like Pop Art or Risograph, or build a custom palette." },
      { title: "Export", detail: "Save your halftone artwork as a PNG." },
    ],
    tips: ["45° rotation = classic print look", "Frequency Modulation gives organic, stochastic textures", "Risograph preset is perfect for poster-style stock graphics"],
    output: "Halftone PNG artwork",
  },
  {
    id: "bento",
    name: "Bento Builder",
    description: "Generate beautiful bento-grid layouts in one click — shuffle, tune spacing and export as PNG or vector SVG.",
    href: "/bento-builder",
    icon: <LayoutGrid className="h-5 w-5" />,
    color: "#14b8a6",
    category: "Creative",
    features: [
      "Auto-generated bento layouts with mixed cell sizes",
      "Shuffle to regenerate fresh arrangements instantly",
      "Grid, spacing & layout controls from the header",
      "Per-cell shading with consistent aesthetic",
      "PNG export with scale options (1x / 2x / 3x)",
      "SVG (vector) export for infinite-resolution use",
    ],
    steps: [
      { title: "Generate a Layout", detail: "The builder creates a bento grid of mixed-size cells automatically." },
      { title: "Shuffle & Tune", detail: "Hit Shuffle for a new arrangement, or fine-tune grid size and spacing from the header controls." },
      { title: "Export", detail: "Download as PNG (choose 1x, 2x or 3x scale) or as SVG vector for design tools." },
    ],
    tips: ["2x–3x PNG scale is ideal for social media posts", "SVG export lets you recolor cells in Illustrator/Figma"],
    output: "Bento grid PNG (1x/2x/3x) or SVG",
  },
  {
    id: "color-palette",
    name: "Color Palette",
    description: "Extract beautiful color palettes from any image — with names, percentages and one-click CSS variables.",
    href: "/color-palette",
    icon: <Palette className="h-5 w-5" />,
    color: "#f43f5e",
    category: "Creative",
    features: [
      "Extract 3–12 dominant colors from any image",
      "Every swatch shows HEX, RGB, color name & share-of-image percentage",
      "Click any swatch to copy its HEX code",
      "Shuffle button to rearrange the palette",
      "Auto-generated CSS :root variables",
      "One-click Copy CSS for the whole palette",
    ],
    steps: [
      { title: "Upload Image", detail: "Drag & drop a photo — colors are extracted instantly with names and percentages." },
      { title: "Adjust Color Count", detail: "Use the slider (3–12) to get fewer dominant tones or a more nuanced spread, then re-extract." },
      { title: "Copy Colors", detail: "Click any swatch to copy the HEX. The sidebar lists every color with its RGB value too." },
      { title: "Copy CSS", detail: "Grab the whole palette as :root CSS variables, ready to paste into a stylesheet." },
    ],
    tips: ["5–6 colors is the sweet spot for design systems", "The percentage tells you each color's visual weight in the image", "Shuffle before exporting to find a better order"],
    output: "Color palette (HEX/RGB/name/percentage) + CSS variables",
  },
  {
    id: "color-harmonizer",
    name: "Color Harmonizer",
    description: "Generate perfect color harmonies from one base color — 7 harmony types on an interactive color wheel.",
    href: "/color-harmonizer",
    icon: <Palette className="h-5 w-5" />,
    color: "#a855f7",
    category: "Creative",
    features: [
      "7 harmony types: Complementary, Analogous, Triadic, Split-Complementary, Square, Tetradic & Monochromatic",
      "Interactive color wheel visualization with live markers",
      "Role labels on every generated color (Base, Complement, Triadic 120°…)",
      "Monochromatic mode produces 5 shades (Dark → Light)",
      "Click-to-copy HEX for every swatch",
      "Download the full harmony as a CSS file",
    ],
    steps: [
      { title: "Pick a Base Color", detail: "Use the color picker or enter a HEX code — the wheel updates instantly." },
      { title: "Choose a Harmony", detail: "Switch between the 7 harmony types and watch the swatches re-generate with role labels." },
      { title: "Copy or Export", detail: "Click any swatch to copy its HEX, or download the entire harmony as a CSS file." },
    ],
    tips: ["Analogous (+/-30°) for calm, cohesive designs", "Complementary for maximum contrast", "Monochromatic is the safest palette for beginners"],
    output: "Color harmony palette with role labels + CSS export",
  },
  {
    id: "ascii",
    name: "ASCII Vision",
    description: "Convert any image into ASCII art — multiple character sets, colored mode and instant text export.",
    href: "/ascii-vision",
    icon: <Type className="h-5 w-5" />,
    color: "#84cc16",
    category: "Creative",
    features: [
      "Adjustable output width: 30–200 characters",
      "Multiple character sets (Standard, Detailed, Blocks, Binary and more)",
      "Invert toggle for dark-on-light / light-on-dark looks",
      "Colored mode maps brightness to a green→red hue scale",
      "Copy text to clipboard",
      "Save output as a TXT file",
      "Live preview with per-character color rendering",
    ],
    steps: [
      { title: "Upload Image", detail: "Drop any image (JPG, PNG, WEBP, GIF) or click to browse — ASCII art generates instantly." },
      { title: "Set Width", detail: "Slide between 30 and 200 characters wide. More characters = more detail." },
      { title: "Choose Character Set", detail: "Pick a character set from the dropdown; the exact character ramp is shown below it." },
      { title: "Style & Export", detail: "Toggle Invert or Colored mode, then Copy text or Save TXT." },
    ],
    tips: ["Width 80–120 balances detail and readability", "Blocks charset gives a bold, modern look", "Colored mode looks great on dark backgrounds"],
    output: "ASCII text art (copy or TXT download)",
  },

  // ─── Analytics Tools ───
  {
    id: "trending",
    name: "Trending",
    description: "See what's hot on Adobe Stock right now — trending niches, top contributors and category breakdowns from live data.",
    href: "/trending",
    icon: <TrendingUp className="h-5 w-5" />,
    color: "#22c55e",
    category: "Analytics",
    features: [
      "Live trending data fetched from Adobe Stock",
      "Time ranges: All Time, This Week, This Month & This Quarter",
      "Trending niches with demand score, downloads, competition & opportunity rating",
      "Top contributors with asset counts, downloads & momentum",
      "Category breakdown with color-coded bars and top-download counts",
      "Curated market insights panel",
      "Sort order shows recently-uploaded vs most-downloaded content",
      "Manual refresh for the latest data",
    ],
    steps: [
      { title: "Pick a Time Range", detail: "Switch between All Time, Week, Month or Quarter — fresher ranges surface newer opportunities." },
      { title: "Scan Trending Niches", detail: "Each niche card shows a demand score, download volume, competition level and opportunity rating." },
      { title: "Study Top Contributors", detail: "See who's gaining momentum right now and how many assets and downloads they have." },
      { title: "Check Categories", detail: "The color-coded category breakdown shows which content types carry the most downloads." },
    ],
    tips: ["Weekly view = freshest, least-saturated opportunities", "High downloads + low competition niches are your entry points", "Cross-check trending niches with the Keywords tool"],
    output: "Trending niches, contributors, category breakdown & insights",
  },
  {
    id: "keywords",
    name: "Keyword Analyzer",
    description: "Analyze any keyword's demand, competition and trend — with niche suggestions and optimization tips.",
    href: "/keywords",
    icon: <Tag className="h-5 w-5" />,
    color: "#ec4899",
    category: "Analytics",
    features: [
      "Instant analysis of any keyword",
      "Search volume level: very high → very low, with a Demand Score (0–100)",
      "Competition level with a Competition Score (0–100)",
      "Suggested niche with monthly search estimates",
      "Trend direction (rising / stable / declining) with monthly growth %",
      "Numbered, actionable optimization tips",
      "Clickable related keywords for chain research",
      "Recent search history (last 10)",
      "Quick Summary verdict: High or Low opportunity",
      "16 popular keyword shortcuts for quick starts",
    ],
    steps: [
      { title: "Enter a Keyword", detail: "Type any keyword or click one of the popular shortcuts (business, technology, nature…)." },
      { title: "Read the Scores", detail: "Compare the Demand Score against the Competition Score — demand above competition = opportunity." },
      { title: "Check the Niche & Trend", detail: "The suggested niche shows the angle to take; the trend badge shows which way the keyword is heading." },
      { title: "Follow Related Keywords", detail: "Click any related keyword to analyze it instantly and build a keyword map for your uploads." },
    ],
    tips: ["Rising trend + medium competition = best upload target", "Use related keywords as your actual asset keyword list", "Very high competition keywords need exceptional execution to rank"],
    output: "Demand/competition scores, niche suggestion, trend direction, tips & related keywords",
  },
  {
    id: "portfolio-analytics",
    name: "Portfolio Analytics",
    description: "Benchmark your portfolio across 8 performance metrics — radar & bar charts comparing you to top performers and the market.",
    href: "/portfolio-analytics",
    icon: <Grid3X3 className="h-5 w-5" />,
    color: "#3b82f6",
    category: "Analytics",
    features: [
      "Radar chart of 8 metrics: Downloads, Views, Likes, Revenue, Rank, Keywords, Consistency & Niche Score",
      "Switch chart type: Radar or Polar Area",
      "Compare 3 profiles: Your Portfolio vs Top Performer vs Market Average",
      "Grouped bar chart view of the same metrics",
      "4 timeframes: 7 / 30 / 90 days & 1 Year",
      "Randomize to simulate scenarios and compare profiles",
      "Toggle either chart on or off",
      "Auto-computed portfolio score",
    ],
    steps: [
      { title: "Read the Radar", detail: "Your portfolio is plotted against a Top Performer and the Market Average across all 8 metrics — dips show exactly where to improve." },
      { title: "Switch Views", detail: "Toggle between Radar and Polar Area, or hide it and use the grouped bar chart for precise comparisons." },
      { title: "Change Timeframe", detail: "Switch between 7, 30, 90 days and 1 Year to see how the picture changes." },
      { title: "Simulate", detail: "Use Randomize to stress-test how different metric profiles would look against the benchmark." },
    ],
    tips: ["Keywords & Niche Score gaps = metadata problems, not content problems", "Consistency matters more than any single spike", "Compare your Revenue shape against the Top Performer's to find pricing/quality gaps"],
    output: "Radar/polar & bar charts benchmarking 8 portfolio metrics",
  },
  {
    id: "trend",
    name: "Trend Predictor",
    description: "Real-time trend forecasting from Adobe Stock data — monthly outlooks, confidence scores and niche opportunities by category.",
    href: "/trend-predictor",
    icon: <TrendingUp className="h-5 w-5" />,
    color: "#22c55e",
    category: "Analytics",
    features: [
      "Category-based trend forecasting from live Adobe Stock data",
      "Monthly Forecast view per category",
      "Trend cards with growth %, season tag & confidence score",
      "4 headline stats: Avg Growth, High Opportunities, Avg Confidence & Top Trend",
      "Search filter across trend names",
      "Trend detail panel on click",
      "Time-range filtering",
      "CSV export of the trend dataset",
      "Last-updated timestamp & manual refresh",
    ],
    steps: [
      { title: "Choose a Category", detail: "Pick a content category (e.g. Technology) and time range — trends load from the Adobe Stock API." },
      { title: "Read the Stats", detail: "Average growth, count of high opportunities, average confidence and the current top trend at a glance." },
      { title: "Open the Monthly Forecast", detail: "The forecast section projects how the category develops month by month." },
      { title: "Drill into Trends", detail: "Click a trend card for details including season and confidence, or export everything to CSV." },
    ],
    tips: ["Confidence % tells you how reliable a forecast is — act on 70%+", "Season tags help you plan uploads 2–3 months ahead", "Cross-reference with Trending before committing to a niche"],
    output: "Category forecasts, trend cards with confidence, CSV export",
  },
  {
    id: "candlestick",
    name: "Candlestick Chart",
    description: "Full-featured financial charting — 5 moving-average types, Bollinger Bands, RSI & MACD with custom data.",
    href: "/candlestick-chart",
    icon: <BarChart3 className="h-5 w-5" />,
    color: "#10b981",
    category: "Analytics",
    features: [
      "Candlestick, line, area & bar chart types",
      "5 moving-average types: SMA, EMA, WMA, DEMA & TEMA",
      "Bollinger Bands overlay",
      "RSI (Relative Strength Index) panel",
      "MACD (Moving Average Convergence Divergence) panel",
      "Paste your own CSV data or use sample data",
      "Interactive chart with tooltips",
      "High-resolution PNG export",
    ],
    steps: [
      { title: "Input Data", detail: "Paste OHLC data (Date, Open, High, Low, Close, Volume) or load the sample dataset." },
      { title: "Choose Chart Type", detail: "Switch between candlestick, line, area and bar views." },
      { title: "Add Indicators", detail: "Toggle moving averages (SMA/EMA/WMA/DEMA/TEMA), Bollinger Bands, RSI and MACD panels." },
      { title: "Export", detail: "Download the finished chart as a PNG." },
    ],
    tips: ["EMA reacts faster than SMA — use both to spot crossovers", "RSI above 70 / below 30 signals overbought/oversold", "MACD crossovers confirm momentum shifts"],
    output: "Interactive financial chart with indicators (PNG export)",
  },
  {
    id: "heatmap",
    name: "Market Heatmap",
    description: "A treemap of 30 stock-content categories — sized by market value, colored by growth, with 6 palettes.",
    href: "/market-heatmap",
    icon: <Grid3X3 className="h-5 w-5" />,
    color: "#ef4444",
    category: "Analytics",
    features: [
      "30 content categories (AI & Tech → Gaming) sized by market value",
      "Growth % per category with green/red performance coloring",
      "6 color palettes: Performance, Ocean, Sunset, Forest, Neon & Grayscale",
      "Sort by name, value or growth",
      "Toggle labels & growth percentages",
      "Minimum-value filter to hide small categories",
      "Fullscreen mode for presentations",
      "Hover tooltips with exact values",
    ],
    steps: [
      { title: "Scan the Map", detail: "Block size = market value; color = growth. Big green blocks are the strongest markets right now." },
      { title: "Switch Palette", detail: "Try Ocean, Sunset, Forest, Neon or Grayscale for different visual reads of the same data." },
      { title: "Filter & Sort", detail: "Raise the minimum-value slider to focus on big markets, or sort by growth to find movers." },
      { title: "Go Fullscreen", detail: "Expand to fullscreen for presentations or screenshots." },
    ],
    tips: ["Sort by Growth to catch fast-rising niches early", "Deep red categories are saturated or declining — think twice", "AI & Tech and Space currently show the strongest growth"],
    output: "Interactive category heatmap with 6 palettes",
  },
  {
    id: "comparison",
    name: "Asset Comparison",
    description: "Compare up to 8 microstock platforms side-by-side — normalized charts, correlation matrix and per-asset RSI stats.",
    href: "/asset-comparison",
    icon: <GitCompare className="h-5 w-5" />,
    color: "#8b5cf6",
    category: "Analytics",
    features: [
      "8 platforms: Adobe Stock, Shutterstock, Getty, iStock, Canva, Dreamstime, 123RF & Pond5",
      "Line, area & bar chart views",
      "Timeframes: 7, 14, 30 or 60 days",
      "Normalize mode converts all series to % change for fair comparison",
      "Correlation matrix between every pair of assets (color-coded)",
      "Per-asset stats: change %, high, low & RSI",
      "Add/remove assets and randomize data",
      "Fullscreen chart mode",
    ],
    steps: [
      { title: "Pick Platforms", detail: "Start with 4 pre-loaded platforms; add or remove any of the 8 supported ones." },
      { title: "Choose View & Timeframe", detail: "Switch line/area/bar and set 7–60 day windows." },
      { title: "Normalize", detail: "Turn on Normalize to compare percentage changes instead of absolute values — essential when scales differ." },
      { title: "Read the Correlations", detail: "The correlation matrix shows which platforms move together (green = correlated, red = inverse). Check RSI for momentum." },
    ],
    tips: ["Normalized view reveals real relative performance", "Low-correlation platforms diversify your earnings", "Use RSI to spot platforms that are overheating"],
    output: "Side-by-side platform comparison with correlation matrix & stats",
  },

  // ─── Utility Tools ───
  {
    id: "svg-eps",
    name: "SVG to EPS",
    description: "Convert SVG vectors to print-ready EPS files entirely in your browser — no uploads, no server.",
    href: "/svg-to-eps",
    icon: <FileCode className="h-5 w-5" />,
    color: "#f97316",
    category: "Utility",
    features: [
      "In-browser SVG → EPS (PostScript) conversion — files never leave your machine",
      "Two EPS versions: EPS10 (maximum compatibility) & EPS20",
      "SVG paths converted to PostScript paths",
      "Batch conversion of multiple files",
      "Instant download of converted files",
    ],
    steps: [
      { title: "Upload SVG Files", detail: "Select one or many SVG files — they queue up for batch processing." },
      { title: "Choose EPS Version", detail: "EPS10 for maximum compatibility with stock platforms and older software, EPS20 for newer features." },
      { title: "Convert", detail: "Start the conversion — each file is rasterized to PostScript paths locally." },
      { title: "Download", detail: "Collect your print-ready EPS files." },
    ],
    tips: ["EPS10 is the safe choice for Adobe Stock submissions", "Everything runs client-side — safe for NDA/private work"],
    output: "EPS10/EPS20 vector files",
  },
  {
    id: "country-map",
    name: "Country Map Generator",
    description: "Generate clean vector-style maps of any country — plus real street maps with buildings, water and parks from OpenStreetMap.",
    href: "/country-map",
    icon: <Globe className="h-5 w-5" />,
    color: "#0ea5e9",
    category: "Utility",
    features: [
      "World map plus every country — searchable by country or major city",
      "State/province drill-down within selected countries",
      "4 projections: Natural Earth, Mercator, Orthographic (Globe) & Equirectangular",
      "Street map mode with live OpenStreetMap data",
      "Street layers: buildings, water, parks & labels — toggle each",
      "Street color palettes (sage and more)",
      "Zoom controls with automatic city focus",
      "Download as PNG or clean vector SVG",
    ],
    steps: [
      { title: "Pick a Location", detail: "Search for a country or major city, or choose 'World' for the full map. States/provinces appear for larger countries." },
      { title: "Choose a Projection", detail: "Natural Earth for a pleasing world view, Orthographic for a globe, Mercator for familiar web-map shapes." },
      { title: "Switch to Street Mode (Optional)", detail: "Search a city to load real OSM street data — toggle buildings, water, parks and labels, and pick a palette." },
      { title: "Export", detail: "Download your map as a high-res PNG or a clean SVG vector ready for design work." },
    ],
    tips: ["SVG export is fully editable in Illustrator — great for stock map graphics", "Orthographic globes sell well as tech/travel backgrounds", "Street mode + custom palettes = unique location graphics"],
    output: "Country/street maps as PNG or vector SVG",
  },
  {
    id: "mockup",
    name: "Mockup Generator",
    description: "Place your designs on professional device mockups — iPhone, MacBook and more, with background presets and 2x export.",
    href: "/mockup-generator",
    icon: <Monitor className="h-5 w-5" />,
    color: "#64748b",
    category: "Utility",
    features: [
      "Device frames: iPhone, MacBook and more",
      "Background color presets plus custom color picker",
      "Automatic screen placement scaled to each device",
      "Realistic device shadows",
      "High-resolution PNG export at 2x",
    ],
    steps: [
      { title: "Upload Your Design", detail: "Drag & drop a PNG/JPG screenshot or artwork." },
      { title: "Choose a Device", detail: "Pick iPhone, MacBook or another frame — your design is placed on the screen automatically." },
      { title: "Set the Background", detail: "Choose from preset colors or pick a custom one to match your brand." },
      { title: "Export", detail: "Download a 2x-resolution PNG ready for portfolios and presentations." },
    ],
    tips: ["Light gray backgrounds make device screens pop", "2x export looks crisp on retina displays"],
    output: "Device mockup PNG at 2x resolution",
  },
  {
    id: "title-optimizer",
    name: "Title Optimizer",
    description: "Score, fix and perfect your stock titles — live SEO analysis, A/B testing, bulk scoring and proven formulas.",
    href: "/title-optimizer",
    icon: <Type className="h-5 w-5" />,
    color: "#06b6d4",
    category: "Utility",
    features: [
      "4 modes: Analyze, A/B Compare, Bulk & Templates",
      "Live SEO score with letter grade (A+ to F) as you type",
      "Platform-specific rules for 6 platforms (length limits & preferences)",
      "Issue detection: filler words, length, capitalization, repetition & more",
      "Strengths list for what's already working",
      "Character Weight Map — SEO value of every word, color-coded",
      "Keyword density check with status per word",
      "Category match scoring & per-keyword search volumes",
      "Auto-optimized title + keyword suggestions",
      "Bulk mode scores many titles at once with CSV export",
      "Proven title formula templates with examples & one-click Use",
    ],
    steps: [
      { title: "Enter a Title", detail: "Paste your stock title — the score, grade, issues and strengths update live." },
      { title: "Analyze Deeply", detail: "Review the Character Weight Map, density check, category match and search volumes to see word-by-word value." },
      { title: "Apply the Optimized Title", detail: "Copy the auto-optimized title and suggested keywords, then re-score to confirm the improvement." },
      { title: "A/B or Bulk", detail: "Compare two titles head-to-head in the A/B tab, or score dozens at once in Bulk with CSV export." },
      { title: "Learn the Formulas", detail: "Open Templates for proven title formulas with real examples you can apply with one click." },
    ],
    tips: ["Aim for 80+ scores before uploading", "Zero filler words is an instant +15 points", "Start titles with the subject — never 'A' or 'The'"],
    output: "SEO score & grade, optimized title, keyword suggestions, bulk CSV report",
  },
  {
    id: "events",
    name: "Events Calendar",
    description: "A full year of holidays and observances mapped to stock-content opportunities — plan uploads before demand spikes.",
    href: "/events",
    icon: <Calendar className="h-5 w-5" />,
    color: "#f43f5e",
    category: "Utility",
    features: [
      "Complete 2026 event calendar with holidays & observances",
      "Month-by-month navigation with today highlight",
      "Event detail side panel for the selected day",
      "Dots on every day that has an event",
      "Covers global days (Earth Day, Women's Day, Mental Health Day…), national holidays & fun observances",
      "Built for planning seasonal stock uploads ahead of demand",
    ],
    steps: [
      { title: "Browse the Year", detail: "Flip through months with the arrows — event days are marked on the grid." },
      { title: "Open an Event", detail: "Click a marked day to see the event details in the side panel." },
      { title: "Plan Ahead", detail: "Note events 2–3 months out and schedule themed content (Halloween in August, Valentine's in December)." },
    ],
    tips: ["Buyers search seasonal content 6–10 weeks early", "Pair each event with the Keywords tool to find the right terms", "Fun observances (Cat Day, Coffee Day) are low-competition gold"],
    output: "Event calendar for seasonal content planning",
  },
];

const CATEGORIES = ["All", "Main", "Creative", "Analytics", "Utility"];

// ─── Components ───
function ToolCard({ tool, isExpanded, onToggle }: { tool: ToolInfo; isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className={`rounded-2xl border transition-all ${isExpanded ? "border-accent/30 bg-surface shadow-lg" : "border-border bg-surface hover:border-accent/20"}`}>
      <button onClick={onToggle}
        className="flex w-full items-center gap-4 p-5 text-left">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: tool.color + "15", color: tool.color }}>
          {tool.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-text-primary">{tool.name}</h3>
            <span className="rounded-full bg-bg-secondary px-2 py-0.5 text-[9px] font-medium text-text-muted">{tool.category}</span>
          </div>
          <p className="mt-0.5 text-[11px] text-text-muted line-clamp-1">{tool.description}</p>
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 text-text-muted transition-transform ${isExpanded ? "rotate-180" : ""}`} />
      </button>

      {isExpanded && (
        <div className="border-t border-border px-5 pb-5">
          {/* Features */}
          <div className="mt-4">
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">
              <Zap className="h-3 w-3" style={{ color: tool.color }} /> Features ({tool.features.length})
            </p>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {tool.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <Check className="mt-0.5 h-3 w-3 shrink-0" style={{ color: tool.color }} />
                  <span className="text-[11px] text-text-secondary leading-snug">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div className="mt-4 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">How to use</p>
            {tool.steps.map((step, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: tool.color }}>
                  {i + 1}
                </div>
                <div>
                  <p className="text-xs font-semibold text-text-primary">{step.title}</p>
                  <p className="mt-0.5 text-[11px] text-text-secondary leading-relaxed">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Output */}
          <div className="mt-4 rounded-xl border border-border bg-bg-secondary/50 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">Output</p>
            <p className="text-[11px] text-text-secondary">{tool.output}</p>
          </div>

          {/* Tips */}
          <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
            <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-600">
              <Lightbulb className="h-3 w-3" /> Tips
            </p>
            <ul className="space-y-1">
              {tool.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[11px] text-text-secondary">
                  <Star className="mt-0.5 h-2.5 w-2.5 shrink-0 text-amber-500" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Open Tool */}
          <Link href={tool.href}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-white transition-all hover:brightness-110"
            style={{ backgroundColor: tool.color }}>
            Open {tool.name} <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───
export default function HowItWorksPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [expandedTool, setExpandedTool] = useState<string | null>(null);

  const filteredTools = activeCategory === "All" ? TOOLS : TOOLS.filter(t => t.category === activeCategory);

  return (
    <ToolLayout>
    <div className="flex flex-1 flex-col lg:overflow-y-auto">
      {/* Page Heading — sticky, same fixed behaviour as other pages */}
      <div className="sticky top-[45px] z-20 flex items-center gap-3 border-b border-border bg-bg px-5 py-2.5 lg:top-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
          <Lightbulb className="h-4 w-4 text-accent" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text-primary">How It Works</h2>
          <p className="text-[11px] text-text-muted">Every tool & feature, step by step — {TOOLS.length} tools documented</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 border-b border-border bg-bg px-5 py-3">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => { setActiveCategory(cat); setExpandedTool(null); }}
            className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all ${
              activeCategory === cat
                ? "bg-accent text-white"
                : "border border-border bg-surface text-text-secondary hover:border-accent/30"
            }`}>
            {cat}
            {cat !== "All" && (
              <span className="ml-1 text-[9px] opacity-70">({TOOLS.filter(t => t.category === cat).length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Tool Cards */}
      <div className="flex-1 p-5">
        <div className="mx-auto max-w-3xl space-y-3">
          {filteredTools.map(tool => (
            <ToolCard
              key={tool.id}
              tool={tool}
              isExpanded={expandedTool === tool.id}
              onToggle={() => setExpandedTool(expandedTool === tool.id ? null : tool.id)}
            />
          ))}
        </div>
      </div>
    </div>
    </ToolLayout>
  );
}
