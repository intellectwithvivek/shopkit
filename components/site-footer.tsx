import { Code, CopyButton, Footer, Text } from '@the_viveksingh/vivek-ui'
import { categories } from '@/data/products'
import { site, utm, vivekUI } from '@/lib/site'

/**
 * Server component. The only thing here that ships JavaScript is the
 * `CopyButton`, which carries its own `'use client'`.
 */
export function SiteFooter() {
  return (
    <Footer
      background="muted"
      className="sk-rule-top"
      columns={[
        {
          title: 'Shop',
          links: [
            { label: 'All products', href: '/shop' },
            ...categories.map((c) => ({
              label: c.label,
              href: `/shop?category=${c.slug}`,
            })),
          ],
        },
        {
          title: 'Help',
          links: [
            { label: 'Shipping', href: '/#faq' },
            { label: 'Returns', href: '/#faq' },
            { label: 'Checkout', href: '/checkout' },
          ],
        },
        {
          title: 'This template',
          links: [
            { label: 'Built with VivekUI', href: '/built-with' },
            {
              label: 'Source on GitHub',
              href: site.repo,
              target: '_blank',
              rel: 'noopener noreferrer',
            },
            {
              label: 'Use this template',
              href: site.useTemplate,
              target: '_blank',
              rel: 'noopener noreferrer',
            },
            {
              label: 'Deploy to Vercel',
              href: site.deploy,
              target: '_blank',
              rel: 'noopener noreferrer',
            },
            {
              label: 'Report an issue',
              href: site.issues,
              target: '_blank',
              rel: 'noopener noreferrer',
            },
            {
              label: 'MIT licence',
              href: site.license,
              target: '_blank',
              rel: 'noopener noreferrer',
            },
          ],
        },
      ]}
      brand={
        /*
          One stacked block only. `.vk-footer__brand` is capped at 24rem, so a
          side-by-side layout in here gets crushed — the clone command lives in
          `CloneBand` above the footer instead, where it has the full width.
        */
        <section className="sk-credit" aria-labelledby="foot-vivekui">
          <Text size="sm" id="foot-vivekui">
            Built with ❤️ using <strong>VivekUI</strong> — 91 React components · 6 SVG
            charts · zero runtime dependencies. One install, one CSS import, no config.
          </Text>

          <div className="sk-install">
            <Code className="sk-install__code">
              <span>{vivekUI.install}</span>
            </Code>
            <CopyButton
              value={vivekUI.install}
              size="sm"
              variant="outline"
              label={<>Copy<span className="sk-sr-only"> the npm install command</span></>}
              copiedLabel="Copied"
            />
          </div>

          <Text size="sm" tone="muted">
            <a href={utm(vivekUI.docs, 'footer')} target="_blank" rel="noopener noreferrer">
              Docs
            </a>
            {' · '}
            <a href={vivekUI.npm} target="_blank" rel="noopener noreferrer">
              npm
            </a>
            {' · '}
            <a href={vivekUI.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            {' · '}
            <a href={utm(vivekUI.author, 'footer')} target="_blank" rel="noopener noreferrer">
              Vivek Kumar Singh
            </a>
          </Text>
        </section>
      }
      copyright={
        /*
          A single element, deliberately. `.vk-footer__bottom` is a flex row with
          `justify-content: space-between`, so a fragment of several children gets
          spread across the full width — which threw the licence link to the far
          right, mid-sentence.
        */
        <Text size="sm" tone="muted">
          ShopKit is a free, open-source template —{' '}
          <a href={site.license} target="_blank" rel="noopener noreferrer">
            MIT licensed
          </a>
          . Demo store: no real payment is processed and no order is ever shipped.
        </Text>
      }
    />
  )
}
