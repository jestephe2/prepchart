import { redirect } from 'next/navigation'
import { FirstImplantForm } from '@/components/FirstImplantForm'
import { OnboardingShell } from '@/components/OnboardingShell'
import { createClient } from '@/lib/supabase/server'
import { gotoOnboardingStep } from '@/lib/onboarding'

export default async function WelcomeImplantPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/welcome/implant')

  const state = await gotoOnboardingStep(supabase, user.id, 3)
  if (state.step !== 3) redirect('/welcome/surgeon')

  return (
    <OnboardingShell step={3} title="What's your top-choice implant?">
      <FirstImplantForm
        surgeonId={state.surgeonId}
        procedureId={state.procedureId}
      />
    </OnboardingShell>
  )
}
