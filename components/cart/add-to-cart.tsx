'use client'

import { Button, useToast, type ButtonProps } from '@the_viveksingh/vivek-ui'
import { useRouter } from 'next/navigation'
import { useCart } from './cart-provider'

interface AddToCartProps {
  slug: string
  name: string
  qty?: number
  label?: string
  size?: ButtonProps['size']
  variant?: ButtonProps['variant']
  fullWidth?: boolean
  disabled?: boolean
  /** "Buy now" — add, then go straight to checkout instead of toasting. */
  thenCheckout?: boolean
}

/**
 * The one interactive island a product card needs.
 *
 * Cards themselves stay Server Components; only this button ships to the
 * browser, which is why a 16-product grid does not become a 16-component
 * client tree.
 */
export function AddToCart({
  slug,
  name,
  qty = 1,
  label = 'Add to cart',
  size,
  variant,
  fullWidth,
  disabled,
  thenCheckout,
}: AddToCartProps) {
  const { add, openCart } = useCart()
  const { toast } = useToast()
  const router = useRouter()

  return (
    <Button
      size={size}
      variant={variant}
      fullWidth={fullWidth}
      disabled={disabled}
      onClick={() => {
        add(slug, qty)
        if (thenCheckout) {
          router.push('/checkout')
          return
        }
        toast({
          // A stable id keeps repeated presses replacing one toast rather than
          // stacking a tower of them.
          id: `added-${slug}`,
          tone: 'success',
          title: 'Added to cart',
          description: qty > 1 ? `${qty} × ${name}` : name,
          action: (
            <Button size="sm" variant="outline" onClick={openCart}>
              View cart
            </Button>
          ),
        })
      }}
    >
      {label}
      <span className="sk-sr-only"> — {name}</span>
    </Button>
  )
}
