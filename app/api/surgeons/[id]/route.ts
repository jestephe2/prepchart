import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deleteSurgeon } from '@/lib/surgeons'

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

  const removed = await deleteSurgeon(supabase, id)
  if (!removed) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}
