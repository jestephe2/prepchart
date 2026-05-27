import { SupabaseClient } from '@supabase/supabase-js'
import { Surgeon, Procedure, ImplantPreference, Flag } from './schemas'

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
