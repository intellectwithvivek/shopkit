/**
 * The ShopKit mark, as data.
 *
 * A tapered tote on a flat amber tile: the body is a trapezoid, the handle a
 * single arch — the same arch used by the hero's colour-block composition, so
 * the logo and the storefront are speaking one visual language.
 *
 * Everything is expressed on a 32-unit grid and lives here rather than inside a
 * component, because the non-visual surfaces need it too: the web manifest, the
 * Apple touch icon and the Open Graph card are all generated, and none of them
 * can import JSX.
 *
 * The first draft of this mark put a narrow, centred handle on a squat body,
 * which rendered as a padlock — right shape language, completely wrong meaning
 * for a shop. The wide flared body plus a wide, shallow handle is what makes it
 * read as a bag, and it holds down to 16px.
 *
 * Colours are literals, not CSS tokens: the mark has to survive contexts with no
 * stylesheet at all (a browser tab, a bookmark, an OS home screen), so it
 * carries its own palette and looks identical in light and dark themes.
 */

export const BRAND = {
  amber: '#f59e0b',
  ink: '#1c1207',
  /** Tile corner radius on the 32-unit grid. */
  radius: 7.5,
  /** Bag handle — one arch. Stroked, never filled. */
  handle: 'M11 12a5 5 0 0 1 10 0',
  handleWidth: 2.1,
  /** Bag body — trapezoid, tapering slightly toward a rounded base. */
  body: 'M7 12h18l-1.3 11.4a2.5 2.5 0 0 1-2.5 2.2H10.8a2.5 2.5 0 0 1-2.5-2.2L7 12Z',
} as const

/**
 * The mark as a standalone SVG document.
 *
 * `app/icon.svg` is a static file (an SVG favicon stays crisp at every size and
 * costs a few hundred bytes), and this function is what generates it — see
 * `npm run brand:icons`. Keeping one generator means the static file can never
 * drift away from the constants above.
 */
export function markSvg(size = 32): string {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${size}" height="${size}" role="img" aria-label="ShopKit">`,
    `<rect width="32" height="32" rx="${BRAND.radius}" fill="${BRAND.amber}"/>`,
    `<path d="${BRAND.handle}" fill="none" stroke="${BRAND.ink}" stroke-width="${BRAND.handleWidth}" stroke-linecap="round"/>`,
    `<path d="${BRAND.body}" fill="${BRAND.ink}"/>`,
    `</svg>`,
  ].join('')
}
