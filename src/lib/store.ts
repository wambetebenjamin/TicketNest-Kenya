// ---------------------------------------------------------------------------
// Persistent key-value store.
//
// Production: Vercel KV / Upstash Redis (KV_REST_API_URL / KV_REST_API_TOKEN
// env vars). Demo/local: a JSON-file backed in-memory store so the whole
// platform runs end-to-end (carts, orders, tickets, availability counters,
// newsletter, check-ins and payouts) with zero external configuration.
//
// Every KV operation is fault-tolerant: if the Redis endpoint is unreachable
// or the credentials are invalid (e.g. a decommissioned Vercel KV store whose
// env vars are still attached to the project), we log a warning and fall back
// to the local store instead of throwing. This keeps `next build` and every
// request resilient to KV outages — the platform simply runs in demo mode.
// ---------------------------------------------------------------------------

import { promises as fs } from "fs";
import path from "path";
import { Redis } from "@upstash/redis";

type MemoryData = Record<string, unknown>;

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

const g = globalThis as unknown as {
  __tnStore?: MemoryData;
  __tnDirty?: boolean;
  __tnKvClient?: Redis | null;
  __tnKvFailed?: boolean;
};

function mem(): MemoryData {
  if (!g.__tnStore) g.__tnStore = {};
  return g.__tnStore;
}

const useVercelKV = () =>
  Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

function getKV(): Redis | null {
  if (!useVercelKV() || g.__tnKvFailed) return null;
  if (g.__tnKvClient === undefined) {
    g.__tnKvClient = new Redis({
      url: process.env.KV_REST_API_URL as string,
      token: process.env.KV_REST_API_TOKEN as string,
    });
  }
  return g.__tnKvClient;
}

/**
 * Run `op` against Redis when configured, transparently degrading to the
 * local file/in-memory store via `fallback` when Redis is unavailable or
 * errors. After the first failure the process stops attempting Redis so a
 * broken endpoint can never stall requests (or the production build).
 */
async function withStore<T>(op: (kv: Redis) => Promise<T>, fallback: () => Promise<T>): Promise<T> {
  const kv = getKV();
  if (kv) {
    try {
      return await op(kv);
    } catch (err) {
      g.__tnKvFailed = true;
      console.warn(
        "[store] KV store unreachable — falling back to local demo store.",
        err instanceof Error ? err.message : err
      );
    }
  }
  return fallback();
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
  return withStore(
    async (kv) => {
      const raw = await kv.get<T>(key);
      if (raw === null || raw === undefined) return null;
      // Tolerate values that were stored double-encoded as JSON strings.
      try {
        return typeof raw === "string" ? (JSON.parse(raw) as T) : (raw as T);
      } catch {
        return raw as unknown as T;
      }
    },
    async () => {
      await loadFile();
      return (mem()[key] as T) ?? null;
    }
  );
}

export async function kvSet(key: string, value: unknown): Promise<void> {
  await withStore(
    async (kv) => {
      await kv.set(key, value as never);
      return null;
    },
    async () => {
      await loadFile();
      mem()[key] = value;
      scheduleFlush();
      return null;
    }
  );
}

export async function kvDel(key: string): Promise<void> {
  await withStore(
    async (kv) => {
      await kv.del(key);
      return null;
    },
    async () => {
      await loadFile();
      delete mem()[key];
      scheduleFlush();
      return null;
    }
  );
}

/** Atomic-ish counter operations used for ticket availability. */
export async function kvIncrBy(key: string, delta: number): Promise<number> {
  return withStore(
    (kv) => kv.incrby(key, delta),
    async () => {
      await loadFile();
      const current = (mem()[key] as number) ?? 0;
      const next = current + delta;
      mem()[key] = next;
      scheduleFlush();
      return next;
    }
  );
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
