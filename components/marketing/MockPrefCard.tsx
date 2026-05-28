// Swappable proof block. Render mirrors the real preference card 1:1 so the
// visual lands the same as the in-app screen. When a real screenshot is ready,
// delete this file and replace `<MockPrefCard />` in LandingPage.tsx with an
// <Image src="..." /> tag — one-line swap.

export function MockPrefCard() {
  return (
    <div className="rounded-2xl border border-border bg-surface-base p-6 shadow-2xl shadow-black/40 max-w-sm mx-auto">
      <div className="text-xs uppercase tracking-wide text-white/40 mb-3">
        ← Surgeons
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-accent-dark text-accent flex items-center justify-center font-semibold text-sm">
          AP
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold">Dr. Anya Patel</h3>
          <p className="text-xs text-white/50">Sports Medicine • Pacific Ortho</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-md bg-border flex items-center justify-center text-xl">
          🦵
        </div>
        <div>
          <h4 className="text-sm font-semibold">ACL Reconstruction</h4>
          <p className="text-xs text-white/50">BTB Autograft</p>
        </div>
      </div>

      <div className="rounded-md border border-flag/30 bg-flag-bg p-3 mb-4">
        <p className="text-[10px] uppercase tracking-wide text-flag mb-1">
          Flags
        </p>
        <p className="text-xs text-flag">Confirm graft size before incision</p>
      </div>

      <div className="flex border-b border-border mb-4">
        <span className="flex-1 text-xs font-medium border-b-2 border-accent text-accent py-2 text-center -mb-px">
          Implants
        </span>
        <span className="flex-1 text-xs font-medium border-b-2 border-transparent text-white/40 py-2 text-center -mb-px">
          Setup
        </span>
        <span className="flex-1 text-xs font-medium border-b-2 border-transparent text-white/40 py-2 text-center -mb-px">
          Rep Notes
        </span>
      </div>

      <div className="space-y-4">
        <section>
          <p className="text-[10px] uppercase tracking-wide text-white/50 mb-2">
            Implant Preference
          </p>
          <div className="rounded-md border border-border bg-surface-card p-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-medium">Arthrex TightRope</span>
              <span className="text-[10px] text-white/50">AR-1588T-2</span>
            </div>
          </div>
        </section>

        <section>
          <p className="text-[10px] uppercase tracking-wide text-white/50 mb-2">
            Bail Out
          </p>
          <div className="rounded-md border border-border bg-surface-card p-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-medium">Smith & Nephew Endobutton</span>
              <span className="text-[10px] text-white/50">EB-2.6</span>
            </div>
            <p className="text-xs text-white/60 mt-1">
              Use if TightRope is on backorder
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
