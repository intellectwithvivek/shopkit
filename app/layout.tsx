import type { Metadata } from 'next'
import { Bricolage_Grotesque, Inter } from 'next/font/google'
import { ThemeProvider, ToastProvider, themeScript } from '@the_viveksingh/vivek-ui'

import '@the_viveksingh/vivek-ui/styles.css'
import '@the_viveksingh/vivek-ui/charts.css'
import './globals.css'

import { CartDrawer } from '@/components/cart/cart-drawer'
import { CartProvider } from '@/components/cart/cart-provider'
import { CloneBand } from '@/components/clone-band'
import { SiteFooter } from '@/components/site-footer'
import { SiteNavbar } from '@/components/site-navbar'
import { TemplateBar } from '@/components/template-bar'
import { searchIndex } from '@/lib/search'
import { site } from '@/lib/site'

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    // Route segments set only their own name; the store name is appended here.
    default: 'Free Next.js E-commerce Template (Open Source) — ShopKit | VivekUI',
    template: '%s — ShopKit',
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: 'Vivek Kumar Singh', url: 'https://vivekkumarsingh.in/' }],
  creator: 'Vivek Kumar Singh',
  keywords: [
    'free nextjs ecommerce template open source',
    'nextjs 16 template',
    'react ecommerce template',
    'vivekui',
    'open source store template',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: site.name,
    url: '/',
    title: 'Free Next.js E-commerce Template (Open Source) — ShopKit | VivekUI',
    description: site.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Next.js E-commerce Template (Open Source) — ShopKit | VivekUI',
    description: site.description,
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  // Built on the server: the palette gets a small index instead of the catalog.
  const entries = searchIndex()

  return (
    <html lang="en" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        {/*
          Synchronous and blocking, on purpose. The server cannot know which
          theme this visitor chose, so without this the browser paints a light
          page before React can read localStorage. No amount of React fixes it.
        */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeProvider defaultTheme="system">
          <ToastProvider position="bottom-end">
            <CartProvider>
              <a href="#main" className="sk-skip">
                Skip to content
              </a>
              <TemplateBar />
              <SiteNavbar entries={entries} />
              <main id="main">{children}</main>
              <CloneBand />
              <SiteFooter />
              <CartDrawer />
            </CartProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
