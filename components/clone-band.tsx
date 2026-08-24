import { Code, Container, CopyButton, Text } from '@the_viveksingh/vivek-ui'
import { site } from '@/lib/site'
import { GitHubIcon, StarIcon, TerminalIcon } from './icons'

/**
 * The "take this template" band, directly above the footer on every page.
 *
 * It lives here rather than inside the `Footer`'s `brand` slot because that slot
 * is capped at `max-width: 24rem` — a two-column credit block put in there gets
 * crushed to about 145px a side and clips the clone command. A full-width band
 * is both roomier and a stronger call to action.
 */
export function CloneBand() {
  return (
    <section className="sk-cloneband" aria-labelledby="clone-band-title">
      <Container size="xl">
        <div className="sk-cloneband__inner">
          <div className="sk-cloneband__copy">
            <p className="sk-eyebrow">Free &amp; open source · MIT</p>
            <h2 id="clone-band-title" className="sk-cloneband__title">
              Take the whole store
            </h2>
            <Text tone="muted">
              Every screen here comes from one package with zero runtime dependencies.
              Clone it, swap <code>data/products.ts</code> for your own catalog, and ship.
            </Text>
          </div>

          <div className="sk-cloneband__action">
            <div className="sk-install">
              <Code className="sk-install__code">
                <TerminalIcon />
                <span>{site.cloneCommand}</span>
              </Code>
              <CopyButton
                value={site.cloneCommand}
                size="sm"
                variant="outline"
                label={
                  <>
                    Copy<span className="sk-sr-only"> the git clone command</span>
                  </>
                }
                copiedLabel="Copied"
              />
            </div>

            <div className="sk-footcta">
              <a
                className="sk-btnlink"
                href={site.useTemplate}
                target="_blank"
                rel="noopener noreferrer"
              >
                Use this template
              </a>
              <a
                className="sk-btnlink sk-btnlink--ghost"
                href={site.repo}
                target="_blank"
                rel="noopener noreferrer"
              >
                <StarIcon /> Star on GitHub
              </a>
              <a
                className="sk-btnlink sk-btnlink--ghost"
                href={site.deploy}
                target="_blank"
                rel="noopener noreferrer"
              >
                Deploy to Vercel
              </a>
              <a
                className="sk-btnlink sk-btnlink--ghost"
                href={site.repo}
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitHubIcon /> Source
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
