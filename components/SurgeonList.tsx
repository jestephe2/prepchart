'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { RowMenu } from '@/components/RowMenu'
import type { Surgeon } from '@/lib/schemas'

export function SurgeonList({ surgeons }: { surgeons: Surgeon[] }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return surgeons
    return surgeons.filter((s) => {
      return (
        s.name.toLowerCase().includes(q) ||
        s.specialty?.toLowerCase().includes(q) ||
        s.hospital?.toLowerCase().includes(q)
      )
    })
  }, [surgeons, query])

  return (
    <>
      <div className="mb-6">
        <input
          type="search"
          inputMode="search"
          placeholder="Search surgeons"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-md bg-[#0d1117] border border-[#1a2332] px-4 py-3 text-base focus:outline-none focus:border-[#4ade80]"
        />
      </div>

      {surgeons.length === 0 ? (
        <div className="rounded-md border border-[#1a2332] bg-[#0d1117] p-6 text-center text-sm text-white/60">
          No surgeons yet. Tap + to add your first.
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-md border border-[#1a2332] bg-[#0d1117] p-6 text-center text-sm text-white/60">
          No matches for &ldquo;{query}&rdquo;.
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((s) => (
            <SurgeonRow key={s.id} surgeon={s} />
          ))}
        </ul>
      )}
    </>
  )
}

function SurgeonRow({ surgeon }: { surgeon: Surgeon }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function confirmAndDelete() {
    if (deleting) return
    const ok = window.confirm(
      `Delete ${surgeon.name}? This will also delete all their procedures and preferences. This cannot be undone.`
    )
    if (!ok) return

    setDeleting(true)
    const res = await fetch(`/api/surgeons/${surgeon.id}`, { method: 'DELETE' })
    setDeleting(false)
    if (!res.ok) {
      window.alert('Could not delete surgeon. Try again.')
      return
    }
    router.refresh()
  }

  return (
    <li className={`relative ${deleting ? 'opacity-50 pointer-events-none' : ''}`}>
      <Link
        href={`/surgeons/${surgeon.id}`}
        className="flex items-center gap-4 rounded-md border border-[#1a2332] bg-[#0d1117] p-4 pr-14"
      >
        <div className="w-12 h-12 rounded-full bg-[#052e16] text-[#4ade80] flex items-center justify-center font-semibold text-sm shrink-0">
          {surgeon.initials ?? initialsFromName(surgeon.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium truncate">{surgeon.name}</div>
          <div className="text-xs text-white/50 mt-0.5 truncate">
            {[surgeon.specialty, surgeon.hospital].filter(Boolean).join(' • ') ||
              'No specialty set'}
          </div>
        </div>
      </Link>
      <div className="absolute inset-y-0 right-2 flex items-center">
        <RowMenu
          triggerLabel={`Actions for ${surgeon.name}`}
          items={[
            { label: 'Edit', href: `/surgeons/${surgeon.id}/edit` },
            { label: 'Delete', onClick: confirmAndDelete, danger: true },
          ]}
        />
      </div>
    </li>
  )
}

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
