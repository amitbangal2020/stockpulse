import type { Metadata } from "next";
import Link from "next/link";
import { DocPage } from "@/components/doc-page";
import { seoMetadata } from "@/lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "About StockPulse — Free AI Toolkit for Microstock Sellers",
  description:
    "StockPulse is a free, privacy-first toolkit of 24 browser tools for microstock sellers: AI metadata generation, Adobe Stock tracking, keyword research and creative utilities.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <DocPage
      title="About StockPulse"
      intro="A free, privacy-first toolkit for microstock sellers — built to keep your files, keys and data on your own machine."
    >
      <h2>What is StockPulse?</h2>
      <p>
        StockPulse (abanti.in) bundles 24 browser-based tools for people who sell on Adobe Stock,
        Shutterstock, Freepik, Vecteezy, iStock and Pond5: an AI metadata generator, live download
        tracking and portfolio analytics, keyword research, and a set of creative utilities for
        preparing assets.
      </p>

      <h2>How it works</h2>
      <ul>
        <li>
          <strong>MetaGen</strong> — upload images, videos or vectors; the AI writes platform-optimized
          titles, keywords and descriptions, then exports a ready-to-upload CSV. You bring your own AI
          provider key, and requests go straight from your browser to the provider.
        </li>
        <li>
          <strong>Tracker &amp; Analytics</strong> — look up any Adobe Stock asset or contributor and see
          live download counts, trends and comparisons.
        </li>
        <li>
          <strong>Creative tools</strong> — Dither Studio, Halftone Studio, SVG to Video/EPS, Color
          Palette, Mockup Generator and more run 100% in your browser.
        </li>
      </ul>

      <h2>Privacy by design</h2>
      <p>
        There are no accounts and no server-side storage: your API keys, watchlists, tracking history
        and preferences live in your browser&apos;s localStorage. Files processed by the creative tools
        never leave your device. See the <Link href="/privacy">Privacy Policy</Link> for the details.
      </p>

      <h2>Pricing</h2>
      <p>
        Every tool is free. The AI metadata generator runs on your own API keys, so there are no
        subscription fees and no per-image charges from us.
      </p>

      <h2>Get in touch</h2>
      <p>
        Found a bug, want a feature, or have a question? More ways to reach us are coming soon —
        feedback is always welcome.
      </p>
    </DocPage>
  );
}
