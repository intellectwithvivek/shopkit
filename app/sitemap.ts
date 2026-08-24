import type { MetadataRoute } from 'next'
import { categories, products } from '@/data/products'
import { SITE_URL } from '@/lib/site'

const url = (path: string): string => new URL(path, SITE_URL).toString()

export default function sitemap(): MetadataRoute.Sitemap {
  // One timestamp for the whole file, so a rebuild does not claim that every
  // page changed at sixteen slightly different moments.
  const lastModified = new Date()

  return [
    { url: url('/'), lastModified, changeFrequency: 'daily', priority: 1 },
    { url: url('/shop'), lastModified, changeFrequency: 'daily', priority: 0.9 },
    { url: url('/built-with'), lastModified, changeFrequency: 'monthly', priority: 0.7 },
    ...categories.map((category) => ({
      url: url(`/shop?category=${category.slug}`),
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
    ...products.map((product) => ({
      url: url(`/product/${product.slug}`),
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    // /checkout is deliberately absent — it is noindex.
  ]
}
