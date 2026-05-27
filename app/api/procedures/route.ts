import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createProcedure } from '@/lib/procedures'
import { CreateProcedureSchema } from '@/lib/schemas'

const RequestSchema = CreateProcedureSchema.extend({
  surgeon_id: z.string().uuid(),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const result = RequestSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid input', issues: result.error.flatten() },
      { status: 400 }
    )
  }

  const { surgeon_id, ...input } = result.data
  const procedure = await createProcedure(supabase, surgeon_id, input)
  return NextResponse.json(procedure, { status: 201 })
}
