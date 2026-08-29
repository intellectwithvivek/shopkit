'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  Field,
  Input,
  RadioGroup,
  Stepper,
  Table,
  Text,
  Timeline,
} from '@the_viveksingh/vivek-ui'
import { formatPrice } from '@/data/products'
import { useCart } from '@/components/cart/cart-provider'

const STEPS = ['Address', 'Shipping', 'Payment', 'Review'] as const

const SHIPPING = [
  { value: 'standard', label: 'Standard — 3–5 working days', price: 6, description: 'Free on orders over $75' },
  { value: 'express', label: 'Express — 1–2 working days', price: 12, description: 'Ordered before 2pm ships today' },
  { value: 'nominated', label: 'Nominated day', price: 18, description: 'Pick a date at the door' },
] as const

const PAYMENTS = [
  { value: 'card', label: 'Card', description: 'Visa, Mastercard, Amex' },
  { value: 'upi', label: 'UPI', description: 'Pay from any UPI app' },
  { value: 'cod', label: 'Cash on delivery', description: 'Pay the courier, +$3 handling' },
] as const

const FREE_SHIPPING_OVER = 75

interface Address {
  name: string
  email: string
  line1: string
  city: string
  postcode: string
  country: string
}

const EMPTY_ADDRESS: Address = {
  name: '',
  email: '',
  line1: '',
  city: '',
  postcode: '',
  country: '',
}

const REQUIRED: Array<keyof Address> = ['name', 'email', 'line1', 'city', 'postcode', 'country']

export function CheckoutFlow() {
  const { lines, subtotal, clear, ready } = useCart()

  const [step, setStep] = useState(0)
  const [address, setAddress] = useState<Address>(EMPTY_ADDRESS)
  const [errors, setErrors] = useState<Partial<Record<keyof Address, string>>>({})
  const [shipping, setShipping] = useState<string>('standard')
  const [payment, setPayment] = useState<string>('card')
  const [orderId, setOrderId] = useState<string | null>(null)

  const shippingOption = SHIPPING.find((s) => s.value === shipping)!
  const shippingCost =
    shipping === 'standard' && subtotal >= FREE_SHIPPING_OVER ? 0 : shippingOption.price
  const codFee = payment === 'cod' ? 3 : 0
  const tax = Math.round((subtotal + shippingCost + codFee) * 0.08)
  const total = subtotal + shippingCost + codFee + tax

  /* ---------------------------------------------------------- Order placed */
  if (orderId) {
    return (
      <div style={{ maxWidth: '38rem' }}>
        <Badge tone="success" variant="soft" pill>
          Order placed
        </Badge>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', margin: '0.6rem 0 0.5rem' }}>
          Thank you — that is all set
        </h1>
        <Text tone="muted" style={{ display: 'block', marginBlockEnd: '0.75rem' }}>
          Your order number is <strong>{orderId}</strong>. We have emailed a confirmation
          to {address.email || 'your inbox'}.
        </Text>

        <Alert tone="info" variant="soft" title="Demo store">
          No real payment was processed and nothing will be shipped. ShopKit is a free
          open-source template — the checkout validates and totals correctly, but there is
          no payment provider behind it.
        </Alert>

        <h2 style={{ fontSize: '1.15rem', margin: '1.75rem 0 0.85rem' }}>Order status</h2>
        <Timeline>
          <Timeline.Item
            status="complete"
            title="Order placed"
            timestamp="Just now"
            description={`${lines.length} ${lines.length === 1 ? 'line' : 'lines'} · ${formatPrice(total)} paid by ${
              PAYMENTS.find((p) => p.value === payment)!.label
            }`}
          />
          <Timeline.Item
            status="current"
            title="Packing"
            timestamp="Within 24 hours"
            description="Picked and checked at the warehouse."
          />
          <Timeline.Item
            status="pending"
            title="Shipped"
            timestamp={shippingOption.label.split(' — ')[0]}
            description="You will get a tracking link by email."
          />
          <Timeline.Item
            status="pending"
            title="Delivered"
            description="Signature required for orders over $200."
          />
        </Timeline>

        <div className="sk-cta-row" style={{ marginBlockStart: '1.75rem' }}>
          <Button asChild>
            <Link href="/shop">Keep shopping</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/built-with">See how this was built</Link>
          </Button>
        </div>
      </div>
    )
  }

  /* ------------------------------------------------------------ Empty cart */
  if (ready && lines.length === 0) {
    return (
      <EmptyState
        // headingLevel 1 because this replaces the page's <h1>. Without it the
        // empty-cart state would be the one view on the site with no h1 at all.
        headingLevel={1}
        size="lg"
        title="Your cart is empty"
        description="Add something to it and the checkout will have something to total up."
        actions={
          <Button asChild>
            <Link href="/shop">Browse the shop</Link>
          </Button>
        }
      />
    )
  }

  const validateAddress = (): boolean => {
    const next: Partial<Record<keyof Address, string>> = {}
    for (const key of REQUIRED) {
      if (!address[key].trim()) next[key] = 'This field is required'
    }
    // Deliberately loose: a strict email regex rejects valid addresses.
    if (address.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)) {
      next.email = 'That does not look like an email address'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const next = () => {
    if (step === 0 && !validateAddress()) return
    setStep((s) => Math.min(STEPS.length - 1, s + 1))
  }

  const placeOrder = () => {
    // Generated on click, never during render — a random id in render would
    // differ between the server HTML and hydration.
    const id = `SK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    setOrderId(id)
    clear()
  }

  const field = (key: keyof Address, label: string, extra?: Partial<Record<string, string>>) => (
    <Field label={label} error={errors[key]} required>
      <Input
        value={address[key]}
        onChange={(e) => {
          /*
            Read the value BEFORE handing it to the updater.

            React calls a functional updater lazily, during the render pass — and
            by then it has reset `currentTarget` on the synthetic event to null.
            Reading it inside the callback throws "Cannot read properties of null",
            which unmounts the whole form on the first keystroke.
          */
          const value = e.currentTarget.value
          setAddress((a) => ({ ...a, [key]: value }))
        }}
        {...extra}
      />
    </Field>
  )

  return (
    <div className="sk-checkout">
      <div>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', margin: '0 0 1.25rem' }}>
          Checkout
        </h1>

        <Stepper
          steps={STEPS as unknown as string[]}
          activeStep={step}
          clickable
          // Forward movement has to go through validation, so only completed
          // steps are reachable by clicking the indicator.
          onStepChange={(index) => setStep((current) => (index < current ? index : current))}
          style={{ marginBlockEnd: '2rem' }}
        />

        {step === 0 && (
          <section aria-label="Delivery address">
            <div className="sk-form-grid">
              <div className="sk-span-2">{field('name', 'Full name', { autoComplete: 'name' })}</div>
              <div className="sk-span-2">
                {field('email', 'Email', { type: 'email', autoComplete: 'email' })}
              </div>
              <div className="sk-span-2">
                {field('line1', 'Address', { autoComplete: 'address-line1' })}
              </div>
              {field('city', 'City', { autoComplete: 'address-level2' })}
              {field('postcode', 'Postcode', { autoComplete: 'postal-code' })}
              <div className="sk-span-2">
                {field('country', 'Country', { autoComplete: 'country-name' })}
              </div>
            </div>
          </section>
        )}

        {step === 1 && (
          <section aria-label="Shipping method">
            <RadioGroup
              name="shipping"
              label="How should we send it?"
              value={shipping}
              onValueChange={setShipping}
              options={SHIPPING.map((option) => ({
                value: option.value,
                label: `${option.label} — ${
                  option.value === 'standard' && subtotal >= FREE_SHIPPING_OVER
                    ? 'Free'
                    : formatPrice(option.price)
                }`,
                description: option.description,
              }))}
            />
            {subtotal >= FREE_SHIPPING_OVER && (
              <Alert tone="success" variant="soft" style={{ marginBlockStart: '1rem' }}>
                Your order qualifies for free standard shipping.
              </Alert>
            )}
          </section>
        )}

        {step === 2 && (
          <section aria-label="Payment method">
            <Alert tone="warning" variant="soft" title="Demo store — no real payment is processed">
              Every option below is a mock. No card details are collected, nothing is
              charged, and no payment provider is wired up.
            </Alert>
            <div style={{ marginBlockStart: '1.25rem' }}>
              <RadioGroup
                name="payment"
                label="How would you like to pay?"
                value={payment}
                onValueChange={setPayment}
                options={PAYMENTS.map((option) => ({
                  value: option.value,
                  label: option.label,
                  description: option.description,
                }))}
              />
            </div>
          </section>
        )}

        {step === 3 && (
          <section aria-label="Review your order">
            <Table size="sm" bordered>
              <Table.Caption visuallyHidden>Your order details</Table.Caption>
              <Table.Body>
                <Table.Row>
                  <Table.HeaderCell scope="row">Deliver to</Table.HeaderCell>
                  <Table.Cell>
                    {address.name}
                    <br />
                    {address.line1}, {address.city} {address.postcode}
                    <br />
                    {address.country}
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.HeaderCell scope="row">Email</Table.HeaderCell>
                  <Table.Cell>{address.email}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.HeaderCell scope="row">Shipping</Table.HeaderCell>
                  <Table.Cell>{shippingOption.label}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.HeaderCell scope="row">Payment</Table.HeaderCell>
                  <Table.Cell>{PAYMENTS.find((p) => p.value === payment)!.label} (mock)</Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>

            <Alert tone="info" variant="soft" style={{ marginBlockStart: '1.25rem' }}>
              Placing this order will not charge you. It generates an order number and an
              example status timeline.
            </Alert>
          </section>
        )}

        <div className="sk-cta-row" style={{ marginBlockStart: '2rem' }}>
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button onClick={next}>Continue to {STEPS[step + 1]}</Button>
          ) : (
            <Button size="lg" onClick={placeOrder}>
              Place order — {formatPrice(total)}
            </Button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------- Order summary */}
      <aside className="sk-summary" aria-label="Order summary">
        <Text weight="semibold" style={{ display: 'block', marginBlockEnd: '0.75rem' }}>
          Order summary
        </Text>

        {lines.map(({ product, qty, lineTotal }) => (
          <div className="sk-line" key={product.slug}>
            <span>
              {product.name}
              {qty > 1 && <> × {qty}</>}
            </span>
            <span>{formatPrice(lineTotal)}</span>
          </div>
        ))}

        <div className="sk-line" style={{ marginBlockStart: '0.5rem' }}>
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="sk-line">
          <span>Shipping</span>
          <span>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
        </div>
        {codFee > 0 && (
          <div className="sk-line">
            <span>Cash-on-delivery fee</span>
            <span>{formatPrice(codFee)}</span>
          </div>
        )}
        <div className="sk-line">
          <span>Estimated tax</span>
          <span>{formatPrice(tax)}</span>
        </div>
        <div className="sk-line sk-line--total">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </aside>
    </div>
  )
}
