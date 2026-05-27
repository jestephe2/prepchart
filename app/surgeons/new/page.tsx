import Link from 'next/link'
import { SurgeonForm } from '@/components/SurgeonForm'

export default function NewSurgeonPage() {
  return (
    <main className="flex-1 px-6 pt-12 pb-12">
      <div className="mb-6">
        <Link href="/surgeons" className="text-sm text-white/60">
          ← Cancel
        </Link>
      </div>

      <h1 className="text-2xl font-semibold mb-8">Add surgeon</h1>

      <SurgeonForm mode="create" />
    </main>
  )
}
