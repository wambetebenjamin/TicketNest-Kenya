import { NextRequest, NextResponse } from "next/server";
import { getBlogPosts, getBlogPostContent } from "@/lib/data/blog";

/**
 * GET /api/blog — MDX article handler.
 *   default    -> article metadata list
 *   ?slug=...  -> metadata + raw MDX body
 */
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  const posts = getBlogPosts();

  if (slug) {
    const post = posts.find((p) => p.slug === slug);
    if (!post) return NextResponse.json({ error: "Article not found" }, { status: 404 });
    const content = await getBlogPostContent(slug);
    if (!content) return NextResponse.json({ error: "Article content missing" }, { status: 404 });
    return NextResponse.json({ post, content });
  }

  return NextResponse.json({ posts });
}
