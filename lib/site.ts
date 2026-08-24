/**
 * One place for the strings that appear on every page, and for the UTM tagging
 * every outbound VivekUI link carries.
 */

/**
 * The canonical origin. Everything URL-shaped on the site derives from this —
 * `metadataBase`, canonicals, the sitemap, robots.txt and every JSON-LD `@id`.
 * Change it here and nowhere else.
 */
export const SITE_URL = 'https://shopkit.vivekkumarsingh.in'

const REPO = 'https://github.com/intellectwithvivek/shopkit'

export const site = {
  name: 'ShopKit',
  tagline: 'Considered goods for everyday carry',
  description:
    'ShopKit is a free, open-source Next.js 16 e-commerce template built with VivekUI — 16 products, a cart drawer, ⌘K search, faceted filters and a mock checkout.',
  url: SITE_URL,
  demo: SITE_URL,
  repo: REPO,
  /** What a developer actually pastes into a terminal. */
  cloneCommand: `git clone ${REPO}.git`,
  cloneUrl: `${REPO}.git`,
  /** GitHub's "create a repo from this template" route. */
  useTemplate: `${REPO}/generate`,
  issues: `${REPO}/issues`,
  license: `${REPO}/blob/main/LICENSE`,
  /** One-click Vercel import, with the repo pre-filled. */
  deploy: `https://vercel.com/new/clone?repository-url=${encodeURIComponent(REPO)}`,
} as const

export const vivekUI = {
  pkg: '@the_viveksingh/vivek-ui',
  install: 'npm i @the_viveksingh/vivek-ui',
  docs: 'https://ui.vivekkumarsingh.in/docs',
  components: 'https://ui.vivekkumarsingh.in/docs/components',
  npm: 'https://www.npmjs.com/package/@the_viveksingh/vivek-ui',
  github: 'https://github.com/intellectwithvivek/vivek_UI',
  author: 'https://vivekkumarsingh.in/',
} as const

/** The campaign is the same for every link on this site; only the placement changes. */
const CAMPAIGN = 'ecommerce'

export type UtmMedium =
  | 'footer'
  | 'navbar'
  | 'topbar'
  | 'builtwith'
  | 'readme'
  | 'hero'

/** Appends the standard `utm_*` trio, preserving any query string already present. */
export function utm(url: string, medium: UtmMedium): string {
  const target = new URL(url)
  target.searchParams.set('utm_source', 'vivekui-template')
  target.searchParams.set('utm_campaign', CAMPAIGN)
  target.searchParams.set('utm_medium', medium)
  return target.toString()
}

/** Deep link to one component's documentation page, tagged for /built-with. */
export function componentDocs(name: string, medium: UtmMedium = 'builtwith'): string {
  return utm(`${vivekUI.components}/${name}`, medium)
}

/**
 * The promo deadline: 23:59 UTC on the coming Sunday.
 *
 * Derived from `now` rather than hard-coded, so the demo's countdown is never
 * showing a sale that ended in 2026. The homepage revalidates hourly, which is
 * what keeps this honest between deploys.
 */
export function saleEndsAt(now: number): number {
  const date = new Date(now)
  const daysUntilSunday = (7 - date.getUTCDay()) % 7 || 7
  return Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate() + daysUntilSunday,
    23,
    59,
    0,
  )
}

/**
 * Charts live at their own docs path rather than under `/docs/components`,
 * so `Sparkline` needs this instead of `componentDocs`.
 */
export function chartDocs(name: string, medium: UtmMedium = 'builtwith'): string {
  return utm(`https://ui.vivekkumarsingh.in/docs/charts/${name}`, medium)
}

/**
 * The generated social card, at `app/opengraph-image.tsx`.
 *
 * Metadata merges shallowly: a route that declares its own `openGraph` replaces
 * the parent's object wholesale, images included. So every route that sets an
 * OG title has to name the image too, or it ships a `summary_large_image` card
 * with no image in it.
 */
export const OG_IMAGE = '/opengraph-image'
