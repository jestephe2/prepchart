'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/'
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrorMessage(null)

    const callback = `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: callback,
      },
    })

    if (error) {
      setStatus('error')
      setErrorMessage(error.message)
      return
    }

    setStatus('sent')
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-[#080b10] text-white">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-2">PrefChart</h1>
        <p className="text-sm text-white/60 mb-8">
          Sign in to your surgeon preferences.
        </p>

        {status === 'sent' ? (
          <div className="rounded-md border border-[#1a2332] bg-[#0d1117] p-4 text-sm">
            Check <span className="font-medium">{email}</span> for your sign-in link.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="block text-xs uppercase tracking-wide text-white/50 mb-2">
                Email
              </span>
              <input
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md bg-[#0d1117] border border-[#1a2332] px-4 py-3 text-base focus:outline-none focus:border-[#4ade80]"
                placeholder="you@example.com"
              />
            </label>

            <button
              type="submit"
              disabled={status === 'sending' || !email}
              className="w-full rounded-md bg-[#4ade80] text-[#052e16] font-medium py-3 disabled:opacity-50"
            >
              {status === 'sending' ? 'Sending…' : 'Send me a link'}
            </button>

            {status === 'error' && errorMessage && (
              <p className="text-sm text-[#fb923c]">{errorMessage}</p>
            )}
          </form>
        )}
      </div>
    </main>
  )
}
