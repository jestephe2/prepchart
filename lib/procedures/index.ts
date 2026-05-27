import { SupabaseClient } from '@supabase/supabase-js'
import {
  deleteProcedure as deleteProcedureRow,
  insertProcedure,
  updateProcedure,
} from '@/lib/data'
import type {
  CreateProcedureInput,
  Procedure,
  UpdateProcedureNotesInput,
} from '@/lib/schemas'

export async function deleteProcedure(
  supabase: SupabaseClient,
  id: string
): Promise<boolean> {
  const count = await deleteProcedureRow(supabase, id)
  return count > 0
}

export async function createProcedure(
  supabase: SupabaseClient,
  surgeonId: string,
  input: CreateProcedureInput
): Promise<Procedure> {
  return insertProcedure(supabase, {
    surgeon_id: surgeonId,
    name: input.name.trim(),
    sub_type: input.sub_type?.trim() || null,
    icon: input.icon?.trim() || '🔩',
  })
}

export async function updateProcedureNotes(
  supabase: SupabaseClient,
  procedureId: string,
  input: UpdateProcedureNotesInput
): Promise<Procedure> {
  const patch: Record<string, string | null> = {}
  if (input.setup_notes !== undefined) {
    patch.setup_notes = input.setup_notes?.trim() || null
  }
  if (input.timing_notes !== undefined) {
    patch.timing_notes = input.timing_notes?.trim() || null
  }
  if (input.rep_notes !== undefined) {
    patch.rep_notes = input.rep_notes?.trim() || null
  }
  return updateProcedure(supabase, procedureId, patch)
}
