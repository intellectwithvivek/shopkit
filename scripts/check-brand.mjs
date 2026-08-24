/**
 * Guards the one duplication in the brand assets.
 *
 * `lib/brand.ts` is the source of truth for the mark, and every rendered
 * surface (navbar, Apple touch icon, Open Graph card, manifest) imports it. The
 * exception is `app/icon.svg`: Next.js wants a real file there, and a static SVG
 * favicon is worth having — it stays crisp at every size for a few hundred bytes.
 *
 * That file is therefore a generated copy, and a copy can drift. This asserts it
 * has not.
 *
 * Deliberately dependency-free and plain JS, parsed with a regex rather than by
 * importing the TypeScript: the project supports Node 20.9+, which cannot strip
 * types, so an import here would fail on the oldest supported runtime.
 *
 *   node scripts/check-brand.mjs        (npm run check:brand)
 *
 * If it fails, regenerate the SVG from the constants and commit it.
 */
import { readFileSync } from 'node:fs'

const brandSource = readFileSync(new URL('../lib/brand.ts', import.meta.url), 'utf8')
const svg = readFileSync(new URL('../app/icon.svg', import.meta.url), 'utf8')

/** Pull `key: 'value'` or `key: 1.23` out of the BRAND object literal. */
function constant(key) {
  const match = brandSource.match(new RegExp(`\\n\\s*${key}:\\s*(?:'([^']*)'|([\\d.]+))`))
  if (!match) throw new Error(`check-brand: could not find "${key}" in lib/brand.ts`)
  return match[1] ?? match[2]
}

const expected = {
  amber: constant('amber'),
  ink: constant('ink'),
  radius: constant('radius'),
  handle: constant('handle'),
  handleWidth: constant('handleWidth'),
  body: constant('body'),
}

const problems = []
for (const [key, value] of Object.entries(expected)) {
  if (!svg.includes(value)) {
    problems.push(`app/icon.svg is missing BRAND.${key} (${JSON.stringify(value)})`)
  }
}

if (problems.length > 0) {
  console.error('Brand assets are out of sync with lib/brand.ts:\n')
  for (const p of problems) console.error('  ✗ ' + p)
  console.error('\nRegenerate app/icon.svg from markSvg() in lib/brand.ts and commit it.')
  process.exit(1)
}

console.log(`app/icon.svg matches lib/brand.ts (${Object.keys(expected).length} values checked)`)
