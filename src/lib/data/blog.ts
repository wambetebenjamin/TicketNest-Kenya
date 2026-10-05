import { promises as fs } from "fs";
import path from "path";

// ---------------------------------------------------------------------------
// MDX-powered blog. Articles live in src/content/blog/*.mdx with frontmatter.
// ---------------------------------------------------------------------------

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  cover: string;
  author: string;
  publishedAt: string;
  readMinutes: number;
}

function parseFrontmatter(raw: string): { data: Record<string, string>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };
  const [, fm, content] = match;
  const data: Record<string, string> = {};
  fm.split(/\r?\n/).forEach((line) => {
    const idx = line.indexOf(":");
    if (idx > 0) data[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  });
  return { data, content };
}

export function getBlogPosts(): BlogPost[] {
  // Synchronous metadata access for listing pages (build-time safe).
  return [
    {
      slug: "plan-your-first-nairobi-event",
      title: "How to Plan Your First Event in Nairobi: A Complete Checklist",
      excerpt:
        "From venue scouting and county permits to M-Pesa ticketing and door control, everything first-time Nairobi organisers need to know.",
      category: "Event Planning",
      cover: "/images/zip/event-gallery-2.jpg",
      author: "Wanjiku Mwangi",
      publishedAt: "2026-09-12",
      readMinutes: 8,
    },
    {
      slug: "gengetone-ticketing-guide",
      title: "Selling Tickets for Gengetone Shows: What Actually Works",
      excerpt:
        "Early bird tiers, WhatsApp share loops and STK push checkout. A data-backed guide to selling out Kenyan urban music events.",
      category: "Ticketing Guides",
      cover: "/images/zip/event-gallery-5.jpg",
      author: "Brian Otieno",
      publishedAt: "2026-09-28",
      readMinutes: 6,
    },
    {
      slug: "koroga-weekend-recap",
      title: "Recap: The Weekend East Africa Danced To",
      excerpt:
        "Three cities, five headline acts, 22,000 scanned QR codes. A look back at the biggest TicketNest weekend so far.",
      category: "Post-Event Recaps",
      cover: "/images/zip/event-gallery-3.jpg",
      author: "Achieng Odera",
      publishedAt: "2026-10-02",
      readMinutes: 5,
    },
  ];
}

export async function getBlogPostContent(slug: string): Promise<string | null> {
  try {
    const safe = slug.replace(/[^a-z0-9-]/gi, "");
    const raw = await fs.readFile(
      path.join(process.cwd(), "src/content/blog", `${safe}.mdx`),
      "utf8"
    );
    const { content } = parseFrontmatter(raw);
    return content;
  } catch {
    return null;
  }
}
