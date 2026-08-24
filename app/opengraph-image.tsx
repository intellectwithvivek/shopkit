import { ImageResponse } from 'next/og'

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
        {/* The amber slabs, echoing the hero's art direction. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              display: 'flex',
              width: '54px',
              height: '54px',
              backgroundColor: '#f59e0b',
              borderRadius: '54px 54px 8px 8px',
            }}
          />
          <div
            style={{
              display: 'flex',
              width: '54px',
              height: '54px',
              backgroundColor: '#fde68a',
              borderRadius: '8px',
            }}
          />
          <div
            style={{
              display: 'flex',
              width: '54px',
              height: '54px',
              backgroundColor: '#d97706',
              borderRadius: '999px',
            }}
          />
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
              fontSize: '92px',
              fontWeight: 700,
              color: '#1d1d1f',
              letterSpacing: '-3px',
              marginTop: '12px',
            }}
          >
            ShopKit
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: '38px',
              color: '#57534e',
              marginTop: '10px',
              lineHeight: 1.3,
            }}
          >
            A Next.js 16 e-commerce template
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
