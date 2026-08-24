import { categoryLabel, type Product } from '@/data/products'
import { SITE_URL, site } from './site'

/**
 * JSON-LD builders.
 *
 * Every value here is derived from the same data the page renders, which is the
 * only way structured data stays truthful — a hand-maintained block drifts from
 * the visible page and Google eventually notices.
 */

const abs = (path: string): string => new URL(path, SITE_URL).toString()

export interface Crumb {
  name: string
  path: string
}

export function breadcrumbList(crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: abs(crumb.path),
    })),
  }
}

export function productSchema(product: Product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.blurb,
    sku: product.id,
    category: categoryLabel(product.category),
    color: product.colorway,
    image: product.images.map((i) => i.src),
    brand: { '@type': 'Brand', name: site.name },
    offers: {
      '@type': 'Offer',
      url: abs(`/product/${product.slug}`),
      price: product.price,
      priceCurrency: 'USD',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
    review: product.reviews.map((r) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.author },
      datePublished: r.date.slice(0, 10),
      name: r.title,
      reviewBody: r.body,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.rating,
        bestRating: 5,
        worstRating: 1,
      },
    })),
  }
}

/** /shop — an ItemList of the products actually listed on the page. */
export function itemListSchema(products: Product[], name: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: products.length,
    itemListElement: products.map((product, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: abs(`/product/${product.slug}`),
      name: product.name,
    })),
  }
}

export function faqSchema(items: ReadonlyArray<{ question: string; plainAnswer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.plainAnswer },
    })),
  }
}

export function storeSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    name: site.name,
    url: SITE_URL,
    description: site.description,
    slogan: site.tagline,
  }
}
