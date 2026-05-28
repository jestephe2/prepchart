'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function FirstImplantForm({
  surgeonId,
  procedureId,
}: {
  surgeonId: string
  procedureId: string
}) {
  const router = useRouter()
  const [implantName, setImplantName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const trimmed = implantName.trim()
    if (!trimmed) {
      setError('Implant name is required.')
      return
    }

    setSubmitting(true)
    const implantsRes = await fetch(
      `/api/procedures/${procedureId}/implants`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            {
              preference_type: 'Implant Preference',
              implant_name: trimmed,
              part_number: null,
              detail_notes: null,
            },
          ],
        }),
      }
    )

    if (!implantsRes.ok) {
      setSubmitting(false)
      const body = await implantsRes.json().catch(() => null)
      setError(body?.error ?? 'Could not save implant.')
      return
    }

    const completeRes = await fetch('/api/onboarding/complete', {
      method: 'POST',
    })
    if (!completeRes.ok) {
      setSubmitting(false)
      setError('Saved implant, but could not finish onboarding. Try again.')
      return
    }

    router.push(`/surgeons/${surgeonId}/procedures/${procedureId}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <label className="block">
        <span className="block text-xs uppercase tracking-wide text-white/50 mb-2">
          Implant name
        </span>
        <input
          type="text"
          required
          autoFocus
          autoComplete="off"
          value={implantName}
          onChange={(e) => setImplantName(e.target.value)}
          placeholder="e.g. Arthrex TightRope"
          className="w-full rounded-md bg-surface-card border border-border px-4 py-3 text-base focus:outline-none focus:border-accent"
        />
        <span className="block text-xs text-white/40 mt-1">
          You can add bail-outs, part numbers, and notes after.
        </span>
      </label>

      {error && <p className="text-sm text-flag">{error}</p>}

      <button
        type="submit"
        disabled={submitting || !implantName.trim()}
        className="w-full rounded-md bg-accent text-accent-dark font-semibold py-3 disabled:opacity-50"
      >
        {submitting ? 'Finishing…' : 'Finish'}
      </button>
    </form>
  )
}
