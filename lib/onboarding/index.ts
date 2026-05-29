import { redirect } from 'next/navigation'
import { SupabaseClient } from '@supabase/supabase-js'
import {
  getImplantCountForProcedure,
  getMostRecentProcedureForSurgeon,
  getMostRecentSurgeon,
} from '@/lib/data'
import { markOnboardingComplete } from '@/lib/profiles'

export type OnboardingStep =
  | { step: 1 }
  | { step: 2; surgeonId: string }
  | { step: 3; surgeonId: string; procedureId: string }
  | { step: 'done' }

export async function resolveOnboardingStep(
  supabase: SupabaseClient
): Promise<OnboardingStep> {
  const surgeon = await getMostRecentSurgeon(supabase)
  if (!surgeon) return { step: 1 }

  const procedure = await getMostRecentProcedureForSurgeon(supabase, surgeon.id)
  if (!procedure) return { step: 2, surgeonId: surgeon.id }

  const implants = await getImplantCountForProcedure(supabase, procedure.id)
  if (implants === 0) {
    return { step: 3, surgeonId: surgeon.id, procedureId: procedure.id }
  }

  return { step: 'done' }
}

export function stepToUrl(state: OnboardingStep): string {
  switch (state.step) {
    case 1:
      return '/welcome/surgeon'
    case 2:
      return `/welcome/procedure?surgeon=${state.surgeonId}`
    case 3:
      return `/welcome/implant?surgeon=${state.surgeonId}&procedure=${state.procedureId}`
    case 'done':
      return '/'
  }
}

// Server-component entry point used by every /welcome page. Resolves the
// authoritative step from DB state; if it doesn't match the page's expected
// step, redirects to the right place. If onboarding data is already complete,
// marks the profile complete so the middleware stops bouncing the user back.
export async function gotoOnboardingStep(
  supabase: SupabaseClient,
  userId: string,
  expected: 1 | 2 | 3
): Promise<
  | { step: 2; surgeonId: string }
  | { step: 3; surgeonId: string; procedureId: string }
  | { step: 1 }
> {
  const state = await resolveOnboardingStep(supabase)
  if (state.step === 'done') {
    await markOnboardingComplete(supabase, userId)
    redirect('/')
  }
  if (state.step !== expected) {
    redirect(stepToUrl(state))
  }
  return state
}
