'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { Flag, ImplantPreference, Procedure } from '@/lib/schemas'

type Tab = 'implants' | 'setup' | 'notes'

export function PreferenceTabs({
  procedure,
  implants,
  flags,
}: {
  procedure: Procedure
  implants: ImplantPreference[]
  flags: Flag[]
}) {
  const [tab, setTab] = useState<Tab>('implants')

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
        <ImplantsTab procedureId={procedure.id} implants={implants} />
      )}

      {tab === 'setup' && <SetupTab procedure={procedure} />}

      {tab === 'notes' && <NotesTab procedure={procedure} flags={flags} />}
    </>
  )
}

type PreferenceType = 'Implant Preference' | 'Bail Out'

type ImplantDraft = {
  _localId: string
  preference_type: PreferenceType
  implant_name: string
  part_number: string
  detail_notes: string
}

function ImplantsTab({
  procedureId,
  implants,
}: {
  procedureId: string
  implants: ImplantPreference[]
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [items, setItems] = useState<ImplantDraft[]>(() => toDrafts(implants))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function startEditing() {
    setItems(toDrafts(implants))
    setError(null)
    setEditing(true)
  }

  function cancel() {
    setItems(toDrafts(implants))
    setError(null)
    setEditing(false)
  }

  function updateItem(localId: string, patch: Partial<ImplantDraft>) {
    setItems((prev) =>
      prev.map((i) => (i._localId === localId ? { ...i, ...patch } : i))
    )
  }

  function removeItem(localId: string) {
    setItems((prev) => prev.filter((i) => i._localId !== localId))
  }

  function addItem(type: PreferenceType) {
    setItems((prev) => [
      ...prev,
      {
        _localId: crypto.randomUUID(),
        preference_type: type,
        implant_name: '',
        part_number: '',
        detail_notes: '',
      },
    ])
  }

  async function save() {
    setError(null)

    const payload = items
      .map((i) => ({
        preference_type: i.preference_type,
        implant_name: i.implant_name.trim(),
        part_number: i.part_number.trim() || null,
        detail_notes: i.detail_notes.trim() || null,
      }))
      .filter((i) => i.implant_name.length > 0)

    setSubmitting(true)
    const res = await fetch(`/api/procedures/${procedureId}/implants`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: payload }),
    })
    setSubmitting(false)
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      setError(body?.error ?? 'Could not save implants.')
      return
    }
    setEditing(false)
    router.refresh()
  }

  if (editing) {
    const preferredDrafts = items.filter(
      (i) => i.preference_type === 'Implant Preference'
    )
    const bailOutDrafts = items.filter((i) => i.preference_type === 'Bail Out')

    return (
      <div className="space-y-6">
        <ImplantEditSection
          title="Implant Preference"
          items={preferredDrafts}
          onUpdate={updateItem}
          onRemove={removeItem}
          onAdd={() => addItem('Implant Preference')}
        />
        <ImplantEditSection
          title="Bail Out"
          items={bailOutDrafts}
          onUpdate={updateItem}
          onRemove={removeItem}
          onAdd={() => addItem('Bail Out')}
        />

        {error && <p className="text-sm text-[#fb923c]">{error}</p>}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={cancel}
            disabled={submitting}
            className="flex-1 rounded-md border border-[#1a2332] py-3 text-sm font-medium text-white/70"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={submitting}
            className="flex-1 rounded-md bg-[#4ade80] text-[#052e16] font-semibold py-3 disabled:opacity-50"
          >
            {submitting ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    )
  }

  const preferred = implants.filter(
    (i) => i.preference_type === 'Implant Preference'
  )
  const bailOut = implants.filter((i) => i.preference_type === 'Bail Out')

  return (
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
      <button
        type="button"
        onClick={startEditing}
        className="w-full rounded-md border border-dashed border-[#1a2332] py-3 text-sm text-[#4ade80]"
      >
        Edit implants
      </button>
    </div>
  )
}

function ImplantEditSection({
  title,
  items,
  onUpdate,
  onRemove,
  onAdd,
}: {
  title: string
  items: ImplantDraft[]
  onUpdate: (localId: string, patch: Partial<ImplantDraft>) => void
  onRemove: (localId: string) => void
  onAdd: () => void
}) {
  return (
    <section>
      <h3 className="text-xs uppercase tracking-wide text-white/50 mb-2">
        {title}
      </h3>
      <div className="space-y-3">
        {items.map((item) => (
          <ImplantEditCard
            key={item._localId}
            item={item}
            onUpdate={(patch) => onUpdate(item._localId, patch)}
            onRemove={() => onRemove(item._localId)}
          />
        ))}
        <button
          type="button"
          onClick={onAdd}
          className="w-full rounded-md border border-dashed border-[#1a2332] py-3 text-sm text-[#4ade80]"
        >
          + Add {title === 'Bail Out' ? 'bail out' : 'preferred'}
        </button>
      </div>
    </section>
  )
}

function ImplantEditCard({
  item,
  onUpdate,
  onRemove,
}: {
  item: ImplantDraft
  onUpdate: (patch: Partial<ImplantDraft>) => void
  onRemove: () => void
}) {
  return (
    <div className="rounded-md border border-[#1a2332] bg-[#0d1117] p-4 space-y-3">
      <div className="flex items-start gap-2">
        <select
          value={item.preference_type}
          onChange={(e) =>
            onUpdate({ preference_type: e.target.value as PreferenceType })
          }
          className="flex-1 rounded-md bg-[#080b10] border border-[#1a2332] px-3 py-2 text-base focus:outline-none focus:border-[#4ade80]"
        >
          <option value="Implant Preference">Implant Preference</option>
          <option value="Bail Out">Bail Out</option>
        </select>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove implant"
          className="rounded-md border border-[#1a2332] px-3 py-2 text-base text-white/60"
        >
          ×
        </button>
      </div>

      <input
        type="text"
        value={item.implant_name}
        onChange={(e) => onUpdate({ implant_name: e.target.value })}
        placeholder="Implant name"
        className="w-full rounded-md bg-[#080b10] border border-[#1a2332] px-3 py-2 text-base focus:outline-none focus:border-[#4ade80]"
      />

      <input
        type="text"
        value={item.part_number}
        onChange={(e) => onUpdate({ part_number: e.target.value })}
        placeholder="Part # (optional)"
        className="w-full rounded-md bg-[#080b10] border border-[#1a2332] px-3 py-2 text-base focus:outline-none focus:border-[#4ade80]"
      />

      <textarea
        value={item.detail_notes}
        onChange={(e) => onUpdate({ detail_notes: e.target.value })}
        rows={2}
        placeholder="Notes (sizing, rationale…)"
        className="w-full rounded-md bg-[#080b10] border border-[#1a2332] px-3 py-2 text-base focus:outline-none focus:border-[#4ade80]"
      />
    </div>
  )
}

function toDrafts(implants: ImplantPreference[]): ImplantDraft[] {
  return implants.map((i) => ({
    _localId: i.id,
    preference_type: i.preference_type as PreferenceType,
    implant_name: i.implant_name,
    part_number: i.part_number ?? '',
    detail_notes: i.detail_notes ?? '',
  }))
}

function SetupTab({ procedure }: { procedure: Procedure }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [setup, setSetup] = useState(procedure.setup_notes ?? '')
  const [timing, setTiming] = useState(procedure.timing_notes ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function startEditing() {
    setSetup(procedure.setup_notes ?? '')
    setTiming(procedure.timing_notes ?? '')
    setError(null)
    setEditing(true)
  }

  function cancel() {
    setSetup(procedure.setup_notes ?? '')
    setTiming(procedure.timing_notes ?? '')
    setError(null)
    setEditing(false)
  }

  async function save() {
    setSubmitting(true)
    setError(null)
    const res = await fetch(`/api/procedures/${procedure.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        setup_notes: setup,
        timing_notes: timing,
      }),
    })
    setSubmitting(false)
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      setError(body?.error ?? 'Could not save.')
      return
    }
    setEditing(false)
    router.refresh()
  }

  if (editing) {
    return (
      <div className="space-y-4">
        <EditField label="OR Setup">
          <textarea
            value={setup}
            onChange={(e) => setSetup(e.target.value)}
            rows={4}
            placeholder="Patient positioning, table setup, equipment notes…"
            className="w-full rounded-md bg-[#0d1117] border border-[#1a2332] px-4 py-3 text-base focus:outline-none focus:border-[#4ade80]"
          />
        </EditField>
        <EditField label="Case Breakdown">
          <textarea
            value={timing}
            onChange={(e) => setTiming(e.target.value)}
            rows={4}
            placeholder="Steps, when to have implants ready, key transitions…"
            className="w-full rounded-md bg-[#0d1117] border border-[#1a2332] px-4 py-3 text-base focus:outline-none focus:border-[#4ade80]"
          />
        </EditField>

        {error && <p className="text-sm text-[#fb923c]">{error}</p>}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={cancel}
            disabled={submitting}
            className="flex-1 rounded-md border border-[#1a2332] py-3 text-sm font-medium text-white/70"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={submitting}
            className="flex-1 rounded-md bg-[#4ade80] text-[#052e16] font-semibold py-3 disabled:opacity-50"
          >
            {submitting ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <NotesBlock title="OR Setup" text={procedure.setup_notes} />
      <NotesBlock title="Case Breakdown" text={procedure.timing_notes} />
      <button
        type="button"
        onClick={startEditing}
        className="w-full rounded-md border border-dashed border-[#1a2332] py-3 text-sm text-[#4ade80]"
      >
        Edit setup
      </button>
    </div>
  )
}

function NotesTab({ procedure, flags }: { procedure: Procedure; flags: Flag[] }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [repNotes, setRepNotes] = useState(procedure.rep_notes ?? '')
  const [flagTexts, setFlagTexts] = useState<string[]>(flags.map((f) => f.text))
  const [newFlag, setNewFlag] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function startEditing() {
    setRepNotes(procedure.rep_notes ?? '')
    setFlagTexts(flags.map((f) => f.text))
    setNewFlag('')
    setError(null)
    setEditing(true)
  }

  function cancel() {
    setRepNotes(procedure.rep_notes ?? '')
    setFlagTexts(flags.map((f) => f.text))
    setNewFlag('')
    setError(null)
    setEditing(false)
  }

  function addFlag() {
    const trimmed = newFlag.trim()
    if (!trimmed) return
    setFlagTexts([...flagTexts, trimmed])
    setNewFlag('')
  }

  function removeFlag(idx: number) {
    setFlagTexts(flagTexts.filter((_, i) => i !== idx))
  }

  async function save() {
    setSubmitting(true)
    setError(null)

    const [notesRes, flagsRes] = await Promise.all([
      fetch(`/api/procedures/${procedure.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rep_notes: repNotes }),
      }),
      fetch(`/api/procedures/${procedure.id}/flags`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts: flagTexts }),
      }),
    ])

    setSubmitting(false)
    if (!notesRes.ok || !flagsRes.ok) {
      setError('Could not save changes.')
      return
    }
    setEditing(false)
    router.refresh()
  }

  if (editing) {
    return (
      <div className="space-y-4">
        <EditField label="Rep Notes">
          <textarea
            value={repNotes}
            onChange={(e) => setRepNotes(e.target.value)}
            rows={6}
            placeholder="Tribal knowledge about this surgeon for this procedure…"
            className="w-full rounded-md bg-[#0d1117] border border-[#1a2332] px-4 py-3 text-base focus:outline-none focus:border-[#4ade80]"
          />
        </EditField>

        <div>
          <span className="block text-xs uppercase tracking-wide text-white/50 mb-2">
            Flags
          </span>
          {flagTexts.length > 0 && (
            <ul className="flex flex-wrap gap-2 mb-3">
              {flagTexts.map((text, idx) => (
                <li key={idx}>
                  <button
                    type="button"
                    onClick={() => removeFlag(idx)}
                    className="inline-flex items-center gap-2 rounded-full border border-[#fb923c]/40 bg-[#1c0a00] px-3 py-1.5 text-sm text-[#fb923c]"
                    aria-label={`Remove flag: ${text}`}
                  >
                    <span>{text}</span>
                    <span className="text-[#fb923c]/70">×</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={newFlag}
              onChange={(e) => setNewFlag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addFlag()
                }
              }}
              placeholder="Add a flag (e.g. confirm graft size)"
              className="flex-1 rounded-md bg-[#0d1117] border border-[#1a2332] px-4 py-3 text-base focus:outline-none focus:border-[#4ade80]"
            />
            <button
              type="button"
              onClick={addFlag}
              disabled={!newFlag.trim()}
              className="rounded-md border border-[#1a2332] px-4 text-sm text-[#4ade80] disabled:opacity-40"
            >
              + Add
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-[#fb923c]">{error}</p>}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={cancel}
            disabled={submitting}
            className="flex-1 rounded-md border border-[#1a2332] py-3 text-sm font-medium text-white/70"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={submitting}
            className="flex-1 rounded-md bg-[#4ade80] text-[#052e16] font-semibold py-3 disabled:opacity-50"
          >
            {submitting ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <NotesBlock title="Rep Notes" text={procedure.rep_notes} />
      <button
        type="button"
        onClick={startEditing}
        className="w-full rounded-md border border-dashed border-[#1a2332] py-3 text-sm text-[#4ade80]"
      >
        Edit notes &amp; flags
      </button>
    </div>
  )
}

function EditField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wide text-white/50 mb-2">
        {label}
      </span>
      {children}
    </label>
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

