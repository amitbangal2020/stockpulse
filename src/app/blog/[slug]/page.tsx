import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_POSTS, getPostBySlug } from "@/lib/blog-posts";
import { availableLocales } from "@/lib/blog-posts-localized";
import { RenderMarkdown } from "@/components/render-markdown";
import { Calendar, Clock, Tag } from "lucide-react";
import { BlogHeader, BlogKeepReading } from "@/components/blog-chrome";
import { BlogLanguageMenu } from "@/components/blog-language-menu";
import { blogArticleJsonLd, blogPostMetadata } from "@/lib/blog-seo";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";

// Pre-render every post at build time — fully static, crawlable HTML.
export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  // Canonical plus an hreflang entry per translation that exists.
  return blogPostMetadata(DEFAULT_LOCALE, post);
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const articleJsonLd = blogArticleJsonLd(DEFAULT_LOCALE, post);
  const otherPosts = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);
  const translations = availableLocales(post.slug).filter((locale) => locale !== DEFAULT_LOCALE);

  return (
    <div className="flex flex-1 flex-col lg:overflow-y-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* Page Heading — sticky, same fixed behaviour as other pages */}
      <BlogHeader variant="post" />

      {/* Article */}
      <article className="flex-1 px-5 py-8">
        <div className="mx-auto max-w-3xl">
          <header className="mb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 rounded-full border border-accent/20 bg-accent-subtle px-2.5 py-0.5 text-[10px] font-semibold text-accent">
                  <Tag className="h-2.5 w-2.5" />
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              {post.title}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-text-secondary">{post.description}</p>
            <div className="mt-4 flex items-center gap-4 border-b border-border pb-6 text-[11px] text-text-muted">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                {new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                {post.readingTime}
              </span>
            </div>
          </header>

          {translations.length > 0 && (
            <div className="mb-8">
              <BlogLanguageMenu targets={translations} slug={post.slug} />
            </div>
          )}

          <RenderMarkdown source={post.body} />

          {/* More Posts */}
          {otherPosts.length > 0 && (
            <div className="mt-12 border-t border-border pt-8">
              <BlogKeepReading />
              <div className="grid gap-3 sm:grid-cols-2">
                {otherPosts.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/blog/${p.slug}`}
                    className="rounded-xl border border-border bg-surface p-4 transition-all hover:border-accent/40"
                  >
                    <h3 className="text-sm font-semibold text-text-primary">{p.title}</h3>
                    <p className="mt-1 line-clamp-2 text-[11px] text-text-muted">{p.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
