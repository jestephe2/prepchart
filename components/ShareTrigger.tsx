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
        className="rounded-md border border-[#1a2332] bg-[#0d1117] px-3 py-2 text-sm text-[#4ade80]"
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
