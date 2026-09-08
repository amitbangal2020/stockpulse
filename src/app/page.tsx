import { ToolLayout } from "@/components/tool-layout";
import Link from "next/link";
import { Sparkles, BarChart3, TrendingUp, FolderOpen, Tag, Search } from "lucide-react";

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
