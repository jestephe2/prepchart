'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { CreateProcedureSchema } from '@/lib/schemas'

const ICONS = ['🔩', '🦴', '🩻', '🦵', '🤲', '🧠', '❤️', '⚙️'] as const

export type ProcedureFormInitial = {
  name: string
  sub_type: string | null
  icon: string
}

export function ProcedureForm({
  mode,
  surgeonId,
  procedureId,
  initial,
}: {
  mode: 'create' | 'edit'
  surgeonId: string
  procedureId?: string
  initial?: ProcedureFormInitial
}) {
  const router = useRouter()
  const [name, setName] = useState(initial?.name ?? '')
  const [subType, setSubType] = useState(initial?.sub_type ?? '')
  const [icon, setIcon] = useState<string>(initial?.icon || ICONS[0])
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError(null)
    setFieldErrors({})

    const payload = {
      name: name.trim(),
      sub_type: subType.trim() || null,
      icon,
    }

    const parsed = CreateProcedureSchema.safeParse(payload)
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors
      setFieldErrors(
        Object.fromEntries(
          Object.entries(flat).map(([k, v]) => [k, v?.[0] ?? 'Invalid'])
        )
      )
      return
    }

    setSubmitting(true)

    let res: Response
    if (mode === 'edit') {
      res = await fetch(`/api/procedures/${procedureId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })
    } else {
      res = await fetch('/api/procedures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...parsed.data, surgeon_id: surgeonId }),
      })
    }

    if (!res.ok) {
      setSubmitting(false)
      const body = await res.json().catch(() => null)
      setSubmitError(body?.error ?? 'Could not save procedure.')
      return
    }

    const procedure = await res.json()
    router.push(`/surgeons/${surgeonId}/procedures/${procedure.id}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Procedure name" error={fieldErrors.name}>
        <input
          type="text"
          required
          autoComplete="off"
          autoFocus={mode === 'create'}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ACL Reconstruction"
          className="w-full rounded-md bg-[#0d1117] border border-[#1a2332] px-4 py-3 text-base focus:outline-none focus:border-[#4ade80]"
        />
      </Field>

      <Field
        label="Sub-type / descriptor"
        hint="Optional. E.g. BTB Autograft, Meniscal Repair."
        error={fieldErrors.sub_type}
      >
        <input
          type="text"
          autoComplete="off"
          value={subType}
          onChange={(e) => setSubType(e.target.value)}
          className="w-full rounded-md bg-[#0d1117] border border-[#1a2332] px-4 py-3 text-base focus:outline-none focus:border-[#4ade80]"
        />
      </Field>

      <div>
        <span className="block text-xs uppercase tracking-wide text-white/50 mb-2">
          Icon
        </span>
        <div className="grid grid-cols-4 gap-2">
          {ICONS.map((emoji) => {
            const active = emoji === icon
            return (
              <button
                key={emoji}
                type="button"
                onClick={() => setIcon(emoji)}
                className={`py-4 text-2xl rounded-md border ${
                  active
                    ? 'border-[#4ade80] bg-[#052e16]'
                    : 'border-[#1a2332] bg-[#0d1117]'
                }`}
                aria-pressed={active}
              >
                {emoji}
              </button>
            )
          })}
        </div>
      </div>

      {submitError && <p className="text-sm text-[#fb923c]">{submitError}</p>}

      <button
        type="submit"
        disabled={submitting || !name.trim()}
        className="w-full rounded-md bg-[#4ade80] text-[#052e16] font-semibold py-3 disabled:opacity-50"
      >
        {submitting
          ? 'Saving…'
          : mode === 'edit'
          ? 'Save changes'
          : 'Add procedure'}
      </button>
    </form>
  )
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wide text-white/50 mb-2">
        {label}
      </span>
      {children}
      {hint && !error && (
        <span className="block text-xs text-white/40 mt-1">{hint}</span>
      )}
      {error && (
        <span className="block text-xs text-[#fb923c] mt-1">{error}</span>
      )}
    </label>
  )
}
