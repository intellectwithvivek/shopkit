'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { getProduct, products, type Product } from '@/data/products'

/**
 * Only the slug and the quantity are persisted. Prices, names and images are
 * always resolved from the catalog at read time, so a price change in
 * `/data/products.ts` can never be shadowed by a stale copy in localStorage.
 */
interface StoredLine {
  slug: string
  qty: number
}

export interface CartLine extends StoredLine {
  product: Product
  lineTotal: number
}

interface CartValue {
  lines: CartLine[]
  /** Total units, which is what the navbar badge shows. */
  count: number
  subtotal: number
  /** False until hydration has finished — the badge waits for it. */
  ready: boolean
  add: (slug: string, qty?: number) => void
  setQty: (slug: string, qty: number) => void
  remove: (slug: string) => void
  clear: () => void
  /** The cart Drawer's open state lives here so the Navbar button can flip it. */
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const STORAGE_KEY = 'shopkit-cart-v1'
const MAX_QTY = 10

/* -------------------------------------------------------------------------- */
/*  The cart as an external store                                             */
/* -------------------------------------------------------------------------- */

/*
  localStorage is an external store, so it is read through `useSyncExternalStore`
  rather than copied into state inside an effect.

  Three things fall out of that, all of which the effect version had to hand-roll:
    · Hydration safety — `getServerSnapshot` returns the same empty cart the
      server rendered, and React swaps in the real value after hydrating.
    · No cascading render on mount, and no `setState` inside an effect.
    · Cross-tab sync for free, because the `storage` event is part of `subscribe`.
*/

const EMPTY: StoredLine[] = []

/** Cached parse, so `getSnapshot` returns a stable reference between reads. */
let cachedRaw: string | null = null
let cachedLines: StoredLine[] = EMPTY

const listeners = new Set<() => void>()

/** Drops anything that is not a live slug, so a renamed product cannot break a cart. */
function parse(raw: string | null): StoredLine[] {
  if (!raw) return EMPTY
  try {
    const data: unknown = JSON.parse(raw)
    if (!Array.isArray(data)) return EMPTY
    const known = new Set(products.map((p) => p.slug))
    const lines = data
      .filter(
        (l): l is StoredLine =>
          typeof l === 'object' &&
          l !== null &&
          typeof (l as StoredLine).slug === 'string' &&
          Number.isFinite((l as StoredLine).qty) &&
          known.has((l as StoredLine).slug),
      )
      .map((l) => ({ slug: l.slug, qty: Math.min(MAX_QTY, Math.max(1, Math.round(l.qty))) }))
    return lines.length > 0 ? lines : EMPTY
  } catch {
    // Corrupt or foreign payload — start empty rather than throwing on load.
    return EMPTY
  }
}

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY)
  } catch {
    // Storage blocked (private window, blocked cookies) — run in memory.
    return null
  }
}

function getSnapshot(): StoredLine[] {
  const raw = readRaw()
  if (raw !== cachedRaw) {
    cachedRaw = raw
    cachedLines = parse(raw)
  }
  return cachedLines
}

/** The server has no cart, so it renders an empty one — and so does hydration. */
function getServerSnapshot(): StoredLine[] {
  return EMPTY
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange)
  // Fires when ANOTHER tab writes, which is what keeps two open tabs in step.
  window.addEventListener('storage', onChange)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener('storage', onChange)
  }
}

function commit(next: StoredLine[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Over quota or blocked: fall back to the in-memory cache for this session.
  }
  cachedRaw = JSON.stringify(next)
  cachedLines = next
  for (const listener of listeners) listener()
}

/** `false` on the server and during hydration, `true` afterwards — no effect needed. */
const alwaysTrue = () => true
const alwaysFalse = () => false
const noopSubscribe = () => () => {}

/* -------------------------------------------------------------------------- */

const CartContext = createContext<CartValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const stored = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const ready = useSyncExternalStore(noopSubscribe, alwaysTrue, alwaysFalse)
  const [isOpen, setIsOpen] = useState(false)

  const add = useCallback((slug: string, qty = 1) => {
    const current = getSnapshot()
    const existing = current.find((l) => l.slug === slug)
    commit(
      existing
        ? current.map((l) =>
            l.slug === slug ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty) } : l,
          )
        : [...current, { slug, qty: Math.min(MAX_QTY, qty) }],
    )
  }, [])

  const setQty = useCallback((slug: string, qty: number) => {
    const current = getSnapshot()
    commit(
      qty <= 0
        ? current.filter((l) => l.slug !== slug)
        : current.map((l) => (l.slug === slug ? { ...l, qty: Math.min(MAX_QTY, qty) } : l)),
    )
  }, [])

  const remove = useCallback((slug: string) => {
    commit(getSnapshot().filter((l) => l.slug !== slug))
  }, [])

  const clear = useCallback(() => commit(EMPTY), [])
  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  const value = useMemo<CartValue>(() => {
    const lines = stored.flatMap<CartLine>((line) => {
      const product = getProduct(line.slug)
      if (!product) return []
      return [{ ...line, product, lineTotal: product.price * line.qty }]
    })
    return {
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: lines.reduce((n, l) => n + l.lineTotal, 0),
      ready,
      add,
      setQty,
      remove,
      clear,
      isOpen,
      openCart,
      closeCart,
    }
  }, [stored, ready, add, setQty, remove, clear, isOpen, openCart, closeCart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
