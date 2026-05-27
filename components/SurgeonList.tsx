'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
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
            <li key={s.id}>
              <Link
                href={`/surgeons/${s.id}`}
                className="flex items-center gap-4 rounded-md border border-[#1a2332] bg-[#0d1117] p-4"
              >
                <div className="w-12 h-12 rounded-full bg-[#052e16] text-[#4ade80] flex items-center justify-center font-semibold text-sm shrink-0">
                  {s.initials ?? initialsFromName(s.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{s.name}</div>
                  <div className="text-xs text-white/50 mt-0.5 truncate">
                    {[s.specialty, s.hospital].filter(Boolean).join(' • ') ||
                      'No specialty set'}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
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
