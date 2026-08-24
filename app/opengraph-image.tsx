import { ImageResponse } from 'next/og'
import { BRAND } from '@/lib/brand'

/**
 * The default social card for every route that does not supply its own.
 *
 * Product pages override it in `generateMetadata` with their own photography;
 * this covers the homepage, /shop and /built-with, which would otherwise declare
 * `summary_large_image` with no image at all.
 *
 * Satori (which renders this) supports a subset of CSS — flexbox yes, grid no —
 * so every box below sets `display: flex` explicitly.
 */
export const alt =
  'ShopKit — a free, open-source Next.js e-commerce template built with VivekUI'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#fffbeb',
          padding: '72px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* The real mark, so the social card and the browser tab agree. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
          <svg width="76" height="76" viewBox="0 0 32 32">
            <rect width="32" height="32" rx={BRAND.radius} fill={BRAND.amber} />
            <path
              d={BRAND.handle}
              fill="none"
              stroke={BRAND.ink}
              strokeWidth={BRAND.handleWidth}
              strokeLinecap="round"
            />
            <path d={BRAND.body} fill={BRAND.ink} />
          </svg>
          <div
            style={{
              display: 'flex',
              fontSize: '44px',
              fontWeight: 700,
              color: '#1d1d1f',
              letterSpacing: '-1.5px',
            }}
          >
            ShopKit
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              fontSize: '30px',
              fontWeight: 600,
              color: '#92400e',
              letterSpacing: '4px',
            }}
          >
            FREE · OPEN SOURCE · MIT
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: '74px',
              fontWeight: 700,
              color: '#1d1d1f',
              letterSpacing: '-2.5px',
              marginTop: '12px',
              lineHeight: 1.1,
            }}
          >
            A Next.js 16 store,
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: '74px',
              fontWeight: 700,
              color: '#92400e',
              letterSpacing: '-2.5px',
              lineHeight: 1.1,
            }}
          >
            ready to clone
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '2px solid #f3d5a3',
            paddingTop: '28px',
          }}
        >
          <div style={{ display: 'flex', fontSize: '30px', color: '#1d1d1f', fontWeight: 600 }}>
            ⚡ Built with VivekUI
          </div>
          <div style={{ display: 'flex', fontSize: '26px', color: '#78716c' }}>
            91 components · 6 charts · zero deps
          </div>
        </div>
      </div>
    ),
    size,
  )
}
