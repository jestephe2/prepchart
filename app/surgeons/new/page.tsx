import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { canAddSurgeon } from '@/lib/subscriptions'
import { SurgeonForm } from '@/components/SurgeonForm'
import { UpgradePrompt } from '@/components/UpgradePrompt'

export default async function NewSurgeonPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const allowed = await canAddSurgeon(supabase, user.id)

  return (
    <main className="flex-1 px-6 pt-12 pb-12">
      <div className="mb-6">
        <Link href="/surgeons" className="text-sm text-white/60">
          ← Cancel
        </Link>
      </div>

      <h1 className="text-2xl font-semibold mb-8">Add surgeon</h1>

      {allowed ? <SurgeonForm mode="create" /> : <UpgradePrompt kind="surgeon" />}
    </main>
  )
}
