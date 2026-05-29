'use client'

import Link from 'next/link'
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { AuthShell } from '@/components/AuthShell'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<AuthShell title="Reset password" subtitle="We'll email you a reset link" />}>
      <ForgotPasswordForm />
    </Suspense>
  )
}

function ForgotPasswordForm() {
  const searchParams = useSearchParams()
  const initialEmail = searchParams.get('email') ?? ''

  const [email, setEmail] = useState(initialEmail)
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrorMessage(null)

    const supabase = createClient()
    const redirectTo = `${window.location.origin}/auth/confirm?type=recovery&next=/update-password`
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })

    if (error) {
      setStatus('error')
      setErrorMessage(error.message)
      return
    }

    setStatus('sent')
  }

  return (
    <AuthShell title="Reset password" subtitle="We'll email you a link to set a new one">
      {status === 'sent' ? (
        <div className="rounded-md border border-border bg-surface-card p-4 text-sm">
          If an account exists for <span className="font-medium">{email}</span>,
          you&apos;ll get a reset email shortly.
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
              className="w-full rounded-md bg-surface-card border border-border px-4 py-3 text-base focus:outline-none focus:border-accent"
              placeholder="you@example.com"
            />
          </label>

          <button
            type="submit"
            disabled={status === 'sending' || !email}
            className="w-full rounded-md bg-accent text-accent-dark font-medium py-3 disabled:opacity-50"
          >
            {status === 'sending' ? 'Sending…' : 'Send reset email'}
          </button>

          {status === 'error' && errorMessage && (
            <p className="text-sm text-flag">{errorMessage}</p>
          )}
        </form>
      )}

      <p className="mt-6 text-center text-sm text-white/60">
        Remembered it?{' '}
        <Link href="/login" className="text-accent underline underline-offset-2">
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  )
}
