import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-emerald-900 w-full py-12 px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl mx-auto">
        {/* Brand column */}
        <div className="flex flex-col gap-4">
          <Image
            src="/logo-text.png"
            alt="Signal Shift"
            width={130}
            height={24}
            className="h-6 w-auto brightness-0 invert"
          />
          <p className="text-sm text-emerald-100/80 leading-relaxed max-w-xs">
            The organic arena where champions play. Premium sports turf with
            world-class facilities.
          </p>
        </div>

        {/* Links columns */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h4 className="text-lime-400 font-bold text-sm mb-3 font-[family-name:var(--font-headline)]">
              Explore
            </h4>
            <ul className="space-y-2">
              {[
                { label: "Browse Turfs", href: "/turfs" },
                { label: "Tournaments", href: "/tournaments" },
                { label: "Teams", href: "/teams" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-emerald-300/60 hover:text-white text-sm transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-lime-400 font-bold text-sm mb-3 font-[family-name:var(--font-headline)]">
              Account
            </h4>
            <ul className="space-y-2">
              {[
                { label: "Sign In", href: "/login" },
                { label: "My Bookings", href: "/bookings" },
                { label: "Profile", href: "/profile" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-emerald-300/60 hover:text-white text-sm transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Follow Us / Social */}
        <div>
          <h4 className="text-lime-400 font-bold text-sm mb-3 font-[family-name:var(--font-headline)]">
            Follow Us
          </h4>
          <div className="flex gap-3">
            {[
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
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-800 text-lime-400 hover:bg-lime-400 hover:text-emerald-900 transition-colors"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-12 pt-8 border-t border-emerald-800/30 text-center max-w-7xl mx-auto">
        <p className="text-xs text-emerald-100/40 uppercase tracking-widest">
          &copy; {new Date().getFullYear()} Signal Shift. Book &middot; Play &middot; Win.
        </p>
      </div>
    </footer>
  );
}
