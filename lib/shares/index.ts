import { SupabaseClient } from '@supabase/supabase-js'
import {
  getActiveShareByProcedure,
  getActiveShareByToken,
  getPreferences,
  getProcedure,
  getSurgeon,
  insertFlags,
  insertImplants,
  insertProcedure,
  insertShare,
  insertSurgeon,
} from '@/lib/data'
import type { Flag, ImplantPreference, Procedure, Share, Surgeon } from '@/lib/schemas'

export async function createShare(
  supabase: SupabaseClient,
  userId: string,
  procedureId: string
): Promise<Share> {
  const existing = await getActiveShareByProcedure(supabase, procedureId)
  if (existing) return existing

  const token = generateToken()
  return insertShare(supabase, {
    token,
    procedure_id: procedureId,
    created_by: userId,
  })
}

export async function getSharedCard(
  serviceSupabase: SupabaseClient,
  token: string
): Promise<{
  share: Share
  surgeon: Surgeon
  procedure: Procedure
  implants: ImplantPreference[]
  flags: Flag[]
} | null> {
  const share = await getActiveShareByToken(serviceSupabase, token)
  if (!share) return null

  const procedure = await getProcedure(serviceSupabase, share.procedure_id)
  if (!procedure) return null

  const surgeon = await getSurgeon(serviceSupabase, procedure.surgeon_id)
  if (!surgeon) return null

  const { implants, flags } = await getPreferences(serviceSupabase, procedure.id)
  return { share, surgeon, procedure, implants, flags }
}

export async function copyShareToUser(
  serviceSupabase: SupabaseClient,
  userSupabase: SupabaseClient,
  recipientUserId: string,
  token: string
): Promise<{ surgeonId: string; procedureId: string }> {
  const source = await getSharedCard(serviceSupabase, token)
  if (!source) {
    throw new Error('Share not found or revoked')
  }

  const { surgeon, procedure, implants, flags } = source

  const newSurgeon = await insertSurgeon(userSupabase, {
    user_id: recipientUserId,
    name: surgeon.name,
    specialty: surgeon.specialty ?? null,
    hospital: surgeon.hospital ?? null,
    initials: surgeon.initials ?? null,
  })

  const newProcedure = await insertProcedure(userSupabase, {
    surgeon_id: newSurgeon.id,
    name: procedure.name,
    sub_type: procedure.sub_type ?? null,
    icon: procedure.icon || '🔩',
  })

  // Carry the long-form notes over via an update — insertProcedure intentionally
  // only takes the create-shape, so we patch the rest.
  if (procedure.setup_notes || procedure.timing_notes || procedure.rep_notes) {
    const { error } = await userSupabase
      .from('procedures')
      .update({
        setup_notes: procedure.setup_notes ?? null,
        timing_notes: procedure.timing_notes ?? null,
        rep_notes: procedure.rep_notes ?? null,
      })
      .eq('id', newProcedure.id)
    if (error)
      throw new Error(`copyShareToUser notes patch failed: ${error.message}`)
  }

  if (implants.length > 0) {
    await insertImplants(
      userSupabase,
      newProcedure.id,
      implants.map((i) => ({
        preference_type: i.preference_type,
        implant_name: i.implant_name,
        part_number: i.part_number ?? null,
        detail_notes: i.detail_notes ?? null,
      }))
    )
  }

  if (flags.length > 0) {
    await insertFlags(
      userSupabase,
      newProcedure.id,
      flags.map((f) => f.text)
    )
  }

  return { surgeonId: newSurgeon.id, procedureId: newProcedure.id }
}

function generateToken(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 16)
}
