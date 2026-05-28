'use client'

import { useEffect, useState } from 'react'

export function ShareSheet({
  procedureId,
  procedureName,
  open,
  onClose,
}: {
  procedureId: string
  procedureName: string
  open: boolean
  onClose: () => void
}) {
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open || url) return

    let cancelled = false
    setLoading(true)
    setError(null)

    fetch('/api/shares', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ procedure_id: procedureId }),
    })
      .then(async (res) => {
        if (cancelled) return
        if (!res.ok) {
          const body = await res.json().catch(() => null)
          setError(body?.error ?? 'Could not create share link.')
          return
        }
        const data = (await res.json()) as { url: string }
        setUrl(data.url)
      })
      .catch(() => {
        if (!cancelled) setError('Network error. Try again.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, procedureId, url])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  async function copyLink() {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setError('Could not copy. Long-press the link to copy manually.')
    }
  }

  async function nativeShare() {
    if (!url) return
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `CaseCard — ${procedureName}`,
          url,
        })
      } catch {
        // User cancelled — ignore.
      }
    } else {
      await copyLink()
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-30 flex items-end sm:items-center justify-center bg-black/60"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-border bg-surface-card p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Share preference card</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-white/60 text-2xl leading-none px-2"
          >
            ×
          </button>
        </div>

        <p className="text-sm text-white/60">
          Anyone with this link can view this card. They can also sign in and
          copy it to their own account.
        </p>

        {loading && (
          <div className="rounded-md border border-border bg-surface-base p-4 text-sm text-white/60">
            Generating link…
          </div>
        )}

        {error && <p className="text-sm text-flag">{error}</p>}

        {url && (
          <>
            <div className="rounded-md border border-border bg-surface-base p-3 text-xs font-mono text-white/80 break-all">
              {url}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={copyLink}
                className="flex-1 rounded-md border border-border py-3 text-sm font-medium text-white/90"
              >
                {copied ? 'Copied!' : 'Copy link'}
              </button>
              <button
                type="button"
                onClick={nativeShare}
                className="flex-1 rounded-md bg-accent text-accent-dark font-semibold py-3 text-sm"
              >
                Share…
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
