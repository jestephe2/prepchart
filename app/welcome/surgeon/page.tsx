import { redirect } from 'next/navigation'
import { OnboardingShell } from '@/components/OnboardingShell'
import { SurgeonForm } from '@/components/SurgeonForm'
import { createClient } from '@/lib/supabase/server'
import { gotoOnboardingStep } from '@/lib/onboarding'

export default async function WelcomeSurgeonPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/welcome/surgeon')

  await gotoOnboardingStep(supabase, user.id, 1)

  return (
    <OnboardingShell step={1} title="Add your first surgeon">
      <SurgeonForm
        mode="create"
        redirectTo={(id) => `/welcome/procedure?surgeon=${id}`}
      />
    </OnboardingShell>
  )
}
