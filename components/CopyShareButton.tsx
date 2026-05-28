'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'prepchart_copied_shares'

export function CopyShareButton({ token }: { token: string }) {
  const router = useRouter()
  const [alreadyCopied, setAlreadyCopied] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const tokens = readCopiedTokens()
    if (tokens.includes(token)) {
      setAlreadyCopied(true)
    }
  }, [token])

  async function copy() {
    setSubmitting(true)
    setError(null)
    const res = await fetch(`/api/shares/${token}/copy`, { method: 'POST' })
    if (!res.ok) {
      setSubmitting(false)
      const body = await res.json().catch(() => null)
      setError(body?.error ?? 'Could not copy.')
      return
    }
    const data = (await res.json()) as {
      surgeon_id: string
      procedure_id: string
    }
    rememberCopiedToken(token)
    router.push(`/surgeons/${data.surgeon_id}/procedures/${data.procedure_id}`)
    router.refresh()
  }

  if (alreadyCopied) {
    return (
      <div className="rounded-md border border-border bg-surface-card p-4 text-sm text-white/60">
        Already copied to your account.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={copy}
        disabled={submitting}
        className="w-full rounded-md bg-accent text-accent-dark font-semibold py-3 disabled:opacity-50"
      >
        {submitting ? 'Copying…' : 'Copy to my account'}
      </button>
      {error && <p className="text-sm text-flag">{error}</p>}
    </div>
  )
}

function readCopiedTokens(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((t) => typeof t === 'string') : []
  } catch {
    return []
  }
}

function rememberCopiedToken(token: string) {
  try {
    const tokens = readCopiedTokens()
    if (!tokens.includes(token)) {
      tokens.push(token)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens))
    }
  } catch {
    // localStorage unavailable — best effort only
  }
}
