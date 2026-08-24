import { Container, CopyButton } from '@the_viveksingh/vivek-ui'
import { site } from '@/lib/site'
import { GitHubIcon, TerminalIcon } from './icons'

/**
 * The open-source strip above the navbar: what this project is, and the one
 * command a developer needs to take it away.
 *
 * A Server Component — only the `CopyButton` ships JavaScript, and it brings its
 * own `'use client'`.
 *
 * It degrades by dropping content rather than shrinking it: the tagline goes
 * first, then the full clone command (replaced by a short "Clone" label that
 * copies the identical string), then the labels on the two links. At 320px what
 * is left is still a working copy button and two reachable links.
 */
export function TemplateBar() {
  return (
    <div className="sk-topbar">
      <Container size="xl">
        <div className="sk-topbar__inner">
          <p className="sk-topbar__intro">
            <span className="sk-topbar__pill">Free &amp; open source</span>
            <span className="sk-topbar__tagline">
              A Next.js 16 e-commerce template you can clone and ship. MIT licensed.
            </span>
          </p>

          <div className="sk-topbar__actions">
            {/*
              The visible command and the copied string are the same value, so
              what a reader sees is exactly what lands on their clipboard.
            */}
            <code className="sk-topbar__clone">
              <TerminalIcon />
              <span>{site.cloneCommand}</span>
            </code>

            {/*
              Short visible label, full accessible name. There is a second copy
              button in the footer, so "Copy" alone would leave a screen-reader
              user with two identically named controls and no way to tell them
              apart.
            */}
            <CopyButton
              className="sk-topbar__copy"
              value={site.cloneCommand}
              size="sm"
              variant="outline"
              label={
                <>
                  Copy<span className="sk-sr-only"> the git clone command</span>
                </>
              }
              copiedLabel="Copied"
              errorLabel="Press ⌘C"
            />

            <a className="sk-topbar__link" href={site.useTemplate} target="_blank" rel="noopener noreferrer">
              <span>Use this template</span>
            </a>

            <a
              className="sk-topbar__link sk-topbar__link--icon"
              href={site.repo}
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitHubIcon />
              <span className="sk-topbar__linklabel">GitHub</span>
              <span className="sk-sr-only"> — view the ShopKit source (opens in a new tab)</span>
            </a>
          </div>
        </div>
      </Container>
    </div>
  )
}
