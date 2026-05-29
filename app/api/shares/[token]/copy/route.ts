import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { copyShareToUser } from '@/lib/shares'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const userSupabase = await createClient()
  const {
    data: { user },
  } = await userSupabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const serviceSupabase = createServiceClient()
  try {
    const { surgeonId, procedureId } = await copyShareToUser(
      serviceSupabase,
      userSupabase,
      user.id,
      token
    )
    return NextResponse.json({ surgeon_id: surgeonId, procedure_id: procedureId })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Copy failed'
    if (message.includes('not found')) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 })
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
