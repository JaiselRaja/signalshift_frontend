import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TurfHighlights from "@/components/turfs/TurfHighlights";
import MapEmbed from "@/components/MapEmbed";

const TESTIMONIALS = [
  {
    name: "Arjun Mehta",
    role: "Football Captain",
    quote:
      "The turf quality is outstanding. Our team trains here every week and the booking process is seamless. Best facility in the city.",
    highlighted: false,
  },
  {
    name: "Priya Sharma",
    role: "Cricket Coach",
    quote:
      "Signal Shift has transformed how we manage our practice sessions. The online booking saves us hours every week. Highly recommend!",
    highlighted: true,
  },
  {
    name: "Rahul Desai",
    role: "Weekend Warrior",
    quote:
      "Finally a turf that takes bookings seriously. No more calling and waiting. Just pick a slot and show up. Love it.",
    highlighted: false,
  },
];

export default function LandingPage() {
  return (
    <>
      <Navbar />
    <div className="flex flex-col">
      {/* ───── Hero Section ───── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#004900]">
        {/* Background image */}
        <Image
          src="/hero-bg-v3.jpg"
          alt="Stadium with floodlights at night"
          fill
          className="object-cover opacity-70"
          priority
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#004900] via-[#004900]/40 to-transparent" />

        {/* Content */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-20 lg:py-28">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-16">
            {/* Left column */}
            <div className="max-w-2xl">
              {/* Pill badge */}
              <span className="inline-block bg-[#b2f746]/20 border border-[#b2f746]/30 text-[#b2f746] rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest mb-8">
                Turf • Indoor Games • Events
              </span>

              <h1 className="font-[family-name:var(--font-headline)] text-5xl md:text-7xl font-extrabold text-white tracking-tighter leading-[1.05] mb-6">
                Play <span className="text-[#b2f746]">Beyond</span> the Ordinary
              </h1>

              <p className="text-xl text-[#86df72] max-w-2xl leading-relaxed mb-10">
                Where sport meets experience. Signal Shift brings Nagercoil a premium destination for games, training, events, and unforgettable moments — with exciting indoor games like air hockey and foosball to make every visit even more fun.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/login"
                  className="bg-[#b2f746] text-[#121f00] px-10 py-5 rounded-full font-extrabold text-lg shadow-2xl shadow-[#004900]/20 hover:scale-[1.02] transition-transform text-center"
                >
                  Book Your Slot
                </Link>
                <Link
                  href="/login"
                  className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-white/20 transition-all text-center"
                >
                  View Availability
                </Link>
              </div>
            </div>

            {/* Right column — stat cards (desktop) */}
            <div className="hidden lg:grid grid-cols-2 gap-4 max-w-sm w-full">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl text-center">
                <p className="font-[family-name:var(--font-headline)] text-4xl font-extrabold text-[#b2f746] mb-1">
                  24/7
                </p>
                <p className="text-white/70 text-sm font-medium">
                  Availability
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl text-center">
                <p className="font-[family-name:var(--font-headline)] text-4xl font-extrabold text-[#b2f746] mb-1">
                  Pro
                </p>
                <p className="text-white/70 text-sm font-medium">
                  Grade Turf
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      <TurfHighlights />

      {/* ───── Why Signal Shift Matters (Bento Grid) ───── */}
      <section className="relative bg-[#0a0b0c] px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.3em] text-[#b2f746]">
              · The Difference ·
            </p>
            <h2 className="font-display text-4xl font-black tracking-tight text-white md:text-5xl">
              Why Signal Shift Matters
            </h2>
            <p className="mt-4 text-lg text-white/60">
              Everything you need for the perfect game, all in one place.
            </p>
          </div>

          <div className="grid auto-rows-[300px] grid-cols-1 gap-6 md:grid-cols-12">
            {/* Card 1 — Instant Booking */}
            <div className="flex flex-col justify-between rounded-3xl border border-white/[0.06] bg-white/[0.03] p-10 md:col-span-7">
              <div>
                <div className="mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#b2f746" strokeWidth="1.8" strokeLinecap="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <h3 className="mb-2 font-display text-2xl font-black text-white">Instant Booking</h3>
                <p className="max-w-md text-base leading-relaxed text-white/60">
                  No phone calls, no waiting. Browse real-time availability and book your preferred slot in seconds.
                </p>
              </div>
            </div>

            {/* Card 2 — Safe for All */}
            <div className="flex flex-col justify-between rounded-3xl bg-[#004900] p-10 text-white md:col-span-5">
              <div>
                <div className="mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#b2f746" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h3 className="mb-2 font-display text-2xl font-black">Safe for All</h3>
                <p className="text-base leading-relaxed text-white/80">
                  Designed for all sports and all ages. Safe, clean, and well-maintained facilities for everyone.
                </p>
              </div>
            </div>

            {/* Card 3 — Pro Performance (the visual anchor) */}
            <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-[#b2f746] p-10 md:col-span-5">
              <div className="grain-overlay pointer-events-none absolute inset-0" />
              <div className="relative">
                <div className="mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#121f00" strokeWidth="2" strokeLinecap="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <h3 className="mb-2 font-display text-2xl font-black text-[#121f00]">Pro Performance</h3>
                <p className="text-base leading-relaxed text-[#121f00]/80">
                  Competition-grade surface that delivers consistent ball roll and player safety.
                </p>
              </div>
            </div>

            {/* Card 4 — Indoor Games */}
            <div className="flex flex-col justify-between rounded-3xl border border-white/[0.06] bg-white/[0.03] p-10 md:col-span-7">
              <div>
                <div className="mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#b2f746" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="10" rx="5" />
                    <line x1="7" y1="12" x2="9" y2="12" />
                    <line x1="8" y1="11" x2="8" y2="13" />
                    <circle cx="15" cy="11" r="1" />
                    <circle cx="17" cy="13" r="1" />
                  </svg>
                </div>
                <h3 className="mb-2 font-display text-2xl font-black text-white">Indoor Games</h3>
                <p className="max-w-md text-base leading-relaxed text-white/60">
                  Air hockey, foosball, and more — extend the fun off the pitch with a full slate of indoor games for every visit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Booking Action Bar ───── */}
      <section className="bg-[#0a0b0c] px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-8 rounded-3xl border border-white/[0.06] bg-white/[0.03] p-8 lg:flex-row">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0a0b0c] bg-[#b2f746] text-xs font-black text-[#121f00]"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div>
                <p className="font-display text-base font-black text-white">
                  Next Available: Today, 6:00 PM
                </p>
                <p className="text-sm text-white/60">
                  Book your next slot before it fills up
                </p>
              </div>
            </div>

            <Link
              href="/login"
              className="whitespace-nowrap rounded-full bg-[#b2f746] px-8 py-3 text-center text-sm font-bold text-[#121f00] shadow-lg shadow-[#b2f746]/10 transition-transform hover:scale-[1.03]"
            >
              Book Now
            </Link>
          </div>
        </div>
      </section>

      {/* ───── Player Voices (Testimonials) ───── */}
      <section className="bg-[#0a0b0c] px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.3em] text-[#b2f746]">
              · Voices from the Field ·
            </p>
            <h2 className="font-display text-4xl font-black tracking-tight text-white md:text-5xl">
              Player Voices
            </h2>
            <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-[#b2f746]" />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className={`rounded-3xl p-8 transition-all hover:-translate-y-1 ${
                  t.highlighted
                    ? "bg-[#b2f746] text-[#121f00] shadow-[0_24px_60px_-24px_rgba(178,247,70,0.35)]"
                    : "border border-white/[0.06] bg-white/[0.03] text-white"
                }`}
              >
                <div className="mb-6 flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg
                      key={s}
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill={t.highlighted ? "#121f00" : "#b2f746"}
                      stroke="none"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>

                <p className={`mb-8 text-base leading-relaxed ${t.highlighted ? "text-[#121f00]/80" : "text-white/70"}`}>
                  &ldquo;{t.quote}&rdquo;
                </p>

                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-black ${
                      t.highlighted ? "bg-[#121f00] text-[#b2f746]" : "bg-[#b2f746] text-[#121f00]"
                    }`}
                  >
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className={`font-display text-sm font-bold ${t.highlighted ? "text-[#121f00]" : "text-white"}`}>
                      {t.name}
                    </p>
                    <p className={`text-xs ${t.highlighted ? "text-[#121f00]/60" : "text-white/50"}`}>
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Find Us ───── */}
      <section className="bg-[#0a0b0c] px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.3em] text-[#b2f746]">
              · Find Us ·
            </p>
            <h2 className="font-display text-4xl font-black tracking-tight text-white md:text-5xl">
              Drop By the Arena
            </h2>
            <p className="mt-4 text-lg text-white/60">
              Ananthanadarkudy, Kanyakumari district, Tamil Nadu.
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.03]">
            <div className="h-[420px] w-full md:h-[480px]">
              <MapEmbed />
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] p-6 sm:flex-row">
              <div>
                <p className="font-display text-base font-black text-white">
                  Signal Shift Sports & Events Centre
                </p>
                <p className="mt-1 text-sm text-white/60">
                  Free parking · Open 6 AM – 12 AM
                </p>
                <a
                  href="tel:+918420058420"
                  className="mt-2 inline-block text-sm font-semibold text-[#b2f746] underline-offset-4 hover:underline"
                >
                  +91 84200 58420
                </a>
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
                <a
                  href="tel:+918420058420"
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#b2f746]/40 bg-[#b2f746]/10 px-6 py-3 text-sm font-bold text-[#b2f746] transition-colors hover:bg-[#b2f746]/15"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  Call
                </a>
                <a
                  href="https://www.google.com/maps/place/Signal+Shift+Sports+%26+Events+Centre/@8.1496779,77.3826845,17z"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#b2f746] px-6 py-3 text-sm font-bold text-[#121f00] shadow-lg shadow-[#b2f746]/10 transition-transform hover:scale-[1.03]"
                >
                  Get Directions
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Final CTA ───── */}
      <section className="relative min-h-[500px] flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <Image
          src="/entrance.jpg"
          alt="Signal Shift entrance"
          fill
          className="object-cover"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/70" />

        {/* Content */}
        <div className="relative z-10 text-center px-6 py-24 max-w-3xl mx-auto">
          <h2 className="font-[family-name:var(--font-headline)] text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6">
            Ready to play at{" "}
            <span className="text-[#b2f746]">Signal Shift</span>?
          </h2>
          <p className="text-white/70 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Join hundreds of players who book their sessions every week. Premium
            turf, instant booking, zero hassle.
          </p>
          <Link
            href="/login"
            className="inline-block bg-[#b2f746] text-[#121f00] px-12 py-5 rounded-full font-extrabold text-lg shadow-2xl hover:scale-[1.02] transition-transform"
          >
            Secure Your Session Now
          </Link>
        </div>
      </section>
    </div>
      <Footer />
    </>
  );
}
