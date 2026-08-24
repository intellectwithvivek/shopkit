'use client'

import { useState } from 'react'
import { Button, ButtonGroup, Text } from '@the_viveksingh/vivek-ui'
import { AddToCart } from '@/components/cart/add-to-cart'

/**
 * Quantity plus the two buy actions.
 *
 * The quantity lives here rather than in the cart context because it is a
 * property of this one interaction, not of the cart — leaving the page should
 * forget it.
 */
export function ProductBuyBox({
  slug,
  name,
  inStock,
  stockCount,
}: {
  slug: string
  name: string
  inStock: boolean
  stockCount: number
}) {
  const [qty, setQty] = useState(1)
  const max = Math.min(10, Math.max(1, stockCount))

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <Text size="sm" weight="semibold" id="qty-label">
          Quantity
        </Text>
        <ButtonGroup attached label="Quantity" aria-describedby="qty-label">
          <Button
            variant="outline"
            aria-label="Decrease quantity"
            disabled={qty <= 1}
            onClick={() => setQty((q) => Math.max(1, q - 1))}
          >
            −
          </Button>
          {/*
            Output, not input: the value is announced through the live region
            rather than being a text field a user could type "abc" into.
          */}
          <Button variant="outline" aria-hidden="true" tabIndex={-1} style={{ minWidth: '3.25rem' }}>
            {qty}
          </Button>
          <Button
            variant="outline"
            aria-label="Increase quantity"
            disabled={qty >= max}
            onClick={() => setQty((q) => Math.min(max, q + 1))}
          >
            +
          </Button>
        </ButtonGroup>
        <span aria-live="polite" className="sk-sr-only">
          Quantity {qty}
        </span>
      </div>

      <div className="sk-pdp__buy">
        <AddToCart
          slug={slug}
          name={name}
          qty={qty}
          size="lg"
          label="Add to cart"
          disabled={!inStock}
        />
        <AddToCart
          slug={slug}
          name={name}
          qty={qty}
          size="lg"
          variant="outline"
          label="Buy now"
          disabled={!inStock}
          thenCheckout
        />
      </div>
    </div>
  )
}
