'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button, Drawer, EmptyState, IconButton, Text } from '@the_viveksingh/vivek-ui'
import { formatPrice } from '@/data/products'
import { useCart } from './cart-provider'

/**
 * The cart. A `Drawer` rather than a page, because losing your place in a grid
 * to check what you have added is the oldest annoyance in online shopping.
 */
export function CartDrawer() {
  const { lines, subtotal, count, isOpen, closeCart, setQty, remove } = useCart()

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeCart()
      }}
      side="end"
      size="md"
    >
      <Drawer.Header>
        <Drawer.Title>
          Your cart{count > 0 ? ` (${count})` : ''}
        </Drawer.Title>
        <Drawer.CloseButton />
      </Drawer.Header>

      <Drawer.Body>
        {lines.length === 0 ? (
          <EmptyState
            title="Nothing in the cart yet"
            description="Add something from the shop and it will show up here."
            actions={
              <Button asChild onClick={closeCart}>
                <Link href="/shop">Browse the shop</Link>
              </Button>
            }
          />
        ) : (
          <div>
            {lines.map(({ product, qty, lineTotal }) => (
              <article className="sk-cartline" key={product.slug}>
                <div className="sk-cartline__thumb">
                  <Image
                    src={product.images[0].src}
                    alt={product.images[0].alt}
                    fill
                    sizes="72px"
                  />
                </div>

                <div>
                  <Text weight="semibold" size="sm">
                    <Link
                      href={`/product/${product.slug}`}
                      onClick={closeCart}
                      style={{ color: 'inherit' }}
                    >
                      {product.name}
                    </Link>
                  </Text>
                  <Text size="sm" tone="muted">
                    {product.colorway} · {formatPrice(product.price)}
                  </Text>

                  <div className="sk-cartline__row">
                    {/*
                      A stepper made of two buttons and a live count, rather than a
                      number input: on a phone a numeric keypad for "2 → 3" is a
                      worse interaction than a plus button.
                    */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <IconButton
                        size="sm"
                        variant="outline"
                        aria-label={`Decrease quantity of ${product.name}`}
                        onClick={() => setQty(product.slug, qty - 1)}
                      >
                        −
                      </IconButton>
                      <Text size="sm" aria-live="polite" style={{ minWidth: '1.5ch', textAlign: 'center' }}>
                        {qty}
                      </Text>
                      <IconButton
                        size="sm"
                        variant="outline"
                        aria-label={`Increase quantity of ${product.name}`}
                        disabled={qty >= 10}
                        onClick={() => setQty(product.slug, qty + 1)}
                      >
                        +
                      </IconButton>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Text size="sm" weight="semibold">
                        {formatPrice(lineTotal)}
                      </Text>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => remove(product.slug)}
                      >
                        Remove
                        <span className="sk-sr-only"> {product.name} from the cart</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Drawer.Body>

      {lines.length > 0 && (
        <Drawer.Footer>
          <div style={{ width: '100%' }}>
            <div className="sk-line sk-line--total">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <Text size="sm" tone="muted" style={{ display: 'block', marginBlockEnd: '0.75rem' }}>
              Shipping and tax are worked out at checkout.
            </Text>
            <Button asChild fullWidth size="lg" onClick={closeCart}>
              <Link href="/checkout">Checkout</Link>
            </Button>
          </div>
        </Drawer.Footer>
      )}
    </Drawer>
  )
}
