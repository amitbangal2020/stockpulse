import type { Metadata } from "next";
import Link from "next/link";
import { ToolLayout } from "@/components/tool-layout";
import { SearchTool } from "@/components/search-tool";
import { seoMetadata } from "@/lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Adobe Stock Contributor Tracker — Portfolio & Download Analytics",
  description:
    "Track any Adobe Stock contributor's portfolio in real time: total downloads, top assets, per-asset stats, and CSV export. Search by keyword, contributor ID, or asset ID.",
  path: "/search",
});

// FAQ structured data — surfaces contributor questions directly in Google
// results and AI assistants (same pattern as /how-it-works).
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How can I see another Adobe Stock contributor's total downloads?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Open StockPulse Tracker, choose the Contributor ID tab, and paste the numeric ID from the contributor's Adobe Stock URL (stock.adobe.com/contributor/ID). StockPulse scans up to 300 of their assets and shows total downloads, best-performing files and per-asset statistics in real time.",
      },
    },
    {
      "@type": "Question",
      name: "How do I find my Adobe Stock contributor ID?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Go to your public Adobe Stock portfolio page. The URL looks like stock.adobe.com/contributor/123456789 — the number after /contributor/ is your contributor ID. Paste that number into StockPulse Tracker to see your live download analytics.",
      },
    },
    {
      "@type": "Question",
      name: "How many times has my Adobe Stock image been downloaded?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Choose the Asset ID tab in StockPulse Tracker and paste the numeric ID from the image URL (stock.adobe.com/images/ID). You get the exact public download count plus performance stats — no dashboard or sign-in needed.",
      },
    },
    {
      "@type": "Question",
      name: "Can I compare my stock portfolio against top contributors?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Search your own contributor ID, then search the leading contributors in your niche. StockPulse shows both portfolios' download counts side by side so you can benchmark your performance and spot content gaps.",
      },
    },
    {
      "@type": "Question",
      name: "Does StockPulse Tracker work for keywords, not just contributors?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The keyword search shows the top 200 live Adobe Stock results for any term with real download counts — a free way to research which subjects and styles sell before you shoot or generate new content.",
      },
    },
    {
      "@type": "Question",
      name: "Is the Adobe Stock tracker free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, StockPulse Tracker is completely free — no account, no API key and no limits. Results can be exported to CSV for offline analysis.",
      },
    },
  ],
};

// SoftwareApplication structured data — tells search engines this is an
// interactive analytics tool, not just an article (rich-result eligibility).
const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "StockPulse Tracker — Adobe Stock Contributor Analytics",
  url: "https://www.abanti.in/search",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any (web browser)",
  description:
    "Free real-time analytics tool for Adobe Stock contributors: track any contributor's downloads, analyze keywords, inspect single asset stats and export portfolios to CSV.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function SearchPage() {
  return (
    <ToolLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
      />
      <SearchTool>
        <SearchSeoSection />
      </SearchTool>
    </ToolLayout>
  );
}

/**
 * Server-rendered SEO content — indexed as static HTML, unlike the client
 * tool above. Answers the questions microstock contributors actually search
 * for and deep-links to the tool's own sections.
 */
function SearchSeoSection() {
  return (
    <section className="border-t border-border bg-bg-secondary">
      <div className="mx-auto max-w-screen-2xl px-5 py-12 lg:px-8">
        <h2 className="font-heading text-lg font-bold tracking-tight text-text-primary">
          Adobe Stock download analytics — free contributor tracker
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-secondary">
          StockPulse Tracker is a free analytics tool built for Adobe Stock
          contributors. Look up any contributor&apos;s public portfolio to see
          total downloads, their best-selling assets and per-file statistics;
          research keywords with real download data; or inspect a single asset
          ID. Everything is read from Adobe Stock&apos;s public data in real
          time — no sign-up, no API key — and any search exports to a
          spreadsheet-ready CSV.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface p-5">
            <h3 className="text-sm font-semibold text-text-primary">
              Track contributor portfolios
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-text-muted">
              Paste any contributor ID (the number in{" "}
              <code className="rounded bg-background px-1 py-0.5 text-[11px]">
                stock.adobe.com/contributor/ID
              </code>
              ) to scan up to 300 assets with live download counts. Benchmark
              your portfolio against the top sellers in your niche and spot
              what content actually sells.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5">
            <h3 className="text-sm font-semibold text-text-primary">
              Research keywords that sell
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-text-muted">
              Keyword search returns the top 200 live results for any term with
              real download counts per asset. See which subjects, styles and
              media types outperform before you shoot — a free alternative to
              paid stock keyword tools.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5">
            <h3 className="text-sm font-semibold text-text-primary">
              Inspect single assets
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-text-muted">
              Enter an asset ID (
              <code className="rounded bg-background px-1 py-0.5 text-[11px]">
                stock.adobe.com/images/ID
              </code>
              ) for the exact public download count and performance breakdown
              of one file — handy for monitoring your own uploads or checking
              competitors&apos; hits.
            </p>
          </div>
        </div>

        <h2 className="mt-10 font-heading text-lg font-bold tracking-tight text-text-primary">
          Frequently asked questions
        </h2>
        <div className="mt-4 grid gap-x-8 gap-y-5 md:grid-cols-2">
          {[
            {
              q: "How do I find my Adobe Stock contributor ID?",
              a: "Open your public portfolio on Adobe Stock — the URL ends with /contributor/ followed by a number. That number is your contributor ID; paste it into the Contributor ID tab above.",
            },
            {
              q: "Can I see how many downloads a specific Adobe Stock image has?",
              a: "Yes. Switch to the Asset ID tab and paste the number from the image's stock.adobe.com URL. StockPulse shows the exact public download count and performance stats instantly.",
            },
            {
              q: "How is this different from the Adobe Stock dashboard?",
              a: "Your contributor dashboard shows only your own sales. StockPulse shows the public download counts of every contributor — so you can benchmark against others, research niches and verify demand before creating new content.",
            },
            {
              q: "Does tracking work for Shutterstock or Freepik too?",
              a: "This tracker covers Adobe Stock's public data. For metadata and keyword optimization across Adobe Stock, Shutterstock, Freepik, Vecteezy, iStock and Pond5, use the free StockPulse metadata generator.",
            },
          ].map((item) => (
            <div key={item.q}>
              <h3 className="text-sm font-semibold text-text-primary">{item.q}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-text-muted">
                {item.a}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs leading-relaxed text-text-muted">
          Data source: Adobe Stock public portfolio data via the StockPulse
          API. Download counts reflect publicly visible totals and may differ
          from private dashboard earnings. For metadata automation, keyword
          research and creative tools, explore{" "}
          <a href="/how-it-works" className="text-accent hover:underline">
            how StockPulse works
          </a>{" "}
          or read the{" "}
          <Link href="/blog" className="text-accent hover:underline">
            contributor blog
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
