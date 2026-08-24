import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Alert,
  Badge,
  Breadcrumb,
  Button,
  Code,
  Container,
  CopyButton,
  Grid,
  Section,
  Table,
  Text,
} from '@the_viveksingh/vivek-ui'

import { JsonLd } from '@/components/json-ld'
import { breadcrumbList } from '@/lib/schema'
import { chartDocs, componentDocs, OG_IMAGE, site, utm, vivekUI } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Built with VivekUI',
  description:
    'Every component used to build ShopKit, deep-linked to its documentation. The cart drawer, ⌘K command palette and sparklines all come from one package with zero runtime dependencies.',
  alternates: { canonical: '/built-with' },
  openGraph: {
    title: 'Built with VivekUI — ShopKit',
    description:
      'Every component used to build this store, deep-linked to its docs. One package, zero runtime dependencies.',
    url: '/built-with',
    images: [OG_IMAGE],
  },
}

interface Row {
  component: string
  where: string
  /** Charts sit at a different docs path from components. */
  chart?: boolean
}

const GROUPS: Array<{ title: string; note: string; rows: Row[] }> = [
  {
    title: 'Site chrome',
    note: 'Present on every page, from the root layout.',
    rows: [
      { component: 'Navbar', where: 'Header, with the collapsing mobile sheet' },
      { component: 'CommandPalette', where: '⌘K search across all 16 products and every page' },
      { component: 'Kbd', where: 'The ⌘K hint in the search button and palette footer' },
      { component: 'Drawer', where: 'The cart, sliding in from the inline end' },
      { component: 'IconButton', where: 'Cart button, quantity steppers' },
      { component: 'Badge', where: 'Cart count, sale flags, “Built with VivekUI”' },
      { component: 'ThemeProvider', where: 'Light / dark / system, persisted' },
      { component: 'ThemeToggle', where: 'The theme switch in the navbar' },
      { component: 'Toast', where: '“Added to cart”, with a View cart action' },
      { component: 'Footer', where: 'Link columns and the credit block below' },
      { component: 'Code', where: 'The install command, here and in the footer' },
      { component: 'CopyButton', where: 'Copying that install command' },
    ],
  },
  {
    title: 'Homepage',
    note: 'The storefront, rendered almost entirely on the server.',
    rows: [
      { component: 'Countdown', where: '“Sale ends in…”, hydration-safe via a server clock' },
      { component: 'Sparkline', where: '14-day sales velocity in the Trending row', chart: true },
      { component: 'Rating', where: 'Stars on every product card' },
      { component: 'LogoCloud', where: 'The “As seen in” strip' },
      { component: 'Testimonials', where: 'Three customer quotes' },
      { component: 'Newsletter', where: 'The signup form' },
      { component: 'FAQ', where: 'Shipping, returns and licence questions' },
      { component: 'Grid', where: 'Category tiles and every product grid' },
      { component: 'Section', where: 'Page bands, including the primary-surface CTA' },
      { component: 'Container', where: 'Max-width gutters' },
      { component: 'Button', where: 'Every call to action, via asChild + next/link' },
      { component: 'Text', where: 'Body copy, muted captions, line clamping' },
    ],
  },
  {
    title: 'Shop',
    note: 'The filter rail runs entirely in the browser.',
    rows: [
      { component: 'Checkbox', where: 'Category facets, with counts' },
      { component: 'Slider', where: 'Price range — two thumbs, each separately labelled' },
      { component: 'Switch', where: '“In stock only”' },
      { component: 'Select', where: 'The sort control' },
      { component: 'Pagination', where: 'Eight products per page' },
      { component: 'Skeleton', where: 'The placeholder shown while filtering' },
      { component: 'EmptyState', where: 'When no product matches the filters' },
      { component: 'Breadcrumb', where: 'Home → Shop' },
    ],
  },
  {
    title: 'Product page',
    note: 'Sixteen statically prerendered pages.',
    rows: [
      { component: 'Carousel', where: 'The image gallery, driven also by the thumbnail strip' },
      { component: 'Sparkline', where: '“Price history — last 30 days”, with min/max labels', chart: true },
      { component: 'ButtonGroup', where: 'The attached quantity stepper' },
      { component: 'Accordion', where: 'Shipping / Returns / Warranty' },
      { component: 'Tabs', where: 'Description, Specs and Reviews' },
      { component: 'Prose', where: 'The description copy' },
      { component: 'Table', where: 'The specification rows' },
      { component: 'Avatar', where: 'Reviewer portraits' },
      { component: 'RelativeTime', where: '“3 weeks ago” on each review' },
      { component: 'Alert', where: 'The low-stock notice' },
    ],
  },
  {
    title: 'Checkout',
    note: 'Four steps, fully mocked.',
    rows: [
      { component: 'Stepper', where: 'Address → Shipping → Payment → Review' },
      { component: 'Field', where: 'Labels, hints and error text wiring' },
      { component: 'Input', where: 'The address form' },
      { component: 'RadioGroup', where: 'Shipping methods and payment methods' },
      { component: 'Timeline', where: 'Order status on the confirmation screen' },
      { component: 'Table', where: 'The review-your-order summary' },
    ],
  },
]

/** `CommandPalette` → `command-palette`, matching the docs URLs. */
const slugify = (name: string): string =>
  name === 'FAQ'
    ? 'faq'
    : name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()

const total = new Set(GROUPS.flatMap((g) => g.rows.map((r) => r.component))).size

export default function BuiltWithPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbList([
          { name: 'Home', path: '/' },
          { name: 'Built with VivekUI', path: '/built-with' },
        ])}
      />

      <Section padding="lg" size="lg">
        <Container size="full" flush>
          <Breadcrumb size="sm" items={[{ label: 'Home', href: '/' }, { label: 'Built with' }]} />

          <div style={{ maxWidth: '44rem', marginBlockStart: '1rem' }}>
            <Badge tone="primary" variant="soft" pill>
              ⚡ Built with VivekUI
            </Badge>

            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', margin: '0.75rem 0 1rem' }}>
              Built with VivekUI
            </h1>

            <Text size="lg" style={{ display: 'block', marginBlockEnd: '1rem' }}>
              This entire website is built with VivekUI, a free React component library with
              zero runtime dependencies.
            </Text>

            <Text tone="muted" style={{ display: 'block', marginBlockEnd: '1.5rem' }}>
              No Tailwind, no shadcn, no component CLI, no config file. {total} distinct
              components and one chart type, from a single install and a single CSS import.
              Everything below is a live part of this store, not a screenshot.
            </Text>

            <div className="sk-credit" style={{ marginBlockEnd: '1rem' }}>
              <Text size="sm" weight="semibold">
                Install VivekUI
              </Text>
              <div className="sk-install">
                <Code className="sk-install__code">{vivekUI.install}</Code>
                <CopyButton
                  value={vivekUI.install}
                  size="sm"
                  variant="outline"
                  label={<>Copy<span className="sk-sr-only"> the npm install command</span></>}
                  copiedLabel="Copied"
                />
              </div>
              <Text size="sm" tone="muted">
                Then one import in your root layout:{' '}
                <Code>{`import '@the_viveksingh/vivek-ui/styles.css'`}</Code>
              </Text>
            </div>

            <div className="sk-credit" style={{ marginBlockEnd: '1.5rem' }}>
              <Text size="sm" weight="semibold">
                Or take this whole store
              </Text>
              <div className="sk-install">
                <Code className="sk-install__code">{site.cloneCommand}</Code>
                <CopyButton
                  value={site.cloneCommand}
                  size="sm"
                  variant="outline"
                  label={<>Copy<span className="sk-sr-only"> the git clone command</span></>}
                  copiedLabel="Copied"
                />
              </div>
              <Text size="sm" tone="muted">
                MIT licensed. Starting a real project? Press{' '}
                <a href={site.useTemplate} target="_blank" rel="noopener noreferrer">
                  Use this template
                </a>{' '}
                for a fresh repository instead of cloning this one.
              </Text>
            </div>

            <Alert tone="info" variant="soft" title="One package, not twelve">
              The cart <strong>Drawer</strong>, the ⌘K <strong>CommandPalette</strong> and both{' '}
              <strong>Sparkline</strong> charts all come from the same package — no drawer
              library, no combobox library, no charting library. That is the whole reason
              this store has zero runtime dependencies of its own.
            </Alert>

            <div className="sk-cta-row" style={{ marginBlockStart: '1.5rem' }}>
              <Button asChild size="lg">
                <a href={utm(vivekUI.docs, 'builtwith')} target="_blank" rel="noopener noreferrer">
                  Read the Docs
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href={vivekUI.github} target="_blank" rel="noopener noreferrer">
                  Star on GitHub
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href={site.useTemplate} target="_blank" rel="noopener noreferrer">
                  Use this template
                </a>
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------- The component map */}
      {GROUPS.map((group) => (
        <Section key={group.title} padding="md" size="lg" className="sk-rule-top">
          <Container size="full" flush>
            <div className="sk-section-head">
              <div>
                <p className="sk-eyebrow">{group.title}</p>
                <h2>{group.note}</h2>
              </div>
            </div>

            <Table size="sm" striped hoverable>
              <Table.Caption visuallyHidden>
                VivekUI components used in the {group.title} of ShopKit
              </Table.Caption>
              <Table.Head>
                <Table.Row>
                  <Table.HeaderCell scope="col">Component</Table.HeaderCell>
                  <Table.HeaderCell scope="col">Where it appears</Table.HeaderCell>
                  <Table.HeaderCell scope="col">Docs</Table.HeaderCell>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {group.rows.map((row) => (
                  <Table.Row key={`${group.title}-${row.component}`}>
                    <Table.HeaderCell scope="row">
                      <Code size="sm">{row.component}</Code>
                    </Table.HeaderCell>
                    <Table.Cell>{row.where}</Table.Cell>
                    <Table.Cell>
                      <a
                        href={
                          row.chart
                            ? chartDocs(slugify(row.component))
                            : componentDocs(slugify(row.component))
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {slugify(row.component)}
                        <span className="sk-sr-only"> documentation, opens in a new tab</span>
                      </a>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </Container>
        </Section>
      ))}

      {/* -------------------------------------------------------------- Close */}
      <Section padding="lg" background="primary" align="center" size="md">
        <h2 style={{ margin: '0 0 0.5rem' }}>Start from this store</h2>
        <Text style={{ display: 'block', marginBlockEnd: '1.25rem' }}>
          ShopKit is MIT licensed. Clone it, swap <Code>data/products.ts</Code> for your own
          catalog, and you have a storefront. The credit in the footer is removable — a star
          on the repository is appreciated instead.
        </Text>
        <Grid cols={{ base: 1, sm: 3 }} gap={3}>
          <Button asChild>
            <a href={utm(vivekUI.docs, 'builtwith')} target="_blank" rel="noopener noreferrer">
              Read the Docs
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href={vivekUI.github} target="_blank" rel="noopener noreferrer">
              Star on GitHub
            </a>
          </Button>
          <Button asChild variant="outline">
            <Link href="/shop">Back to the shop</Link>
          </Button>
        </Grid>
      </Section>
    </>
  )
}
