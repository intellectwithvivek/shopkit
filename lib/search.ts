import { categories, categoryLabel, formatPrice, products } from '@/data/products'

/**
 * A flat, deliberately small record for the ⌘K palette.
 *
 * The palette is a client component, so whatever it receives crosses the
 * network. Sending the whole catalog would ship every description, spec table
 * and review to every visitor on every page; this index is built on the server
 * and carries only what a search result actually renders.
 */
export interface SearchEntry {
  /** The palette uses `id` as its identity — here it doubles as the href. */
  id: string
  label: string
  description: string
  group: string
  keywords: string[]
}

export function searchIndex(): SearchEntry[] {
  const productEntries: SearchEntry[] = products.map((p) => ({
    id: `/product/${p.slug}`,
    label: p.name,
    description: `${categoryLabel(p.category)} · ${formatPrice(p.price)} · ${p.colorway}`,
    group: categoryLabel(p.category),
    // Terms a shopper might type that are not in the visible name.
    keywords: [p.category, p.colorway, p.blurb, ...p.specs.map(([, v]) => v)],
  }))

  const pageEntries: SearchEntry[] = [
    {
      id: '/shop',
      label: 'Shop all',
      description: `Browse all ${products.length} products`,
      group: 'Go to',
      keywords: ['catalog', 'browse', 'all', 'filter'],
    },
    ...categories.map((c) => ({
      id: `/shop?category=${c.slug}`,
      label: c.label,
      description: c.blurb,
      group: 'Go to',
      keywords: [c.slug, 'category'],
    })),
    {
      id: '/checkout',
      label: 'Checkout',
      description: 'Review your cart and place a demo order',
      group: 'Go to',
      keywords: ['cart', 'pay', 'basket', 'order'],
    },
    {
      id: '/built-with',
      label: 'Built with VivekUI',
      description: 'Every component on this site, deep-linked to its docs',
      group: 'Go to',
      keywords: ['components', 'credits', 'docs', 'vivekui'],
    },
  ]

  return [...productEntries, ...pageEntries]
}
