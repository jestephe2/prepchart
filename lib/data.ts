import { SupabaseClient } from '@supabase/supabase-js'
import {
  Surgeon,
  Procedure,
  ImplantPreference,
  Flag,
  Share,
  UserProfile,
} from './schemas'

export async function getUserProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw new Error(`getUserProfile failed: ${error.message}`)
  return data
}

export async function upsertUserProfile(
  supabase: SupabaseClient,
  userId: string,
  patch: Partial<{
    onboarding_complete: boolean
    stripe_customer_id: string | null
    stripe_subscription_id: string | null
    subscription_status: string | null
    subscription_end: string | null
    cancel_at_period_end: boolean | null
  }>
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({ user_id: userId, ...patch }, { onConflict: 'user_id' })
    .select()
    .single()
  if (error) throw new Error(`upsertUserProfile failed: ${error.message}`)
  return data
}

export async function getProfileByStripeCustomerId(
  supabase: SupabaseClient,
  customerId: string
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('stripe_customer_id', customerId)
    .maybeSingle()
  if (error)
    throw new Error(`getProfileByStripeCustomerId failed: ${error.message}`)
  return data
}

export async function getProfileByStripeSubscriptionId(
  supabase: SupabaseClient,
  subscriptionId: string
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('stripe_subscription_id', subscriptionId)
    .maybeSingle()
  if (error)
    throw new Error(
      `getProfileByStripeSubscriptionId failed: ${error.message}`
    )
  return data
}

export async function insertShare(
  supabase: SupabaseClient,
  row: { token: string; procedure_id: string; created_by: string }
): Promise<Share> {
  const { data, error } = await supabase
    .from('shares')
    .insert(row)
    .select()
    .single()
  if (error) throw new Error(`insertShare failed: ${error.message}`)
  return data
}

export async function getActiveShareByProcedure(
  supabase: SupabaseClient,
  procedureId: string
): Promise<Share | null> {
  const { data, error } = await supabase
    .from('shares')
    .select('*')
    .eq('procedure_id', procedureId)
    .is('revoked_at', null)
    .maybeSingle()
  if (error) throw new Error(`getActiveShareByProcedure failed: ${error.message}`)
  return data
}

export async function getActiveShareByToken(
  supabase: SupabaseClient,
  token: string
): Promise<Share | null> {
  const { data, error } = await supabase
    .from('shares')
    .select('*')
    .eq('token', token)
    .is('revoked_at', null)
    .maybeSingle()
  if (error) throw new Error(`getActiveShareByToken failed: ${error.message}`)
  return data
}

export async function insertSurgeon(
  supabase: SupabaseClient,
  row: {
    user_id: string
    name: string
    specialty?: string | null
    hospital?: string | null
    initials?: string | null
  }
): Promise<Surgeon> {
  const { data, error } = await supabase
    .from('surgeons')
    .insert(row)
    .select()
    .single()
  if (error) throw new Error(`insertSurgeon failed: ${error.message}`)
  return data
}

export async function updateProcedure(
  supabase: SupabaseClient,
  id: string,
  patch: Partial<{
    setup_notes: string | null
    timing_notes: string | null
    rep_notes: string | null
    name: string
    sub_type: string | null
    icon: string
  }>
): Promise<Procedure> {
  const { data, error } = await supabase
    .from('procedures')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(`updateProcedure failed: ${error.message}`)
  return data
}

export async function insertProcedure(
  supabase: SupabaseClient,
  row: {
    surgeon_id: string
    name: string
    sub_type?: string | null
    icon?: string
  }
): Promise<Procedure> {
  const { data, error } = await supabase
    .from('procedures')
    .insert(row)
    .select()
    .single()
  if (error) throw new Error(`insertProcedure failed: ${error.message}`)
  return data
}

export async function updateSurgeon(
  supabase: SupabaseClient,
  id: string,
  patch: Partial<{
    name: string
    specialty: string | null
    hospital: string | null
    initials: string | null
  }>
): Promise<Surgeon> {
  const { data, error } = await supabase
    .from('surgeons')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(`updateSurgeon failed: ${error.message}`)
  return data
}

export async function deleteSurgeon(
  supabase: SupabaseClient,
  id: string
): Promise<number> {
  const { count, error } = await supabase
    .from('surgeons')
    .delete({ count: 'exact' })
    .eq('id', id)
  if (error) throw new Error(`deleteSurgeon failed: ${error.message}`)
  return count ?? 0
}

export async function deleteProcedure(
  supabase: SupabaseClient,
  id: string
): Promise<number> {
  const { count, error } = await supabase
    .from('procedures')
    .delete({ count: 'exact' })
    .eq('id', id)
  if (error) throw new Error(`deleteProcedure failed: ${error.message}`)
  return count ?? 0
}

export async function getSurgeons(supabase: SupabaseClient): Promise<Surgeon[]> {
  const { data, error } = await supabase
    .from('surgeons')
    .select('*')
    .order('name')
  if (error) throw new Error(`getSurgeons failed: ${error.message}`)
  return data ?? []
}

export async function getUpcomingSurgeons(
  supabase: SupabaseClient
): Promise<Surgeon[]> {
  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('surgeons')
    .select('*')
    .gte('last_case_date', today)
    .order('last_case_date')
  if (error) throw new Error(`getUpcomingSurgeons failed: ${error.message}`)
  return data ?? []
}

export async function getStats(
  supabase: SupabaseClient
): Promise<{ surgeonCount: number; procedureCount: number }> {
  const [surgeons, procedures] = await Promise.all([
    supabase.from('surgeons').select('*', { count: 'exact', head: true }),
    supabase.from('procedures').select('*', { count: 'exact', head: true }),
  ])
  if (surgeons.error) throw new Error(`getStats(surgeons) failed: ${surgeons.error.message}`)
  if (procedures.error) throw new Error(`getStats(procedures) failed: ${procedures.error.message}`)
  return {
    surgeonCount: surgeons.count ?? 0,
    procedureCount: procedures.count ?? 0,
  }
}

export async function getSurgeon(
  supabase: SupabaseClient,
  id: string
): Promise<Surgeon | null> {
  const { data, error } = await supabase
    .from('surgeons')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw new Error(`getSurgeon failed: ${error.message}`)
  return data
}

export async function getProcedures(
  supabase: SupabaseClient,
  surgeonId: string
): Promise<Procedure[]> {
  const { data, error } = await supabase
    .from('procedures')
    .select('*')
    .eq('surgeon_id', surgeonId)
    .order('name')
  if (error) throw new Error(`getProcedures failed: ${error.message}`)
  return data ?? []
}

export async function getProcedure(
  supabase: SupabaseClient,
  id: string
): Promise<Procedure | null> {
  const { data, error } = await supabase
    .from('procedures')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw new Error(`getProcedure failed: ${error.message}`)
  return data
}

export async function insertImplants(
  supabase: SupabaseClient,
  procedureId: string,
  rows: Array<{
    preference_type: string
    implant_name: string
    part_number?: string | null
    detail_notes?: string | null
  }>
): Promise<ImplantPreference[]> {
  if (rows.length === 0) return []
  const payload = rows.map((r) => ({ ...r, procedure_id: procedureId }))
  const { data, error } = await supabase
    .from('implant_preferences')
    .insert(payload)
    .select()
  if (error) throw new Error(`insertImplants failed: ${error.message}`)
  return data ?? []
}

export async function deleteAllImplantsForProcedure(
  supabase: SupabaseClient,
  procedureId: string
): Promise<void> {
  const { error } = await supabase
    .from('implant_preferences')
    .delete()
    .eq('procedure_id', procedureId)
  if (error)
    throw new Error(`deleteAllImplantsForProcedure failed: ${error.message}`)
}

export async function insertFlags(
  supabase: SupabaseClient,
  procedureId: string,
  texts: string[]
): Promise<Flag[]> {
  if (texts.length === 0) return []
  const rows = texts.map((text) => ({ procedure_id: procedureId, text }))
  const { data, error } = await supabase
    .from('flags')
    .insert(rows)
    .select()
  if (error) throw new Error(`insertFlags failed: ${error.message}`)
  return data ?? []
}

export async function deleteAllFlagsForProcedure(
  supabase: SupabaseClient,
  procedureId: string
): Promise<void> {
  const { error } = await supabase
    .from('flags')
    .delete()
    .eq('procedure_id', procedureId)
  if (error) throw new Error(`deleteAllFlagsForProcedure failed: ${error.message}`)
}

export async function getPreferences(
  supabase: SupabaseClient,
  procedureId: string
): Promise<{ implants: ImplantPreference[]; flags: Flag[] }> {
  const [implants, flagsResult] = await Promise.all([
    supabase
      .from('implant_preferences')
      .select('*')
      .eq('procedure_id', procedureId)
      .order('implant_name'),
    supabase
      .from('flags')
      .select('*')
      .eq('procedure_id', procedureId),
  ])
  if (implants.error)
    throw new Error(`getImplants failed: ${implants.error.message}`)
  if (flagsResult.error)
    throw new Error(`getFlags failed: ${flagsResult.error.message}`)
  return {
    implants: implants.data ?? [],
    flags: flagsResult.data ?? [],
  }
}
