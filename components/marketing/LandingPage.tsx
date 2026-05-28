import Link from 'next/link'
import { MockPrefCard } from './MockPrefCard'

export function LandingPage() {
  return (
    <div className="flex-1 flex flex-col">
      <Nav />
      <Hero />
      <Problem />
      <HowItWorks />
      <Proof />
      <CTAFooter />
      <Footer />
    </div>
  )
}

function Nav() {
  return (
    <nav className="px-6 py-5 flex items-center justify-between border-b border-border">
      <span className="text-base font-semibold">CaseCard</span>
      <Link href="/login" className="text-sm text-white/70">
        Sign in
      </Link>
    </nav>
  )
}

function Hero() {
  return (
    <section className="px-6 pt-12 pb-16 sm:pt-20 sm:pb-24 max-w-2xl mx-auto w-full">
      <h1 className="text-4xl sm:text-5xl font-semibold leading-tight tracking-tight">
        Your surgeon preferences.
        <br />
        <span className="text-accent">Always with you.</span>
      </h1>
      <p className="mt-5 text-base sm:text-lg text-white/70 max-w-md">
        Pull up any surgeon, any procedure, any implant — in two taps.
      </p>
      <Link
        href="/login"
        className="mt-8 inline-block rounded-md bg-accent text-accent-dark font-semibold px-6 py-3 text-base"
      >
        Get started free
      </Link>
    </section>
  )
}

function Problem() {
  return (
    <section className="px-6 py-12 max-w-2xl mx-auto w-full space-y-4 text-base sm:text-lg text-white/80">
      <p>Tribal knowledge walks out the door when a rep leaves.</p>
      <p>
        Notebooks get lost. Texts get buried. A new procedure catches you
        flat-footed.
      </p>
      <p>
        CaseCard keeps every surgeon&apos;s card a tap away — including the
        bail-outs for when their #1 is on backorder.
      </p>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    {
      n: 1,
      title: 'Add surgeons',
      body: 'Name, specialty, hospital. Done.',
    },
    {
      n: 2,
      title: 'Map procedures',
      body: 'What they do, in their words. Pick an icon to scan fast.',
    },
    {
      n: 3,
      title: 'Pull up the card',
      body: 'Preferred implants, bail-outs, setup notes, flags. Before you walk in.',
    },
  ]
  return (
    <section className="px-6 py-12 max-w-4xl mx-auto w-full">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {steps.map((s) => (
          <div
            key={s.n}
            className="rounded-md border border-border bg-surface-card p-5"
          >
            <div className="w-8 h-8 rounded-full bg-accent-dark text-accent flex items-center justify-center font-semibold text-sm mb-3">
              {s.n}
            </div>
            <h3 className="text-base font-semibold mb-2">{s.title}</h3>
            <p className="text-sm text-white/60">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Proof() {
  return (
    <section className="px-6 py-12 max-w-2xl mx-auto w-full">
      <MockPrefCard />
    </section>
  )
}

function CTAFooter() {
  return (
    <section className="px-6 py-16 sm:py-20 border-t border-border bg-surface-card">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Start with your next case.
        </h2>
        <p className="mt-3 text-base text-white/70">
          Free to try. No credit card.
        </p>
        <Link
          href="/login"
          className="mt-7 inline-block rounded-md bg-accent text-accent-dark font-semibold px-6 py-3 text-base"
        >
          Get started free
        </Link>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="px-6 py-6 text-xs text-white/40 flex items-center justify-center gap-2">
      <Link href="/privacy" className="hover:text-white/60">
        Privacy
      </Link>
      <span>·</span>
      <span>© 2026 CaseCard</span>
      <span>·</span>
      <span>Built for ortho reps</span>
    </footer>
  )
}
