export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children?: React.ReactNode
}) {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-surface-base text-white">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-2">{title}</h1>
        {subtitle && (
          <p className="text-sm text-white/60 mb-8">{subtitle}</p>
        )}
        {!subtitle && <div className="mb-8" />}
        {children}
      </div>
    </main>
  )
}
