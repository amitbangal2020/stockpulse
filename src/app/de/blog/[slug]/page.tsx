import type { Metadata } from "next";
import { BlogPostView } from "@/components/blog-locale-view";
import { localizedPost, localizedPosts } from "@/lib/blog-posts-localized";
import { blogPostMetadata } from "@/lib/blog-seo";

// Pre-render every German post at build time — static, crawlable HTML, exactly
// like the English, Bengali and Hindi sides. Empty until the first translated
// article lands in blog-posts-de.ts.
export function generateStaticParams() {
  return localizedPosts("de").map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = localizedPost("de", slug);
  return post ? blogPostMetadata("de", post) : {};
}

export default async function GermanBlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <BlogPostView locale="de" slug={slug} />;
}
