import { SupabaseClient } from '@supabase/supabase-js'
import {
  deleteAllFlagsForProcedure,
  deleteAllImplantsForProcedure,
  insertFlags,
  insertImplants,
} from '@/lib/data'
import type { Flag, ImplantPreference, UpsertImplantInput } from '@/lib/schemas'

export async function replaceFlags(
  supabase: SupabaseClient,
  procedureId: string,
  texts: string[]
): Promise<Flag[]> {
  const cleaned = texts
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
  await deleteAllFlagsForProcedure(supabase, procedureId)
  return insertFlags(supabase, procedureId, cleaned)
}

export async function replaceImplants(
  supabase: SupabaseClient,
  procedureId: string,
  items: UpsertImplantInput[]
): Promise<ImplantPreference[]> {
  const cleaned = items
    .map((i) => ({
      preference_type: i.preference_type,
      implant_name: i.implant_name.trim(),
      part_number: i.part_number?.trim() || null,
      detail_notes: i.detail_notes?.trim() || null,
    }))
    .filter((i) => i.implant_name.length > 0)
  await deleteAllImplantsForProcedure(supabase, procedureId)
  return insertImplants(supabase, procedureId, cleaned)
}
