'use client'

import { useState } from 'react'

type Action = 'upgrade' | 'manage'

const COPY: Record<Action, { idle: string; loading: string }> = {
  upgrade: { idle: 'Upgrade to Pro — $15/mo', loading: 'Loading…' },
  manage: { idle: 'Manage subscription', loading: 'Loading…' },
}

const ENDPOINTS: Record<Action, string> = {
  upgrade: '/api/billing/checkout',
  manage: '/api/billing/portal',
}

export function BillingActionButton({ action }: { action: Action }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const copy = COPY[action]

  async function go() {
    setSubmitting(true)
    setError(null)
    const res = await fetch(ENDPOINTS[action], { method: 'POST' })
    if (!res.ok) {
      setSubmitting(false)
      const body = await res.json().catch(() => null)
      setError(body?.error ?? 'Could not continue.')
      return
    }
    const data = (await res.json()) as { url: string }
    window.location.href = data.url
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={go}
        disabled={submitting}
        className={`w-full rounded-md font-semibold py-3 disabled:opacity-50 ${
          action === 'upgrade'
            ? 'bg-accent text-accent-dark'
            : 'border border-border text-white/90'
        }`}
      >
        {submitting ? copy.loading : copy.idle}
      </button>
      {error && <p className="text-sm text-flag">{error}</p>}
    </div>
  )
}
