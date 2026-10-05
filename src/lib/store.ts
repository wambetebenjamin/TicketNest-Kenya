// ---------------------------------------------------------------------------
// Persistent key-value store.
//
// Production: Vercel KV (KV_REST_API_URL / KV_REST_API_TOKEN env vars).
// Demo/local: a JSON-file backed in-memory store so the whole platform runs
// end-to-end (carts, orders, tickets, availability counters, newsletter,
// check-ins and payouts) with zero external configuration.
// ---------------------------------------------------------------------------

import { promises as fs } from "fs";
import path from "path";

type MemoryData = Record<string, unknown>;

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

const g = globalThis as unknown as { __tnStore?: MemoryData; __tnDirty?: boolean };

function mem(): MemoryData {
  if (!g.__tnStore) g.__tnStore = {};
  return g.__tnStore;
}

const useVercelKV = () =>
  Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

let kvClient: { get: (k: string) => Promise<string | null>; set: (k: string, v: string) => Promise<unknown>; del: (k: string) => Promise<unknown> } | null = null;

async function getKV() {
  if (!useVercelKV()) return null;
  if (!kvClient) {
    const mod = await import("@vercel/kv");
    const client = (mod as unknown as { kv: unknown }).kv ?? mod;
    kvClient = client as unknown as typeof kvClient;
  }
  return kvClient;
}

async function loadFile(): Promise<void> {
  if (g.__tnStore !== undefined) return;
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    g.__tnStore = JSON.parse(raw);
  } catch {
    g.__tnStore = {};
  }
}

let flushTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(async () => {
    flushTimer = null;
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(DATA_FILE, JSON.stringify(mem()), "utf8");
    } catch {
      // non-fatal: in read-only environments we simply stay in memory
    }
  }, 150);
}

export async function kvGet<T>(key: string): Promise<T | null> {
  const kv = await getKV();
  if (kv) {
    const raw = await kv.get(key);
    if (raw === null || raw === undefined) return null;
    try {
      return typeof raw === "string" ? (JSON.parse(raw) as T) : (raw as T);
    } catch {
      return raw as unknown as T;
    }
  }
  await loadFile();
  return (mem()[key] as T) ?? null;
}

export async function kvSet(key: string, value: unknown): Promise<void> {
  const kv = await getKV();
  if (kv) {
    await kv.set(key, JSON.stringify(value));
    return;
  }
  await loadFile();
  mem()[key] = value;
  scheduleFlush();
}

export async function kvDel(key: string): Promise<void> {
  const kv = await getKV();
  if (kv) {
    await kv.del(key);
    return;
  }
  await loadFile();
  delete mem()[key];
  scheduleFlush();
}

/** Atomic-ish counter operations used for ticket availability. */
export async function kvIncrBy(key: string, delta: number): Promise<number> {
  const kv = await getKV();
  if (kv) {
    // Vercel KV (Upstash REST) supports incrby; fall back to get/set.
    try {
      const url = `${process.env.KV_REST_API_URL}/incrby/${encodeURIComponent(key)}/${delta}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });
      const body = (await res.json()) as { result: number };
      return body.result;
    } catch {
      // fall through to get/set
    }
  }
  await loadFile();
  const current = (mem()[key] as number) ?? 0;
  const next = current + delta;
  mem()[key] = next;
  scheduleFlush();
  return next;
}

/** List helpers (secondary index pattern: key -> array of ids). */
export async function kvListPush(key: string, id: string): Promise<void> {
  const list = (await kvGet<string[]>(key)) ?? [];
  if (!list.includes(id)) list.push(id);
  await kvSet(key, list);
}

export async function kvListRemove(key: string, id: string): Promise<void> {
  const list = (await kvGet<string[]>(key)) ?? [];
  await kvSet(
    key,
    list.filter((x) => x !== id)
  );
}

export async function kvListAll<T>(key: string, collectionPrefix: string): Promise<T[]> {
  const ids = (await kvGet<string[]>(key)) ?? [];
  const items: unknown[] = await Promise.all(
    ids.map((id) => kvGet<T>(`${collectionPrefix}${id}`))
  );
  return items.filter((x) => x !== null) as T[];
}

export const STORE_KEYS = {
  order: (id: string) => `order:${id}`,
  orderIndex: () => "index:orders",
  ordersByEmail: (email: string) => `orders:email:${email.toLowerCase()}`,
  ordersByEvent: (slug: string) => `orders:event:${slug}`,
  ticket: (id: string) => `ticket:${id}`,
  ticketIndex: () => "index:tickets",
  ticketsByEmail: (email: string) => `tickets:email:${email.toLowerCase()}`,
  user: (id: string) => `user:${id}`,
  userByEmail: (email: string) => `user:email:${email.toLowerCase()}`,
  userIndex: () => "index:users",
  cart: (sessionId: string) => `cart:${sessionId}`,
  availability: (eventSlug: string, tierId: string) => `avail:${eventSlug}:${tierId}`,
  newsletter: () => "newsletter",
  payout: (id: string) => `payout:${id}`,
  payoutIndex: (organiserId: string) => `payouts:${organiserId}`,
  enquiry: (id: string) => `enquiry:${id}`,
  enquiryIndex: () => "index:enquiries",
  organiserEvents: (organiserId: string) => `organiser-events:${organiserId}`,
  upload: (name: string) => `upload:${name}`,
};
