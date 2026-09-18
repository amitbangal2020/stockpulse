import Link from "next/link";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { Calendar, Clock, Tag, BookOpen } from "lucide-react";

export default function BlogIndexPage() {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      {/* Page Heading — same as other pages */}
      <div className="flex items-center gap-3 border-b border-border bg-bg px-5 py-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
          <BookOpen className="h-4 w-4 text-accent" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text-primary">Blog</h2>
          <p className="text-[11px] text-text-muted">Microstock tips, AI workflows & keyword strategy</p>
        </div>
      </div>

      {/* Posts */}
      <div className="flex-1 p-5">
        <div className="mx-auto max-w-3xl space-y-4">
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

          {BLOG_POSTS.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
                <Tag className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-text-primary">Coming Soon</h3>
              <p className="mt-1.5 max-w-sm text-sm text-text-muted">
                Guides on AI metadata, keyword research and microstock strategy are on the way.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
