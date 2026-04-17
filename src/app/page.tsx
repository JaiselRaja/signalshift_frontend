import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

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
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDihWagyJ40pQWF_KAKYqWqPvdp6fveXW8hycrVtyejRSD9LaU3-mgV6eMk_2pQY6pBBZGxXrhXK9iMSTX7nAOySNr9Kyc_M4KBrUkTjD7do-aw0RapVKTRBdWBZvCqU5ikv4KBQrU0K7FIcNXZeDQz8Lh8KyxDFaNkD5OCcCm0QnJED_UVjVc90p07MsdcRBX-y5suIXY6FSrt2YypHQHbBtwFgbIzh1rjXEj3NCOS-o1WMxfceznwTmnwyO0yjT10tUgfWAlVruk"
          alt="Turf background"
          fill
          className="object-cover opacity-60"
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
                Premium Sports Turf
              </span>

              <h1 className="font-[family-name:var(--font-headline)] text-5xl md:text-7xl font-extrabold text-white tracking-tighter leading-[1.05] mb-6">
                Play on the{" "}
                <span className="text-[#b2f746]">Superior</span> Green.
              </h1>

              <p className="text-xl text-[#86df72] max-w-2xl leading-relaxed mb-10">
                Premium sports turf with world-class facilities. Built for
                performance, designed for champions.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/login"
                  className="bg-[#b2f746] text-[#121f00] px-10 py-5 rounded-full font-extrabold text-lg shadow-2xl shadow-[#004900]/20 hover:scale-[1.02] transition-transform text-center"
                >
                  Book Your Slot
                </Link>
                <Link
                  href="/turfs"
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

          {/* Mobile hero image */}
          <div className="mt-12 lg:hidden overflow-hidden rounded-t-[3rem]">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDihWagyJ40pQWF_KAKYqWqPvdp6fveXW8hycrVtyejRSD9LaU3-mgV6eMk_2pQY6pBBZGxXrhXK9iMSTX7nAOySNr9Kyc_M4KBrUkTjD7do-aw0RapVKTRBdWBZvCqU5ikv4KBQrU0K7FIcNXZeDQz8Lh8KyxDFaNkD5OCcCm0QnJED_UVjVc90p07MsdcRBX-y5suIXY6FSrt2YypHQHbBtwFgbIzh1rjXEj3NCOS-o1WMxfceznwTmnwyO0yjT10tUgfWAlVruk"
              alt="Turf field"
              width={800}
              height={500}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      {/* ───── Why Signal Shift Matters (Bento Grid) ───── */}
      <section className="bg-[#f8f9fa] px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-[family-name:var(--font-headline)] text-4xl md:text-5xl font-extrabold text-[#004900] mb-4">
              Why Signal Shift Matters
            </h2>
            <p className="text-[#404a3b] text-lg max-w-2xl mx-auto">
              Everything you need for the perfect game, all in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[300px]">
            {/* Card 1 — Instant Booking */}
            <div className="md:col-span-7 bg-[#f3f4f5] rounded-2xl p-10 flex flex-col justify-between">
              <div>
                <div className="mb-4">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#004900"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <h3 className="font-[family-name:var(--font-headline)] text-2xl font-extrabold text-[#004900] mb-2">
                  Instant Booking
                </h3>
                <p className="text-[#404a3b] text-base leading-relaxed max-w-md">
                  No phone calls, no waiting. Browse real-time availability and
                  book your preferred slot in seconds.
                </p>
              </div>
            </div>

            {/* Card 2 — Safe for All */}
            <div className="md:col-span-5 bg-[#006400] rounded-2xl p-10 text-white flex flex-col justify-between">
              <div>
                <div className="mb-4">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h3 className="font-[family-name:var(--font-headline)] text-2xl font-extrabold mb-2">
                  Safe for All
                </h3>
                <p className="text-white/80 text-base leading-relaxed">
                  Designed for all sports and all ages. Safe, clean, and
                  well-maintained facilities for everyone.
                </p>
              </div>
            </div>

            {/* Card 3 — Pro Performance */}
            <div className="md:col-span-5 bg-[#b2f746] rounded-2xl p-10 flex flex-col justify-between">
              <div>
                <div className="mb-4">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#004900"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <h3 className="font-[family-name:var(--font-headline)] text-2xl font-extrabold text-[#004900] mb-2">
                  Pro Performance
                </h3>
                <p className="text-[#2d3a1e] text-base leading-relaxed">
                  Competition-grade surface that delivers consistent ball roll
                  and player safety.
                </p>
              </div>
            </div>

            {/* Card 4 — Teams & Tournaments */}
            <div className="md:col-span-7 bg-[#e7e8e9] rounded-2xl p-10 flex flex-col justify-between">
              <div>
                <div className="mb-4">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#004900"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3 className="font-[family-name:var(--font-headline)] text-2xl font-extrabold text-[#004900] mb-2">
                  Teams & Tournaments
                </h3>
                <p className="text-[#404a3b] text-base leading-relaxed max-w-md">
                  Create teams, add players, and join leagues. Organize
                  tournaments and track standings all in one place.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Booking Action Bar ───── */}
      <section className="bg-white px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="bg-[#edeeef] rounded-xl p-8 flex flex-col lg:flex-row items-center justify-between gap-8 border border-[#bfcab7]/15">
            {/* Left — avatars + info */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-full bg-[#004900] border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div>
                <p className="font-bold text-[#004900] text-base">
                  Next Available: Today, 6:00 PM
                </p>
                <p className="text-[#404a3b] text-sm">
                  Book your next slot before it fills up
                </p>
              </div>
            </div>

            {/* Right — CTA */}
            <Link
              href="/login"
              className="bg-[#004900] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#003700] transition-colors text-center whitespace-nowrap"
            >
              Book Now
            </Link>
          </div>
        </div>
      </section>

      {/* ───── Player Voices (Testimonials) ───── */}
      <section className="py-24 bg-[#f8f9fa] px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-[family-name:var(--font-headline)] text-4xl md:text-5xl font-extrabold text-[#004900] mb-4">
              Player Voices
            </h2>
            <div className="w-24 h-1.5 bg-[#b2f746] mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className={`rounded-2xl p-8 ${
                  t.highlighted
                    ? "bg-[#004900] text-white"
                    : "bg-white shadow-lg shadow-black/5 border border-gray-100"
                }`}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg
                      key={s}
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill={t.highlighted ? "#b2f746" : "#f59e0b"}
                      stroke="none"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>

                <p
                  className={`text-base leading-relaxed mb-8 ${
                    t.highlighted ? "text-white/90" : "text-[#404a3b]"
                  }`}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Avatar + name */}
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      t.highlighted
                        ? "bg-[#b2f746] text-[#004900]"
                        : "bg-[#004900] text-white"
                    }`}
                  >
                    {t.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p
                      className={`font-bold text-sm ${
                        t.highlighted ? "text-white" : "text-[#004900]"
                      }`}
                    >
                      {t.name}
                    </p>
                    <p
                      className={`text-xs ${
                        t.highlighted ? "text-white/60" : "text-[#404a3b]"
                      }`}
                    >
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Final CTA ───── */}
      <section className="relative min-h-[500px] flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <Image
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDlAuAW6fKqghGMTV9lLhYrbD7tY41aWgQip7ad-gNVTWD12jy3zHAazYLoPNr7u0QPh_AURYzumWwrVZzFltKe0jOnu6ncxakqHp5Sz6nLPamE8wRYWF6wv1BRr9WBPwUvO4nRxTkCu_D43glo4KUJNM4JbEqOMCL-imfbWZHD2AAt2h3uBFYiTHzbNZu1LZIvm-RNisYpLeX0xFIJKsqpd4VktY5NzJm-P0AXB_F-gKZ5muD1MUmamgFPIjE-37x-AARJIOSSiY"
          alt="Turf at night"
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
