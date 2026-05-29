'use client'

import Link from 'next/link'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthShell } from '@/components/AuthShell'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  return (
    <Suspense fallback={<AuthShell title="CaseCard" subtitle="Create your account" />}>
      <SignupForm />
    </Suspense>
  )
}

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/'
  const loginHref = `/login?redirect=${encodeURIComponent(redirect)}`

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMessage(null)

    if (password !== confirm) {
      setStatus('error')
      setErrorMessage('Passwords do not match.')
      return
    }

    setStatus('sending')
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setStatus('error')
      setErrorMessage(error.message)
      return
    }

    // Supabase returns data.session = null with no error when the email already
    // exists in auth.users (it silently sends a confirmation email). Don't push
    // into the protected redirect — bounce to /login with a hint instead.
    if (!data.session) {
      router.push(
        `/login?email=${encodeURIComponent(email)}&hint=account_exists&redirect=${encodeURIComponent(redirect)}`
      )
      return
    }

    router.push(redirect)
    router.refresh()
  }

  return (
    <AuthShell title="CaseCard" subtitle="Create your account">
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

        <label className="block">
          <span className="block text-xs uppercase tracking-wide text-white/50 mb-2">
            Password
          </span>
          <input
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md bg-surface-card border border-border px-4 py-3 text-base focus:outline-none focus:border-accent"
            placeholder="At least 6 characters"
          />
        </label>

        <label className="block">
          <span className="block text-xs uppercase tracking-wide text-white/50 mb-2">
            Confirm password
          </span>
          <input
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-md bg-surface-card border border-border px-4 py-3 text-base focus:outline-none focus:border-accent"
          />
        </label>

        <button
          type="submit"
          disabled={status === 'sending' || !email || !password || !confirm}
          className="w-full rounded-md bg-accent text-accent-dark font-medium py-3 disabled:opacity-50"
        >
          {status === 'sending' ? 'Creating account…' : 'Create account'}
        </button>

        {status === 'error' && errorMessage && (
          <p className="text-sm text-flag">{errorMessage}</p>
        )}
      </form>

      <p className="mt-6 text-center text-sm text-white/60">
        Already have an account?{' '}
        <Link href={loginHref} className="text-accent underline underline-offset-2">
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}
