import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
/*
  Note the flat imports for the Accordion and Tabs parts.

  Both components carry their own `'use client'`, and their sub-components are
  attached as static properties (`Accordion.Item`). A static property is not a
  module export, so it does not survive the server/client boundary — reaching for
  `<Accordion.Item>` from a Server Component like this one hands React
  `undefined`. The separately exported `AccordionItem` is the same component and
  crosses the boundary properly.

  Table, Card and Section are Server Components, so their dot notation is fine.
*/
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  Avatar,
  Badge,
  Breadcrumb,
  Container,
  Grid,
  Prose,
  Rating,
  RelativeTime,
  Section,
  Table,
  Tabs,
  TabsList,
  TabsPanel,
  TabsPanels,
  TabsTab,
  Text,
} from '@the_viveksingh/vivek-ui'
import { Sparkline } from '@the_viveksingh/vivek-ui/charts'

import { JsonLd } from '@/components/json-ld'
import { ProductCard } from '@/components/product-card'
import { ProductBuyBox } from '@/components/product/product-buybox'
import { ProductGallery } from '@/components/product/product-gallery'
import {
  categoryLabel,
  formatPrice,
  getProduct,
  isLowestIn30Days,
  products,
  related,
} from '@/data/products'
import { breadcrumbList, productSchema } from '@/lib/schema'

/** All sixteen pages are prerendered at build time. */
export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }))
}

export async function generateMetadata({
  params,
}: PageProps<'/product/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const product = getProduct(slug)
  if (!product) return { title: 'Product not found' }

  const path = `/product/${product.slug}`
  const title = `${product.name} — ${categoryLabel(product.category)}`

  return {
    title,
    description: `${product.blurb} ${formatPrice(product.price)}. Free 30-day returns. Part of ShopKit, a free open-source Next.js e-commerce template.`,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      title,
      description: product.blurb,
      url: path,
      // One OG image per product, straight from its own gallery.
      images: [{ url: product.images[0].src, alt: product.images[0].alt }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: product.blurb,
      images: [product.images[0].src],
    },
  }
}

export default async function ProductPage({ params }: PageProps<'/product/[slug]'>) {
  const { slug } = await params
  const product = getProduct(slug)
  if (!product) notFound()

  const onSale = typeof product.comparePrice === 'number'
  const low = Math.min(...product.priceHistory)
  const high = Math.max(...product.priceHistory)
  const atLow = isLowestIn30Days(product)
  const relatedProducts = related(product, 4)

  return (
    <>
      <JsonLd data={productSchema(product)} />
      <JsonLd
        data={breadcrumbList([
          { name: 'Home', path: '/' },
          { name: 'Shop', path: '/shop' },
          { name: categoryLabel(product.category), path: `/shop?category=${product.category}` },
          { name: product.name, path: `/product/${product.slug}` },
        ])}
      />

      <Section padding="md" size="xl">
        <Container size="full" flush>
          <Breadcrumb
            size="sm"
            items={[
              { label: 'Home', href: '/' },
              { label: 'Shop', href: '/shop' },
              {
                label: categoryLabel(product.category),
                href: `/shop?category=${product.category}`,
              },
              { label: product.name },
            ]}
          />

          <div className="sk-pdp" style={{ marginBlockStart: '1.5rem' }}>
            <ProductGallery images={product.images} productName={product.name} />

            <div>
              <p className="sk-eyebrow">{categoryLabel(product.category)}</p>

              {/* The page's only h1. */}
              <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', margin: '0.3rem 0 0.75rem' }}>
                {product.name}
              </h1>

              <div className="sk-meta" style={{ marginBlockEnd: '1rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Rating value={product.rating} readOnly allowHalf size="sm" />
                  <Text size="sm" tone="muted">
                    {product.rating.toFixed(1)}
                    <span className="sk-sr-only"> out of 5</span> · {product.reviewCount} reviews
                  </Text>
                </span>
                <span className="sk-dot" aria-hidden="true">
                  |
                </span>
                <Text size="sm" tone="muted">
                  {product.colorway}
                </Text>
                {product.inStock ? (
                  <Badge tone="success" variant="soft" size="sm">
                    In stock
                  </Badge>
                ) : (
                  <Badge tone="neutral" variant="solid" size="sm">
                    Sold out
                  </Badge>
                )}
              </div>

              {/* --------------------------- Price + 30-day history spark */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '1.25rem',
                  marginBlockEnd: '1.25rem',
                }}
              >
                <p className="sk-price sk-price--lg">
                  <span className="sk-price__now">{formatPrice(product.price)}</span>
                  {onSale && (
                    <span className="sk-price__was">
                      <span className="sk-sr-only">Was </span>
                      {formatPrice(product.comparePrice!)}
                    </span>
                  )}
                </p>

                <div className="sk-history">
                  <div className="sk-history__head">
                    <span className="sk-history__label">Price history — last 30 days</span>
                  </div>
                  <Sparkline
                    data={product.priceHistory}
                    height={34}
                    width={180}
                    fill
                    showLastPoint
                    curve="smooth"
                    title={`${product.name} — price over the last 30 days`}
                    description={`Ranged from ${formatPrice(low)} to ${formatPrice(high)}, now ${formatPrice(product.price)}.`}
                    xLabel="Day"
                    yLabel="Price (USD)"
                    formatValue={(value) => formatPrice(value)}
                  />
                  <p className="sk-history__bounds">
                    <span>Low {formatPrice(low)}</span>
                    <span>High {formatPrice(high)}</span>
                  </p>
                  {atLow && (
                    <Text
                      size="sm"
                      weight="semibold"
                      style={{ display: 'block', marginBlockStart: '0.35rem', color: 'var(--vk-color-primary)' }}
                    >
                      Lowest price in 30 days
                    </Text>
                  )}
                </div>
              </div>

              <Text tone="muted" style={{ display: 'block', marginBlockEnd: '1.25rem' }}>
                {product.blurb}
              </Text>

              <ProductBuyBox
                slug={product.slug}
                name={product.name}
                inStock={product.inStock}
                stockCount={product.stockCount}
              />

              {product.inStock && product.stockCount <= 12 && (
                <Alert tone="warning" variant="soft" style={{ marginBlockEnd: '1.25rem' }}>
                  Only {product.stockCount} left in {product.colorway}.
                </Alert>
              )}

              {/* ------------------------------------------- Shipping etc. */}
              <Accordion type="single" collapsible variant="separated" headingLevel={2}>
                <AccordionItem value="shipping">
                  <AccordionTrigger>Shipping</AccordionTrigger>
                  <AccordionContent>
                    Free standard shipping on orders over $75, otherwise $6. Standard is
                    3–5 working days, express is 1–2. Orders placed before 2pm ship the
                    same day. Demo store — nothing is actually dispatched.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="returns">
                  <AccordionTrigger>Returns</AccordionTrigger>
                  <AccordionContent>
                    Thirty days, free, any reason, as long as it is unworn and in its
                    original packaging. We email a prepaid label; refunds land 3–5 working
                    days after the parcel reaches the warehouse.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="warranty">
                  <AccordionTrigger>Warranty</AccordionTrigger>
                  <AccordionContent>
                    Two years against manufacturing defects, covering materials and
                    workmanship. Pack hardware — buckles, zips and clasps — is covered for
                    life. Wear from normal use is not a defect.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </Container>
      </Section>

      {/* --------------------------------------------- Description / Specs / Reviews */}
      <Section padding="lg" size="xl" className="sk-rule-top">
        <Tabs defaultValue="description" variant="line">
          <TabsList>
            <TabsTab value="description">Description</TabsTab>
            <TabsTab value="specs">Specs</TabsTab>
            <TabsTab value="reviews">Reviews ({product.reviews.length})</TabsTab>
          </TabsList>

          <TabsPanels>
            <TabsPanel value="description">
              <Prose measure>
                {product.description.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
              </Prose>
            </TabsPanel>

            <TabsPanel value="specs">
              <Table striped size="md" style={{ maxWidth: '38rem' }}>
                <Table.Caption visuallyHidden>
                  Technical specifications for {product.name}
                </Table.Caption>
                <Table.Body>
                  {product.specs.map(([label, value]) => (
                    <Table.Row key={label}>
                      <Table.HeaderCell scope="row">{label}</Table.HeaderCell>
                      <Table.Cell>{value}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </TabsPanel>

            <TabsPanel value="reviews">
              <ul className="sk-reviews">
                {product.reviews.map((review) => (
                  <li className="sk-review" key={review.id}>
                    <Avatar src={review.avatar} name={review.author} size="md" />
                    <div>
                      <div className="sk-review__head">
                        <Text weight="semibold">{review.author}</Text>
                        <Text size="sm" tone="muted">
                          {/*
                            `locale` and `timeZone` are pinned deliberately.
                            Before the mount effect runs, RelativeTime renders the
                            ABSOLUTE date — and with both left to the runtime, the
                            server formats it in UTC while the browser formats it in
                            the visitor's zone, which is a text mismatch and a real
                            React hydration error (#418).
                          */}
                          <RelativeTime date={review.date} locale="en-US" timeZone="UTC" />
                        </Text>
                      </div>
                      <Rating value={review.rating} readOnly size="sm" />
                      <Text weight="semibold" style={{ display: 'block', marginBlockStart: '0.35rem' }}>
                        {review.title}
                      </Text>
                      <Text tone="muted">{review.body}</Text>
                    </div>
                  </li>
                ))}
              </ul>
            </TabsPanel>
          </TabsPanels>
        </Tabs>
      </Section>

      {/* ------------------------------------------------------------- Related */}
      <Section padding="lg" size="xl" className="sk-rule-top" aria-labelledby="related-title">
        <div className="sk-section-head">
          <div>
            <p className="sk-eyebrow">You might also like</p>
            <h2 id="related-title">More from the shop</h2>
          </div>
          <Text size="sm">
            <Link href="/shop">Browse everything</Link>
          </Text>
        </div>
        <Grid cols={{ base: 1, sm: 2, lg: 4 }} gap={4}>
          {relatedProducts.map((item) => (
            <ProductCard
              key={item.slug}
              product={item}
              sizes="(min-width: 64rem) 23vw, (min-width: 34rem) 46vw, 92vw"
            />
          ))}
        </Grid>
      </Section>
    </>
  )
}
