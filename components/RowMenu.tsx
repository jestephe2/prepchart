'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

export type RowMenuItem = {
  label: string
  href?: string
  onClick?: () => void
  danger?: boolean
}

export function RowMenu({
  items,
  triggerLabel,
}: {
  items: RowMenuItem[]
  triggerLabel: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handlePointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  function stop(e: React.SyntheticEvent) {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={triggerLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onPointerDown={stop}
        onClick={(e) => {
          stop(e)
          setOpen((v) => !v)
        }}
        className="flex items-center justify-center w-9 h-9 rounded-md text-white/70 hover:bg-[#1a2332] active:bg-[#1a2332] text-lg leading-none"
      >
        <span aria-hidden="true">⋯</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 min-w-[140px] rounded-md border border-[#1a2332] bg-[#0d1117] shadow-lg z-20 py-1"
        >
          {items.map((item, i) =>
            item.href ? (
              <Link
                key={i}
                href={item.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                onPointerDown={(e) => e.stopPropagation()}
                className={`block px-4 py-2 text-sm ${
                  item.danger ? 'text-[#fb923c]' : 'text-white/90'
                } hover:bg-[#1a2332]`}
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={i}
                type="button"
                role="menuitem"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  stop(e)
                  setOpen(false)
                  item.onClick?.()
                }}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  item.danger ? 'text-[#fb923c]' : 'text-white/90'
                } hover:bg-[#1a2332]`}
              >
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}
