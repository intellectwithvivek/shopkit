import type { MetadataRoute } from 'next'
import { BRAND } from '@/lib/brand'
import { site } from '@/lib/site'

/**
 * The web app manifest, served at /manifest.webmanifest.
 *
 * Icons are PNG rather than the SVG favicon because Android's install flow and
 * launcher masking want raster sizes. `maskable` is declared on the 512 so
 * adaptive-icon launchers crop the amber tile instead of letterboxing it.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — free Next.js e-commerce template`,
    short_name: site.name,
    description: site.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: BRAND.amber,
    categories: ['shopping', 'developer'],
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
