"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartLine } from "@/types";

/**
 * Client cart. Mirrors to /api/cart (Vercel KV session when configured)
 * and persists to localStorage for offline resilience.
 */

const LOCAL_KEY = "tn_cart_v1";
const SESSION_COOKIE = "tn_cart_session";

interface CartContextValue {
  lines: CartLine[];
  count: number;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (tierId: string, eventSlug: string, quantity: number) => void;
  remove: (tierId: string, eventSlug: string) => void;
  clear: () => void;
  ready: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  let sid = localStorage.getItem(SESSION_COOKIE);
  if (!sid) {
    sid = `sid_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    localStorage.setItem(SESSION_COOKIE, sid);
  }
  return sid;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  // Mirror to server session cart (KV)
  const sync = useCallback((next: CartLine[]) => {
    try {
      fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: getSessionId(), lines: next }),
      }).catch(() => undefined);
    } catch {
      /* non-fatal */
    }
  }, []);

  const persist = useCallback(
    (next: CartLine[]) => {
      setLines(next);
      try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      sync(next);
    },
    [sync]
  );

  const add = useCallback(
    (line: Omit<CartLine, "quantity">, quantity = 1) => {
      setLines((prev) => {
        const idx = prev.findIndex(
          (l) => l.tierId === line.tierId && l.eventSlug === line.eventSlug
        );
        let next: CartLine[];
        if (idx >= 0) {
          next = prev.map((l, i) =>
            i === idx ? { ...l, quantity: Math.min(10, l.quantity + quantity) } : l
          );
        } else {
          next = [...prev, { ...line, quantity }];
        }
        try {
          localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        sync(next);
        return next;
      });
    },
    [sync]
  );

  const setQuantity = useCallback(
    (tierId: string, eventSlug: string, quantity: number) => {
      persist(
        lines
          .map((l) =>
            l.tierId === tierId && l.eventSlug === eventSlug
              ? { ...l, quantity: Math.max(0, Math.min(10, quantity)) }
              : l
          )
          .filter((l) => l.quantity > 0)
      );
    },
    [lines, persist]
  );

  const remove = useCallback(
    (tierId: string, eventSlug: string) => {
      persist(lines.filter((l) => !(l.tierId === tierId && l.eventSlug === eventSlug)));
    },
    [lines, persist]
  );

  const clear = useCallback(() => persist([]), [persist]);

  const value = useMemo(
    () => ({
      lines,
      count: lines.reduce((s, l) => s + l.quantity, 0),
      add,
      setQuantity,
      remove,
      clear,
      ready,
    }),
    [lines, add, setQuantity, remove, clear, ready]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
