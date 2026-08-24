import Link from 'next/link'
import { Button, Container, EmptyState, Section } from '@the_viveksingh/vivek-ui'

export default function NotFound() {
  return (
    <Section padding="xl" size="md">
      <Container size="full" flush>
        <EmptyState
          size="lg"
          headingLevel={1}
          title="We cannot find that page"
          description="The link may be old, or the product may have been renamed. The shop is the fastest way back."
          actions={
            <>
              <Button asChild>
                <Link href="/shop">Browse the shop</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Go home</Link>
              </Button>
            </>
          }
        />
      </Container>
    </Section>
  )
}
