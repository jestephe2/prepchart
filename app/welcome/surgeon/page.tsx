'use client'

import { OnboardingShell } from '@/components/OnboardingShell'
import { SurgeonForm } from '@/components/SurgeonForm'

export default function WelcomeSurgeonPage() {
  return (
    <OnboardingShell step={1} title="Add your first surgeon">
      <SurgeonForm
        mode="create"
        redirectTo={(id) => `/welcome/procedure?surgeon=${id}`}
      />
    </OnboardingShell>
  )
}
