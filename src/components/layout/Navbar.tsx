"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearToken, getToken } from "@/lib/api";

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Turfs", href: "/turfs" },
  { name: "Tournaments", href: "/tournaments" },
  { name: "Teams", href: "/teams" },
  { name: "My Bookings", href: "/bookings" },
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
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl">
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
              className="h-6 w-auto hidden sm:block"
            />
          </Link>

          {/* Center: Desktop nav links */}
          <div className="hidden items-center gap-6 md:flex font-[family-name:var(--font-headline)]">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    active
                      ? "text-emerald-900 font-extrabold border-b-2 border-lime-400 pb-1"
                      : "text-emerald-700/70 font-medium hover:text-emerald-900 hover:scale-105 transition-all"
                  }
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right: Book Now / User menu + Mobile toggle */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                {/* User avatar — desktop */}
                <Link
                  href="/profile"
                  className="hidden md:flex h-9 w-9 items-center justify-center rounded-full bg-emerald-800 text-xs font-bold text-white hover:scale-105 transition-all"
                >
                  Me
                </Link>
                <button
                  onClick={handleLogout}
                  className="hidden md:block text-sm font-medium text-emerald-700/70 hover:text-emerald-900 transition-all font-[family-name:var(--font-headline)]"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-[#b2f746] text-[#121f00] px-8 py-3 rounded-full font-bold text-sm tracking-wide shadow-lg shadow-[#004900]/10 hover:scale-105 active:scale-95 transition-all"
              >
                Book Now
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg text-emerald-800 hover:bg-emerald-50 md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          <nav
            className="absolute top-[73px] left-0 right-0 bg-white/95 backdrop-blur-xl px-6 py-5 shadow-lg animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-1 font-[family-name:var(--font-headline)]">
              {NAV_LINKS.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-lg px-4 py-3 text-sm ${
                      active
                        ? "text-emerald-900 font-extrabold bg-lime-50"
                        : "text-emerald-700/70 font-medium"
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.name}
                  </Link>
                );
              })}
              <div className="my-2 border-t border-emerald-100" />
              {isLoggedIn ? (
                <>
                  <Link
                    href="/profile"
                    className="rounded-lg px-4 py-3 text-sm font-medium text-emerald-700/70"
                    onClick={() => setMobileOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="rounded-lg px-4 py-3 text-left text-sm font-medium text-red-500"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="mt-2 block bg-[#b2f746] text-[#121f00] px-8 py-3 rounded-full font-bold text-sm tracking-wide text-center shadow-lg shadow-[#004900]/10"
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
