import 'server-only'

import type Stripe from 'stripe'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import {
  getProfileByStripeCustomerId,
  getProfileByStripeSubscriptionId,
  getUserProfile,
  upsertUserProfile,
} from '@/lib/data'
import { getProPriceId } from '@/lib/stripe'

async function resolveCustomerId(
  stripe: Stripe,
  supabase: SupabaseClient,
  user: User
): Promise<string> {
  const profile = await getUserProfile(supabase, user.id)
  if (profile?.stripe_customer_id) return profile.stripe_customer_id

  const customer = await stripe.customers.create({
    email: user.email ?? undefined,
    metadata: { supabase_user_id: user.id },
  })

  await upsertUserProfile(supabase, user.id, {
    stripe_customer_id: customer.id,
  })

  return customer.id
}

export async function createCheckoutSession(
  stripe: Stripe,
  supabase: SupabaseClient,
  user: User,
  origin: string
): Promise<{ url: string }> {
  const customerId = await resolveCustomerId(stripe, supabase, user)

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: getProPriceId(), quantity: 1 }],
    success_url: `${origin}/account?checkout=success`,
    cancel_url: `${origin}/account?checkout=canceled`,
    allow_promotion_codes: true,
  })

  if (!session.url) {
    throw new Error('Stripe Checkout session has no URL')
  }
  return { url: session.url }
}

export async function createPortalSession(
  stripe: Stripe,
  supabase: SupabaseClient,
  userId: string,
  origin: string
): Promise<{ url: string }> {
  const profile = await getUserProfile(supabase, userId)
  if (!profile?.stripe_customer_id) {
    throw new Error('No Stripe customer on file for this user')
  }
  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${origin}/account`,
  })
  return { url: session.url }
}

function endIso(periodEnd: number | null | undefined): string | null {
  if (!periodEnd) return null
  return new Date(periodEnd * 1000).toISOString()
}

export async function handleCheckoutComplete(
  serviceSupabase: SupabaseClient,
  stripe: Stripe,
  session: Stripe.Checkout.Session
): Promise<void> {
  const customerId =
    typeof session.customer === 'string'
      ? session.customer
      : session.customer?.id
  if (!customerId) return

  const subscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id
  if (!subscriptionId) return

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const item = subscription.items.data[0]

  const profile = await getProfileByStripeCustomerId(serviceSupabase, customerId)
  if (!profile) {
    console.error(
      `handleCheckoutComplete: no profile for customer ${customerId}`
    )
    return
  }

  await upsertUserProfile(serviceSupabase, profile.user_id, {
    stripe_subscription_id: subscription.id,
    subscription_status: subscription.status,
    subscription_end: endIso(item?.current_period_end ?? null),
  })
}

export async function handleSubscriptionUpdated(
  serviceSupabase: SupabaseClient,
  subscription: Stripe.Subscription
): Promise<void> {
  const profile = await getProfileByStripeSubscriptionId(
    serviceSupabase,
    subscription.id
  )
  if (!profile) {
    console.error(
      `handleSubscriptionUpdated: no profile for subscription ${subscription.id}`
    )
    return
  }
  const item = subscription.items.data[0]
  await upsertUserProfile(serviceSupabase, profile.user_id, {
    subscription_status: subscription.status,
    subscription_end: endIso(item?.current_period_end ?? null),
  })
}

export async function handleSubscriptionDeleted(
  serviceSupabase: SupabaseClient,
  subscription: Stripe.Subscription
): Promise<void> {
  const profile = await getProfileByStripeSubscriptionId(
    serviceSupabase,
    subscription.id
  )
  if (!profile) {
    console.error(
      `handleSubscriptionDeleted: no profile for subscription ${subscription.id}`
    )
    return
  }
  // Keep subscription_end so user_is_pro stays true through the paid-up period.
  await upsertUserProfile(serviceSupabase, profile.user_id, {
    subscription_status: 'canceled',
  })
}
