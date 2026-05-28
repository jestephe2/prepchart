'use client'

import { redirect, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { OnboardingShell } from '@/components/OnboardingShell'
import { ProcedureForm } from '@/components/ProcedureForm'

export default function WelcomeProcedurePage() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  )
}

function Inner() {
  const searchParams = useSearchParams()
  const surgeonId = searchParams.get('surgeon')
  if (!surgeonId) {
    redirect('/welcome/surgeon')
  }

  return (
    <OnboardingShell step={2} title="Add your first procedure">
      <ProcedureForm
        mode="create"
        surgeonId={surgeonId}
        redirectTo={(procId) =>
          `/welcome/implant?surgeon=${surgeonId}&procedure=${procId}`
        }
      />
    </OnboardingShell>
  )
}
