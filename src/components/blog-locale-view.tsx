import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Calendar, Clock, Tag } from "lucide-react";
import { RenderMarkdown } from "@/components/render-markdown";
import { BlogLanguageMenu } from "@/components/blog-language-menu";
import { BLOG_CHROME } from "@/lib/blog-locale-copy";
import { availableLocales, localizedPost, localizedPosts } from "@/lib/blog-posts-localized";
import { formatBengaliDate } from "@/lib/blog-posts-bn";
import { formatHindiDate } from "@/lib/blog-posts-hi";
import { blogArticleJsonLd } from "@/lib/blog-seo";
import { blogPath } from "@/lib/i18n/localized-path";
import type { TranslatedLocale } from "@/lib/i18n/locales";

/**
 * The translated blog pages, shared by every language.
 *
 * Server components with no client hooks: the whole point of a route per
 * language is that the text — chrome included — is in the HTML Google receives.
 * Only `BlogLanguageMenu` runs on the client, because its label follows the
 * visitor's current language.
 */

/** Dates read wrong in a script they don't belong to, so each language formats its own. */
const DATE_FORMATTERS: Record<TranslatedLocale, (iso: string) => string> = {
  bn: formatBengaliDate,
  hi: formatHindiDate,
};

/** Every other language this page exists in — what the pills link to. */
function otherLocales(locale: TranslatedLocale, slug?: string) {
  return availableLocales(slug).filter((other) => other !== locale);
}

function BlogLocaleHeader({ locale }: { locale: TranslatedLocale }) {
  const chrome = BLOG_CHROME[locale];

  return (
    <div className="sticky top-[45px] z-20 flex items-center gap-3 border-b border-border bg-bg px-5 py-2.5 lg:top-0">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
        <BookOpen className="h-4 w-4 text-accent" />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-text-primary">{chrome.title}</h2>
        <p className="text-[11px] text-text-muted">{chrome.subtitle}</p>
      </div>
    </div>
  );
}

function PostCard({ locale, post }: { locale: TranslatedLocale; post: ReturnType<typeof localizedPosts>[number] }) {
  const formatDate = DATE_FORMATTERS[locale];

  return (
    <Link
      href={blogPath(locale, post.slug)}
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
      <h3 className="font-heading text-lg font-bold tracking-tight text-text-primary">{post.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">{post.description}</p>
      <div className="mt-4 flex items-center gap-4 text-[11px] text-text-muted">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3 w-3" />
          {formatDate(post.date)}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-3 w-3" />
          {post.readingTime}
        </span>
      </div>
    </Link>
  );
}

export function BlogIndexView({ locale }: { locale: TranslatedLocale }) {
  const chrome = BLOG_CHROME[locale];
  const posts = localizedPosts(locale);

  return (
    <div className="flex flex-1 flex-col lg:overflow-y-auto">
      <BlogLocaleHeader locale={locale} />

      <div className="flex-1 p-5">
        <div className="mx-auto max-w-3xl space-y-4">
          <BlogLanguageMenu targets={otherLocales(locale)} />

          {posts.map((post) => (
            <PostCard key={post.slug} locale={locale} post={post} />
          ))}

          {posts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
                <BookOpen className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-text-primary">{chrome.comingSoon}</h3>
              <p className="mt-1.5 max-w-sm text-sm text-text-muted">{chrome.comingSoonBody}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function BlogPostView({ locale, slug }: { locale: TranslatedLocale; slug: string }) {
  const post = localizedPost(locale, slug);
  if (!post) notFound();

  const chrome = BLOG_CHROME[locale];
  const formatDate = DATE_FORMATTERS[locale];
  const otherPosts = localizedPosts(locale).filter((other) => other.slug !== post.slug).slice(0, 3);

  return (
    <div className="flex flex-1 flex-col lg:overflow-y-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogArticleJsonLd(locale, post)) }}
      />

      <div className="sticky top-[45px] z-20 flex items-center gap-3 border-b border-border bg-bg px-5 py-2.5 lg:top-0">
        <Link
          href={blogPath(locale)}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-[10px] font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent"
        >
          <ArrowLeft className="h-3 w-3" /> {chrome.backToAll}
        </Link>
      </div>

      <article className="flex-1 px-5 py-8">
        <div className="mx-auto max-w-3xl">
          <header className="mb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 rounded-full border border-accent/20 bg-accent-subtle px-2.5 py-0.5 text-[10px] font-semibold text-accent"
                >
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
                {formatDate(post.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                {post.readingTime}
              </span>
            </div>
          </header>

          {/* In the article flow rather than the sticky bar: the tool column is
              `lg:overflow-hidden`, which would clip a dropdown opened up there. */}
          {otherLocales(locale, post.slug).length > 0 && (
            <div className="mb-8">
              <BlogLanguageMenu targets={otherLocales(locale, post.slug)} slug={post.slug} />
            </div>
          )}

          <RenderMarkdown source={post.body} />

          {otherPosts.length > 0 && (
            <div className="mt-12 border-t border-border pt-8">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-text-muted">
                {chrome.keepReading}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {otherPosts.map((other) => (
                  <Link
                    key={other.slug}
                    href={blogPath(locale, other.slug)}
                    className="rounded-xl border border-border bg-surface p-4 transition-all hover:border-accent/40"
                  >
                    <h3 className="text-sm font-semibold text-text-primary">{other.title}</h3>
                    <p className="mt-1 line-clamp-2 text-[11px] text-text-muted">{other.description}</p>
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
