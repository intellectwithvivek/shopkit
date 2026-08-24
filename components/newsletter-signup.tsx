'use client'

import { useState } from 'react'
import { Newsletter, type NewsletterStatus } from '@the_viveksingh/vivek-ui'

/**
 * The signup form needs an `onSubscribe` handler, and a function cannot cross
 * the server/client boundary — so this thin wrapper is the client island and the
 * homepage stays a Server Component.
 *
 * There is no mailing list behind it. It resolves after a beat so the success
 * state is real rather than mimed, and says so.
 */
export function NewsletterSignup() {
  const [status, setStatus] = useState<NewsletterStatus>('idle')

  return (
    <Newsletter
      title="New arrivals, twice a month"
      description="Restocks, price drops and the occasional note about how something was made. No more than two emails a month."
      placeholder="you@example.com"
      buttonLabel="Subscribe"
      status={status}
      successMessage="You're on the list — well, you would be. This is a demo store, so nothing was stored."
      note="Demo form: no address is collected or sent anywhere."
      onSubscribe={async () => {
        setStatus('submitting')
        await new Promise((resolve) => setTimeout(resolve, 600))
        setStatus('success')
      }}
    />
  )
}
