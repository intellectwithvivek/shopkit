/**
 * The mock catalog. Sixteen products across four categories.
 *
 * Everything here is static and deterministic — the sales/price series are produced by a
 * seeded generator rather than `Math.random()`, so the server and the browser render the
 * exact same sparklines and nothing has to be excluded from prerendering.
 */

export type Category = 'headphones' | 'watches' | 'sneakers' | 'backpacks'

export interface CategoryMeta {
  slug: Category
  label: string
  /** Singular, for "1 watch in your cart". */
  noun: string
  blurb: string
  image: string
}

export interface ProductImage {
  src: string
  alt: string
}

export interface Review {
  id: string
  author: string
  avatar: string
  rating: number
  title: string
  body: string
  /** Fixed ISO date, so the page stays statically prerenderable. */
  date: string
}

export interface Product {
  id: string
  slug: string
  name: string
  category: Category
  /** Minor units are avoided throughout; this is a whole-currency amount. */
  price: number
  /** The "was" price. Present only on products actually on sale. */
  comparePrice?: number
  rating: number
  reviewCount: number
  inStock: boolean
  stockCount: number
  colorway: string
  /** One line for cards and search results. */
  blurb: string
  /** Paragraphs for the product page's Description tab. */
  description: string[]
  specs: ReadonlyArray<readonly [string, string]>
  images: ProductImage[]
  /** 14 days of units sold — Sparkline #1, in the Trending row. */
  salesVelocity: number[]
  /** 30 days of prices — Sparkline #2, next to the price on the product page. */
  priceHistory: number[]
  reviews: Review[]
}

export const CURRENCY = 'USD'

export const categories: CategoryMeta[] = [
  {
    slug: 'headphones',
    label: 'Headphones',
    noun: 'pair of headphones',
    blurb: 'Over-ear and in-ear, tuned flat.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=640&q=80&auto=format&fit=crop',
  },
  {
    slug: 'watches',
    label: 'Watches',
    noun: 'watch',
    blurb: 'Mechanical and quartz, 36–40mm.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=640&q=80&auto=format&fit=crop',
  },
  {
    slug: 'sneakers',
    label: 'Sneakers',
    noun: 'pair of sneakers',
    blurb: 'Leather, canvas, and one knit.',
    image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=640&q=80&auto=format&fit=crop',
  },
  {
    slug: 'backpacks',
    label: 'Backpacks',
    noun: 'backpack',
    blurb: 'Daypacks that hold a 16" laptop.',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=640&q=80&auto=format&fit=crop',
  },
]

export const categoryLabel = (slug: Category): string =>
  categories.find((c) => c.slug === slug)?.label ?? slug

/* -------------------------------------------------------------------------- */
/*  Deterministic mock series                                                 */
/* -------------------------------------------------------------------------- */

/** A tiny LCG. Same seed, same sequence, on every machine and both sides of hydration. */
function rng(seed: number): () => number {
  let state = seed % 2147483647
  if (state <= 0) state += 2147483646
  return () => {
    state = (state * 16807) % 2147483647
    return (state - 1) / 2147483646
  }
}

/** Turns a slug into a stable seed, so reordering the catalog does not reshuffle charts. */
function seedFrom(slug: string): number {
  let h = 2166136261
  for (let i = 0; i < slug.length; i += 1) {
    h ^= slug.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

/** 14 days of units sold, trending up by roughly `growth`. */
function salesSeries(slug: string, base: number, growth: number): number[] {
  const next = rng(seedFrom(slug))
  return Array.from({ length: 14 }, (_, i) => {
    const trend = base * (1 + (growth * i) / 13)
    const noise = (next() - 0.45) * base * 0.35
    return Math.max(1, Math.round(trend + noise))
  })
}

/**
 * 30 days of prices that land exactly on today's `price`.
 *
 * Products on sale walk down from their compare price so the spark visibly steps to the
 * current low; full-price products just drift.
 */
function priceSeries(slug: string, price: number, comparePrice?: number): number[] {
  const next = rng(seedFrom(`${slug}-price`))
  const start = comparePrice ?? Math.round(price * 1.06)
  const series = Array.from({ length: 30 }, (_, i) => {
    const t = i / 29
    const drift = start + (price - start) * Math.pow(t, comparePrice ? 2.4 : 1.1)
    const noise = (next() - 0.5) * price * (i > 26 ? 0 : 0.03)
    return Math.round(drift + noise)
  })
  series[29] = price
  return series
}

/** The caption the product page shows when today's price is the 30-day floor. */
export function isLowestIn30Days(product: Pick<Product, 'price' | 'priceHistory'>): boolean {
  return product.price <= Math.min(...product.priceHistory)
}

/** "▲ 23% this week" — last 7 days of units against the 7 before them. */
export function weeklyDelta(product: Pick<Product, 'salesVelocity'>): number {
  const s = product.salesVelocity
  const prev = s.slice(0, 7).reduce((a, b) => a + b, 0)
  const recent = s.slice(7).reduce((a, b) => a + b, 0)
  if (prev === 0) return 0
  return Math.round(((recent - prev) / prev) * 100)
}

export const formatPrice = (amount: number): string =>
  `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

/* -------------------------------------------------------------------------- */
/*  Reviewers                                                                 */
/* -------------------------------------------------------------------------- */

const REVIEWERS = [
  'Amara Okafor', 'Jonas Lindqvist', 'Priya Raman', 'Diego Salcedo',
  'Mei-Ling Chen', 'Tobias Kraus', 'Nadia Haddad', 'Ruth Kimani',
  'Sam Whitfield', 'Ines Ferreira', 'Kenji Watanabe', 'Clara Boucher',
] as const

function reviewsFor(slug: string, rating: number, texts: ReadonlyArray<readonly [string, string]>): Review[] {
  const next = rng(seedFrom(`${slug}-reviews`))
  return texts.map(([title, body], i) => {
    const drift = next() < 0.7 ? 0 : -1
    const who = REVIEWERS[(seedFrom(slug) + i * 5) % REVIEWERS.length]
    return {
      id: `${slug}-r${i + 1}`,
      author: who,
      avatar: `https://i.pravatar.cc/80?img=${((seedFrom(slug) + i * 7) % 70) + 1}`,
      rating: Math.max(3, Math.min(5, Math.round(rating) + drift)),
      title,
      body,
      // Fixed dates, walking back from a fixed anchor — keeps the page prerenderable.
      date: new Date(Date.UTC(2026, 7, 18 - i * 9, 9, 30)).toISOString(),
    }
  })
}

/* -------------------------------------------------------------------------- */
/*  Catalog                                                                   */
/* -------------------------------------------------------------------------- */

const UNSPLASH = 'https://images.unsplash.com/photo-'
/** Unsplash with sane transform params — same crop every time, so no layout shift. */
const img = (id: string, alt: string): ProductImage => ({
  src: `${UNSPLASH}${id}?w=1200&q=80&auto=format&fit=crop`,
  alt,
})

interface Seed
  extends Omit<Product, 'salesVelocity' | 'priceHistory' | 'reviews' | 'id' | 'inStock'> {
  /** Units/day the sparkline starts around, and the 14-day growth factor. */
  velocity: readonly [number, number]
  reviewText: ReadonlyArray<readonly [string, string]>
}

const seeds: Seed[] = [
  /* ----------------------------- Headphones ----------------------------- */
  {
    slug: 'cadence-over-ear',
    name: 'Cadence Over-Ear',
    category: 'headphones',
    price: 249,
    comparePrice: 299,
    rating: 4.7,
    reviewCount: 412,
    stockCount: 34,
    colorway: 'Graphite',
    blurb: 'Closed-back, 40mm drivers, tuned flat enough to mix on.',
    description: [
      'The Cadence is what happens when you stop chasing a bass curve that looks good on a spec sheet. The 40mm drivers are tuned within 3dB of flat from 40Hz to 12kHz, which means a mix you balance on these still holds together in a car.',
      'The earcups are memory foam under lambskin, and they clamp lightly enough to wear through a nine-hour flight. Both cups fold flat. The cable is detachable at both ends, so a chewed connector costs you $12 rather than the headphones.',
    ],
    specs: [
      ['Driver', '40mm dynamic, paper composite'],
      ['Frequency response', '18Hz – 22kHz'],
      ['Impedance', '32 Ω'],
      ['Battery', '52 hours, 8 min quick charge'],
      ['Weight', '284 g'],
      ['Connectivity', 'Bluetooth 5.3, USB-C, 3.5mm'],
      ['In the box', 'Case, USB-C cable, 3.5mm cable'],
    ],
    images: [
      img('1505740420928-5e560c06d30e', 'Cadence Over-Ear headphones in graphite, resting on a yellow background'),
      img('1618366712010-f4ae9c647dcb', 'Cadence Over-Ear headphones seen from the front, earcups together'),
      img('1546435770-a3e426bf472b', 'Cadence Over-Ear headphones in graphite against a plain backdrop'),
    ],
    velocity: [22, 0.34],
    reviewText: [
      ['Finally, headphones that do not lie to me', 'I checked a mix on these against my monitors and the low end matched. That has never happened with a consumer pair.'],
      ['Nine hours, no hotspots', 'Wore them London to Singapore. The clamp is light and my ears did not get sweaty, which is the whole game for me.'],
      ['The detachable cable is the real feature', 'Third pair I have owned where the cable died first. This time it cost me twelve dollars instead of everything.'],
    ],
  },
  {
    slug: 'cadence-studio',
    name: 'Cadence Studio',
    category: 'headphones',
    price: 329,
    rating: 4.8,
    reviewCount: 189,
    stockCount: 12,
    colorway: 'Silver / Tan',
    blurb: 'Open-back reference pair. Wired only, and unapologetic about it.',
    description: [
      'Open-back, wired, no battery, no app. The Studio exists because every wireless feature is a compromise somewhere in the signal path, and some people would rather not make it.',
      'Soundstage is wide enough that you can place instruments left to right without guessing. It leaks — that is what open-back means — so this is a room pair, not a train pair.',
    ],
    specs: [
      ['Driver', '45mm dynamic, open-back'],
      ['Frequency response', '10Hz – 28kHz'],
      ['Impedance', '80 Ω (amp recommended)'],
      ['Cable', '2.5m detachable, 6.3mm + 3.5mm adapter'],
      ['Weight', '312 g'],
      ['Connectivity', 'Wired only'],
      ['In the box', 'Two cables, 6.3mm adapter, spare pads'],
    ],
    images: [
      img('1484704849700-f032a568e944', 'Cadence Studio earcup in close-up, showing the brushed silver housing and tan pad'),
      img('1583394838336-acd977736f90', 'Cadence Studio headphones with the cable attached, on a white surface'),
    ],
    velocity: [9, 0.28],
    reviewText: [
      ['Worth the amp', 'Ran them off a phone first and wondered what the fuss was. On a proper amp they open right up.'],
      ['Leaks like a sieve, sounds like a studio', 'My partner can hear everything from the next room. I do not care.'],
      ['No app. Thank you.', 'Nothing to update, nothing to pair, nothing to break. Plug in and listen.'],
    ],
  },
  {
    slug: 'loop-pro-in-ear',
    name: 'Loop Pro In-Ear',
    category: 'headphones',
    price: 149,
    comparePrice: 179,
    rating: 4.4,
    reviewCount: 623,
    stockCount: 88,
    colorway: 'White',
    blurb: 'Active noise cancelling that actually holds on a plane.',
    description: [
      'Two mics per bud and a feed-forward loop that kills the 80–200Hz drone a cabin makes. It will not erase a toddler, but it turns jet noise into a distant hush.',
      'Four ear-tip sizes in the box, including a genuinely small one. Fit is most of noise cancelling, and most brands ship three tips that all assume the same ear.',
    ],
    specs: [
      ['Driver', '11mm dynamic'],
      ['ANC', 'Hybrid feed-forward, −32dB peak'],
      ['Battery', '9 h buds, 32 h with case'],
      ['Water resistance', 'IPX5'],
      ['Weight', '5.1 g per bud'],
      ['Connectivity', 'Bluetooth 5.3, multipoint'],
      ['In the box', 'Case, four tip sizes, USB-C cable'],
    ],
    images: [
      img('1572569511254-d8f925fe2cbb', 'Loop Pro In-Ear buds beside their charging case'),
      img('1600294037681-c80b4cb5b434', 'Loop Pro In-Ear buds laid out next to the open case'),
    ],
    velocity: [41, 0.22],
    reviewText: [
      ['The small tips changed everything', 'I have narrow ear canals and every other pair falls out. The extra-small tips here seal properly.'],
      ['Cut the plane drone', 'Not silence, but the engine noise drops to nothing and I could actually sleep.'],
      ['Multipoint works properly', 'Laptop and phone at once, switches without me touching anything.'],
    ],
  },
  {
    slug: 'loop-air',
    name: 'Loop Air',
    category: 'headphones',
    price: 89,
    rating: 4.2,
    reviewCount: 941,
    stockCount: 156,
    colorway: 'Prism',
    blurb: 'The pair you can lose. Open-fit, no cancelling, 6g a side.',
    description: [
      'Open-fit buds that sit in the ear rather than sealing it, so you can hear a bike bell and a colleague at the same time. There is no noise cancelling and that is the point.',
      'At this price you will eventually leave one in a taxi, and replacing a single bud costs $29 rather than a new set.',
    ],
    specs: [
      ['Driver', '13mm dynamic, open-fit'],
      ['ANC', 'None — by design'],
      ['Battery', '7 h buds, 28 h with case'],
      ['Water resistance', 'IPX4'],
      ['Weight', '6.0 g per bud'],
      ['Connectivity', 'Bluetooth 5.3'],
      ['In the box', 'Case, USB-C cable'],
    ],
    images: [
      img('1610438235354-a6ae5528385c', 'Loop Air earbuds seated in their gradient charging case'),
      img('1572569511254-d8f925fe2cbb', 'Loop Air earbuds out of the case, showing the open-fit tips'),
    ],
    velocity: [58, 0.16],
    reviewText: [
      ['Perfect for running on roads', 'I can hear traffic. Sealed buds always felt dangerous outdoors.'],
      ['Lost one, replaced one', 'Twenty-nine dollars for a single bud instead of buying the whole set again. More brands should do this.'],
      ['Light enough to forget', 'Two hours of calls and I stopped noticing they were in.'],
    ],
  },

  /* ------------------------------- Watches ------------------------------- */
  {
    slug: 'meridian-38-automatic',
    name: 'Meridian 38 Automatic',
    category: 'watches',
    price: 459,
    rating: 4.9,
    reviewCount: 214,
    stockCount: 9,
    colorway: 'Steel / Cream',
    blurb: '38mm, sapphire, and a movement you can see through the back.',
    description: [
      'A 38mm case, which is the size watches were before everyone decided a wrist was a billboard. It sits under a shirt cuff and it wears smaller than the number suggests because the lugs are short.',
      'The movement is a 24-jewel automatic with a 41-hour reserve, visible through a sapphire caseback. It runs a few seconds fast a day. That is what mechanical means, and it is regulated rather than perfect.',
    ],
    specs: [
      ['Case', '38mm × 9.8mm, 316L stainless'],
      ['Crystal', 'Sapphire, double AR coating'],
      ['Movement', '24-jewel automatic, 41 h reserve'],
      ['Accuracy', '−5 / +12 sec per day'],
      ['Water resistance', '100 m'],
      ['Strap', '19mm, quick-release leather'],
      ['Lug-to-lug', '45.5mm'],
    ],
    images: [
      img('1524805444758-089113d48a6d', 'Meridian 38 Automatic with a cream dial on a brown leather strap'),
      img('1524592094714-0f0654e20314', 'Meridian 38 Automatic held in one hand to show the 38mm case'),
    ],
    velocity: [7, 0.41],
    reviewText: [
      ['38mm is the right size', 'I have small wrists and everything else looked like a dinner plate. This is proportioned like a watch.'],
      ['Runs +6 a day and I love it', 'You do not buy mechanical for accuracy. The sweep alone is worth it.'],
      ['The short lugs matter', 'Lug-to-lug under 46mm means it actually fits. Wish more brands published that number.'],
    ],
  },
  {
    slug: 'meridian-field',
    name: 'Meridian Field',
    category: 'watches',
    price: 289,
    comparePrice: 349,
    rating: 4.6,
    reviewCount: 337,
    stockCount: 41,
    colorway: 'Slate',
    blurb: 'Matte field watch with real lume and a 24-hour inner track.',
    description: [
      'A field watch that follows the brief: high-contrast dial, numerals you can read at a glance, and lume on every hour marker rather than just twelve, three, six and nine.',
      'The case is bead-blasted so it does not flash in daylight, and it will pick up scratches. Those are supposed to be there.',
    ],
    specs: [
      ['Case', '39mm × 11mm, bead-blasted steel'],
      ['Crystal', 'Sapphire, flat'],
      ['Movement', 'Quartz, 3-year cell'],
      ['Lume', 'Super-LumiNova BGW9, all markers'],
      ['Water resistance', '100 m'],
      ['Strap', '20mm sailcloth, spring bars'],
      ['Lug-to-lug', '47mm'],
    ],
    images: [
      img('1434056886845-dac89ffe9b56', 'Meridian Field dial in close-up, showing the numerals and inner 24-hour track'),
      img('1622434641406-a158123450f9', 'Meridian Field on a mesh bracelet, photographed at an angle'),
    ],
    velocity: [16, 0.29],
    reviewText: [
      ['Lume on every marker', 'I can read it at 3am without hunting for the one glowing pip.'],
      ['Does not flash in the sun', 'The blasted finish is matte enough that it never catches the light annoyingly.'],
      ['Beater in the best sense', 'Scratched it in week one and it looked better for it.'],
    ],
  },
  {
    slug: 'halden-quartz-36',
    name: 'Halden Quartz 36',
    category: 'watches',
    price: 179,
    rating: 4.5,
    reviewCount: 502,
    stockCount: 73,
    colorway: 'Steel / White',
    blurb: 'A 36mm dress watch that costs less than the strap on most of them.',
    description: [
      'Thirty-six millimetres, 7mm thick, and it disappears under a cuff. The dial is slate with applied markers rather than printed ones, which is where most watches at this price give the game away.',
      'Quartz, so it keeps time to within fifteen seconds a month and you never have to wind it.',
    ],
    specs: [
      ['Case', '36mm × 7.2mm, polished steel'],
      ['Crystal', 'Sapphire, domed'],
      ['Movement', 'Quartz, 4-year cell'],
      ['Accuracy', '±15 sec per month'],
      ['Water resistance', '50 m'],
      ['Strap', '18mm leather, quick-release'],
      ['Lug-to-lug', '43mm'],
    ],
    images: [
      img('1523275335684-37898b6baf30', 'Halden Quartz 36 with a white strap, photographed from above'),
      img('1508685096489-7aacd43bd3b1', 'Halden Quartz 36 worn on a wrist'),
    ],
    velocity: [24, 0.18],
    reviewText: [
      ['Applied markers at this price', 'Held it next to a watch costing four times more and the dial finishing is not far off.'],
      ['Genuinely thin', 'Seven millimetres. It slides under a shirt cuff without catching.'],
      ['Set it and forget it', 'Six months in, still dead on. No winding, no fuss.'],
    ],
  },
  {
    slug: 'halden-diver',
    name: 'Halden Diver 300',
    category: 'watches',
    price: 339,
    rating: 4.7,
    reviewCount: 268,
    stockCount: 22,
    colorway: 'Black / Steel',
    blurb: '300m rated, ceramic bezel, and a clasp that adjusts on the wrist.',
    description: [
      'Rated to 300 metres with a screw-down crown and a ceramic bezel insert that will not fade to grey after two summers.',
      'The bracelet has a ratcheting clasp with six positions, so you can let it out when your wrist swells in heat instead of living with a loose or tight watch all day.',
    ],
    specs: [
      ['Case', '40mm × 12.8mm, brushed steel'],
      ['Crystal', 'Sapphire, double AR'],
      ['Movement', 'Automatic, 38 h reserve'],
      ['Bezel', '120-click ceramic insert'],
      ['Water resistance', '300 m'],
      ['Bracelet', '20mm steel, ratcheting clasp'],
      ['Lug-to-lug', '47.5mm'],
    ],
    images: [
      img('1596516109370-29001ec8ec36', 'Halden Diver 300 on a steel bracelet, showing the bezel and crown'),
      img('1434056886845-dac89ffe9b56', 'Halden Diver 300 dial in close-up, showing the lumed markers'),
    ],
    velocity: [12, 0.36],
    reviewText: [
      ['The ratcheting clasp is the killer feature', 'Adjust it mid-afternoon without tools. I will never go back.'],
      ['Ceramic bezel stays black', 'My old aluminium insert went grey in one season. No sign of that here.'],
      ['Chunky but balanced', 'Twelve-eight sounds thick and wears fine because the weight sits low.'],
    ],
  },

  /* ------------------------------ Sneakers ------------------------------- */
  {
    slug: 'terrace-low-leather',
    name: 'Terrace Low Leather',
    category: 'sneakers',
    price: 139,
    rating: 4.6,
    reviewCount: 388,
    stockCount: 52,
    colorway: 'Off-White',
    blurb: 'Full-grain leather court shoe, unlined, and properly resoleable.',
    description: [
      'A court shoe in full-grain leather that creases rather than cracks. It is unlined, so it takes the shape of your foot inside a fortnight instead of fighting it for a month.',
      'Cemented sole, but the construction leaves enough of a lip that a cobbler can resole it. Most sneakers at this price cannot be, which is why they become landfill in two years.',
    ],
    specs: [
      ['Upper', 'Full-grain leather, unlined'],
      ['Lining', 'Vegetable-tanned leather'],
      ['Sole', 'Vulcanised rubber, resoleable'],
      ['Insole', 'Removable, cork-latex'],
      ['Sizing', 'True to size, D width'],
      ['Weight', '412 g (UK 9)'],
      ['Made in', 'Portugal'],
    ],
    images: [
      img('1608231387042-66d1773070a5', 'Terrace Low Leather court shoe in off-white, side profile against a dark backdrop'),
      img('1600269452121-4f2416e55c28', 'Terrace Low Leather from the side, showing the vulcanised sole and lacing'),
    ],
    velocity: [19, 0.31],
    reviewText: [
      ['Softened up in two weeks', 'Unlined leather moulds to your foot fast. No break-in blisters at all, which is a first for me.'],
      ['Creased instead of cracking', 'Six months daily wear. The leather has softened and there is not a single crack.'],
      ['Getting them resoled', 'Cobbler took one look and said no problem. Try that with a knit runner.'],
    ],
  },
  {
    slug: 'terrace-canvas',
    name: 'Terrace Canvas',
    category: 'sneakers',
    price: 89,
    comparePrice: 110,
    rating: 4.3,
    reviewCount: 714,
    stockCount: 118,
    colorway: 'Ecru',
    blurb: '12oz organic canvas, washable, and it dries overnight.',
    description: [
      'Twelve-ounce organic canvas over the same last as the leather Terrace. It goes in a washing machine at 30°C and comes out fine, which is the entire argument for canvas.',
      'It is not waterproof and will not pretend to be. In a downpour your socks are getting wet.',
    ],
    specs: [
      ['Upper', '12oz organic cotton canvas'],
      ['Lining', 'Unlined'],
      ['Sole', 'Vulcanised rubber'],
      ['Insole', 'Removable, cork-latex'],
      ['Care', 'Machine wash 30°C, air dry'],
      ['Weight', '338 g (UK 9)'],
      ['Made in', 'Portugal'],
    ],
    images: [
      img('1595950653106-6c9ebd614d3a', 'Terrace Canvas sneaker in a pale colourway, side profile'),
      img('1560769629-975ec94e6a86', 'A pair of Terrace Canvas sneakers displayed on a plinth'),
    ],
    velocity: [37, 0.19],
    reviewText: [
      ['Washed them, they were fine', 'Muddy festival weekend, straight in the machine, good as new.'],
      ['Same last as the leather pair', 'I own both and the fit is identical. Ordering was easy.'],
      ['Wet feet in rain', 'Exactly as described, so no complaint. Canvas is canvas.'],
    ],
  },
  {
    slug: 'runner-knit-one',
    name: 'Runner Knit One',
    category: 'sneakers',
    price: 159,
    rating: 4.5,
    reviewCount: 445,
    stockCount: 64,
    colorway: 'Bone / Ember',
    blurb: 'One-piece knit upper, 8mm drop, built for pavement.',
    description: [
      'The upper is knitted as a single piece, so there are no overlays to rub and nothing to delaminate. Sizing runs half a size small because knit does not stretch the way mesh does.',
      'An 8mm drop and a firm midsole — this is a road shoe for steady miles, not a max-cushion marshmallow.',
    ],
    specs: [
      ['Upper', 'One-piece engineered knit'],
      ['Midsole', 'Supercritical EVA foam'],
      ['Drop', '8mm (26mm / 18mm)'],
      ['Outsole', 'Blown rubber, road pattern'],
      ['Sizing', 'Order a half size up'],
      ['Weight', '246 g (UK 9)'],
      ['Made in', 'Vietnam'],
    ],
    images: [
      img('1600185365926-3a2ce3cdb9eb', 'Runner Knit One in bone and ember, side profile'),
      img('1606107557195-0e29a4b5b4aa', 'Runner Knit One in the high-visibility colourway'),
      img('1520256862855-398228c41684', 'Runner Knit One knit upper photographed under coloured light'),
    ],
    velocity: [28, 0.26],
    reviewText: [
      ['Size up, they are right about that', 'Ordered true to size first, too snug. The half size up is perfect.'],
      ['No rubbing anywhere', 'One-piece upper means no seams. Twenty kilometres and zero hot spots.'],
      ['Firm, not mushy', 'If you want a cushioned cloud this is not it. I wanted road feel and got it.'],
    ],
  },
  {
    slug: 'trail-mid-waterproof',
    name: 'Trail Mid Waterproof',
    category: 'sneakers',
    price: 189,
    rating: 4.7,
    reviewCount: 296,
    stockCount: 38,
    colorway: 'Slate / Amber',
    blurb: 'Membrane-lined mid with 4mm lugs and a gusseted tongue.',
    description: [
      'A waterproof membrane with a gusseted tongue, which is the part most brands skip — a waterproof boot with an open tongue just funnels water in at the ankle.',
      'Four-millimetre lugs bite in mud and are loud on tarmac. The rock plate means you can stop watching where you put your feet.',
    ],
    specs: [
      ['Upper', 'Recycled ripstop + waterproof membrane'],
      ['Tongue', 'Fully gusseted'],
      ['Outsole', '4mm lugs, sticky rubber'],
      ['Protection', 'Full-length rock plate'],
      ['Drop', '6mm (28mm / 22mm)'],
      ['Weight', '398 g (UK 9)'],
      ['Made in', 'Vietnam'],
    ],
    images: [
      img('1520219306100-ec4afeeefe58', 'A pair of Trail Mid Waterproof boots standing on rock'),
      img('1520639888713-7851133b1ed0', 'Trail Mid Waterproof boots being laced'),
    ],
    velocity: [14, 0.38],
    reviewText: [
      ['Gusseted tongue actually works', 'Ankle-deep stream crossing, dry socks. That is the whole review.'],
      ['Rock plate saved my feet', 'Scottish scree for six hours and I never felt a stone.'],
      ['Loud on pavement', 'The lugs clack on tarmac. Fine, they are trail shoes.'],
    ],
  },

  /* ------------------------------ Backpacks ------------------------------ */
  {
    slug: 'transit-22l-daypack',
    name: 'Transit 22L Daypack',
    category: 'backpacks',
    price: 129,
    comparePrice: 159,
    rating: 4.8,
    reviewCount: 531,
    stockCount: 47,
    colorway: 'Black',
    blurb: 'Clamshell daypack that opens flat and holds a 16" laptop.',
    description: [
      'It opens flat like a suitcase, so you pack it on a bed rather than shovelling things down a tube. The laptop sleeve is suspended — it does not touch the bottom of the bag, so setting the pack down does not put your machine on the floor.',
      'Twenty-two litres is the largest bag that still counts as a personal item on most carriers. That is not a coincidence.',
    ],
    specs: [
      ['Volume', '22 L'],
      ['Laptop', 'Fits 16", suspended sleeve'],
      ['Fabric', '420D recycled nylon, DWR finish'],
      ['Opening', 'Full clamshell, YKK AquaGuard'],
      ['Carry-on', 'Personal-item compliant'],
      ['Weight', '1.1 kg'],
      ['Warranty', 'Lifetime on hardware'],
    ],
    images: [
      img('1585916420730-d7f95e942d43', 'Transit 22L Daypack in black, front view'),
      img('1581605405669-fcdf81165afa', 'Transit 22L Daypack carried by its haul handle'),
      img('1553062407-98eeb64c6a62', 'Transit 22L Daypack in the navy colourway, standing upright'),
    ],
    velocity: [31, 0.44],
    reviewText: [
      ['The suspended sleeve is genius', 'Put the bag down hard a hundred times and my laptop has never touched the ground.'],
      ['Fits under every seat so far', 'Six airlines, no questions. Twenty-two litres is the sweet spot.'],
      ['Packs like a suitcase', 'Opening flat changes everything. I can see all my stuff at once.'],
    ],
  },
  {
    slug: 'transit-rolltop-26l',
    name: 'Transit Rolltop 26L',
    category: 'backpacks',
    price: 169,
    rating: 4.6,
    reviewCount: 302,
    stockCount: 29,
    colorway: 'Coyote',
    blurb: 'Rolltop that flexes from 18 to 26 litres depending on the day.',
    description: [
      'A rolltop closure means the bag is 18 litres on a normal day and 26 when you are carrying gym kit, without ever looking half empty.',
      'The main fabric is a waxed cotton-nylon blend that stiffens in cold and softens in the hand over a year. It is water-resistant, not waterproof — a rolltop with three folds gets close, but the seams are not taped.',
    ],
    specs: [
      ['Volume', '18 – 26 L (rolltop)'],
      ['Laptop', 'Fits 16", padded sleeve'],
      ['Fabric', 'Waxed cotton-nylon blend'],
      ['Closure', 'Rolltop, magnetic buckle'],
      ['Water resistance', 'Resistant; seams untaped'],
      ['Weight', '1.0 kg'],
      ['Warranty', 'Lifetime on hardware'],
    ],
    images: [
      img('1577733966973-d680bffd2e80', 'Transit Rolltop 26L in waxed canvas with leather straps, top rolled down'),
      img('1491637639811-60e2756cc1c7', 'Transit Rolltop 26L held up outdoors, showing the rolled closure'),
    ],
    velocity: [17, 0.27],
    reviewText: [
      ['Flexes with the day', 'Small on Monday, gym kit on Tuesday, same bag and it never looks floppy.'],
      ['Wax is aging nicely', 'A year in and it has a patina where the strap rubs. Looks better than new.'],
      ['Honest about waterproofing', 'They say resistant, not waterproof. Heavy rain got through the seams eventually. Fair enough.'],
    ],
  },
  {
    slug: 'field-tote-pack-18l',
    name: 'Field Tote Pack 18L',
    category: 'backpacks',
    price: 99,
    rating: 4.4,
    reviewCount: 419,
    stockCount: 92,
    colorway: 'Sand',
    blurb: 'Tote by the handles, backpack by the straps. 18 litres either way.',
    description: [
      'Grab the handles and it is a tote; pull the straps out of their back pocket and it is a backpack. The conversion takes about three seconds and does not involve clipping anything.',
      'There is one internal pocket and no organiser panel. If you want fourteen slots for cables, this is the wrong bag.',
    ],
    specs: [
      ['Volume', '18 L'],
      ['Laptop', 'Fits 14", padded sleeve'],
      ['Fabric', '600D recycled poly canvas'],
      ['Carry', 'Tote handles + stowable straps'],
      ['Pockets', 'One internal, one external zip'],
      ['Weight', '760 g'],
      ['Warranty', 'Two years'],
    ],
    images: [
      img('1509762774605-f07235a08f1f', 'Field Tote Pack 18L in sand, standing on a rock at sunrise'),
      img('1622560480605-d83c853bc5c3', 'Field Tote Pack 18L in the mauve colourway, front view'),
    ],
    velocity: [26, 0.21],
    reviewText: [
      ['Two bags, one bag', 'Tote for the office, backpack for the cycle home. Three seconds to switch.'],
      ['One pocket is enough', 'I was sceptical. Turns out I do not need fourteen compartments.'],
      ['14" only', 'My 16" laptop does not fit. Read the spec, that is on me.'],
    ],
  },
  {
    slug: 'summit-30l-weekender',
    name: 'Summit 30L Weekender',
    category: 'backpacks',
    price: 199,
    rating: 4.7,
    reviewCount: 187,
    stockCount: 18,
    colorway: 'Forest',
    blurb: 'Three nights, a load-lifting harness, and a proper hip belt.',
    description: [
      'Thirty litres with a real harness — load lifters, a framesheet, and a hip belt that carries weight on your hips rather than hanging off your shoulders. At this volume that stops being a nice extra.',
      'It is a three-night bag. Pack cubes, a laptop and boots all fit, and the compression straps pull it down to something that does not look absurd when it is half full.',
    ],
    specs: [
      ['Volume', '30 L'],
      ['Laptop', 'Fits 16", suspended sleeve'],
      ['Fabric', '630D ballistic nylon, DWR'],
      ['Harness', 'Framesheet, load lifters, hip belt'],
      ['Compression', 'Four side straps'],
      ['Weight', '1.4 kg'],
      ['Warranty', 'Lifetime on hardware'],
    ],
    images: [
      img('1622260614153-03223fb72052', 'Summit 30L Weekender in forest green, propped against a rock'),
      img('1547949003-9792a18a2601', 'Summit 30L Weekender showing the harness and hip belt'),
    ],
    velocity: [11, 0.33],
    reviewText: [
      ['A hip belt that does something', 'Most bags this size have a token strap. This one actually transfers the load.'],
      ['Three nights, carry-on only', 'Fits the overhead, holds a long weekend. No checked bag again.'],
      ['Compresses down well', 'Half full it still looks like a bag rather than a sack.'],
    ],
  },
]

/** The catalog. Numeric series and reviews are derived once, at module load. */
export const products: Product[] = seeds.map((seed, i) => {
  const { velocity, reviewText, ...rest } = seed
  return {
    ...rest,
    id: `p-${String(i + 1).padStart(2, '0')}`,
    inStock: rest.stockCount > 0,
    salesVelocity: salesSeries(rest.slug, velocity[0], velocity[1]),
    priceHistory: priceSeries(rest.slug, rest.price, rest.comparePrice),
    reviews: reviewsFor(rest.slug, rest.rating, reviewText),
  }
})

export const getProduct = (slug: string): Product | undefined =>
  products.find((p) => p.slug === slug)

export const byCategory = (category: Category): Product[] =>
  products.filter((p) => p.category === category)

/** The four cards in the homepage "Trending now" row — highest weekly delta wins. */
export const trending = (count = 4): Product[] =>
  [...products].sort((a, b) => weeklyDelta(b) - weeklyDelta(a)).slice(0, count)

/** Best-sellers grid: most-reviewed first, which is the honest proxy for units shifted. */
export const bestSellers = (count = 8): Product[] =>
  [...products].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, count)

/** Same category first, then anything else, so the rail is never short. */
export const related = (product: Product, count = 4): Product[] =>
  products
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .concat(products.filter((p) => p.category !== product.category))
    .slice(0, count)

export const priceBounds = (): [number, number] => {
  const all = products.map((p) => p.price)
  return [Math.min(...all), Math.max(...all)]
}

/* -------------------------------------------------------------------------- */
/*  Card projection                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Exactly what a product card renders — nothing more.
 *
 * /shop filters in the browser, so its data has to cross the network. Sending
 * whole `Product` objects would ship every description, spec table and review
 * with them; this projection is roughly a fifth of the size, and `Product`
 * satisfies it structurally, so server pages can keep passing products straight
 * through.
 */
export type ProductCardData = Pick<
  Product,
  | 'slug'
  | 'name'
  | 'category'
  | 'price'
  | 'comparePrice'
  | 'rating'
  | 'reviewCount'
  | 'inStock'
  | 'stockCount'
  | 'colorway'
  | 'blurb'
  | 'salesVelocity'
> & { images: [ProductImage] | ProductImage[] }

export const toCardData = (p: Product): ProductCardData => ({
  slug: p.slug,
  name: p.name,
  category: p.category,
  price: p.price,
  comparePrice: p.comparePrice,
  rating: p.rating,
  reviewCount: p.reviewCount,
  inStock: p.inStock,
  stockCount: p.stockCount,
  colorway: p.colorway,
  blurb: p.blurb,
  salesVelocity: p.salesVelocity,
  // Only the first image is ever shown on a card.
  images: [p.images[0]],
})
