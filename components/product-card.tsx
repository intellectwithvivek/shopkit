import Image from 'next/image'
import Link from 'next/link'
import { Badge, Rating, Text } from '@the_viveksingh/vivek-ui'
import { Sparkline } from '@the_viveksingh/vivek-ui/charts'
import { formatPrice, weeklyDelta, type ProductCardData } from '@/data/products'
import { AddToCart } from './cart/add-to-cart'

/** Shared by the trending row, the best-seller grid, /shop and the related rail. */
interface ProductCardProps {
  product: ProductCardData
  /** Adds the 14-day sales-velocity spark — the homepage "Trending now" row. */
  showVelocity?: boolean
  /** Set on the handful of cards above the fold so they are not lazy-loaded. */
  priority?: boolean
  /** Passed to next/image so it can pick a sensible candidate per breakpoint. */
  sizes?: string
}

const DEFAULT_SIZES =
  '(min-width: 75rem) 22rem, (min-width: 48rem) 33vw, (min-width: 30rem) 50vw, 100vw'

export function ProductCard({
  product,
  showVelocity = false,
  priority = false,
  sizes = DEFAULT_SIZES,
}: ProductCardProps) {
  const onSale = typeof product.comparePrice === 'number'
  const discount = onSale
    ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)
    : 0
  const delta = showVelocity ? weeklyDelta(product) : 0
  const href = `/product/${product.slug}`

  return (
    <article className="sk-pcard">
      <div className="sk-pcard__media">
        <div className="sk-pcard__flags">
          {onSale && (
            <Badge tone="primary" variant="solid" size="sm">
              Save {discount}%
            </Badge>
          )}
          {!product.inStock && (
            <Badge tone="neutral" variant="solid" size="sm">
              Sold out
            </Badge>
          )}
          {product.inStock && product.stockCount <= 12 && (
            <Badge tone="warning" variant="soft" size="sm">
              Only {product.stockCount} left
            </Badge>
          )}
        </div>

        {/*
          The whole media panel is the link, but the accessible name comes from
          the heading link below rather than being duplicated here — two links to
          the same place with the same name is noise in a screen reader's list.
        */}
        <Link href={href} tabIndex={-1} aria-hidden="true">
          <Image
            src={product.images[0].src}
            alt={product.images[0].alt}
            fill
            sizes={sizes}
            priority={priority}
          />
        </Link>
      </div>

      <div className="sk-pcard__body">
        <Text size="sm" tone="muted" style={{ fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {product.colorway}
        </Text>

        <h3 className="sk-pcard__name">
          <Link href={href}>{product.name}</Link>
        </h3>

        {/*
          `Rating` is a client component, so no function props may be handed to
          it from here — the review count is visible text beside the stars
          instead of a `formatLabel` callback, which reads better anyway.
        */}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <Rating value={product.rating} readOnly size="sm" allowHalf />
          <Text size="sm" tone="muted">
            {product.rating.toFixed(1)}
            <span className="sk-sr-only"> out of 5</span> ({product.reviewCount})
          </Text>
        </span>

        {showVelocity ? (
          <div className="sk-spark">
            <div className="sk-spark__chart">
              <Sparkline
                data={product.salesVelocity}
                height={26}
                width={110}
                fill
                showLastPoint
                curve="smooth"
                title={`${product.name} — units sold per day over the last 14 days`}
                yLabel="Units sold"
                xLabel="Day"
              />
            </div>
            <span className="sk-spark__delta">
              ▲ {delta}%<span className="sk-sr-only"> more units sold</span> this week
            </span>
          </div>
        ) : (
          <Text size="sm" tone="muted" lineClamp={2}>
            {product.blurb}
          </Text>
        )}

        <div className="sk-pcard__foot">
          <p className="sk-price">
            <span className="sk-price__now">{formatPrice(product.price)}</span>
            {onSale && (
              <span className="sk-price__was">
                <span className="sk-sr-only">Was </span>
                {formatPrice(product.comparePrice!)}
              </span>
            )}
          </p>

          <AddToCart
            slug={product.slug}
            name={product.name}
            label="Add to cart"
            size="sm"
            disabled={!product.inStock}
          />
        </div>
      </div>
    </article>
  )
}
