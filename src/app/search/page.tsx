import type { Metadata } from "next";
import { ToolLayout } from "@/components/tool-layout";
import { SearchTool } from "@/components/search-tool";
import { SearchSeoSection } from "@/components/search-seo-section";
import { seoMetadata } from "@/lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Adobe Stock Contributor Tracker — Portfolio & Download Analytics",
  description:
    "Track any Adobe Stock contributor's portfolio in real time: total downloads, top assets, per-asset stats, and CSV export. Search by keyword, contributor ID, or asset ID.",
  path: "/search",
});

// FAQ structured data — surfaces contributor questions directly in Google
// results and AI assistants (same pattern as /how-it-works). Kept in English
// on purpose: Google indexes the server-rendered English page, matching the
// <html lang="en"> markup it crawls.
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
        {/* Localized via the shared i18n dictionary — English in the initial
            HTML (what Google indexes), visitor's language after hydration. */}
        <SearchSeoSection />
      </SearchTool>
    </ToolLayout>
  );
}
