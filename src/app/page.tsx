import Link from "next/link";

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    title: "Instant Slot Booking",
    desc: "Browse real-time availability and book your preferred slot in seconds. No calls, no waiting.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Team Management",
    desc: "Create teams, add players, assign roles. Keep your squad organised all in one place.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4" /><path d="M19 7V4H8" />
      </svg>
    ),
    title: "Tournaments & Leagues",
    desc: "Register your team, track live standings, and follow match schedules across formats.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    title: "Secure Payments",
    desc: "Pay instantly via Razorpay. UPI, cards, and net banking — all supported.",
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Sign up", desc: "Create your free account with just your email — no password needed." },
  { step: "02", title: "Find a turf", desc: "Browse nearby turfs, check amenities, and view real-time slot availability." },
  { step: "03", title: "Book & play", desc: "Pick your slot, pay securely, and get instant confirmation." },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-20 text-center overflow-hidden">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[120px]" />
          <div className="absolute left-[60%] top-[60%] h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-[100px]" />
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-4 py-1.5 text-xs font-medium text-indigo-400 mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Now live in your city
        </div>

        <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-white md:text-6xl">
          Book Sports Turfs{" "}
          <span className="gradient-text">Instantly</span>
        </h1>

        <p className="mt-5 max-w-xl text-base text-[var(--text-secondary)] md:text-lg">
          Signal Shift connects players with premium sports facilities. Browse, book, and play — all from one platform.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-8 py-3.5 text-base font-bold text-white shadow-xl shadow-indigo-500/25 hover:opacity-90 transition-opacity"
          >
            Get Started Free
          </Link>
          <Link
            href="/turfs"
            className="rounded-xl border border-white/[0.1] bg-white/[0.04] px-8 py-3.5 text-base font-medium text-[var(--text-primary)] hover:bg-white/[0.07] transition-colors"
          >
            Browse Turfs →
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 flex flex-wrap justify-center gap-8">
          {[
            { value: "50+", label: "Turfs" },
            { value: "10K+", label: "Bookings" },
            { value: "5K+", label: "Players" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-extrabold gradient-text">{s.value}</p>
              <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-20 md:px-6">
        <div className="mx-auto max-w-4xl">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-indigo-400">How it works</p>
          <h2 className="mb-12 text-center text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
            Three steps to the field
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="glass-card p-6 text-center">
                <p className="mb-3 text-3xl font-extrabold gradient-text">{item.step}</p>
                <h3 className="mb-2 text-base font-semibold text-[var(--text-primary)]">{item.title}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20 md:px-6">
        <div className="mx-auto max-w-4xl">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-indigo-400">Features</p>
          <h2 className="mb-12 text-center text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
            Everything you need
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f.title} className="glass-card p-5 flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)] mb-1">{f.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="px-4 py-20 md:px-6">
        <div className="mx-auto max-w-2xl">
          <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 p-10 text-center">
            <div className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[80px]" />
            </div>
            <h2 className="text-2xl font-bold text-white md:text-3xl">Ready to play?</h2>
            <p className="mt-3 text-[var(--text-secondary)]">Join thousands of players booking turfs on Signal Shift.</p>
            <Link
              href="/login"
              className="mt-6 inline-block rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-8 py-3.5 text-base font-bold text-white shadow-xl shadow-indigo-500/25 hover:opacity-90 transition-opacity"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
