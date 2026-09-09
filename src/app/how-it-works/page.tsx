"use client";

import { useState } from "react";
import Link from "next/link";
import { ToolLayout } from "@/components/tool-layout";
import {
  Sparkles, BarChart3, Video, Layers, CircleDot, LayoutGrid, Palette,
  Grid3X3, Type, FileCode, TrendingUp, GitCompare, Calendar, Monitor,
  ChevronDown, ChevronRight, ExternalLink, Upload, Zap, Download,
  Search, Target, Settings, Image as ImageIcon, Play, Eye, Copy,
  Check, Smartphone, MonitorPlay, CreditCard, BookOpen, ShoppingBag,
  ArrowRight, Lightbulb, Star,
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
  steps: { title: string; detail: string }[];
  tips: string[];
  output: string;
}

const TOOLS: ToolInfo[] = [
  // ─── Main Tools ───
  {
    id: "generator",
    name: "Metadata Generator",
    description: "AI-powered metadata generation for microstock platforms (Adobe Stock, Shutterstock, Freepik, etc.)",
    href: "/metagen",
    icon: <Sparkles className="h-5 w-5" />,
    color: "#10b981",
    category: "Main",
    steps: [
      { title: "Add API Key", detail: "Click 'Add API Key' in the sidebar. Enter your Gemini/OpenAI/Claude API key. Click 'Validate API Key' to verify it works." },
      { title: "Select Platforms", detail: "Check the target platforms (Adobe Stock, Shutterstock, Freepik, etc.). Multiple platforms = separate CSV files in ZIP." },
      { title: "Upload Files", detail: "Drag & drop or click to upload images (PNG, JPG, EPS, SVG) or videos (MP4, MOV, AVI). Thumbnails auto-generate." },
      { title: "Configure Settings", detail: "Set title length, keyword count, description length. Toggle transparent/white background. Choose prompt style and tone." },
      { title: "Generate Metadata", detail: "Click 'Generate All'. AI analyzes each file and creates title, description, keywords. Live timer shows progress." },
      { title: "Generate Prompts Too", detail: "Switch to the 'Prompt' tab (next to Metadata) to generate AI image prompts (e.g., for Midjourney/DALL-E) from the same files. Set prompt length, camera params, prefix/suffix, and negative prompt as needed." },
      { title: "Review & Copy", detail: "Review each file's metadata. Copy individual fields or 'Copy All'. Switch between A/B versions. Check quality score." },
      { title: "Export CSV", detail: "Click 'Download CSV' for single platform or 'Download ZIP' for multiple platforms. Each CSV matches platform format." },
    ],
    tips: ["Use Transparent toggle for PNG/EPS files", "Enable Parallel Generation for faster batch processing", "Use the Prompt tab to create Midjourney/DALL-E prompts from your images", "Try different Prompt Styles for variety"],
    output: "Platform-specific CSV files with title, description, keywords, category + AI image prompts",
  },
  {
    id: "tracker",
    name: "Adobe Tracker",
    description: "Search, track, and analyze Adobe Stock assets. AI badge detection, trend analysis, competitor research.",
    href: "/search",
    icon: <BarChart3 className="h-5 w-5" />,
    color: "#6366f1",
    category: "Main",
    steps: [
      { title: "Search by Asset ID", detail: "Enter any Adobe Stock Asset ID (e.g., 212340954) to see exact download count and view count for that specific asset. Perfect for tracking your own uploads or analyzing competitors." },
      { title: "Search by Creator ID", detail: "Enter a Contributor/Creator ID to see their entire portfolio. View total downloads across all their assets, find top performers, and analyze their keyword strategy." },
      { title: "Search by Keyword", detail: "Type any keyword to discover related assets. Results show thumbnails with titles, downloads, views, and contributor info." },
      { title: "Filter Results", detail: "Use AI filter (AI Only / Exclude AI / Include AI). Filter by media type (Photo, Vector, Video). Sort by downloads or performance." },
      { title: "View Performance Stats", detail: "Check the summary bar: Total Results, Total Downloads, Average Downloads, Top Performer. Each asset shows download count + view count + performance bar." },
      { title: "Export Data", detail: "Click CSV button to download search results with all stats. Analyze in Excel or Google Sheets for deeper insights." },
    ],
    tips: ["Asset ID = check exact downloads for any single file", "Creator ID = spy on competitor portfolios", "AI filter helps understand AI vs handmade market"],
    output: "Download counts, view counts, portfolio analysis, competitor insights, CSV export",
  },
  {
    id: "svg-video",
    name: "SVG to Video",
    description: "Convert SVG animations to MP4/MOV video files with custom FPS, resolution, and background.",
    href: "/svg-to-video",
    icon: <Video className="h-5 w-5" />,
    color: "#f59e0b",
    category: "Main",
    steps: [
      { title: "Upload SVG", detail: "Drag & drop an animated SVG file or click to browse. The SVG preview shows immediately." },
      { title: "Configure Output", detail: "Choose video format (MP4/MOV/AVI), resolution (720p/1080p/4K), FPS (24/30/60), and background color." },
      { title: "Preview Animation", detail: "Click Play to preview the SVG animation. Adjust start/end times if needed." },
      { title: "Convert & Export", detail: "Click 'Convert & Export'. Progress bar shows encoding status. Download the video when complete." },
    ],
    tips: ["60 FPS for smooth motion graphics", "1080p is best balance of quality and file size", "Transparent backgrounds work with MOV format"],
    output: "MP4/MOV/AVI video files",
  },
  // ─── Creative Tools ───
  {
    id: "dither",
    name: "Dither Studio",
    description: "Apply dithering effects to images. Bayer and Floyd-Steinberg algorithms with adjustable parameters.",
    href: "/dither-studio",
    icon: <Layers className="h-5 w-5" />,
    color: "#ec4899",
    category: "Creative",
    steps: [
      { title: "Upload Image", detail: "Drag & drop any image (PNG, JPG, WEBP). Preview shows original and dithered side-by-side." },
      { title: "Choose Algorithm", detail: "Select Bayer (2x2, 4x4, 8x8) or Floyd-Steinberg. Each produces different visual patterns." },
      { title: "Adjust Settings", detail: "Set dither intensity, color palette (2-16 colors), contrast, brightness, and threshold." },
      { title: "Preview & Export", detail: "Live preview updates as you adjust. Click 'Download' to save the dithered image as PNG." },
    ],
    tips: ["Bayer 4x4 for retro pixel art look", "Floyd-Steinberg for photographic dithering", "Reduce colors to 4-8 for strongest effect"],
    output: "PNG image with dithering effect",
  },
  {
    id: "halftone",
    name: "Halftone Studio",
    description: "Create halftone dot patterns from images. Adjustable dot size, angle, shape, and color.",
    href: "/halftone-studio",
    icon: <CircleDot className="h-5 w-5" />,
    color: "#8b5cf6",
    category: "Creative",
    steps: [
      { title: "Upload Image", detail: "Drop any image. The halftone preview renders in real-time." },
      { title: "Set Dot Parameters", detail: "Adjust dot size (1-20px), rotation angle (0-90°), shape (circle/square/diamond), and spacing." },
      { title: "Choose Colors", detail: "Set dot color and background color. Use duotone for two-color halftone effects." },
      { title: "Export", detail: "Download as PNG. Choose resolution: Screen (72dpi), Print (300dpi), or Custom." },
    ],
    tips: ["45° angle for classic newspaper look", "Small dots (2-4px) for subtle texture", "Large dots (10-20px) for pop art style"],
    output: "PNG with halftone dot pattern",
  },
  {
    id: "bento",
    name: "Bento Builder",
    description: "Create bento grid layouts for social media, presentations, and portfolios.",
    href: "/bento-builder",
    icon: <LayoutGrid className="h-5 w-5" />,
    color: "#14b8a6",
    category: "Creative",
    steps: [
      { title: "Choose Layout", detail: "Select a pre-made bento grid template (2x2, 3x3, mixed sizes). Or start blank." },
      { title: "Add Content", detail: "Click cells to add images, text, or colors. Drag to reorder. Resize cells by dragging borders." },
      { title: "Style Cells", detail: "Set background colors, gradients, borders, and padding for each cell. Add text overlays." },
      { title: "Export", detail: "Download the bento grid as PNG (1x/2x/3x) or copy to clipboard for direct paste." },
    ],
    tips: ["Use consistent spacing between cells", "Limit to 3-4 colors for cohesive look", "2x export for social media quality"],
    output: "PNG bento grid layout",
  },
  {
    id: "color-palette",
    name: "Color Palette",
    description: "Extract dominant colors from any image. Generate harmonious palettes with copy/export.",
    href: "/color-palette",
    icon: <Palette className="h-5 w-5" />,
    color: "#f43f5e",
    category: "Creative",
    steps: [
      { title: "Upload Image", detail: "Drop any image. Colors are extracted automatically using k-means clustering." },
      { title: "View Extracted Colors", detail: "See 5-10 dominant colors as swatches with HEX, RGB, and HSL values." },
      { title: "Adjust Count", detail: "Use the slider to extract 3-12 colors. Fewer = more dominant, more = more nuanced." },
      { title: "Copy & Export", detail: "Click any color to copy HEX code. Export full palette as PNG, SVG, or CSS variables." },
    ],
    tips: ["5 colors is ideal for most design systems", "Lock colors you like before re-extracting", "Export as CSS variables for web projects"],
    output: "Color palette with HEX/RGB/HSL codes, PNG/SVG export",
  },
  {
    id: "color-harmonizer",
    name: "Color Harmonizer",
    description: "Generate color harmonies (complementary, analogous, triadic, etc.) from a base color.",
    href: "/color-harmonizer",
    icon: <Palette className="h-5 w-5" />,
    color: "#a855f7",
    category: "Creative",
    steps: [
      { title: "Pick Base Color", detail: "Click the color picker or enter a HEX code. The color wheel updates instantly." },
      { title: "Choose Harmony Type", detail: "Select from: Complementary, Analogous, Triadic, Split-Complementary, Square, Tetradic, Monochromatic." },
      { title: "View Results", detail: "Generated colors appear on the wheel and as swatches. Each shows role (Base, Complement, etc.)." },
      { title: "Copy & Apply", detail: "Click any swatch to copy HEX. Export the full harmony as palette, CSS, or image." },
    ],
    tips: ["Analogous for calm, cohesive designs", "Complementary for high contrast", "Triadic for vibrant, balanced palettes"],
    output: "Color harmony palette with role labels",
  },
  {
    id: "ascii",
    name: "ASCII Vision",
    description: "Convert images to ASCII art text. Adjustable character set, resolution, and color.",
    href: "/ascii-vision",
    icon: <Type className="h-5 w-5" />,
    color: "#84cc16",
    category: "Creative",
    steps: [
      { title: "Upload Image", detail: "Drop any image. ASCII preview generates instantly." },
      { title: "Set Resolution", detail: "Adjust width (20-200 characters). More characters = more detail but larger output." },
      { title: "Choose Character Set", detail: "Select from: Standard (ascii11), Detailed (ascii70), Blocks, Binary, or Custom characters." },
      { title: "Copy or Download", detail: "Copy ASCII text to clipboard or download as TXT/PNG file." },
    ],
    tips: ["Width 80-100 for best balance", "Block characters for bold look", "Standard set for classic ASCII art"],
    output: "ASCII text art (TXT or PNG)",
  },
  {
    id: "svg-eps",
    name: "SVG to EPS",
    description: "Convert SVG files to EPS10 and EPS20 formats. Batch conversion with folder support.",
    href: "/svg-to-eps",
    icon: <FileCode className="h-5 w-5" />,
    color: "#f97316",
    category: "Utility",
    steps: [
      { title: "Upload SVG Files", detail: "Select individual SVGs or import an entire folder. Multiple files supported." },
      { title: "Choose EPS Version", detail: "Select EPS10 (widely compatible) or EPS20 (newer features). Both options available." },
      { title: "Set Save Location", detail: "Click 'Save to Folder' to choose where converted files save." },
      { title: "Convert", detail: "Click 'Convert All'. Progress shows for each file. Download or open folder when done." },
    ],
    tips: ["EPS10 for maximum compatibility", "EPS20 for advanced transparency", "Batch import folders for bulk conversion"],
    output: "EPS10/EPS20 vector files",
  },
  // ─── Analytics Tools ───
  {
    id: "trend",
    name: "Trend Predictor",
    description: "Predict stock content trends using Adobe Stock API data. Niche analysis and opportunity scoring.",
    href: "/trend-predictor",
    icon: <TrendingUp className="h-5 w-5" />,
    color: "#22c55e",
    category: "Analytics",
    steps: [
      { title: "Select Time Period", detail: "Choose All Time, Month, Week, or Day to filter trend data." },
      { title: "View Trending Niches", detail: "See top niches with growth percentage, competition level, and opportunity score." },
      { title: "Check Top Contributors", detail: "See who's uploading the most and their growth rate. Learn from successful contributors." },
      { title: "Analyze Categories", detail: "View category breakdown with color-coded bars. Identify underserved categories." },
    ],
    tips: ["Weekly trends show freshest opportunities", "Low competition + high growth = best niche", "Check multiple time periods for pattern recognition"],
    output: "Trend data, niche opportunities, contributor insights",
  },
  {
    id: "candlestick",
    name: "Candlestick Chart",
    description: "Financial candlestick charts with multiple styles, timeframes, and technical indicators.",
    href: "/candlestick-chart",
    icon: <BarChart3 className="h-5 w-5" />,
    color: "#10b981",
    category: "Analytics",
    steps: [
      { title: "Upload Data", detail: "Paste CSV data with Date, Open, High, Low, Close, Volume columns. Or use sample data." },
      { title: "Choose Chart Type", detail: "Select Candlestick, Line, Area, Bar, or Mixed view." },
      { title: "Set Timeframe", detail: "Choose 1D, 1W, 1M, 3M, 6M, or 1Y timeframe." },
      { title: "Add Indicators", detail: "Toggle SMA, EMA, Bollinger Bands, Volume overlay, MACD, RSI." },
      { title: "Export", detail: "Download chart as PNG or SVG. Copy data as CSV." },
    ],
    tips: ["Use 1W for long-term trends", "Bollinger Bands show volatility", "Volume confirms price movements"],
    output: "Interactive financial chart (PNG/SVG export)",
  },
  {
    id: "heatmap",
    name: "Market Heatmap",
    description: "Visual heatmap of market sectors with color-coded performance metrics.",
    href: "/market-heatmap",
    icon: <Grid3X3 className="h-5 w-5" />,
    color: "#ef4444",
    category: "Analytics",
    steps: [
      { title: "Select Market", detail: "Choose stock market sector data or custom portfolio data." },
      { title: "Set Metric", detail: "View by: Performance, Volume, Market Cap, or Custom metric." },
      { title: "Adjust Timeframe", detail: "1D, 1W, 1M, 3M, 6M, 1Y performance view." },
      { title: "Interpret Colors", detail: "Green = positive, Red = negative, Intensity = magnitude. Hover for details." },
    ],
    tips: ["Larger blocks = higher market cap", "Deep red/green = significant movement", "Use 1M view for medium-term trends"],
    output: "Interactive heatmap visualization",
  },
  {
    id: "portfolio",
    name: "Portfolio Analytics",
    description: "Track and analyze your stock portfolio performance across multiple platforms.",
    href: "/portfolio-analytics",
    icon: <Target className="h-5 w-5" />,
    color: "#3b82f6",
    category: "Analytics",
    steps: [
      { title: "Add Assets", detail: "Import your portfolio data from CSV or add manually. Include platform, downloads, earnings." },
      { title: "View Dashboard", detail: "See total earnings, downloads, top performers, and platform breakdown." },
      { title: "Analyze Performance", detail: "Check growth charts, earnings trends, and category distribution." },
      { title: "Export Report", detail: "Download portfolio report as PDF or CSV for tax/accounting purposes." },
    ],
    tips: ["Update data monthly for accurate tracking", "Compare platforms to focus efforts", "Track earnings per asset for ROI analysis"],
    output: "Portfolio dashboard, performance charts, export reports",
  },
  {
    id: "comparison",
    name: "Asset Comparison",
    description: "Compare two stock assets side-by-side. Metadata, performance, and visual analysis.",
    href: "/asset-comparison",
    icon: <GitCompare className="h-5 w-5" />,
    color: "#8b5cf6",
    category: "Analytics",
    steps: [
      { title: "Select Two Assets", detail: "Search and select two assets to compare. Or paste asset IDs." },
      { title: "View Side-by-Side", detail: "See thumbnails, titles, keywords, downloads, views, and contributor info." },
      { title: "Analyze Differences", detail: "Highlighted differences in metadata, keyword overlap, and performance gap." },
      { title: "Learn & Apply", detail: "Identify what makes the better performer successful. Apply insights to your uploads." },
    ],
    tips: ["Compare similar content types (both icons, both photos)", "Focus on keyword differences", "Check title structure differences"],
    output: "Side-by-side comparison report",
  },
  // ─── Utility Tools ───
  {
    id: "title-optimizer",
    name: "Title Optimizer",
    description: "SEO analysis and optimization for stock titles. Scoring, suggestions, and multi-platform support.",
    href: "/title-optimizer",
    icon: <Type className="h-5 w-5" />,
    color: "#06b6d4",
    category: "Utility",
    steps: [
      { title: "Enter Title", detail: "Paste or type your stock title. Live scoring updates as you type." },
      { title: "Select Platform", detail: "Choose Adobe Stock, Shutterstock, Freepik, Vecteezy, iStock, or Pond5." },
      { title: "Analyze", detail: "View SEO score, grade (A+ to F), issues, strengths, and character weight map." },
      { title: "Optimize", detail: "See optimized title, keyword suggestions, platform compatibility, and category match." },
      { title: "Compare A/B", detail: "Switch to A/B tab to compare two titles side-by-side." },
      { title: "Bulk Analyze", detail: "Paste multiple titles (one per line) for batch scoring and CSV export." },
    ],
    tips: ["Score 80+ = excellent", "Use Templates tab for proven formulas", "Check Character Weight Map for SEO value of each word"],
    output: "SEO score, optimized title, keyword suggestions, CSV report",
  },
  {
    id: "mockup",
    name: "Mockup Generator",
    description: "Professional device mockups. Place your design on iPhone, MacBook, poster, and more.",
    href: "/mockup-generator",
    icon: <Monitor className="h-5 w-5" />,
    color: "#64748b",
    category: "Utility",
    steps: [
      { title: "Upload Design", detail: "Drag & drop your image (PNG, JPG). Preview shows on the default device." },
      { title: "Choose Device", detail: "Select from: iPhone, iPad, MacBook, iMac, Monitor, TV, Business Card, Poster, Book Cover, Tote Bag." },
      { title: "Adjust Background", detail: "Pick from 12 presets (white, gray, gradients) or choose custom color." },
      { title: "Fine-tune", detail: "Adjust rotation, brightness, contrast, saturation. Toggle drop shadow." },
      { title: "Export", detail: "Download as high-resolution PNG (2x) with transparent or colored background." },
    ],
    tips: ["Use gradient backgrounds for modern look", "2x export for social media quality", "Subtle rotation (-5° to 5°) adds dynamism"],
    output: "High-resolution mockup PNG (2x)",
  },
  {
    id: "events",
    name: "Events",
    description: "Track important dates, deadlines, and events for stock content planning.",
    href: "/events",
    icon: <Calendar className="h-5 w-5" />,
    color: "#f43f5e",
    category: "Utility",
    steps: [
      { title: "View Calendar", detail: "See upcoming events, holidays, and seasonal content opportunities." },
      { title: "Add Events", detail: "Click 'Add Event' to create custom deadlines or content planning dates." },
      { title: "Set Reminders", detail: "Configure reminder notifications for important dates." },
      { title: "Plan Content", detail: "Use events to plan themed content uploads ahead of seasonal demand." },
    ],
    tips: ["Upload seasonal content 2-3 months early", "Holidays = peak demand", "Track trending events for timely uploads"],
    output: "Event calendar, reminders, content planning",
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
          {/* Steps */}
          <div className="mt-4 space-y-3">
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
    <div className="flex flex-1 flex-col overflow-y-auto">
      {/* Page Heading — same as other pages */}
      <div className="flex items-center gap-3 border-b border-border bg-bg px-5 py-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
          <Lightbulb className="h-4 w-4 text-accent" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text-primary">How It Works</h2>
          <p className="text-[11px] text-text-muted">Step-by-step guides for every tool</p>
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
              <span className="ml-1 text-[9px] opacity-70">({TOOLS.filter(t => cat === "All" || t.category === cat).length})</span>
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
