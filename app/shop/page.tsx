import type { Metadata } from 'next'
import Link from 'next/link'
import { Breadcrumb, Container, Section, Text } from '@the_viveksingh/vivek-ui'

import { JsonLd } from '@/components/json-ld'
import { ShopBrowser } from '@/components/shop/shop-browser'
import {
  categories,
  priceBounds,
  products,
  toCardData,
  type Category,
} from '@/data/products'
import { breadcrumbList, itemListSchema } from '@/lib/schema'
import { OG_IMAGE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Shop all — 16 products',
  description:
    'Browse all sixteen ShopKit products: headphones, watches, sneakers and backpacks. Filter by category, price, rating and availability.',
  alternates: { canonical: '/shop' },
  openGraph: {
    title: 'Shop all — ShopKit',
    description: 'Headphones, watches, sneakers and backpacks. Sixteen things worth owning.',
    url: '/shop',
    images: [OG_IMAGE],
  },
}

const VALID_SORTS = ['featured', 'price-asc', 'price-desc', 'rating', 'reviews'] as const
type Sort = (typeof VALID_SORTS)[number]

/** `?category=` may arrive repeated or comma-separated; both are honoured. */
function readCategories(raw: string | string[] | undefined): Category[] {
  if (!raw) return []
  const known = new Set(categories.map((c) => c.slug))
  const values = (Array.isArray(raw) ? raw : [raw]).flatMap((v) => v.split(','))
  return values.filter((v): v is Category => known.has(v as Category))
}

export default async function ShopPage({ searchParams }: PageProps<'/shop'>) {
  // Next 16: searchParams is a promise and has to be awaited.
  const params = await searchParams
  const initialCategories = readCategories(params.category)
  const sortParam = Array.isArray(params.sort) ? params.sort[0] : params.sort
  const initialSort: Sort = VALID_SORTS.includes(sortParam as Sort)
    ? (sortParam as Sort)
    : 'featured'

  const heading =
    initialCategories.length === 1
      ? categories.find((c) => c.slug === initialCategories[0])!.label
      : 'Everything'

  return (
    <>
      <JsonLd data={itemListSchema(products, 'ShopKit — all products')} />
      <JsonLd
        data={breadcrumbList([
          { name: 'Home', path: '/' },
          { name: 'Shop', path: '/shop' },
        ])}
      />

      <Section padding="md" size="xl">
        <Container size="full" flush>
          <Breadcrumb
            size="sm"
            items={[{ label: 'Home', href: '/' }, { label: 'Shop' }]}
          />

          <div style={{ margin: '1rem 0 2rem', maxWidth: '38rem' }}>
            <p className="sk-eyebrow">Shop</p>
            <h1 style={{ fontSize: 'clamp(1.9rem, 4.5vw, 2.75rem)', margin: '0.3rem 0 0.6rem' }}>
              {heading}
            </h1>
            <Text tone="muted">
              Sixteen products, four categories, no seasonal churn. Filters run in the
              browser — nothing here is behind an API you have to wire up.{' '}
              <Link href="/built-with">See the components used</Link>.
            </Text>
          </div>

          {/*
            Only the card projection crosses to the browser, not the full catalog:
            the filter UI needs the data client-side, but it does not need every
            description, spec table and review with it.
          */}
          <ShopBrowser
            products={products.map(toCardData)}
            bounds={priceBounds()}
            initialCategories={initialCategories}
            initialSort={initialSort}
          />
        </Container>
      </Section>
    </>
  )
}
