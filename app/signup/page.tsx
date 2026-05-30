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

    // Supabase signals "email already in use" two different ways depending on
    // the project's email-confirmation setting:
    //   1. Confirm email OFF → explicit error with code 'user_already_exists'
    //      (sometimes 'email_address_already_in_use') and message "User already
    //      registered".
    //   2. Confirm email ON  → no error, but data.session is null (it silently
    //      sends an account-already-exists notification email).
    // Both should funnel to /login with the account-exists hint.
    const alreadyExists =
      (error &&
        (error.code === 'user_already_exists' ||
          error.code === 'email_address_already_in_use' ||
          /already (registered|exists|in use)/i.test(error.message))) ||
      (!error && !data.session)

    if (alreadyExists) {
      router.push(
        `/login?email=${encodeURIComponent(email)}&hint=account_exists&redirect=${encodeURIComponent(redirect)}`
      )
      return
    }

    if (error) {
      setStatus('error')
      setErrorMessage(error.message)
      return
    }

    // Brand-new signup with no specific redirect target: send directly to the
    // first onboarding step instead of bouncing through / and letting middleware
    // redirect. One fewer round-trip on the hop where Supabase compute is most
    // likely to be cold/throttled.
    const target = redirect === '/' ? '/welcome/surgeon' : redirect
    router.push(target)
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
