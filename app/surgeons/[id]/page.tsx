import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSurgeon, getProcedures } from '@/lib/data'
import { BottomNav } from '@/components/BottomNav'
import { ProcedureList } from '@/components/ProcedureList'

export default async function SurgeonPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const surgeon = await getSurgeon(supabase, id)
  if (!surgeon) notFound()

  const procedures = await getProcedures(supabase, id)
  const initials = surgeon.initials ?? initialsFromName(surgeon.name)

  return (
    <>
      <main className="flex-1 px-6 pt-12 pb-28">
        <div className="mb-6">
          <Link href="/surgeons" className="text-sm text-white/60">
            ← Surgeons
          </Link>
        </div>

        <header className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-accent-dark text-accent flex items-center justify-center font-semibold text-lg shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold truncate">{surgeon.name}</h1>
            <p className="text-sm text-white/50 mt-1 truncate">
              {[surgeon.specialty, surgeon.hospital].filter(Boolean).join(' • ') ||
                'No specialty set'}
            </p>
          </div>
        </header>

        <section>
          <h2 className="text-xs uppercase tracking-wide text-white/50 mb-3">
            Procedures
          </h2>
          <ProcedureList surgeonId={id} procedures={procedures} />

          <Link
            href={`/surgeons/${id}/procedures/new`}
            className="mt-3 flex items-center justify-center gap-2 rounded-md border border-dashed border-border py-3 text-sm text-accent"
          >
            + Add procedure
          </Link>
        </section>
      </main>
      <BottomNav />
    </>
  )
}

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
