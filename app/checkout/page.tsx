import type { Metadata } from 'next'
import { Container, Section } from '@the_viveksingh/vivek-ui'
import { CheckoutFlow } from '@/components/checkout/checkout-flow'

export const metadata: Metadata = {
  title: 'Checkout',
  description:
    'A four-step demo checkout: address, shipping, payment and review. No real payment is processed.',
  alternates: { canonical: '/checkout' },
  // Nothing here is worth indexing, and a cart page in search results is noise.
  robots: { index: false, follow: true },
}

export default function CheckoutPage() {
  return (
    <Section padding="lg" size="xl">
      <Container size="full" flush>
        <CheckoutFlow />
      </Container>
    </Section>
  )
}
