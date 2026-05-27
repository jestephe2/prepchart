'use client'

import { useEffect, useState } from 'react'

export function OfflineBanner() {
  const [online, setOnline] = useState(true)

  useEffect(() => {
    setOnline(navigator.onLine)
    function handleOnline() {
      setOnline(true)
    }
    function handleOffline() {
      setOnline(false)
    }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (online) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-0 z-10 bg-[#1c0a00] border-b border-[#fb923c]/30 text-[#fb923c] text-sm text-center py-2 px-4"
    >
      You&apos;re offline. Reconnect to save changes.
    </div>
  )
}
