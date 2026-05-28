'use client'

import { useState } from 'react'
import { ShareSheet } from './ShareSheet'

export function ShareTrigger({
  procedureId,
  procedureName,
}: {
  procedureId: string
  procedureName: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Share preference card"
        className="rounded-md border border-border bg-surface-card px-3 py-2 text-sm text-accent"
      >
        Share
      </button>
      <ShareSheet
        procedureId={procedureId}
        procedureName={procedureName}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
