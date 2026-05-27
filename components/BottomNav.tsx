'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const items = [
  { href: '/', label: 'Home' },
  { href: '/surgeons', label: 'Surgeons' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 border-t border-[#1a2332] bg-[#0d1117]">
      <div className="relative flex items-center">
        {items.map((item, idx) => {
          const active =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-3 text-sm ${
                active ? 'text-[#4ade80]' : 'text-white/70'
              } ${idx === 0 ? 'pr-8' : 'pl-8'}`}
            >
              {item.label}
            </Link>
          )
        })}
        <Link
          href="/surgeons/new"
          aria-label="Add surgeon"
          className="absolute left-1/2 -translate-x-1/2 -top-5 w-14 h-14 rounded-full bg-[#4ade80] text-[#052e16] flex items-center justify-center text-3xl font-light shadow-lg shadow-black/40"
        >
          +
        </Link>
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}
