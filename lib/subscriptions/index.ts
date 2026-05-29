import { SupabaseClient } from '@supabase/supabase-js'
import { getUserProfile } from '@/lib/data'

const FREE_SURGEON_CAP = 2
const FREE_PROCEDURE_CAP_PER_SURGEON = 3

export type SubscriptionState = {
  tier: 'free' | 'pro'
  status: string | null
  subscriptionEnd: string | null
  cancelAtPeriodEnd: boolean
}

async function fetchIsPro(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc('user_is_pro', {
    p_user_id: userId,
  })
  if (error) throw new Error(`user_is_pro RPC failed: ${error.message}`)
  return data === true
}

export async function getSubscription(
  supabase: SupabaseClient,
  userId: string
): Promise<SubscriptionState> {
  const [isPro, profile] = await Promise.all([
    fetchIsPro(supabase, userId),
    getUserProfile(supabase, userId),
  ])
  return {
    tier: isPro ? 'pro' : 'free',
    status: profile?.subscription_status ?? null,
    subscriptionEnd: profile?.subscription_end ?? null,
    cancelAtPeriodEnd: profile?.cancel_at_period_end ?? false,
  }
}

export async function canAddSurgeon(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  if (await fetchIsPro(supabase, userId)) return true

  const { count, error } = await supabase
    .from('surgeons')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
  if (error) throw new Error(`canAddSurgeon count failed: ${error.message}`)
  return (count ?? 0) < FREE_SURGEON_CAP
}

export async function canAddProcedure(
  supabase: SupabaseClient,
  surgeonId: string
): Promise<boolean> {
  const { data: surgeon, error: surgeonErr } = await supabase
    .from('surgeons')
    .select('user_id')
    .eq('id', surgeonId)
    .maybeSingle()
  if (surgeonErr)
    throw new Error(`canAddProcedure surgeon lookup failed: ${surgeonErr.message}`)
  if (!surgeon) return false

  if (await fetchIsPro(supabase, surgeon.user_id)) return true

  const { count, error } = await supabase
    .from('procedures')
    .select('id', { count: 'exact', head: true })
    .eq('surgeon_id', surgeonId)
  if (error) throw new Error(`canAddProcedure count failed: ${error.message}`)
  return (count ?? 0) < FREE_PROCEDURE_CAP_PER_SURGEON
}

export class CapReachedError extends Error {
  readonly kind: 'surgeon' | 'procedure'

  constructor(kind: 'surgeon' | 'procedure') {
    super(`cap_reached:${kind}`)
    this.kind = kind
    this.name = 'CapReachedError'
  }
}
