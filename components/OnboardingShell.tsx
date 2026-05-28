'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function OnboardingShell({
  step,
  title,
  subtitle,
  children,
}: {
  step: 1 | 2 | 3
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  const router = useRouter()
  const [skipping, setSkipping] = useState(false)

  async function skip() {
    setSkipping(true)
    const res = await fetch('/api/onboarding/complete', { method: 'POST' })
    if (!res.ok) {
      setSkipping(false)
      window.alert('Could not skip onboarding. Try again.')
      return
    }
    router.push('/')
    router.refresh()
  }

  return (
    <main className="flex-1 px-6 pt-12 pb-12">
      <div className="mb-8">
        <p className="text-sm text-white/50 mb-3">PrefChart</p>
        <div className="flex items-center gap-2" aria-label={`Step ${step} of 3`}>
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className={`h-1.5 rounded-full transition-all ${
                n === step
                  ? 'w-10 bg-[#4ade80]'
                  : n < step
                  ? 'w-6 bg-[#4ade80]/40'
                  : 'w-6 bg-[#1a2332]'
              }`}
            />
          ))}
        </div>
      </div>

      <header className="mb-8">
        <h1 className="text-2xl font-semibold leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm text-white/60 mt-2">{subtitle}</p>
        )}
      </header>

      {children}

      <div className="mt-10 text-center">
        <button
          type="button"
          onClick={skip}
          disabled={skipping}
          className="text-xs text-white/40 underline underline-offset-2 disabled:opacity-50"
        >
          {skipping ? 'Skipping…' : 'Skip for now'}
        </button>
      </div>
    </main>
  )
}
