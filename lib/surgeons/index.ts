import { SupabaseClient } from '@supabase/supabase-js'
import {
  deleteSurgeon as deleteSurgeonRow,
  insertSurgeon,
  updateSurgeon as updateSurgeonRow,
} from '@/lib/data'
import type { CreateSurgeonInput, Surgeon } from '@/lib/schemas'

export async function deleteSurgeon(
  supabase: SupabaseClient,
  id: string
): Promise<boolean> {
  const count = await deleteSurgeonRow(supabase, id)
  return count > 0
}

export async function createSurgeon(
  supabase: SupabaseClient,
  userId: string,
  input: CreateSurgeonInput
): Promise<Surgeon> {
  const initials = input.initials?.trim() || initialsFromName(input.name)
  return insertSurgeon(supabase, {
    user_id: userId,
    name: input.name.trim(),
    specialty: input.specialty?.trim() || null,
    hospital: input.hospital?.trim() || null,
    initials: initials || null,
  })
}

export async function updateSurgeon(
  supabase: SupabaseClient,
  id: string,
  input: CreateSurgeonInput
): Promise<Surgeon> {
  const initials = input.initials?.trim() || initialsFromName(input.name)
  return updateSurgeonRow(supabase, id, {
    name: input.name.trim(),
    specialty: input.specialty?.trim() || null,
    hospital: input.hospital?.trim() || null,
    initials: initials || null,
  })
}

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 3)
}
