'use client'

import { redirect, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { FirstImplantForm } from '@/components/FirstImplantForm'
import { OnboardingShell } from '@/components/OnboardingShell'

export default function WelcomeImplantPage() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  )
}

function Inner() {
  const searchParams = useSearchParams()
  const surgeonId = searchParams.get('surgeon')
  const procedureId = searchParams.get('procedure')
  if (!surgeonId || !procedureId) {
    redirect('/welcome/surgeon')
  }

  return (
    <OnboardingShell step={3} title="What's your top-choice implant?">
      <FirstImplantForm surgeonId={surgeonId} procedureId={procedureId} />
    </OnboardingShell>
  )
}
