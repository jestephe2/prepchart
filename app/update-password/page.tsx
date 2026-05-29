'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthShell } from '@/components/AuthShell'
import { createClient } from '@/lib/supabase/client'

export default function UpdatePasswordPage() {
  const router = useRouter()
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
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setStatus('error')
      setErrorMessage(error.message)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <AuthShell title="Set a new password" subtitle="Choose something you'll remember">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="block text-xs uppercase tracking-wide text-white/50 mb-2">
            New password
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
            Confirm new password
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
          disabled={status === 'sending' || !password || !confirm}
          className="w-full rounded-md bg-accent text-accent-dark font-medium py-3 disabled:opacity-50"
        >
          {status === 'sending' ? 'Saving…' : 'Save new password'}
        </button>

        {status === 'error' && errorMessage && (
          <p className="text-sm text-flag">{errorMessage}</p>
        )}
      </form>
    </AuthShell>
  )
}
