'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { CreateSurgeonSchema } from '@/lib/schemas'

const SPECIALTIES = [
  'Sports Medicine',
  'Ortho Trauma',
  'Spine',
  'General Ortho',
  'Other',
] as const

export type SurgeonFormInitial = {
  name: string
  specialty: string | null
  hospital: string | null
  initials: string | null
}

export function SurgeonForm({
  mode,
  surgeonId,
  initial,
}: {
  mode: 'create' | 'edit'
  surgeonId?: string
  initial?: SurgeonFormInitial
}) {
  const router = useRouter()
  const [name, setName] = useState(initial?.name ?? '')
  const [specialty, setSpecialty] = useState(initial?.specialty ?? '')
  const [hospital, setHospital] = useState(initial?.hospital ?? '')
  const [initials, setInitials] = useState(initial?.initials ?? '')
  const [initialsTouched, setInitialsTouched] = useState(
    Boolean(initial?.initials)
  )
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const effectiveInitials = initialsTouched ? initials : computeInitials(name)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError(null)
    setFieldErrors({})

    const payload = {
      name: name.trim(),
      specialty: specialty || null,
      hospital: hospital.trim() || null,
      initials: effectiveInitials.trim() || null,
    }

    const parsed = CreateSurgeonSchema.safeParse(payload)
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
    const url = mode === 'edit' ? `/api/surgeons/${surgeonId}` : '/api/surgeons'
    const method = mode === 'edit' ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    })

    if (!res.ok) {
      setSubmitting(false)
      const body = await res.json().catch(() => null)
      setSubmitError(body?.error ?? 'Could not save surgeon.')
      return
    }

    const surgeon = await res.json()
    router.push(`/surgeons/${surgeon.id}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Name" error={fieldErrors.name}>
        <input
          type="text"
          required
          autoComplete="off"
          autoFocus={mode === 'create'}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Dr. Sarah Chen"
          className="w-full rounded-md bg-[#0d1117] border border-[#1a2332] px-4 py-3 text-base focus:outline-none focus:border-[#4ade80]"
        />
      </Field>

      <Field label="Specialty" error={fieldErrors.specialty}>
        <select
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          className="w-full rounded-md bg-[#0d1117] border border-[#1a2332] px-4 py-3 text-base focus:outline-none focus:border-[#4ade80]"
        >
          <option value="">Select specialty</option>
          {SPECIALTIES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Hospital" error={fieldErrors.hospital}>
        <input
          type="text"
          autoComplete="off"
          value={hospital}
          onChange={(e) => setHospital(e.target.value)}
          placeholder="Sutter Medical Center"
          className="w-full rounded-md bg-[#0d1117] border border-[#1a2332] px-4 py-3 text-base focus:outline-none focus:border-[#4ade80]"
        />
      </Field>

      <Field
        label="Initials"
        error={fieldErrors.initials}
        hint="Auto-filled from name. Edit if you prefer something else."
      >
        <input
          type="text"
          maxLength={3}
          value={effectiveInitials}
          onChange={(e) => {
            setInitialsTouched(true)
            setInitials(e.target.value.toUpperCase())
          }}
          className="w-full rounded-md bg-[#0d1117] border border-[#1a2332] px-4 py-3 text-base focus:outline-none focus:border-[#4ade80]"
        />
      </Field>

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
          : 'Add surgeon'}
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

function computeInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 3)
}
