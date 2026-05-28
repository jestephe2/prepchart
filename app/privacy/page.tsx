// TODO(pre-launch): replace with real privacy policy before public launch.
// Stub exists only to prevent a 404 on the footer link.

import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <main className="flex-1 px-6 pt-12 pb-12 max-w-2xl mx-auto w-full">
      <Link href="/" className="text-sm text-white/60">
        ← CaseCard
      </Link>
      <h1 className="mt-6 text-3xl font-semibold">Privacy</h1>
      <p className="mt-4 text-base text-white/70">
        CaseCard respects your privacy. A full policy is on its way.
      </p>
    </main>
  )
}
