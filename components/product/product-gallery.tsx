'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Carousel } from '@the_viveksingh/vivek-ui'
import type { ProductImage } from '@/data/products'

/**
 * The gallery: a `Carousel` for the big images, plus a thumbnail strip.
 *
 * The thumbnails move the carousel the same way its own arrows and dots do —
 * by scrolling `.vk-carousel__track`, which is a scroll-snap container. That is
 * the documented seam (the track is the component; the controls reach it through
 * the DOM), so this adds a second set of controls without reimplementing the
 * carousel or forcing the slides onto the client.
 */
export function ProductGallery({
  images,
  productName,
}: {
  images: ProductImage[]
  productName: string
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  const trackOf = useCallback(
    () => rootRef.current?.querySelector<HTMLElement>('.vk-carousel__track') ?? null,
    [],
  )

  const goTo = useCallback(
    (index: number) => {
      const track = trackOf()
      const slide = track?.children[index]
      if (!track || !(slide instanceof HTMLElement)) return
      const left =
        slide.getBoundingClientRect().left -
        track.getBoundingClientRect().left +
        track.scrollLeft
      if (typeof track.scrollTo === 'function') track.scrollTo({ left, behavior: 'smooth' })
      else track.scrollLeft = left
    },
    [trackOf],
  )

  /* Keep the thumbnail highlight honest when the user drags or arrows the track. */
  useEffect(() => {
    const track = trackOf()
    if (!track) return

    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const origin = track.getBoundingClientRect().left
        let nearest = 0
        let shortest = Infinity
        Array.from(track.children).forEach((child, i) => {
          if (!(child instanceof HTMLElement)) return
          const distance = Math.abs(child.getBoundingClientRect().left - origin)
          if (distance < shortest) {
            shortest = distance
            nearest = i
          }
        })
        setActive(nearest)
      })
    }

    track.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      track.removeEventListener('scroll', onScroll)
    }
  }, [trackOf])

  return (
    <div>
      {/*
        No arrows on purpose. With `showArrows` the library insets the track by
        the arrow width on both sides so the buttons sit in the gutters, which
        leaves the neighbouring slide peeking into the frame — fine for a
        content carousel, wrong for a bordered product photo. The thumbnail strip
        below is the navigation, and the track itself stays focusable and
        arrow-key scrollable either way.
      */}
      <Carousel
        ref={rootRef}
        slidesPerView={1}
        gap={2}
        showArrows={false}
        showDots={false}
        label={`${productName} — product images`}
        slideLabel={(index, total) => `Image ${index + 1} of ${total}`}
      >
        {images.map((image) => (
          <div className="sk-gallery__frame" key={image.src}>
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority={image === images[0]}
              sizes="(min-width: 60rem) 46rem, 96vw"
            />
          </div>
        ))}
      </Carousel>

      {/*
        A tablist would be wrong here: these do not reveal panels, they scroll a
        carousel. Plain buttons with `aria-pressed` say what is actually true.
      */}
      <div className="sk-thumbs" role="group" aria-label="Choose an image">
        {images.map((image, index) => (
          <button
            type="button"
            key={image.src}
            className="sk-thumb"
            aria-pressed={active === index}
            onClick={() => goTo(index)}
          >
            <Image src={image.src} alt="" fill sizes="80px" />
            <span className="sk-sr-only">
              Show image {index + 1} of {images.length}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
