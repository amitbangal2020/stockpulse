import type { Metadata } from "next";
import { DocPage } from "@/components/doc-page";
import { seoMetadata } from "@/lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Terms of Service",
  description:
    "Terms for using StockPulse (abanti.in): free tools provided as-is, your responsibility for AI keys, uploaded content and compliance with stock platform rules.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <DocPage
      title="Terms of Service"
      intro="These terms govern your use of StockPulse at abanti.in. By using the site you agree to them."
      updated="September 20, 2026"
    >
      <h2>1. The service</h2>
      <p>
        StockPulse is a free, browser-based toolkit for microstock sellers: AI metadata generation,
        Adobe Stock tracking and analytics, keyword research, and creative utilities. It is provided
        as-is, with no guarantee of availability, accuracy or fitness for a particular purpose.
      </p>

      <h2>2. Acceptable use</h2>
      <ul>
        <li>Do not use the tools to infringe intellectual property or platform rules.</li>
        <li>Do not attempt to disrupt, overload or reverse-engineer the service or its APIs.</li>
        <li>Do not resell the site or misrepresent it as your own product.</li>
        <li>You are responsible for how you use generated metadata and for the content you upload to stock platforms.</li>
      </ul>

      <h2>3. AI usage and your API keys</h2>
      <p>
        MetaGen calls AI providers (OpenAI, Google Gemini, Anthropic, xAI, Mistral, OpenRouter)
        using <strong>your own API keys</strong>, sent directly from your browser to the provider.
        You are responsible for those keys, for the usage and costs they incur, and for complying
        with each provider&apos;s terms. Never paste a key you do not own.
      </p>

      <h2>4. No warranty</h2>
      <p>
        The service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of
        any kind, express or implied. Asset statistics, keyword analyses and trend predictions are
        informational estimates and must not be treated as financial or business advice. We do not
        warrant that results are accurate, complete or that uploads to stock platforms will be
        accepted or perform well.
      </p>

      <h2>5. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, StockPulse and its operator are not liable for any
        indirect, incidental or consequential damages, lost profits, lost data or account actions
        taken by third-party platforms (such as stock sites rejecting your uploads) arising from
        your use of the service.
      </p>

      <h2>6. Your content</h2>
      <p>
        You keep all rights to files you process with the tools. We receive no license to them
        because, with the exception of AI-provider calls you initiate, your content never reaches
        our servers.
      </p>

      <h2>7. Changes and termination</h2>
      <p>
        We may change, suspend or discontinue any part of the service at any time, and may update
        these terms; continued use after an update means you accept the revised terms. You can stop
        using the service at any time — there is no account to cancel.
      </p>

      <h2>8. Contact</h2>
      <p>
        Questions about these terms? Reach out through the site — a contact form is coming soon.
      </p>
    </DocPage>
  );
}
