import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { verifyRecaptcha } from "@/lib/captcha";
import {
  kvGet,
  kvSet,
  kvListPush,
  STORE_KEYS,
} from "@/lib/store";
import type { EventItem, TicketTier } from "@/types";

/**
 * /api/organiser/events — CRUD for organiser events (protected, organiser role).
 * GET    -> list this organiser's events
 * POST   -> create (reCAPTCHA v3 verified on publish)
 * PATCH  -> update (status/tiers)
 * DELETE -> remove a created event
 */
async function requireOrganiser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: NextResponse.json({ error: "Sign in required" }, { status: 401 }) };
  if ((session.user as { role?: string }).role !== "organiser") {
    return { error: NextResponse.json({ error: "Organiser account required" }, { status: 403 }) };
  }
  return { userId: (session.user as { id?: string }).id ?? "usr_org_demo" };
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export async function GET() {
  const guard = await requireOrganiser();
  if (guard.error) return guard.error;
  const { organiserEvents } = await import("@/lib/events-service");
  const events = await organiserEvents(null); // demo organiser view
  return NextResponse.json({ events });
}

export async function POST(req: NextRequest) {
  const guard = await requireOrganiser();
  if (guard.error) return guard.error;

  const body = (await req.json().catch(() => null)) as {
    event?: Partial<EventItem>;
    publish?: boolean;
    recaptchaToken?: string | null;
  } | null;

  if (!body?.event?.name || !body.event.tiers?.length || !body.event.startAt) {
    return NextResponse.json({ error: "Event name, date and at least one ticket tier are required" }, { status: 400 });
  }

  // reCAPTCHA v3 verified on the publish step
  const captcha = await verifyRecaptcha(body.recaptchaToken ?? undefined);
  if (!captcha.ok) {
    return NextResponse.json(
      { error: "Verification failed. Please complete the challenge.", requireV2: captcha.requireV2 },
      { status: 400 }
    );
  }

  const slug = slugify(body.event.name);
  const existing = await kvGet<EventItem>(`event:${slug}`);
  if (existing) {
    return NextResponse.json({ error: "An event with a similar name already exists" }, { status: 409 });
  }

  const tiers: TicketTier[] = body.event.tiers.slice(0, 6).map((t, i) => ({
    id: t.id || `tier-${i + 1}`,
    name: t.name || `Tier ${i + 1}`,
    priceKES: Number(t.priceKES) || 0,
    quantityTotal: Number(t.quantityTotal) || 0,
    quantityRemaining: Number(t.quantityTotal) || 0,
    saleStart: t.saleStart || new Date().toISOString(),
    saleEnd: t.saleEnd || body.event!.startAt!,
    description: t.description || "",
    transferable: t.transferable ?? true,
  }));

  const organiserName = body.event.organiser?.name || "Independent Organiser";
  const event: EventItem = {
    slug,
    name: body.event.name,
    tagline: body.event.tagline || "",
    category: body.event.category || "music",
    eventType: body.event.eventType || "physical",
    ageRestricted: body.event.ageRestricted ?? false,
    description: body.event.description?.length ? body.event.description : ["Details coming soon."],
    organiser: {
      name: organiserName,
      slug: slugify(organiserName),
      bio: body.event.organiser?.bio || "",
    },
    startAt: body.event.startAt,
    endAt: body.event.endAt || body.event.startAt,
    venue: body.event.venue ?? { name: "TBA", address: "TBA", city: "Nairobi", lat: -1.29, lng: 36.82 },
    onlineLink: body.event.onlineLink,
    lineup: body.event.lineup ?? [],
    tiers,
    poster: body.event.poster || "/images/zip/event-gallery-1.jpg",
    featured: false,
    status: body.publish === false ? "draft" : "live",
    createdAt: new Date().toISOString(),
  };

  await kvSet(`event:${slug}`, event);
  await kvListPush("index:created-events", slug);
  await kvListPush(STORE_KEYS.organiserEvents(guard.userId!), slug);
  return NextResponse.json({ ok: true, event });
}

export async function PATCH(req: NextRequest) {
  const guard = await requireOrganiser();
  if (guard.error) return guard.error;
  const body = (await req.json().catch(() => null)) as {
    slug?: string;
    status?: "draft" | "live" | "ended";
  } | null;
  if (!body?.slug || !body.status) {
    return NextResponse.json({ error: "slug and status required" }, { status: 400 });
  }
  const event = await kvGet<EventItem>(`event:${body.slug}`);
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  event.status = body.status;
  await kvSet(`event:${body.slug}`, event);
  return NextResponse.json({ ok: true, event });
}

export async function DELETE(req: NextRequest) {
  const guard = await requireOrganiser();
  if (guard.error) return guard.error;
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });
  const event = await kvGet<EventItem>(`event:${slug}`);
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  // Cancel rather than hard-delete so existing tickets stay valid
  event.status = "ended";
  await kvSet(`event:${slug}`, event);
  return NextResponse.json({ ok: true, event });
}
