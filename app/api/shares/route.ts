import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createShare } from '@/lib/shares'
import { CreateShareSchema } from '@/lib/schemas'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const result = CreateShareSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid input', issues: result.error.flatten() },
      { status: 400 }
    )
  }

  const share = await createShare(supabase, user.id, result.data.procedure_id)

  const origin = new URL(request.url).origin
  return NextResponse.json(
    { token: share.token, url: `${origin}/share/${share.token}` },
    { status: 201 }
  )
}
