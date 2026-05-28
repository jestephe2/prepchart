import { SupabaseClient } from '@supabase/supabase-js'
import { getUserProfile, upsertUserProfile } from '@/lib/data'

export async function getOnboardingState(
  supabase: SupabaseClient,
  userId: string
): Promise<{ complete: boolean }> {
  const profile = await getUserProfile(supabase, userId)
  return { complete: profile?.onboarding_complete ?? false }
}

export async function markOnboardingComplete(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  await upsertUserProfile(supabase, userId, { onboarding_complete: true })
}
