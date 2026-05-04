"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearToken, getToken } from "@/lib/api";

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Our Turf", href: "/turfs" },
  { name: "Tournaments", href: "/tournaments" },
  { name: "Teams", href: "/teams" },
  { name: "My Bookings", href: "/bookings" },
  { name: "Plans", href: "/plans" },
];

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!getToken());
  }, []);

  function handleLogout() {
    clearToken();
    setIsLoggedIn(false);
    router.push("/login");
  }

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0a0b0c]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="Signal Shift"
              width={40}
              height={37}
              className="h-9 w-auto"
            />
            <Image
              src="/logo-text.png"
              alt="Signal Shift"
              width={130}
              height={24}
              className="h-5 w-auto brightness-0 invert sm:h-6"
            />
          </Link>

          {/* Center: Desktop nav links */}
          <div className="hidden items-center gap-7 md:flex">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-sm font-semibold tracking-wide transition-colors ${
                    active
                      ? "text-white"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  {link.name}
                  {active && (
                    <span className="absolute -bottom-1.5 left-0 right-0 h-[2px] rounded-full bg-[#b2f746]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right: Book Now / User menu + Mobile toggle */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link
                  href="/profile"
                  className="hidden h-9 w-9 items-center justify-center rounded-full bg-[#b2f746] text-xs font-black text-[#121f00] transition-transform hover:scale-105 md:flex"
                >
                  Me
                </Link>
                <button
                  onClick={handleLogout}
                  className="hidden text-sm font-semibold text-white/50 transition-colors hover:text-white md:block"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-[#b2f746] px-6 py-2.5 text-sm font-bold tracking-wide text-[#121f00] shadow-lg shadow-[#b2f746]/10 transition-transform hover:scale-105 active:scale-95"
              >
                Book Now
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/[0.06] md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <nav
            className="absolute left-0 right-0 top-[73px] border-b border-white/[0.06] bg-[#0a0b0c]/95 px-6 py-5 backdrop-blur-xl shadow-xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                      active
                        ? "bg-[#b2f746]/10 text-[#b2f746]"
                        : "text-white/60 hover:bg-white/[0.04] hover:text-white"
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
                    className="rounded-lg px-4 py-3 text-sm font-semibold text-white/60 hover:bg-white/[0.04] hover:text-white"
                    onClick={() => setMobileOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="rounded-lg px-4 py-3 text-left text-sm font-semibold text-rose-400 hover:bg-rose-500/10"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="mt-2 block rounded-full bg-[#b2f746] px-8 py-3 text-center text-sm font-bold tracking-wide text-[#121f00] shadow-lg shadow-[#b2f746]/10"
                  onClick={() => setMobileOpen(false)}
                >
                  Book Now
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
