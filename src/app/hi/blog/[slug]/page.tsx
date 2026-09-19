import type { Metadata } from "next";
import { BlogPostView } from "@/components/blog-locale-view";
import { localizedPost, localizedPosts } from "@/lib/blog-posts-localized";
import { blogPostMetadata } from "@/lib/blog-seo";

// Pre-render every Hindi post at build time — static, crawlable HTML, exactly
// like the English and Bengali sides.
export function generateStaticParams() {
  return localizedPosts("hi").map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = localizedPost("hi", slug);
  return post ? blogPostMetadata("hi", post) : {};
}

export default async function HindiBlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <BlogPostView locale="hi" slug={slug} />;
}
