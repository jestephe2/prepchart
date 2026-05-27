import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSurgeon } from '@/lib/surgeons'
import { CreateSurgeonSchema } from '@/lib/schemas'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const result = CreateSurgeonSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid input', issues: result.error.flatten() },
      { status: 400 }
    )
  }

  const surgeon = await createSurgeon(supabase, user.id, result.data)
  return NextResponse.json(surgeon, { status: 201 })
}
