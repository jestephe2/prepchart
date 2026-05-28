import { SupabaseClient } from '@supabase/supabase-js'
import {
  deleteProcedure as deleteProcedureRow,
  insertProcedure,
  updateProcedure,
} from '@/lib/data'
import type {
  CreateProcedureInput,
  Procedure,
  UpdateProcedureInput,
} from '@/lib/schemas'
import { canAddProcedure, CapReachedError } from '@/lib/subscriptions'

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
  if (!(await canAddProcedure(supabase, surgeonId))) {
    throw new CapReachedError('procedure')
  }
  return insertProcedure(supabase, {
    surgeon_id: surgeonId,
    name: input.name.trim(),
    sub_type: input.sub_type?.trim() || null,
    icon: input.icon?.trim() || '🔩',
  })
}

export async function updateProcedureFields(
  supabase: SupabaseClient,
  procedureId: string,
  input: UpdateProcedureInput
): Promise<Procedure> {
  const patch: Record<string, string | null> = {}
  if (input.name !== undefined) {
    patch.name = input.name.trim()
  }
  if (input.sub_type !== undefined) {
    patch.sub_type = input.sub_type?.trim() || null
  }
  if (input.icon !== undefined) {
    patch.icon = input.icon?.trim() || '🔩'
  }
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
