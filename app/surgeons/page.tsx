import { createClient } from '@/lib/supabase/server'
import { getSurgeons } from '@/lib/data'
import { BottomNav } from '@/components/BottomNav'
import { SurgeonList } from '@/components/SurgeonList'

export default async function SurgeonsPage() {
  const supabase = await createClient()
  const surgeons = await getSurgeons(supabase)

  return (
    <>
      <main className="flex-1 px-6 pt-12 pb-28">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold">Surgeons</h1>
          <p className="text-sm text-white/50 mt-1">
            {surgeons.length} {surgeons.length === 1 ? 'surgeon' : 'surgeons'}
          </p>
        </header>

        <SurgeonList surgeons={surgeons} />
      </main>
      <BottomNav />
    </>
  )
}
