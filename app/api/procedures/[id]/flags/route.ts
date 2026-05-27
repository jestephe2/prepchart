import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { replaceFlags } from '@/lib/preferences'
import { ReplaceFlagsSchema } from '@/lib/schemas'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const result = ReplaceFlagsSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid input', issues: result.error.flatten() },
      { status: 400 }
    )
  }

  const flags = await replaceFlags(supabase, id, result.data.texts)
  return NextResponse.json(flags)
}
