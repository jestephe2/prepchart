import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProcedure, getSurgeon } from '@/lib/data'
import { ProcedureForm } from '@/components/ProcedureForm'

export default async function EditProcedurePage({
  params,
}: {
  params: Promise<{ id: string; procedureId: string }>
}) {
  const { id, procedureId } = await params
  const supabase = await createClient()

  const [surgeon, procedure] = await Promise.all([
    getSurgeon(supabase, id),
    getProcedure(supabase, procedureId),
  ])
  if (!surgeon || !procedure || procedure.surgeon_id !== surgeon.id) {
    notFound()
  }

  return (
    <main className="flex-1 px-6 pt-12 pb-12">
      <div className="mb-6">
        <Link
          href={`/surgeons/${id}/procedures/${procedureId}`}
          className="text-sm text-white/60"
        >
          ← Cancel
        </Link>
      </div>

      <header className="mb-8">
        <p className="text-sm text-white/50 mb-1">For {surgeon.name}</p>
        <h1 className="text-2xl font-semibold">Edit procedure</h1>
      </header>

      <ProcedureForm
        mode="edit"
        surgeonId={id}
        procedureId={procedureId}
        initial={{
          name: procedure.name,
          sub_type: procedure.sub_type ?? null,
          icon: procedure.icon || '🔩',
        }}
      />
    </main>
  )
}
