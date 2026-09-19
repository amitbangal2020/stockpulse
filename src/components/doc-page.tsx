import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Static, server-rendered content shell for policy/document pages.
 * Everything renders as crawlable HTML — no client JS beyond the site shell.
 */
export function DocPage({
  title,
  intro,
  updated,
  children,
}: {
  title: string;
  intro?: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col lg:overflow-y-auto">
      {/* Sticky page bar — same fixed behaviour as the blog header */}
      <div className="sticky top-[var(--shell-top)] z-20 flex items-center gap-3 border-b border-border bg-bg px-5 py-2.5 lg:top-0">
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-[10px] font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent"
        >
          <ArrowLeft className="h-3 w-3" /> Home
        </Link>
        {updated && (
          <span className="text-[10px] text-text-muted">Last updated: {updated}</span>
        )}
      </div>

      <article className="flex-1 px-5 py-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
            {title}
          </h1>
          {intro && <p className="mt-3 text-base leading-relaxed text-text-secondary">{intro}</p>}

          <div className="mt-8 space-y-8 text-sm leading-relaxed text-text-secondary [&_h2]:font-heading [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-text-primary [&_h2]:mb-3 [&_h2]:mt-8 [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-3 [&_a]:text-accent [&_a]:underline [&_a:hover]:opacity-80">
            {children}
          </div>
        </div>
      </article>
    </div>
  );
}
