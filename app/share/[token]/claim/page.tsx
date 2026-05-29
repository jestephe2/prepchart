import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import {
  getActiveShareByToken,
  getProcedure,
  getProcedureBySourceToken,
} from '@/lib/data'
import { copyShareToUser } from '@/lib/shares'
import { markOnboardingComplete } from '@/lib/profiles'

export default async function ClaimSharePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  const serviceSupabase = createServiceClient()
  const share = await getActiveShareByToken(serviceSupabase, token)
  if (!share) notFound()

  const userSupabase = await createClient()
  const {
    data: { user },
  } = await userSupabase.auth.getUser()
  if (!user) {
    redirect(`/login?redirect=/share/${token}/claim`)
  }

  // Owner of the share — don't copy, send them to the original.
  if (share.created_by === user.id) {
    const original = await getProcedure(serviceSupabase, share.procedure_id)
    if (!original) notFound()
    redirect(`/surgeons/${original.surgeon_id}/procedures/${original.id}`)
  }

  // Already copied previously — redirect to existing copy.
  const existing = await getProcedureBySourceToken(userSupabase, token)
  if (existing) {
    await markOnboardingComplete(userSupabase, user.id)
    redirect(`/surgeons/${existing.surgeon_id}/procedures/${existing.id}`)
  }

  const { surgeonId, procedureId } = await copyShareToUser(
    serviceSupabase,
    userSupabase,
    user.id,
    token
  )

  // Critical: mark onboarding complete BEFORE redirecting, otherwise middleware
  // will bounce a brand-new recipient straight into /welcome/surgeon and they'll
  // create a duplicate surgeon.
  await markOnboardingComplete(userSupabase, user.id)

  redirect(`/surgeons/${surgeonId}/procedures/${procedureId}`)
}
