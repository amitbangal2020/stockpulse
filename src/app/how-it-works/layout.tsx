import type { Metadata } from "next";
import type { ReactNode } from "react";
import { seoMetadata } from "@/lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "How StockPulse Works — AI Metadata for Microstock",
  description:
    "Learn how StockPulse generates stock-optimized titles, keywords and descriptions, and how to track your portfolio.",
  path: "/how-it-works",
});

// FAQ structured data so search engines and AI assistants can surface
// these questions directly from the How It Works guide.
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is StockPulse?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "StockPulse is a free browser-based toolkit for microstock sellers with 22 tools covering AI metadata generation, Adobe Stock tracking and analytics, keyword research, and creative utilities like SVG to Video, Dither Studio and Halftone Studio.",
      },
    },
    {
      "@type": "Question",
      name: "Which microstock platforms does StockPulse support?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The metadata generator and title optimizer support Adobe Stock, Shutterstock, Freepik, Vecteezy, iStock and Pond5 — each with its own platform-specific CSV export format.",
      },
    },
    {
      "@type": "Question",
      name: "How does the AI metadata generator work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Upload images, videos or vector files, pick your target platforms, and the AI writes an optimized title, description and up to 45 keywords for each file. Every result gets a quality score and exports as a platform-ready CSV file.",
      },
    },
    {
      "@type": "Question",
      name: "Which AI providers can I use with the metadata generator?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can connect OpenAI (GPT-4o), Google Gemini, Anthropic Claude, Grok, Mistral and OpenRouter using your own API keys. Multiple keys per provider are supported with automatic round-robin rotation.",
      },
    },
    {
      "@type": "Question",
      name: "Can I track any Adobe Stock contributor's downloads?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Enter any contributor ID to scan up to 300 assets of their portfolio with live download counts, or enter an asset ID to see the exact download count for a single file. Results can be filtered by AI content and media type, and exported to CSV.",
      },
    },
    {
      "@type": "Question",
      name: "Is StockPulse free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, all 22 tools are free. The metadata generator uses your own AI provider API keys, so you stay in control of usage and costs.",
      },
    },
    {
      "@type": "Question",
      name: "Do my files get uploaded to a server?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Creative tools like SVG to EPS, Dither Studio, Halftone Studio and the Color Palette extractor run entirely in your browser — your files never leave your machine.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need to install anything to use StockPulse?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No installation is needed. StockPulse runs entirely in your web browser on abanti.in — just open a tool and start working.",
      },
    },
  ],
};

export default function HowItWorksLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  );
}
