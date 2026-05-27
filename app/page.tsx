import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUpcomingSurgeons, getStats } from '@/lib/data'
import { BottomNav } from '@/components/BottomNav'

export default async function HomePage() {
  const supabase = await createClient()
  const [upcoming, stats] = await Promise.all([
    getUpcomingSurgeons(supabase),
    getStats(supabase),
  ])

  return (
    <>
      <main className="flex-1 px-6 pt-12 pb-28">
        <header className="mb-10">
          <p className="text-sm text-white/50 mb-2">PrefChart</p>
          <h1 className="text-3xl font-semibold leading-tight">
            What case are you walking into?
          </h1>
        </header>

        <Link
          href="/surgeons"
          className="block w-full rounded-xl bg-[#4ade80] text-[#052e16] font-semibold text-lg py-5 text-center mb-10"
        >
          Pick your surgeon
        </Link>

        <section className="mb-10">
          <h2 className="text-xs uppercase tracking-wide text-white/50 mb-3">
            Upcoming
          </h2>
          {upcoming.length === 0 ? (
            <div className="rounded-md border border-[#1a2332] bg-[#0d1117] p-4 text-sm text-white/60">
              No upcoming cases.
            </div>
          ) : (
            <ul className="space-y-2">
              {upcoming.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/surgeons/${s.id}`}
                    className="block rounded-md border border-[#1a2332] bg-[#0d1117] p-4"
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="font-medium">{s.name}</span>
                      <span className="text-xs text-white/50">
                        {s.last_case_date}
                      </span>
                    </div>
                    {s.specialty && (
                      <p className="text-xs text-white/50 mt-1">{s.specialty}</p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-xs uppercase tracking-wide text-white/50 mb-3">
            Your stack
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md border border-[#1a2332] bg-[#0d1117] p-4">
              <div className="text-2xl font-semibold">{stats.surgeonCount}</div>
              <div className="text-xs text-white/50 mt-1">Surgeons</div>
            </div>
            <div className="rounded-md border border-[#1a2332] bg-[#0d1117] p-4">
              <div className="text-2xl font-semibold">{stats.procedureCount}</div>
              <div className="text-xs text-white/50 mt-1">Procedures</div>
            </div>
          </div>
        </section>
      </main>
      <BottomNav />
    </>
  )
}
