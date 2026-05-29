'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function LogoutButton() {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function logout() {
    setPending(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={pending}
      className="w-full rounded-md border border-border py-3 text-sm font-medium text-white/90 disabled:opacity-50"
    >
      {pending ? 'Signing out…' : 'Sign out'}
    </button>
  )
}
