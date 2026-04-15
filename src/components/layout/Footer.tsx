import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/[0.06] bg-[#0d0e14]">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <span className="text-sm font-bold tracking-wider text-white">SIGNAL SHIFT</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Book sports turfs, manage your team, and compete in tournaments — all in one place.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Explore</h4>
            <ul className="space-y-2">
              {[
                { label: "Browse Turfs", href: "/turfs" },
                { label: "Tournaments", href: "/tournaments" },
                { label: "Teams", href: "/teams" },
                { label: "My Bookings", href: "/bookings" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-xs text-[var(--text-secondary)] hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Account</h4>
            <ul className="space-y-2">
              {[
                { label: "Sign In", href: "/login" },
                { label: "Profile", href: "/profile" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-xs text-[var(--text-secondary)] hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-white/[0.06] pt-6 text-center text-xs text-[var(--text-muted)]">
          © {new Date().getFullYear()} Signal Shift. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
