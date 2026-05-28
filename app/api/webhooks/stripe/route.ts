import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getStripe } from '@/lib/stripe'
import {
  handleCheckoutComplete,
  handleSubscriptionDeleted,
  handleSubscriptionUpdated,
} from '@/lib/billing'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature')
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!signature || !secret) {
    return NextResponse.json(
      { error: 'Missing signature or webhook secret' },
      { status: 400 }
    )
  }

  const stripe = getStripe()
  const body = await request.text()

  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret)
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Webhook signature verification failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const supabase = createServiceClient()

  const { data: existing } = await supabase
    .from('processed_events')
    .select('id')
    .eq('stripe_event_id', event.id)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ received: true, deduplicated: true })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutComplete(supabase, stripe, event.data.object)
        break
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(supabase, event.data.object)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(supabase, event.data.object)
        break
      default:
        // Unhandled event types still get marked processed so retries don't pile up
        break
    }
  } catch (err) {
    // Surface the error so Stripe retries — do NOT mark processed.
    console.error('Stripe webhook handler error:', err)
    const message = err instanceof Error ? err.message : 'Handler failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  await supabase
    .from('processed_events')
    .insert({ stripe_event_id: event.id })

  return NextResponse.json({ received: true })
}
