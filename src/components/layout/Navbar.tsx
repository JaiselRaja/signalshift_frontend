"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearToken, getToken } from "@/lib/api";

const NAV_LINKS = [
  { name: "Turfs", href: "/turfs" },
  { name: "Tournaments", href: "/tournaments" },
  { name: "My Bookings", href: "/bookings" },
  { name: "Teams", href: "/teams" },
];

function LogoMark() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/20">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!getToken());
  }, []);

  function handleLogout() {
    clearToken();
    router.push("/login");
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between border-b border-white/[0.06] bg-[#0a0b0f]/80 px-4 backdrop-blur-xl md:px-6">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark />
          <div className="hidden sm:block">
            <div className="text-sm font-bold tracking-wider text-white">SIGNAL SHIFT</div>
            <div className="text-[9px] font-medium uppercase tracking-widest text-indigo-400">Book · Play · Win</div>
          </div>
        </Link>

        {/* Center: Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-indigo-500/10 text-indigo-400"
                    : "text-[var(--text-secondary)] hover:bg-white/[0.04] hover:text-[var(--text-primary)]"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Right: Profile / Login + Mobile toggle */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-bold text-white"
              >
                Me
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-10 min-w-[160px] rounded-xl border border-white/[0.08] bg-[#161821] py-1 shadow-lg">
                  <Link
                    href="/profile"
                    className="block px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-white/[0.04] hover:text-white"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/5"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600 md:block"
            >
              Sign In
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-white/[0.04] md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <nav
            className="absolute top-16 left-0 right-0 border-b border-white/[0.06] bg-[#0d0e14] px-4 py-4 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const active = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-lg px-4 py-3 text-sm font-medium ${
                      active
                        ? "bg-indigo-500/10 text-indigo-400"
                        : "text-[var(--text-secondary)]"
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.name}
                  </Link>
                );
              })}
              <div className="my-2 border-t border-white/[0.06]" />
              {isLoggedIn ? (
                <>
                  <Link
                    href="/profile"
                    className="rounded-lg px-4 py-3 text-sm text-[var(--text-secondary)]"
                    onClick={() => setMobileOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="rounded-lg px-4 py-3 text-left text-sm text-red-400"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="rounded-lg bg-indigo-500 px-4 py-3 text-center text-sm font-semibold text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
