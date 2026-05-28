import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSurgeon } from '@/lib/surgeons'
import { CreateSurgeonSchema } from '@/lib/schemas'
import { CapReachedError } from '@/lib/subscriptions'

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

  try {
    const surgeon = await createSurgeon(supabase, user.id, result.data)
    return NextResponse.json(surgeon, { status: 201 })
  } catch (err) {
    if (err instanceof CapReachedError) {
      return NextResponse.json(
        { error: 'cap_reached', kind: err.kind },
        { status: 402 }
      )
    }
    throw err
  }
}
