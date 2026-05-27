'use client'

export default function ErrorBoundary({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
      <p className="text-sm text-white/60 mb-8 max-w-xs">
        We couldn&apos;t load this page. Check your connection and try again.
      </p>
      <button
        onClick={reset}
        className="rounded-md bg-[#4ade80] text-[#052e16] font-semibold px-6 py-3"
      >
        Try again
      </button>
    </main>
  )
}
