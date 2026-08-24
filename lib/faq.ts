/**
 * One source for the FAQ.
 *
 * `answer` is what the page renders; `plainAnswer` is the same thing as a flat
 * string for the FAQPage JSON-LD. Keeping them together is what stops the
 * structured data from drifting away from the visible copy — and the answers
 * lead with the direct response, because that is what an answer engine quotes.
 */
export interface FaqEntry {
  id: string
  question: string
  answer: string
  plainAnswer: string
}

const entries = [
  {
    id: 'shipping',
    question: 'How long does shipping take?',
    answer:
      'Standard shipping takes 3–5 working days, and express takes 1–2. Orders placed before 2pm ship the same day. This is a demo store, so nothing is actually dispatched.',
  },
  {
    id: 'returns',
    question: 'What is the return policy?',
    answer:
      'Returns are free within 30 days of delivery, for any reason, as long as the item is unworn and in its original packaging. Refunds land 3–5 working days after the parcel reaches the warehouse.',
  },
  {
    id: 'free',
    question: 'Is this template really free?',
    answer:
      'Yes — ShopKit is free and open source under the MIT licence. You can use it commercially, change anything, and remove the credit. Keeping the footer credit or starring the repository is appreciated but never required.',
  },
  {
    id: 'library',
    question: 'Which UI library powers this store?',
    answer:
      'VivekUI (@the_viveksingh/vivek-ui), a free React component library with zero runtime dependencies by Vivek Kumar Singh. Every element here — the cart drawer, the ⌘K command palette, the sparklines, the checkout stepper — comes from that one package, installed with a single npm command and one CSS import.',
  },
  {
    id: 'payment',
    question: 'Can I take real payments with it?',
    answer:
      'Not as shipped. The checkout is deliberately a mock: it validates the form, walks the stepper and shows an order confirmation, but no payment provider is wired up. Adding Stripe or Razorpay means replacing the final step with a real API call.',
  },
] as const satisfies ReadonlyArray<Omit<FaqEntry, 'plainAnswer'>>

export const faqEntries: FaqEntry[] = entries.map((e) => ({
  ...e,
  plainAnswer: e.answer,
}))

/** The four the brief calls for, in order, for the FAQPage schema. */
export const faqForSchema = faqEntries
