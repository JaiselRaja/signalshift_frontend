"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listTurfs } from "@/lib/api";
import type { TurfRead } from "@/types";
import PageHero from "@/components/v1/PageHero";
import PageStats from "@/components/v1/PageStats";
import PageFAQ from "@/components/v1/PageFAQ";
import CTABanner from "@/components/v1/CTABanner";
import Eyebrow from "@/components/v1/Eyebrow";

const FAQS = [
  {
    q: "Where exactly is the arena?",
    a: "Right on OMR Road, Thoraipakkam — 5 min from the IT corridor. Free parking on-site, easy auto/cab access.",
  },
  {
    q: "What surface do you use?",
    a: "FIFA-grade artificial turf with shock-pad underlay. Replaced every 18 months for grip and safety.",
  },
  {
    q: "Can I visit before booking?",
    a: "Walk in any day between 6 AM and 12 AM — we'll give you a tour. No appointment needed.",
  },
];

const GALLERY = [
  {
    tag: "Pitch · Wide",
    span: "col-span-2 row-span-2",
    bg: "linear-gradient(135deg,#0c2c0a 0%,#1a4a14 50%,#0a1f08 100%), radial-gradient(ellipse at 30% 30%, rgba(178,247,70,0.4), transparent 60%)",
  },
  {
    tag: "Floodlights",
    span: "col-span-1 row-span-1",
    bg: "linear-gradient(180deg,#04140a 0%,#0a3a14 100%), radial-gradient(circle at 50% 0%, rgba(178,247,70,0.6), transparent 50%)",
  },
  {
    tag: "Changing room",
    span: "col-span-1 row-span-1",
    bg: "linear-gradient(135deg,#1a1a14 0%,#2a2818 100%)",
  },
  {
    tag: "Goal · Detail",
    span: "col-span-1 row-span-1",
    bg: "linear-gradient(45deg,#0a1f08 0%,#244a1a 60%,#0a1f08 100%)",
  },
  {
    tag: "Spectator deck",
    span: "col-span-1 row-span-1",
    bg: "linear-gradient(180deg,#152018 0%,#0a1f08 100%)",
  },
  {
    tag: "Night view",
    span: "col-span-2 row-span-1",
    bg: "linear-gradient(180deg,#000 0%,#0a2810 80%,#1a4a14 100%), radial-gradient(ellipse at 50% 100%, rgba(178,247,70,0.5), transparent 60%)",
  },
];

const DEFAULT_AMENITIES: { icon: string; label: string; sub: string }[] = [
  { icon: "🅿️", label: "Free parking", sub: "Up to 30 cars" },
  { icon: "💧", label: "Drinking water", sub: "RO + chilled" },
  { icon: "🚿", label: "Changing rooms", sub: "Stalls + showers" },
  { icon: "💡", label: "Floodlit", sub: "500 lux LED" },
  { icon: "🏟️", label: "Spectator seats", sub: "40 seats" },
  { icon: "☔", label: "Rain-cover", sub: "Half-canopy" },
  { icon: "🏥", label: "First-aid", sub: "On-site kit" },
  { icon: "📶", label: "Free Wi-Fi", sub: "For spectators" },
];

function operatingHoursLabel(turf: TurfRead | null): string {
  if (!turf) return "6 AM – 12 AM";
  const today = new Date()
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();
  const hours = turf.operating_hours?.[today];
  if (!hours) return "6 AM – 12 AM";
  return `${hours.open} – ${hours.close}`;
}

export default function TurfsPage() {
  const [turf, setTurf] = useState<TurfRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    listTurfs()
      .then((all) => {
        const active = all.find((t) => t.is_active) ?? all[0] ?? null;
        setTurf(active);
      })
      .catch(() => setTurf(null))
      .finally(() => setLoading(false));
  }, []);

  const venueName = turf?.name ?? "Signal Shift Arena";
  const venueAddress = turf?.address ?? "OMR Road, Thoraipakkam";
  const venueCity = turf?.city ?? "Chennai";

  // Pick up to 8 amenity slots — mix turf-provided + defaults
  const amenities = (() => {
    const apiAmenities = (turf?.amenities ?? [])
      .filter((a) => a.available !== false)
      .slice(0, 8)
      .map((a) => ({
        icon: a.icon ?? "✓",
        label: a.name,
        sub: "On-site",
      }));
    if (apiAmenities.length >= 4) return apiAmenities.slice(0, 8);
    return DEFAULT_AMENITIES;
  })();

  const sportFormats =
    turf?.sport_types?.length
      ? `${turf.sport_types.length} format${turf.sport_types.length > 1 ? "s" : ""}`
      : "3 formats";

  return (
    <div>
      <PageHero
        eyebrow={`The Arena · ${venueCity}`}
        head1="One ground,"
        italicWord="built"
        head2="for the game."
        subtitle="FIFA-grade turf, floodlit till midnight, parking for 30. The home of Signal Shift — and your weekend ritual."
      />

      {/* Primary CTA — visible above the fold */}
      <div className="px-6 pb-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-3 sm:flex-row">
          {turf && !loading ? (
            <Link
              href={`/turfs/${turf.slug}?id=${turf.id}`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#b2f746] px-7 py-3.5 text-sm font-bold text-[#121f00] shadow-lg shadow-[#b2f746]/20 transition-transform hover:scale-[1.03] sm:w-auto"
            >
              Book a slot
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <span className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white/[0.06] px-7 py-3.5 text-sm font-bold text-white/40 sm:w-auto">
              {loading ? "Loading…" : "Sign in to book"}
            </span>
          )}
          <a
            href="#gallery"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-7 py-3.5 text-sm font-bold text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white sm:w-auto"
          >
            See the arena
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </a>
        </div>
      </div>

      <div className="px-6 pb-8">
        <div className="mx-auto max-w-6xl">
          <PageStats
            stats={[
              { value: "4.9★", label: "From 482 players" },
              { value: "18h", label: "Open daily 6 AM – 12 AM" },
              { value: "30", label: "Free parking spots" },
              { value: "500lx", label: "Floodlit night play" },
            ]}
          />
        </div>
      </div>

      {/* Gallery — bento grid */}
      <section id="gallery" className="scroll-mt-24 px-6 py-10 md:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-black text-white">
                Take a look around
              </h2>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
                {GALLERY.length} photos · 360° tour available
              </p>
            </div>
            <button
              type="button"
              className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              360° tour →
            </button>
          </div>
          <div className="grid grid-cols-3 grid-rows-[180px_180px_180px] gap-3 md:grid-cols-4 md:grid-rows-[220px_220px]">
            {GALLERY.map((g, i) => (
              <button
                key={g.tag}
                type="button"
                onClick={() => setActiveImg(i)}
                className={`group relative overflow-hidden rounded-3xl ${g.span} ${
                  activeImg === i
                    ? "ring-2 ring-[#b2f746]"
                    : "ring-1 ring-white/[0.06]"
                } transition-all hover:ring-[#b2f746]/50`}
                style={{ background: g.bg }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                  {g.tag}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Spec sheet + map */}
      <section className="px-6 py-10 md:py-12">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.03] p-6 md:p-7">
            <Eyebrow>The Specs</Eyebrow>
            <h2 className="mt-3 font-display text-2xl font-black tracking-tight text-white md:text-3xl">
              Built like a Sunday-league dream.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              Every inch of this ground is designed for serious play. From the
              shock-padded turf to the floodlight grid, you can feel the
              difference from your first touch.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {[
                { l: "Surface", v: "FIFA-grade artificial turf" },
                { l: "Pitch size", v: "120 × 80 ft" },
                { l: "Format", v: "5-a-side / 7-a-side" },
                { l: "Hours", v: operatingHoursLabel(turf) },
                { l: "Established", v: "2022" },
                { l: "Sports", v: sportFormats },
              ].map((s) => (
                <div key={s.l} className="border-b border-white/[0.04] pb-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
                    {s.l}
                  </p>
                  <p className="mt-1 font-display text-base font-bold text-white">
                    {s.v}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Map / address card */}
          <div className="overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.03]">
            <div
              className="relative h-56 overflow-hidden"
              style={{ background: "linear-gradient(135deg,#0a1f08 0%,#1a4a14 100%)" }}
            >
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(178,247,70,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(178,247,70,0.15) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-[#b2f746]/30" />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[#b2f746] text-[#121f00] shadow-lg shadow-[#b2f746]/40">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-5">
              <Eyebrow>Find Us</Eyebrow>
              <h3 className="mt-2 font-display text-lg font-black text-white">
                {venueCity} · {venueAddress}
              </h3>
              <p className="mt-2 text-sm text-white/60">
                Right off OMR, 200m from Thoraipakkam Junction. Free, gated parking on-site.
              </p>
              <div className="mt-4 flex gap-2">
                <a
                  href={
                    turf?.lat && turf?.lng
                      ? `https://www.google.com/maps/search/?api=1&query=${turf.lat},${turf.lng}`
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venueName} ${venueCity}`)}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-full bg-[#b2f746] py-2.5 text-center text-xs font-bold uppercase tracking-wider text-[#121f00] transition-transform hover:scale-[1.02]"
                >
                  Get directions
                </a>
                <a
                  href="tel:+910000000000"
                  className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  Call
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section className="px-6 py-10 md:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <Eyebrow>What&apos;s On Site</Eyebrow>
            <h2 className="mt-3 font-display text-2xl font-black tracking-tight text-white md:text-3xl">
              Eight things you&apos;ll be glad we thought of.
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {amenities.map((a) => (
              <div
                key={a.label}
                className="rounded-3xl border border-white/[0.06] bg-white/[0.03] p-5 transition-colors hover:border-[#b2f746]/30"
              >
                <div className="text-3xl">{a.icon}</div>
                <p className="mt-3 font-display text-base font-bold text-white">
                  {a.label}
                </p>
                <p className="mt-1 text-xs text-white/50">{a.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PageFAQ items={FAQS} />

      {turf && !loading ? (
        <CTABanner
          eyebrow="Ready to play?"
          title="Book your slot in 30 seconds."
          subtitle="Live availability, instant confirmation. Pay per game or unlock a Pro plan for big savings."
          buttonLabel="Book a slot"
          href={`/turfs/${turf.slug}?id=${turf.id}`}
        />
      ) : (
        <CTABanner
          eyebrow="Ready to play?"
          title="Book your slot in 30 seconds."
          subtitle="Live availability, instant confirmation. Pay per game or unlock a Pro plan for big savings."
          buttonLabel={loading ? "Loading…" : "Sign in to book"}
          href={loading ? "#" : "/login"}
        />
      )}
    </div>
  );
}
