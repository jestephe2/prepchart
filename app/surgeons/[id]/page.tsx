import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSurgeon, getProcedures } from '@/lib/data'
import { BottomNav } from '@/components/BottomNav'

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
          <div className="w-16 h-16 rounded-full bg-[#052e16] text-[#4ade80] flex items-center justify-center font-semibold text-lg shrink-0">
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
          {procedures.length === 0 ? (
            <div className="rounded-md border border-[#1a2332] bg-[#0d1117] p-6 text-center text-sm text-white/60">
              No procedures yet for {surgeon.name}.
            </div>
          ) : (
            <ul className="space-y-2">
              {procedures.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/surgeons/${id}/procedures/${p.id}`}
                    className="flex items-center gap-4 rounded-md border border-[#1a2332] bg-[#0d1117] p-4"
                  >
                    <div className="w-10 h-10 rounded-md bg-[#1a2332] flex items-center justify-center text-xl shrink-0">
                      {p.icon || '🔩'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{p.name}</div>
                      {p.sub_type && (
                        <div className="text-xs text-white/50 mt-0.5 truncate">
                          {p.sub_type}
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
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
