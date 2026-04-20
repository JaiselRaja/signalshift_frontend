import Link from "next/link";

const EXPLORE = [
  { label: "Browse Turfs", href: "/turfs" },
  { label: "Tournaments", href: "/tournaments" },
  { label: "Teams", href: "/teams" },
];

const ACCOUNT = [
  { label: "Sign In", href: "/login" },
  { label: "My Bookings", href: "/bookings" },
  { label: "Profile", href: "/profile" },
];

const SOCIAL = [
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "Twitter",
    href: "https://twitter.com",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.06] bg-[#0a0b0c]">
      <div className="grain-overlay pointer-events-none absolute inset-0" />

      {/* Big wordmark band */}
      <div className="relative overflow-hidden border-b border-white/[0.06]">
        <div aria-hidden className="absolute -left-4 -right-4 top-1/2 -translate-y-1/2 whitespace-nowrap text-center font-display text-[18vw] font-black leading-none tracking-tighter text-white/[0.04] md:text-[14vw]">
          SIGNAL · SHIFT · SIGNAL · SHIFT
        </div>
        <div className="relative mx-auto flex max-w-7xl items-end justify-between gap-6 px-6 py-16 md:py-24">
          <div>
            <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.3em] text-[#b2f746]">
              · Signal Shift ·
            </p>
            <h2 className="font-display text-3xl font-black leading-[0.95] tracking-tight text-white md:text-5xl">
              The arena
              <br />
              <span className="italic text-[#b2f746]">never sleeps.</span>
            </h2>
          </div>

          <Link
            href="/turfs"
            className="hidden shrink-0 items-center gap-2 rounded-full bg-[#b2f746] px-5 py-2.5 text-sm font-bold text-[#121f00] shadow-lg shadow-[#b2f746]/10 transition-transform hover:scale-[1.03] md:inline-flex"
          >
            Find a slot
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Columns */}
      <div className="relative mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-12">
          {/* Brand blurb — spans more on desktop */}
          <div className="col-span-2 md:col-span-5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#b2f746] font-display text-sm font-black text-[#121f00]">
                SS
              </span>
              <span className="font-display text-base font-black uppercase tracking-[0.18em] text-white">
                Signal Shift
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/50">
              Premium sports turf. Book your slot, bring your crew, play on the superior green.
            </p>
            <div className="mt-6 flex gap-2">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/70 transition-all hover:-translate-y-0.5 hover:border-[#b2f746]/50 hover:bg-[#b2f746]/10 hover:text-[#b2f746]"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <FooterColumn title="Explore" items={EXPLORE} />
          <FooterColumn title="Account" items={ACCOUNT} />

          {/* Location / contact */}
          <div className="col-span-2 md:col-span-3">
            <h4 className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
              Contact
            </h4>
            <p className="text-sm leading-relaxed text-white/70">
              Ananthanadarkudy
              <br />
              Kanyakumari district
              <br />
              Tamil Nadu, India
            </p>
            <a
              href="mailto:signalshiftturf@gmail.com"
              className="mt-3 inline-block text-sm font-semibold text-[#b2f746] underline-offset-4 hover:underline"
            >
              signalshiftturf@gmail.com
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-[11px] uppercase tracking-[0.16em] text-white/40 md:flex-row">
          <p className="font-mono">
            &copy; {new Date().getFullYear()} Signal Shift · Book &middot; Play &middot; Win
          </p>
          <p className="font-mono">
            Made with <span className="text-[#b2f746]">◆</span> in Tamil Nadu
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: { label: string; href: string }[];
}) {
  return (
    <div className="col-span-1 md:col-span-2">
      <h4 className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
        {title}
      </h4>
      <ul className="space-y-2.5">
        {items.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              <span className="h-px w-0 bg-[#b2f746] transition-all group-hover:w-3" aria-hidden />
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
