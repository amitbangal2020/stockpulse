import type { Metadata } from "next";
import { DocPage } from "@/components/doc-page";
import { seoMetadata } from "@/lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Privacy Policy",
  description:
    "How StockPulse (abanti.in) handles data: no accounts, no server-side storage — your files, API keys and watchlists stay in your browser.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <DocPage
      title="Privacy Policy"
      intro="StockPulse is built to work without collecting your data. This page explains exactly what happens to anything you enter or upload while using the tools."
      updated="September 20, 2026"
    >
      <h2>1. The short version</h2>
      <p>
        We do not require accounts, we do not run a user database, and we do not store your files,
        API keys, portfolios or watchlists on our servers. Almost everything you do in StockPulse
        lives in your own browser (localStorage) and never leaves your device.
      </p>

      <h2>2. What is stored in your browser</h2>
      <p>
        The following data is saved in your browser&apos;s localStorage so the tools can remember
        your work between visits. It is never transmitted to us:
      </p>
      <ul>
        <li>AI provider API keys you add in MetaGen (stored only to call your chosen provider)</li>
        <li>Generated titles, keywords and descriptions</li>
        <li>Tracked assets, download history and watchlist entries</li>
        <li>Theme, language and tool preferences</li>
      </ul>
      <p>
        Clearing your browser data or using the settings panel removes all of it permanently. We
        cannot recover it because we never had a copy.
      </p>

      <h2>3. Files you upload</h2>
      <p>
        Creative tools (Dither Studio, Halftone Studio, SVG to EPS, SVG to Video, Color Palette,
        Mockup Generator, ASCII Vision and others) process files entirely in your browser — those
        files are never uploaded anywhere.
      </p>
      <p>
        In MetaGen, when you generate metadata with an AI provider, the image, video or text you
        submit is sent <strong>directly from your browser to the AI provider you selected</strong>
        (OpenAI, Google Gemini, Anthropic, xAI, Mistral or OpenRouter), using your own API key. The
        request does not pass through or get stored on our servers. What happens to it afterwards is
        governed by that provider&apos;s privacy policy.
      </p>

      <h2>4. Third-party services</h2>
      <ul>
        <li>
          <strong>AI providers</strong> — receive your submissions and API key when you generate
          metadata (see section 3).
        </li>
        <li>
          <strong>Adobe Stock</strong> — public asset/download information you look up with the
          Tracker tools is fetched on the fly; we do not keep it.
        </li>
        <li>
          <strong>Vercel Analytics</strong> — collects anonymous, aggregated page-view metrics
          (no cookies, no personal profiles).
        </li>
        <li>
          <strong>Google Analytics 4</strong> — only loads if enabled, and respects the self-exclusion
          described below.
        </li>
        <li>
          <strong>Advertising</strong> — if ads are shown, Google and its partners may use cookies to
          serve ads based on your visits to this and other sites. You can opt out of personalized
          advertising at https://www.google.com/settings/ads.
        </li>
      </ul>

      <h2>5. Analytics opt-out</h2>
      <p>
        Visit https://www.abanti.in/#no-analytics once in any browser and that browser stops
        reporting analytics from then on. The preference is stored locally.
      </p>

      <h2>6. Cookies</h2>
      <p>
        StockPulse itself sets no tracking cookies. Any cookies you see come from the third-party
        services above (analytics or advertising) and are covered by their policies.
      </p>

      <h2>7. Children&apos;s privacy</h2>
      <p>
        StockPulse is a professional tool and is not directed at children under 13. We do not
        knowingly collect personal information from anyone, including children.
      </p>

      <h2>8. Your rights (GDPR / CCPA)</h2>
      <p>
        Because we do not store personal data server-side, there is generally nothing for us to
        export or delete — you already control all of your data in your browser. If you believe we
        hold personal data about you anyway, reach out through the site and we will respond within
        30 days.
      </p>

      <h2>9. Changes to this policy</h2>
      <p>
        If this policy changes, the updated date at the top of this page will change with it.
        Material changes will be highlighted on the homepage for a reasonable period.
      </p>
    </DocPage>
  );
}
