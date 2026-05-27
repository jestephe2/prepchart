import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSurgeon } from '@/lib/data'
import { SurgeonForm } from '@/components/SurgeonForm'

export default async function EditSurgeonPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const surgeon = await getSurgeon(supabase, id)
  if (!surgeon) notFound()

  return (
    <main className="flex-1 px-6 pt-12 pb-12">
      <div className="mb-6">
        <Link href={`/surgeons/${id}`} className="text-sm text-white/60">
          ← Cancel
        </Link>
      </div>

      <h1 className="text-2xl font-semibold mb-8">Edit surgeon</h1>

      <SurgeonForm
        mode="edit"
        surgeonId={id}
        initial={{
          name: surgeon.name,
          specialty: surgeon.specialty ?? null,
          hospital: surgeon.hospital ?? null,
          initials: surgeon.initials ?? null,
        }}
      />
    </main>
  )
}
