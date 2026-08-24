import { BRAND } from '@/lib/brand'

/**
 * The ShopKit identity as React.
 *
 * Geometry comes from `lib/brand.ts`, which is also what generates the favicon,
 * the Apple touch icon and the manifest icons — so the tab, the home screen and
 * the navbar can never show different marks.
 */

interface LogoMarkProps {
  size?: number
  /** Drop the amber tile and draw the glyph in `currentColor` instead. */
  bare?: boolean
  className?: string
}

/**
 * The mark alone. `aria-hidden`, because everywhere it appears it sits beside
 * the wordmark — announcing it again would only add noise.
 */
export function LogoMark({ size = 28, bare = false, className }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {!bare && <rect width="32" height="32" rx={BRAND.radius} fill={BRAND.amber} />}
      <path
        d={BRAND.handle}
        fill="none"
        stroke={bare ? 'currentColor' : BRAND.ink}
        strokeWidth={BRAND.handleWidth}
        strokeLinecap="round"
      />
      <path d={BRAND.body} fill={bare ? 'currentColor' : BRAND.ink} />
    </svg>
  )
}

/**
 * Mark plus wordmark.
 *
 * The wordmark is live text rather than a traced path, so it inherits the page
 * font, scales with the reader's type size, and can be selected and searched.
 */
export function Logo({ size = 26 }: { size?: number }) {
  return (
    <span className="sk-lockup">
      <LogoMark size={size} />
      <span className="sk-brand">
        Shop<span className="sk-brand__mark">Kit</span>
      </span>
    </span>
  )
}
