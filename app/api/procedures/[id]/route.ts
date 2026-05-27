import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deleteProcedure, updateProcedureNotes } from '@/lib/procedures'
import { UpdateProcedureNotesSchema } from '@/lib/schemas'

export async function PATCH(
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
  const result = UpdateProcedureNotesSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid input', issues: result.error.flatten() },
      { status: 400 }
    )
  }

  const procedure = await updateProcedureNotes(supabase, id, result.data)
  return NextResponse.json(procedure)
}

export async function DELETE(
  _request: Request,
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

  const removed = await deleteProcedure(supabase, id)
  if (!removed) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}
