'use client'

import Link from 'next/link'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthShell } from '@/components/AuthShell'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthShell title="CaseCard" subtitle="Sign in to your surgeon preferences" />}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/'
  const hint = searchParams.get('hint')
  const initialEmail = searchParams.get('email') ?? ''
  const signupHref = `/signup?redirect=${encodeURIComponent(redirect)}`

  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState('')
  const [pwStatus, setPwStatus] = useState<'idle' | 'sending' | 'error'>('idle')
  const [pwError, setPwError] = useState<string | null>(null)

  const [linkStatus, setLinkStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [linkError, setLinkError] = useState<string | null>(null)

  async function handlePasswordSignIn(e: React.FormEvent) {
    e.preventDefault()
    setPwStatus('sending')
    setPwError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setPwStatus('error')
      setPwError(error.message)
      return
    }

    router.push(redirect)
    router.refresh()
  }

  async function handleMagicLink() {
    if (!email) {
      setLinkStatus('error')
      setLinkError('Enter your email above first.')
      return
    }
    setLinkStatus('sending')
    setLinkError(null)

    const supabase = createClient()
    const callback = `${window.location.origin}/auth/confirm?next=${encodeURIComponent(redirect)}`
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callback },
    })

    if (error) {
      setLinkStatus('error')
      setLinkError(error.message)
      return
    }

    setLinkStatus('sent')
  }

  return (
    <AuthShell title="CaseCard" subtitle="Sign in to your surgeon preferences">
      {hint === 'account_exists' && (
        <div className="mb-4 rounded-md border border-accent/30 bg-accent/10 p-3 text-sm text-accent">
          Looks like you already have an account — sign in instead.
        </div>
      )}

      <form onSubmit={handlePasswordSignIn} className="space-y-4">
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
          <div className="flex items-center justify-between mb-2">
            <span className="block text-xs uppercase tracking-wide text-white/50">
              Password
            </span>
            <Link
              href="/forgot-password"
              className="text-xs text-white/60 underline underline-offset-2"
            >
              Forgot?
            </Link>
          </div>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md bg-surface-card border border-border px-4 py-3 text-base focus:outline-none focus:border-accent"
          />
        </label>

        <button
          type="submit"
          disabled={pwStatus === 'sending' || !email || !password}
          className="w-full rounded-md bg-accent text-accent-dark font-medium py-3 disabled:opacity-50"
        >
          {pwStatus === 'sending' ? 'Signing in…' : 'Sign in'}
        </button>

        {pwStatus === 'error' && pwError && (
          <p className="text-sm text-flag">{pwError}</p>
        )}
      </form>

      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-white/30">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      {linkStatus === 'sent' ? (
        <div className="rounded-md border border-border bg-surface-card p-4 text-sm">
          Check <span className="font-medium">{email}</span> for your sign-in link.
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={handleMagicLink}
            disabled={linkStatus === 'sending'}
            className="w-full rounded-md border border-border py-3 text-sm font-medium text-white/90 disabled:opacity-50"
          >
            {linkStatus === 'sending' ? 'Sending…' : 'Email me a sign-in link instead'}
          </button>
          {linkStatus === 'error' && linkError && (
            <p className="mt-2 text-sm text-flag">{linkError}</p>
          )}
        </>
      )}

      <p className="mt-6 text-center text-sm text-white/60">
        Don&apos;t have an account?{' '}
        <Link href={signupHref} className="text-accent underline underline-offset-2">
          Create one
        </Link>
      </p>
    </AuthShell>
  )
}
