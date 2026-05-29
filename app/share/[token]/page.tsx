import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getSharedCard } from '@/lib/shares'
import { SharedPreferenceTabs } from '@/components/SharedPreferenceTabs'

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  const serviceSupabase = createServiceClient()
  const card = await getSharedCard(serviceSupabase, token)
  if (!card) notFound()

  const { share, surgeon, procedure, implants, flags } = card

  const userSupabase = await createClient()
  const {
    data: { user },
  } = await userSupabase.auth.getUser()

  const isOwner = user?.id === share.created_by
  const claimHref = `/share/${token}/claim`
  const loginRedirect = `/login?redirect=${encodeURIComponent(claimHref)}`

  // Signed-in non-owner: clicking the share link IS the intent to save.
  // Skip the preview and send them straight through the claim flow,
  // which handles idempotency (re-visits land on their existing copy).
  if (user && !isOwner) {
    redirect(claimHref)
  }

  return (
    <main className="flex-1 px-6 pt-8 pb-12">
      <div className="mb-6 text-xs uppercase tracking-wide text-white/40">
        Shared preference card
      </div>

      <header className="mb-6">
        <h2 className="text-lg font-semibold">{surgeon.name}</h2>
        <p className="text-sm text-white/50 mt-1">
          {[surgeon.specialty, surgeon.hospital].filter(Boolean).join(' • ') ||
            'No specialty set'}
        </p>
      </header>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-md bg-border flex items-center justify-center text-2xl shrink-0">
          {procedure.icon || '🔩'}
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-semibold truncate">{procedure.name}</h1>
          {procedure.sub_type && (
            <p className="text-sm text-white/50 mt-0.5 truncate">
              {procedure.sub_type}
            </p>
          )}
        </div>
      </div>

      {flags.length > 0 && (
        <section className="mb-6 rounded-md border border-flag/30 bg-flag-bg p-4">
          <h2 className="text-xs uppercase tracking-wide text-flag mb-2">
            Flags
          </h2>
          <ul className="space-y-1">
            {flags.map((f) => (
              <li key={f.id} className="text-sm text-flag">
                {f.text}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mb-6">
        {isOwner ? (
          <div className="rounded-md border border-border bg-surface-card p-4 text-sm text-white/60">
            You shared this card.
          </div>
        ) : (
          <Link
            href={loginRedirect}
            className="block w-full rounded-md bg-accent text-accent-dark font-semibold py-3 text-center"
          >
            Create a free account to save/edit
          </Link>
        )}
      </div>

      <SharedPreferenceTabs procedure={procedure} implants={implants} />
    </main>
  )
}
