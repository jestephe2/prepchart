'use client'

import { useState } from 'react'
import type { ImplantPreference, Procedure } from '@/lib/schemas'

type Tab = 'implants' | 'setup' | 'notes'

export function PreferenceTabs({
  procedure,
  implants,
}: {
  procedure: Procedure
  implants: ImplantPreference[]
}) {
  const [tab, setTab] = useState<Tab>('implants')

  const preferred = implants.filter((i) => i.preference_type === 'Implant Preference')
  const bailOut = implants.filter((i) => i.preference_type === 'Bail Out')

  return (
    <>
      <div role="tablist" className="flex border-b border-[#1a2332] mb-6">
        <TabButton active={tab === 'implants'} onClick={() => setTab('implants')}>
          Implants
        </TabButton>
        <TabButton active={tab === 'setup'} onClick={() => setTab('setup')}>
          Setup
        </TabButton>
        <TabButton active={tab === 'notes'} onClick={() => setTab('notes')}>
          Rep Notes
        </TabButton>
      </div>

      {tab === 'implants' && (
        <div className="space-y-6">
          <ImplantSection
            title="Implant Preference"
            items={preferred}
            emptyText="No preferred implant set."
          />
          <ImplantSection
            title="Bail Out"
            items={bailOut}
            emptyText="No bail out options set."
          />
          <EditPlaceholder label="Edit implants" />
        </div>
      )}

      {tab === 'setup' && (
        <div className="space-y-4">
          <NotesBlock title="OR Setup" text={procedure.setup_notes} />
          <NotesBlock title="Timing" text={procedure.timing_notes} />
          <EditPlaceholder label="Edit setup" />
        </div>
      )}

      {tab === 'notes' && (
        <div className="space-y-4">
          <NotesBlock title="Rep Notes" text={procedure.rep_notes} />
          <EditPlaceholder label="Edit notes" />
        </div>
      )}
    </>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex-1 py-3 text-sm font-medium border-b-2 -mb-px transition ${
        active
          ? 'border-[#4ade80] text-[#4ade80]'
          : 'border-transparent text-white/60'
      }`}
    >
      {children}
    </button>
  )
}

function ImplantSection({
  title,
  items,
  emptyText,
}: {
  title: string
  items: ImplantPreference[]
  emptyText: string
}) {
  return (
    <section>
      <h3 className="text-xs uppercase tracking-wide text-white/50 mb-2">
        {title}
      </h3>
      {items.length === 0 ? (
        <div className="rounded-md border border-[#1a2332] bg-[#0d1117] p-4 text-sm text-white/60">
          {emptyText}
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((i) => (
            <li
              key={i.id}
              className="rounded-md border border-[#1a2332] bg-[#0d1117] p-4"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-medium">{i.implant_name}</span>
                {i.part_number && (
                  <span className="text-xs text-white/50 shrink-0">
                    {i.part_number}
                  </span>
                )}
              </div>
              {i.detail_notes && (
                <p className="text-sm text-white/70 mt-2 whitespace-pre-wrap">
                  {i.detail_notes}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function NotesBlock({ title, text }: { title: string; text?: string | null }) {
  return (
    <section>
      <h3 className="text-xs uppercase tracking-wide text-white/50 mb-2">
        {title}
      </h3>
      <div className="rounded-md border border-[#1a2332] bg-[#0d1117] p-4 text-sm whitespace-pre-wrap">
        {text?.trim() ? text : <span className="text-white/40">Not set.</span>}
      </div>
    </section>
  )
}

function EditPlaceholder({ label }: { label: string }) {
  return (
    <button
      disabled
      className="w-full rounded-md border border-dashed border-[#1a2332] py-3 text-sm text-white/40"
      aria-label={`${label} (coming in Phase 2)`}
    >
      {label} (coming soon)
    </button>
  )
}
