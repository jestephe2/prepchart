import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSubscription } from '@/lib/subscriptions'
import { BillingActionButton } from '@/components/BillingActionButton'
import { BottomNav } from '@/components/BottomNav'
import { LogoutButton } from '@/components/LogoutButton'

export default async function AccountPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const subscription = await getSubscription(supabase, user.id)
  const isPro = subscription.tier === 'pro'
  const periodEnd = subscription.subscriptionEnd
    ? new Date(subscription.subscriptionEnd)
    : null

  return (
    <>
      <main className="flex-1 px-6 pt-12 pb-28">
        <div className="mb-6">
          <Link href="/" className="text-sm text-white/60">
            ← Home
          </Link>
        </div>

        <h1 className="text-2xl font-semibold mb-8">Account</h1>

        <section className="space-y-2 mb-8">
          <p className="text-xs uppercase tracking-wide text-white/50">Email</p>
          <p className="text-base">{user.email}</p>
        </section>

        <section className="space-y-3 mb-8">
          <p className="text-xs uppercase tracking-wide text-white/50">Plan</p>
          <div className="rounded-md border border-border bg-surface-card p-4">
            <p className="text-base font-semibold">
              {isPro ? 'Pro' : 'Free'}
            </p>
            {isPro && periodEnd && (
              <p className="text-sm text-white/60 mt-1">
                {subscription.status === 'canceled' ||
                subscription.cancelAtPeriodEnd
                  ? `Cancels ${formatDate(periodEnd)}.`
                  : `Renews ${formatDate(periodEnd)}.`}
              </p>
            )}
            {!isPro && (
              <p className="text-sm text-white/60 mt-1">
                2 surgeons. 3 procedures per surgeon.
              </p>
            )}
          </div>
        </section>

        <BillingActionButton action={isPro ? 'manage' : 'upgrade'} />

        <section className="mt-10 space-y-3">
          <p className="text-xs uppercase tracking-wide text-white/50">
            Security
          </p>
          <Link
            href={`/forgot-password?email=${encodeURIComponent(user.email ?? '')}`}
            className="block w-full rounded-md border border-border py-3 text-sm text-center font-medium text-white/90"
          >
            Change password
          </Link>
          <LogoutButton />
        </section>
      </main>
      <BottomNav />
    </>
  )
}

function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
