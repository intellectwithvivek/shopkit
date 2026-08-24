/**
 * Renders one JSON-LD block.
 *
 * `<` is escaped to its unicode form so a value containing `</script>` can never
 * break out of the tag. The data here is all static, but a template gets copied
 * and then fed a CMS, and that is exactly when this stops being theoretical.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  )
}
