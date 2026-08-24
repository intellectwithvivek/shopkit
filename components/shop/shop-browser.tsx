'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Checkbox,
  EmptyState,
  Grid,
  Pagination,
  Rating,
  Select,
  Skeleton,
  Slider,
  Switch,
  Text,
} from '@the_viveksingh/vivek-ui'
import {
  categories,
  formatPrice,
  type Category,
  type ProductCardData,
} from '@/data/products'
import { ProductCard } from '@/components/product-card'

const PER_PAGE = 8

const SORTS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
  { value: 'reviews', label: 'Most reviewed' },
] as const

type Sort = (typeof SORTS)[number]['value']

interface ShopBrowserProps {
  products: ProductCardData[]
  bounds: [number, number]
  /** Seeded from `?category=` and `?sort=` so navbar and homepage links land right. */
  initialCategories: Category[]
  initialSort: Sort
}

export function ShopBrowser({
  products,
  bounds,
  initialCategories,
  initialSort,
}: ShopBrowserProps) {
  const [selected, setSelected] = useState<Category[]>(initialCategories)
  const [price, setPrice] = useState<[number, number]>(bounds)
  const [minRating, setMinRating] = useState(0)
  const [inStockOnly, setInStockOnly] = useState(false)
  const [sort, setSort] = useState<Sort>(initialSort)
  const [page, setPage] = useState(1)

  const results = useMemo(() => {
    const filtered = products.filter((p) => {
      if (selected.length > 0 && !selected.includes(p.category)) return false
      if (p.price < price[0] || p.price > price[1]) return false
      if (minRating > 0 && p.rating < minRating) return false
      if (inStockOnly && !p.inStock) return false
      return true
    })

    const sorted = [...filtered]
    switch (sort) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating)
        break
      case 'reviews':
        sorted.sort((a, b) => b.reviewCount - a.reviewCount)
        break
      default:
        // "Featured" keeps the catalog's own curated order.
        break
    }
    return sorted
  }, [products, selected, price, minRating, inStockOnly, sort])

  /*
    A short pending state so the Skeleton has something to represent.

    Filtering sixteen products in memory is instantaneous, so `useTransition`
    would never report pending — but a real catalog behind an API would, and this
    is the state a template needs to show. The signature is what changed, not the
    result, so flipping a filter that matches nothing still shows the skeleton
    before the empty state.
  */
  const signature = JSON.stringify([selected, price, minRating, inStockOnly, sort])
  const [filtering, setFiltering] = useState(false)
  const [lastSignature, setLastSignature] = useState(signature)

  /*
    Adjusted during render rather than in an effect. React handles a setState
    that happens while rendering by re-running this component immediately, before
    anything is committed to the DOM — so the skeleton and page reset are part of
    the same paint as the new filter, and no cascading render is queued.
  */
  if (lastSignature !== signature) {
    setLastSignature(signature)
    setFiltering(true)
    setPage(1)
  }

  // Only the timeout touches state here, so the effect body stays side-effect free.
  useEffect(() => {
    if (!filtering) return
    const timer = setTimeout(() => setFiltering(false), 220)
    return () => clearTimeout(timer)
  }, [filtering])

  const pageCount = Math.ceil(results.length / PER_PAGE)
  const shown = results.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const toggleCategory = (slug: Category) => {
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    )
  }

  const isFiltered =
    selected.length > 0 ||
    minRating > 0 ||
    inStockOnly ||
    price[0] !== bounds[0] ||
    price[1] !== bounds[1]

  const reset = () => {
    setSelected([])
    setPrice(bounds)
    setMinRating(0)
    setInStockOnly(false)
  }

  return (
    <div className="sk-shop">
      {/* ------------------------------------------------------- Filter rail */}
      <aside className="sk-rail" aria-label="Filter products">
        <div className="sk-rail__group">
          <fieldset>
            <legend className="sk-rail__legend">Category</legend>
            <div style={{ display: 'grid', gap: '0.55rem' }}>
              {categories.map((c) => {
                const count = products.filter((p) => p.category === c.slug).length
                return (
                  <Checkbox
                    key={c.slug}
                    label={`${c.label} (${count})`}
                    checked={selected.includes(c.slug)}
                    onChange={() => toggleCategory(c.slug)}
                  />
                )
              })}
            </div>
          </fieldset>
        </div>

        <div className="sk-rail__group">
          <span className="sk-rail__legend" id="price-label">
            Price
          </span>
          <Slider
            range
            min={bounds[0]}
            max={bounds[1]}
            step={10}
            value={price}
            onValueChange={setPrice}
            showValue
            formatValue={(v) => formatPrice(v)}
            minLabel="Minimum price"
            maxLabel="Maximum price"
            aria-labelledby="price-label"
          />
        </div>

        <div className="sk-rail__group">
          <span className="sk-rail__legend" id="rating-legend">
            Minimum rating
          </span>
          {/*
            `aria-label` rather than `label`: `label` renders a visible <legend>,
            which duplicated the heading above it on screen. This keeps one
            visible label and one accessible name.
          */}
          <Rating
            value={minRating}
            onValueChange={setMinRating}
            allowHalf
            aria-label="Minimum rating"
            allowClear
          />
          <Text size="sm" tone="muted" style={{ display: 'block', marginBlockStart: '0.4rem' }}>
            {minRating > 0 ? `${minRating} stars and up` : 'Any rating'}
          </Text>
        </div>

        <div className="sk-rail__group">
          <Switch
            label="In stock only"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.currentTarget.checked)}
          />
        </div>

        {isFiltered && (
          <Button variant="outline" size="sm" onClick={reset}>
            Clear all filters
          </Button>
        )}
      </aside>

      {/* ----------------------------------------------------------- Results */}
      <div>
        <div className="sk-toolbar">
          {/*
            aria-live so a filter change announces the new count. Without it a
            screen-reader user flips a checkbox and hears nothing at all.
          */}
          <Text size="sm" aria-live="polite">
            {filtering
              ? 'Filtering…'
              : `${results.length} ${results.length === 1 ? 'product' : 'products'}${
                  isFiltered ? ' match your filters' : ''
                }`}
          </Text>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label htmlFor="sort" style={{ fontSize: '0.875rem' }}>
              Sort
            </label>
            <Select
              id="sort"
              size="sm"
              value={sort}
              onChange={(e) => setSort(e.currentTarget.value as Sort)}
              options={SORTS.map((s) => ({ value: s.value, label: s.label }))}
            />
          </div>
        </div>

        {filtering ? (
          <Grid cols={{ base: 1, sm: 2, lg: 3 }} gap={4} aria-hidden="true">
            {Array.from({ length: Math.max(shown.length, 3) }, (_, i) => (
              <div key={i}>
                <Skeleton variant="rect" height={240} />
                <div style={{ paddingBlockStart: '0.75rem' }}>
                  <Skeleton variant="text" lines={3} />
                </div>
              </div>
            ))}
          </Grid>
        ) : shown.length === 0 ? (
          <EmptyState
            title="Nothing matches those filters"
            description="Try widening the price range, or clearing the category selection."
            actions={
              <Button variant="outline" onClick={reset}>
                Clear all filters
              </Button>
            }
          />
        ) : (
          <>
            <Grid cols={{ base: 1, sm: 2, lg: 3 }} gap={4}>
              {shown.map((product) => (
                <ProductCard
                  key={product.slug}
                  product={product}
                  sizes="(min-width: 60rem) 22rem, (min-width: 34rem) 44vw, 92vw"
                />
              ))}
            </Grid>

            {pageCount > 1 && (
              /*
                A plain block, NOT a flex row.

                `.vk-pagination` declares `container-type: inline-size`, so it is
                a container-query container: its own width cannot depend on its
                contents. As a flex item that resolves to zero width, which put it
                permanently into its own `@container (width <= 22rem)` state —
                every page number except the current one hidden, and the arrows
                stacked vertically, even on a 1440px screen.

                Given the full width it centres its list itself.
              */
              <div className="sk-pagination-wrap">
                <Pagination
                  page={page}
                  pageCount={pageCount}
                  onPageChange={setPage}
                  showFirstLast={pageCount > 3}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
