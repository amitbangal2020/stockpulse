import { ToolLayout } from "@/components/tool-layout";
import Link from "next/link";
import { Sparkles, BarChart3, TrendingUp, FolderOpen, Tag, Search } from "lucide-react";
import type { Metadata } from "next";
import { seoMetadata } from "@/lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "StockPulse — AI Metadata & Analytics Toolkit for Microstock Sellers",
  description:
    "Free AI toolkit for microstock sellers: generate stock photo titles, keywords and descriptions, track Adobe Stock downloads, and research trending keywords — all in one place.",
  path: "/",
});

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "StockPulse",
  url: "https://www.abanti.in",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "AI-powered metadata generator and analytics toolkit for Adobe Stock, Shutterstock, Freepik and other microstock platforms.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "StockPulse",
  url: "https://www.abanti.in",
  logo: "https://www.abanti.in/og-image.png",
  description:
    "Free AI toolkit for microstock sellers: metadata generation, portfolio analytics and keyword research for Adobe Stock, Shutterstock and Freepik.",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "StockPulse",
  alternateName: "abanti.in",
  url: "https://www.abanti.in",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://www.abanti.in/search?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is StockPulse?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "StockPulse is a free AI toolkit for microstock sellers: generate optimized titles, keywords and descriptions for Adobe Stock, Shutterstock and Freepik, track downloads in real time, and research trending keywords — 22 tools in one place.",
      },
    },
    {
      "@type": "Question",
      name: "How do I generate keywords for Adobe Stock?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Open the MetaGen tool, upload your images or videos, and the AI writes platform-optimized titles, keywords and descriptions for each file. Export the results as an Adobe Stock-ready CSV and upload it directly.",
      },
    },
    {
      "@type": "Question",
      name: "Can I see how many downloads an Adobe Stock asset has?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Use the Adobe Tracker tool and enter any asset ID to see its exact live download count, or enter a contributor ID to analyze an entire portfolio of up to 300 assets.",
      },
    },
    {
      "@type": "Question",
      name: "Which AI providers does StockPulse support?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "StockPulse works with OpenAI, Google Gemini, Anthropic Claude, Grok, Mistral and OpenRouter. You bring your own API keys, and multiple keys per provider rotate automatically.",
      },
    },
    {
      "@type": "Question",
      name: "Is StockPulse free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — every tool is free to use. The AI metadata generator runs on your own API keys, so there are no subscription fees or per-image charges.",
      },
    },
  ],
};

const TOOLS = [
  {
    title: "MetaGen",
    description: "AI-powered metadata generator for Adobe Stock, Shutterstock, Freepik, Vecteezy, and more.",
    href: "/metagen",
    icon: Sparkles,
    color: "text-accent",
    bg: "bg-accent-subtle",
  },
  {
    title: "Adobe Tracker",
    description: "Real-time download analytics. Track, compare, and optimize your stock portfolio.",
    href: "/search",
    icon: Search,
    color: "text-info",
    bg: "bg-info-subtle",
  },
  {
    title: "Dashboard",
    description: "Overview of your portfolio performance, earnings, and recent activity.",
    href: "/dashboard",
    icon: BarChart3,
    color: "text-warning",
    bg: "bg-warning-subtle",
  },
  {
    title: "Trending",
    description: "Discover trending keywords, popular assets, and market insights.",
    href: "/trending",
    icon: TrendingUp,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    title: "Portfolio",
    description: "Manage and organize your uploaded assets across all platforms.",
    href: "/portfolio",
    icon: FolderOpen,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    title: "Keywords",
    description: "Keyword research tool to find high-demand, low-competition tags.",
    href: "/keywords",
    icon: Tag,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
];

export default function Home() {
  return (
    <ToolLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* Hero */}
        <div className="flex flex-col items-center px-6 pt-16 pb-10 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent-subtle px-4 py-1.5 text-xs font-semibold text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Tools
          </div>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
            Your Microstock{" "}
            <span className="text-accent">Toolkit</span>
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-text-secondary">
            Generate optimized metadata, track downloads, analyze trends, and
            manage your portfolio — all in one place.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 px-6 pb-16 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex flex-col rounded-2xl border border-border bg-surface p-6 transition-all hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5"
            >
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${tool.bg}`}>
                <tool.icon className={`h-6 w-6 ${tool.color}`} />
              </div>
            <h3 className="font-heading text-sm font-semibold tracking-tight text-text-primary group-hover:text-accent transition-colors">
              {tool.title}
            </h3>
            <p className="mt-1.5 text-xs text-text-muted leading-relaxed">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
