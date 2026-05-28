'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { RowMenu } from '@/components/RowMenu'
import type { Procedure } from '@/lib/schemas'

export function ProcedureList({
  surgeonId,
  procedures,
}: {
  surgeonId: string
  procedures: Procedure[]
}) {
  if (procedures.length === 0) {
    return (
      <div className="rounded-md border border-border bg-surface-card p-6 text-center text-sm text-white/60">
        No procedures yet.
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {procedures.map((p) => (
        <ProcedureRow key={p.id} procedure={p} surgeonId={surgeonId} />
      ))}
    </ul>
  )
}

function ProcedureRow({
  procedure,
  surgeonId,
}: {
  procedure: Procedure
  surgeonId: string
}) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function confirmAndDelete() {
    if (deleting) return
    const ok = window.confirm(
      `Delete ${procedure.name}? This will also delete its implants and flags. This cannot be undone.`
    )
    if (!ok) return

    setDeleting(true)
    const res = await fetch(`/api/procedures/${procedure.id}`, {
      method: 'DELETE',
    })
    setDeleting(false)
    if (!res.ok) {
      window.alert('Could not delete procedure. Try again.')
      return
    }
    router.refresh()
  }

  return (
    <li className={`relative ${deleting ? 'opacity-50 pointer-events-none' : ''}`}>
      <Link
        href={`/surgeons/${surgeonId}/procedures/${procedure.id}`}
        className="flex items-center gap-4 rounded-md border border-border bg-surface-card p-4 pr-14"
      >
        <div className="w-10 h-10 rounded-md bg-border flex items-center justify-center text-xl shrink-0">
          {procedure.icon || '🔩'}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium truncate">{procedure.name}</div>
          {procedure.sub_type && (
            <div className="text-xs text-white/50 mt-0.5 truncate">
              {procedure.sub_type}
            </div>
          )}
        </div>
      </Link>
      <div className="absolute inset-y-0 right-2 flex items-center">
        <RowMenu
          triggerLabel={`Actions for ${procedure.name}`}
          items={[
            {
              label: 'Edit',
              href: `/surgeons/${surgeonId}/procedures/${procedure.id}/edit`,
            },
            { label: 'Delete', onClick: confirmAndDelete, danger: true },
          ]}
        />
      </div>
    </li>
  )
}
