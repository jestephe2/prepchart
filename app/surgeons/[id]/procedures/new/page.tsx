import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSurgeon } from '@/lib/data'
import { canAddProcedure } from '@/lib/subscriptions'
import { ProcedureForm } from '@/components/ProcedureForm'
import { UpgradePrompt } from '@/components/UpgradePrompt'

export default async function NewProcedurePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const surgeon = await getSurgeon(supabase, id)
  if (!surgeon) notFound()

  const allowed = await canAddProcedure(supabase, id)

  return (
    <main className="flex-1 px-6 pt-12 pb-12">
      <div className="mb-6">
        <Link href={`/surgeons/${id}`} className="text-sm text-white/60">
          ← Cancel
        </Link>
      </div>

      <header className="mb-8">
        <p className="text-sm text-white/50 mb-1">For {surgeon.name}</p>
        <h1 className="text-2xl font-semibold">Add procedure</h1>
      </header>

      {allowed ? (
        <ProcedureForm mode="create" surgeonId={id} />
      ) : (
        <UpgradePrompt kind="procedure" />
      )}
    </main>
  )
}
