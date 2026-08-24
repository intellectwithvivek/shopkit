import Image from 'next/image'
import Link from 'next/link'
import {
  Button,
  Container,
  Countdown,
  FAQ,
  Grid,
  LogoCloud,
  Section,
  Testimonials,
  Text,
} from '@the_viveksingh/vivek-ui'

import { JsonLd } from '@/components/json-ld'
import { NewsletterSignup } from '@/components/newsletter-signup'
import { ProductCard } from '@/components/product-card'
import { ArrowIcon, PressLogo, ReturnIcon, ShieldIcon, TruckIcon } from '@/components/icons'
import {
  bestSellers,
  categories,
  formatPrice,
  getProduct,
  products,
  trending,
} from '@/data/products'
import { faqEntries } from '@/lib/faq'
import { faqSchema, storeSchema } from '@/lib/schema'
import { saleEndsAt } from '@/lib/site'

/** Hourly, so the promo countdown never counts down to a date in the past. */
export const revalidate = 3600

/* The three products in the hero composition. */
const HERO_SLUGS = ['cadence-over-ear', 'terrace-low-leather', 'meridian-38-automatic'] as const

export default function HomePage() {
  /*
    Reading the clock during render is exactly what is wanted here, and only
    here. This is a Server Component that is prerendered and then revalidated
    hourly (see `revalidate` above), so `Date.now()` is the generation time — it
    gets baked into the HTML, handed to `Countdown` as its `now`, and the browser
    reproduces the same first render before taking over the ticking.

    The alternatives are both worse: a module-scope constant would be the
    server's start time and drift stale over a long-running process, and omitting
    `now` entirely makes the first paint a `--` placeholder.

    eslint-disable-next-line react-hooks/purity -- prerender timestamp, re-synced on the client
  */
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now()
  const saleEnd = saleEndsAt(now)
  const heroProducts = HERO_SLUGS.map((slug) => getProduct(slug)!)
  const trendingProducts = trending(4)
  const best = bestSellers(8)

  return (
    <>
      <JsonLd data={storeSchema()} />
      <JsonLd data={faqSchema(faqEntries)} />

      {/* ---------------------------------------------------------------- Hero */}
      <section className="sk-hero" aria-labelledby="hero-title">
        <Container size="xl">
          <div className="sk-hero__grid">
            <div className="sk-hero__copy">
              <p className="sk-eyebrow">Free &amp; open-source Next.js template</p>

              <h1 id="hero-title" className="sk-hero__title">
                Everyday carry, <span className="sk-hero__mark">considered</span>
              </h1>

              <p className="sk-hero__lede">
                Sixteen things we actually use: headphones tuned flat, watches that fit
                under a cuff, sneakers you can resole, and packs that open like a
                suitcase. Mid-season sale — up to 20% off.
              </p>

              <div style={{ margin: '1.5rem 0 1.25rem' }}>
                <Text
                  size="sm"
                  weight="semibold"
                  style={{ display: 'block', marginBlockEnd: '0.5rem' }}
                >
                  Sale ends in
                </Text>
                {/*
                  `now` is passed so the server HTML contains real digits that the
                  browser reproduces exactly on hydration. Without it the first
                  paint would be a `--` placeholder.
                */}
                <Countdown to={saleEnd} now={now} label="Time left in the mid-season sale" />
              </div>

              <div className="sk-cta-row">
                <Button asChild size="lg">
                  <Link href="/shop">
                    Shop all {products.length} products <ArrowIcon />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/built-with">See how it is built</Link>
                </Button>
              </div>
            </div>

            {/*
              The signature element: flat amber slabs with the photography offset
              off them, so a hard band of colour shows along two edges of every
              shape. Decorative as a composition — each photo still carries the
              real alt text of the product it shows.
            */}
            <div className="sk-blocks">
              <div className="sk-figure sk-figure--a sk-figure--arch">
                <div className="sk-figure__slab" />
                <div className="sk-figure__photo">
                  <Image
                    src={heroProducts[0].images[0].src}
                    alt={heroProducts[0].images[0].alt}
                    fill
                    priority
                    sizes="(min-width: 62rem) 30vw, 50vw"
                  />
                </div>
              </div>

              <div className="sk-figure sk-figure--b sk-figure--pale">
                <div className="sk-figure__slab" />
                <div className="sk-figure__photo">
                  <Image
                    src={heroProducts[1].images[0].src}
                    alt={heroProducts[1].images[0].alt}
                    fill
                    priority
                    sizes="(min-width: 62rem) 30vw, 50vw"
                  />
                </div>
              </div>

              <div className="sk-figure sk-figure--c sk-figure--circle sk-figure--deep">
                <div className="sk-figure__slab" />
                <div className="sk-figure__photo">
                  <Image
                    src={heroProducts[2].images[0].src}
                    alt={heroProducts[2].images[0].alt}
                    fill
                    sizes="(min-width: 62rem) 20vw, 33vw"
                  />
                </div>
              </div>

              <p className="sk-chip">
                {heroProducts[0].name}
                <small>from {formatPrice(heroProducts[0].price)}</small>
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ---------------------------------------------------- Service promises */}
      <Section padding="sm" background="muted" size="xl">
        <Grid cols={{ base: 1, sm: 3 }} gap={4}>
          {[
            { icon: <TruckIcon />, title: 'Free shipping over $75', note: '3–5 working days' },
            { icon: <ReturnIcon />, title: '30-day free returns', note: 'Unworn, any reason' },
            { icon: <ShieldIcon />, title: 'Two-year warranty', note: 'Lifetime on pack hardware' },
          ].map((item) => (
            <div
              key={item.title}
              style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}
            >
              <span style={{ color: 'var(--vk-color-primary)' }}>{item.icon}</span>
              <span>
                <Text size="sm" weight="semibold" style={{ display: 'block' }}>
                  {item.title}
                </Text>
                <Text size="sm" tone="muted">
                  {item.note}
                </Text>
              </span>
            </div>
          ))}
        </Grid>
      </Section>

      {/* ------------------------------------------------------- Category tiles */}
      <Section padding="lg" size="xl" aria-labelledby="categories-title">
        <div className="sk-section-head">
          <div>
            <p className="sk-eyebrow">Four categories</p>
            <h2 id="categories-title">Start somewhere</h2>
          </div>
          <Button asChild variant="ghost">
            <Link href="/shop">
              Everything <ArrowIcon />
            </Link>
          </Button>
        </div>

        <Grid cols={{ base: 2, md: 4 }} gap={4}>
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/shop?category=${category.slug}`}
              className="sk-tile"
            >
              <div className="sk-tile__img">
                <Image
                  src={category.image}
                  alt=""
                  fill
                  sizes="(min-width: 48rem) 25vw, 50vw"
                />
              </div>
              <div className="sk-tile__bar">
                <strong>{category.label}</strong>
                <span>{category.blurb}</span>
              </div>
            </Link>
          ))}
        </Grid>
      </Section>

      {/* ------------------------------------------------------- Trending now */}
      <Section padding="lg" size="xl" className="sk-rule-top" aria-labelledby="trending-title">
        <div className="sk-section-head">
          <div>
            <p className="sk-eyebrow">Trending now</p>
            <h2 id="trending-title">Moving fastest this week</h2>
            <Text size="sm" tone="muted" style={{ marginBlockStart: '0.4rem' }}>
              Units sold per day over the last fourteen days.
            </Text>
          </div>
        </div>

        <Grid cols={{ base: 1, sm: 2, lg: 4 }} gap={4}>
          {trendingProducts.map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
              showVelocity
              sizes="(min-width: 64rem) 23vw, (min-width: 34rem) 46vw, 92vw"
            />
          ))}
        </Grid>
      </Section>

      {/* ------------------------------------------------------- Best sellers */}
      <Section padding="lg" size="xl" className="sk-rule-top" aria-labelledby="best-title">
        <div className="sk-section-head">
          <div>
            <p className="sk-eyebrow">Best sellers</p>
            <h2 id="best-title">What everyone else picked</h2>
          </div>
          <Button asChild variant="ghost">
            <Link href="/shop?sort=rating">
              Sort by rating <ArrowIcon />
            </Link>
          </Button>
        </div>

        <Grid cols={{ base: 1, sm: 2, lg: 4 }} gap={4}>
          {best.map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
              sizes="(min-width: 64rem) 23vw, (min-width: 34rem) 46vw, 92vw"
            />
          ))}
        </Grid>
      </Section>

      {/* ------------------------------------------------------------- Press */}
      <LogoCloud
        background="muted"
        title="As seen in"
        padding="md"
        size="xl"
        logos={[0, 1, 2, 3, 4].map((i) => ({
          id: i,
          alt: '',
          node: <PressLogo index={i} />,
        }))}
      />

      {/* ------------------------------------------------------ Testimonials */}
      <Testimonials
        padding="lg"
        size="xl"
        eyebrow="Reviews"
        title="What people say once it arrives"
        columns={{ base: 1, md: 3 }}
        items={[
          {
            id: 't1',
            quote:
              'I bought the Transit pack for one trip and it has been my only bag for a year. The suspended laptop sleeve alone justifies it.',
            author: 'Rhian Morgan',
            role: 'Photographer, Cardiff',
          },
          {
            id: 't2',
            quote:
              'Ordered the Meridian 38 expecting to send it back. Three months on it is the only watch I wear — it actually fits a small wrist.',
            author: 'Aditya Menon',
            role: 'Architect, Bengaluru',
          },
          {
            id: 't3',
            quote:
              'The Terrace sneakers went back to a cobbler and came out looking new. Nothing else I own at this price could have.',
            author: 'Sofie Andersen',
            role: 'Illustrator, Copenhagen',
          },
        ]}
      />

      {/* -------------------------------------------------------- Newsletter */}
      <Section padding="lg" background="muted" size="md" className="sk-rule-top">
        <NewsletterSignup />
      </Section>

      {/* --------------------------------------------------------------- FAQ */}
      <FAQ
        id="faq"
        padding="lg"
        size="lg"
        className="sk-rule-top"
        eyebrow="Questions"
        title="Shipping, returns, and this template"
        name="shopkit-faq"
        defaultOpen={0}
        items={faqEntries.map((entry) => ({
          id: entry.id,
          question: entry.question,
          answer: entry.answer,
        }))}
      />

    </>
  )
}
