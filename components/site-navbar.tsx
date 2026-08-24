'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import {
  Badge,
  Button,
  CommandPalette,
  IconButton,
  Kbd,
  Navbar,
  ThemeToggle,
  type CommandPaletteEntry,
} from '@the_viveksingh/vivek-ui'
import { categories } from '@/data/products'
import { utm, vivekUI } from '@/lib/site'
import type { SearchEntry } from '@/lib/search'
import { useCart } from './cart/cart-provider'
import { BagIcon, SearchIcon } from './icons'

/**
 * The site header: category links, ⌘K search over the whole catalog, the cart
 * button with its count, and the theme switch.
 */
export function SiteNavbar({ entries }: { entries: SearchEntry[] }) {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const { count, ready, openCart } = useCart()
  const router = useRouter()
  const pathname = usePathname()

  /** Group the flat index into the palette's titled runs, preserving order. */
  const items = useMemo<CommandPaletteEntry[]>(() => {
    const groups = new Map<string, SearchEntry[]>()
    for (const entry of entries) {
      const bucket = groups.get(entry.group)
      if (bucket) bucket.push(entry)
      else groups.set(entry.group, [entry])
    }
    return [...groups].map(([heading, group]) => ({
      heading,
      items: group.map((e) => ({
        id: e.id,
        label: e.label,
        description: e.description,
        keywords: e.keywords,
      })),
    }))
  }, [entries])

  return (
    <>
      <Navbar sticky container="xl">
        <Navbar.Brand asChild>
          <Link href="/" aria-label="ShopKit — home">
            <span className="sk-brand">
              Shop<span className="sk-brand__mark">Kit</span>
            </span>
          </Link>
        </Navbar.Brand>

        <Navbar.Links>
          <Navbar.Link asChild active={pathname === '/shop'}>
            <Link href="/shop">Shop all</Link>
          </Navbar.Link>
          {categories.map((c) => (
            <Navbar.Link key={c.slug} asChild>
              <Link href={`/shop?category=${c.slug}`}>{c.label}</Link>
            </Navbar.Link>
          ))}
          <Navbar.Link asChild active={pathname === '/built-with'}>
            <Link href="/built-with">Built with</Link>
          </Navbar.Link>
        </Navbar.Links>

        <Navbar.Actions>
          <a
            className="sk-navbadge"
            href={utm(vivekUI.docs, 'navbar')}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Badge tone="primary" variant="soft" pill>
              ⚡ Built with VivekUI
            </Badge>
          </a>

          <Button
            variant="outline"
            size="sm"
            className="sk-searchbtn"
            onClick={() => setPaletteOpen(true)}
          >
            <SearchIcon />
            <span className="sk-searchbtn__label">Search</span>
            <Kbd size="sm" className="sk-searchbtn__kbd">
              ⌘K
            </Kbd>
          </Button>

          <span className="sk-cartbtn">
            <IconButton
              variant="ghost"
              aria-label={
                ready && count > 0
                  ? `Open cart, ${count} ${count === 1 ? 'item' : 'items'}`
                  : 'Open cart'
              }
              onClick={openCart}
            >
              <BagIcon />
            </IconButton>
            {/*
              Held back until the persisted cart has been read. Rendering a "0"
              first and then flipping it to "3" is a worse first impression than
              showing nothing for one frame.
            */}
            {ready && count > 0 && (
              <span className="sk-cartbtn__count">
                <Badge tone="primary" size="sm" pill aria-hidden="true">
                  {count}
                </Badge>
              </span>
            )}
          </span>

          <ThemeToggle mode="cycle" size="sm" variant="ghost" />
        </Navbar.Actions>

        <Navbar.Toggle />
      </Navbar>

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        items={items}
        placeholder="Search products and pages…"
        label="Search ShopKit"
        emptyState="No products match that. Try “backpack” or “watch”."
        // The palette's own `mod+k` listener stays on, so the shortcut works
        // even when the button is off-screen on a phone.
        onSelect={(item) => router.push(item.id)}
        footer={
          <span>
            <Kbd size="sm">↑</Kbd> <Kbd size="sm">↓</Kbd> to move ·{' '}
            <Kbd size="sm">↵</Kbd> to open · <Kbd size="sm">esc</Kbd> to close
          </span>
        }
      />
    </>
  )
}
