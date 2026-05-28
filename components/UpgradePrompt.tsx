'use client'

import { useState } from 'react'

const COPY = {
  surgeon: {
    title: "You've reached the free plan limit.",
    body: 'Free accounts include up to 2 surgeons. Upgrade to Pro to add unlimited surgeons.',
  },
  procedure: {
    title: "You've reached the free plan limit.",
    body: 'Free accounts include up to 3 procedures per surgeon. Upgrade to Pro to add unlimited procedures.',
  },
} as const

export function UpgradePrompt({
  kind,
  showCancel = false,
  onCancel,
}: {
  kind: 'surgeon' | 'procedure'
  showCancel?: boolean
  onCancel?: () => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const copy = COPY[kind]

  async function startCheckout() {
    setSubmitting(true)
    setError(null)
    const res = await fetch('/api/billing/checkout', { method: 'POST' })
    if (!res.ok) {
      setSubmitting(false)
      const body = await res.json().catch(() => null)
      setError(body?.error ?? 'Could not start checkout.')
      return
    }
    const data = (await res.json()) as { url: string }
    window.location.href = data.url
  }

  return (
    <div className="rounded-md border border-border bg-surface-card p-6 space-y-4">
      <h2 className="text-lg font-semibold">{copy.title}</h2>
      <p className="text-sm text-white/70">{copy.body}</p>
      <p className="text-sm text-white/60">
        <span className="font-semibold text-white">$15/month.</span> Cancel
        anytime.
      </p>

      {error && <p className="text-sm text-flag">{error}</p>}

      <div className="flex gap-2 pt-2">
        {showCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 rounded-md border border-border py-3 text-sm font-medium text-white/70"
          >
            Not now
          </button>
        )}
        <button
          type="button"
          onClick={startCheckout}
          disabled={submitting}
          className="flex-1 rounded-md bg-accent text-accent-dark font-semibold py-3 disabled:opacity-50"
        >
          {submitting ? 'Loading…' : 'Upgrade to Pro'}
        </button>
      </div>
    </div>
  )
}
