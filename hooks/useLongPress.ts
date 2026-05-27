'use client'

import { useRef } from 'react'

export function useLongPress(
  onLongPress: () => void,
  { ms = 600 }: { ms?: number } = {}
) {
  const triggered = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function start() {
    triggered.current = false
    timer.current = setTimeout(() => {
      triggered.current = true
      onLongPress()
    }, ms)
  }

  function cancel() {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
  }

  return {
    onPointerDown: start,
    onPointerUp: cancel,
    onPointerLeave: cancel,
    onPointerCancel: cancel,
    onContextMenu: (e: React.MouseEvent) => {
      e.preventDefault()
    },
    onClick: (e: React.MouseEvent) => {
      if (triggered.current) {
        e.preventDefault()
        e.stopPropagation()
        triggered.current = false
      }
    },
  }
}
