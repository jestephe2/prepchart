import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSurgeon, getProcedure, getPreferences } from '@/lib/data'
import { BottomNav } from '@/components/BottomNav'
import { PreferenceTabs } from '@/components/PreferenceTabs'

export default async function ProcedurePage({
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

  const { implants, flags } = await getPreferences(supabase, procedure.id)

  return (
    <>
      <main className="flex-1 px-6 pt-12 pb-28">
        <div className="mb-6">
          <Link href={`/surgeons/${id}`} className="text-sm text-white/60">
            ← {surgeon.name}
          </Link>
        </div>

        <header className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-md bg-[#1a2332] flex items-center justify-center text-2xl shrink-0">
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
        </header>

        {flags.length > 0 && (
          <section className="mb-6 rounded-md border border-[#fb923c]/30 bg-[#1c0a00] p-4">
            <h2 className="text-xs uppercase tracking-wide text-[#fb923c] mb-2">
              Flags
            </h2>
            <ul className="space-y-1">
              {flags.map((f) => (
                <li key={f.id} className="text-sm text-[#fb923c]">
                  {f.text}
                </li>
              ))}
            </ul>
          </section>
        )}

        <PreferenceTabs procedure={procedure} implants={implants} />
      </main>
      <BottomNav />
    </>
  )
}
