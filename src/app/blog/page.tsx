import Link from "next/link";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { BLOG_POSTS_BN } from "@/lib/blog-posts-bn";
import { Calendar, Clock } from "lucide-react";
import { BlogEmptyState, BlogHeader } from "@/components/blog-chrome";
import { BengaliPostLink } from "@/components/bengali-post-link";

export default function BlogIndexPage() {
  return (
    <div className="flex flex-1 flex-col lg:overflow-y-auto">
      {/* Page Heading — sticky, same fixed behaviour as other pages */}
      <BlogHeader />

      {/* Posts */}
      <div className="flex-1 p-5">
        <div className="mx-auto max-w-3xl space-y-4">
          {BLOG_POSTS_BN.length > 0 && <BengaliPostLink />}

          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block rounded-2xl border border-border bg-surface p-6 transition-all hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5"
            >
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-accent/20 bg-accent-subtle px-2.5 py-0.5 text-[10px] font-semibold text-accent">
                    {tag}
                  </span>
                ))}
              </div>
              <h3 className="font-heading text-lg font-bold tracking-tight text-text-primary transition-colors group-hover:text-accent">
                {post.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{post.description}</p>
              <div className="mt-4 flex items-center gap-4 text-[11px] text-text-muted">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  {new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  {post.readingTime}
                </span>
              </div>
            </Link>
          ))}

          {BLOG_POSTS.length === 0 && <BlogEmptyState />}
        </div>
      </div>
    </div>
  );
}
