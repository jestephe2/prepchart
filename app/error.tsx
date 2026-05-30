'use client'

import { useRouter } from 'next/navigation'

export default function ErrorBoundary({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  function retry() {
    router.refresh()
    reset()
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
      <p className="text-sm text-white/60 mb-8 max-w-xs">
        We couldn&apos;t load this page. If you just signed up, your account
        was probably created — try again or head home.
      </p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={retry}
          className="rounded-md bg-accent text-accent-dark font-semibold px-6 py-3"
        >
          Try again
        </button>
        <button
          onClick={() => router.push('/')}
          className="rounded-md border border-border text-white/80 font-medium px-6 py-3"
        >
          Go home
        </button>
      </div>
    </main>
  )
}
