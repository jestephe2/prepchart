import { redirect } from 'next/navigation'
import { OnboardingShell } from '@/components/OnboardingShell'
import { ProcedureForm } from '@/components/ProcedureForm'
import { createClient } from '@/lib/supabase/server'
import { gotoOnboardingStep } from '@/lib/onboarding'

export default async function WelcomeProcedurePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/welcome/procedure')

  const state = await gotoOnboardingStep(supabase, user.id, 2)
  // gotoOnboardingStep only returns when state.step matches expected.
  if (state.step !== 2) redirect('/welcome/surgeon')

  return (
    <OnboardingShell step={2} title="Add your first procedure">
      <ProcedureForm
        mode="create"
        surgeonId={state.surgeonId}
        redirectTo={(procId) =>
          `/welcome/implant?surgeon=${state.surgeonId}&procedure=${procId}`
        }
      />
    </OnboardingShell>
  )
}
