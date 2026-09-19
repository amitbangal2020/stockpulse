import type { Metadata } from "next";
import Link from "next/link";
import { BLOG_POSTS_BN, formatBengaliDate } from "@/lib/blog-posts-bn";
import { BlogEmptyStateBn, BlogHeaderBn } from "@/components/blog-bn";
import { Calendar, Clock } from "lucide-react";

const SITE_URL = "https://www.abanti.in";

const title = "ব্লগ — মাইক্রোস্টক টিপস, AI ওয়ার্কফ্লো ও কীওয়ার্ড রিসার্চ";
const description =
  "মাইক্রোস্টক সেলারদের জন্য বাংলা গাইড: Adobe Stock কীওয়ার্ড স্ট্র্যাটেজি, AI মেটাডেটা ওয়ার্কফ্লো, সিজনাল আপলোড টাইমিং আর AI কনটেন্টের নিয়ম।";

// Self-canonical (never the English URL) plus the hreflang pair — this is what
// tells Google the two pages are translations, not duplicates.
export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: `${SITE_URL}/bn/blog`,
    languages: {
      en: `${SITE_URL}/blog`,
      bn: `${SITE_URL}/bn/blog`,
      "x-default": `${SITE_URL}/blog`,
    },
  },
  openGraph: {
    title,
    description,
    url: `${SITE_URL}/bn/blog`,
    siteName: "StockPulse",
    type: "website",
    locale: "bn_IN",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "StockPulse বাংলা ব্লগ" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.png"],
  },
};

export default function BengaliBlogIndexPage() {
  return (
    <div className="flex flex-1 flex-col lg:overflow-y-auto">
      <BlogHeaderBn />

      <div className="flex-1 p-5">
        <div className="mx-auto max-w-3xl space-y-4">
          {BLOG_POSTS_BN.map((post) => (
            <Link
              key={post.slug}
              href={`/bn/blog/${post.slug}`}
              className="block rounded-2xl border border-border bg-surface p-6 transition-all hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5"
            >
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-accent/20 bg-accent-subtle px-2.5 py-0.5 text-[10px] font-semibold text-accent"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h3 className="font-heading text-lg font-bold tracking-tight text-text-primary">
                {post.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{post.description}</p>
              <div className="mt-4 flex items-center gap-4 text-[11px] text-text-muted">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  {formatBengaliDate(post.date)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  {post.readingTime}
                </span>
              </div>
            </Link>
          ))}

          {BLOG_POSTS_BN.length === 0 && <BlogEmptyStateBn />}
        </div>
      </div>
    </div>
  );
}
