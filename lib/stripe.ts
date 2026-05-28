import 'server-only'

import Stripe from 'stripe'

let cached: Stripe | null = null

export function getStripe(): Stripe {
  if (cached) return cached
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  cached = new Stripe(key, { apiVersion: '2026-05-27.dahlia' })
  return cached
}

export function getProPriceId(): string {
  const id = process.env.STRIPE_PRO_PRICE_ID
  if (!id) {
    throw new Error('STRIPE_PRO_PRICE_ID is not set')
  }
  return id
}
