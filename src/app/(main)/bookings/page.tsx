"use client";

import { useEffect, useMemo, useState } from "react";
import {
  cancelBooking,
  getMyBookings,
  listTurfs,
} from "@/lib/api";
import type { BookingRead, BookingType, TurfRead } from "@/types";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import CancelBookingModal from "@/components/bookings/CancelBookingModal";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import PageHero from "@/components/v1/PageHero";
import PageStats from "@/components/v1/PageStats";
import PageFAQ from "@/components/v1/PageFAQ";
import CTABanner from "@/components/v1/CTABanner";
import Link from "next/link";

const FAQS = [
  {
    q: "How far in advance can I book?",
    a: "Daily Pass users can book 24 hours ahead. Starter members get 3 days, Pro members get 7 days advance window.",
  },
  {
    q: "Can I reschedule a booking?",
    a: "Yes — up to 12 hours before. Tap any booking and choose Reschedule. We'll show you available slots.",
  },
  {
    q: "What if it rains?",
    a: "Covered turfs play through. Uncovered turfs auto-credit the lost hour to your account, plus 10% goodwill bonus.",
  },
];

const UPCOMING_STATUSES = new Set(["pending", "confirmed"]);

function isUpcoming(b: BookingRead): boolean {
  const today = new Date().toISOString().slice(0, 10);
  if (b.booking_date < today) return false;
  return UPCOMING_STATUSES.has(b.status);
}

function formatLabel(t: BookingType): string {
  if (t === "tournament") return "Tournament";
  if (t === "practice") return "Practice";
  if (t === "event") return "Event";
  if (t === "subscription") return "Plan booking";
  return "Regular booking";
}

function formatTime(hhmmss: string): string {
  // "18:30:00" → "6:30 PM"
  const [h, m] = hhmmss.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${String(m).padStart(2, "0")} ${period}`;
}

function dateBlock(iso: string): { dow: string; day: string; mon: string } {
  const d = new Date(iso + "T00:00:00");
  return {
    dow: d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
    day: String(d.getDate()),
    mon: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
  };
}

function statusPill(status: string): string {
  if (status === "confirmed") return "bg-[#b2f746]/15 text-[#b2f746]";
  if (status === "pending") return "bg-amber-400/15 text-amber-400";
  if (status === "cancelled") return "bg-rose-500/15 text-rose-400";
  if (status === "completed") return "bg-sky-500/15 text-sky-400";
  return "bg-white/10 text-white/60";
}

function DashboardContent() {
  const [bookings, setBookings] = useState<BookingRead[]>([]);
  const [turfMap, setTurfMap] = useState<Map<string, { name: string; slug: string }>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<BookingRead | null>(null);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  useEffect(() => {
    Promise.all([
      getMyBookings().catch(() => [] as BookingRead[]),
      listTurfs().catch(() => [] as TurfRead[]),
    ])
      .then(([bList, turfList]) => {
        setBookings(bList);
        const map = new Map<string, { name: string; slug: string }>();
        turfList.forEach((t) => map.set(t.id, { name: t.name, slug: t.slug }));
        setTurfMap(map);
      })
      .catch(() => setError("Failed to load bookings."))
      .finally(() => setLoading(false));
  }, []);

  const { upcoming, past, monthHours, totalConfirmed } = useMemo(() => {
    const sorted = [...bookings].sort((a, b) => {
      const da = a.booking_date + a.start_time;
      const db = b.booking_date + b.start_time;
      return da < db ? -1 : 1;
    });
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthMins = bookings
      .filter(
        (b) =>
          new Date(b.booking_date) >= monthStart &&
          (b.status === "confirmed" || b.status === "completed"),
      )
      .reduce((s, b) => s + (b.duration_mins ?? 0), 0);
    return {
      upcoming: sorted.filter(isUpcoming),
      past: sorted.filter((b) => !isUpcoming(b)).reverse(),
      monthHours: Math.round((monthMins / 60) * 10) / 10,
      totalConfirmed: bookings.filter(
        (b) => b.status === "confirmed" || b.status === "completed",
      ).length,
    };
  }, [bookings]);

  async function handleCancel(reason: string) {
    if (!cancelTarget) return;
    const updated = await cancelBooking(cancelTarget.id, reason);
    setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    setCancelTarget(null);
  }

  if (loading) return <PageLoader />;

  const list = tab === "upcoming" ? upcoming : past;

  return (
    <div>
      <PageHero
        eyebrow="Your Schedule"
        head1="Every match,"
        italicWord="all"
        head2="in one place."
        subtitle="Track upcoming bookings, review past games, and reschedule with one tap. Your turf history, organized."
      />

      <div className="px-6 pb-8">
        <div className="mx-auto max-w-6xl">
          <PageStats
            stats={[
              { value: String(upcoming.length), label: "Upcoming" },
              { value: String(totalConfirmed), label: "Total played" },
              { value: `${monthHours}h`, label: "This month" },
              { value: "Pitch A", label: "Your home court" },
            ]}
          />
        </div>
      </div>

      <div className="sticky top-[72px] z-10 border-y border-white/[0.06] bg-[#0a0b0c]/90 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="flex gap-1.5">
            {(["upcoming", "past"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-full border px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
                  tab === t
                    ? "border-[#b2f746] bg-[#b2f746] text-[#121f00]"
                    : "border-white/10 bg-white/[0.03] text-white/60 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <Link
            href="/turfs"
            className="rounded-full bg-[#b2f746] px-5 py-2 text-xs font-bold uppercase tracking-wider text-[#121f00] transition-transform hover:scale-[1.03]"
          >
            + New booking
          </Link>
        </div>
      </div>

      <section className="px-6 py-10 md:py-12">
        <div className="mx-auto max-w-5xl">
          {error && (
            <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/5 px-5 py-4 text-sm text-rose-300">
              {error}
            </div>
          )}

          {list.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-14 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#b2f746]/10 text-[#b2f746]">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <p className="text-sm text-white/60">
                {tab === "upcoming" ? "No upcoming bookings yet." : "Nothing in the past column."}
              </p>
              {tab === "upcoming" && (
                <Link
                  href="/turfs"
                  className="text-xs font-semibold uppercase tracking-wider text-[#b2f746] underline-offset-4 hover:underline"
                >
                  Book a slot →
                </Link>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {list.map((b) => {
                const block = dateBlock(b.booking_date);
                const isSubscription = b.booking_type === "subscription";
                return (
                  <div
                    key={b.id}
                    className={`group flex flex-col gap-4 rounded-3xl border p-5 transition-all hover:-translate-y-0.5 md:flex-row md:items-center md:p-6 ${
                      isSubscription
                        ? "border-[#b2f746]/30 bg-[#b2f746]/[0.04] hover:border-[#b2f746]/50"
                        : "border-white/[0.06] bg-white/[0.03] hover:border-[#b2f746]/30"
                    }`}
                  >
                    <div
                      className={`flex flex-col items-center justify-center rounded-2xl p-4 md:w-24 ${
                        isSubscription ? "bg-[#b2f746]/15" : "bg-[#b2f746]/10"
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#b2f746]">
                        {block.dow}
                      </span>
                      <span className="font-display text-2xl font-black text-white">
                        {block.day}
                      </span>
                      <span className="text-[10px] font-semibold uppercase text-white/50">
                        {block.mon}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${statusPill(b.status)}`}
                        >
                          {b.status}
                        </span>
                        {isSubscription && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#b2f746] px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#121f00]">
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                            >
                              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                              <polyline points="21 3 21 8 16 8" />
                            </svg>
                            Plan
                          </span>
                        )}
                      </div>
                      <h3 className="mt-2 font-display text-lg font-black text-white">
                        {formatLabel(b.booking_type)}
                      </h3>
                      <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/60">
                        <span className="flex items-center gap-2">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          {formatTime(b.start_time)} – {formatTime(b.end_time)}
                        </span>
                        <span className="text-white/40">·</span>
                        <span>Pitch A</span>
                      </p>
                    </div>
                    <div className="text-right">
                      {isSubscription ? (
                        <>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#b2f746]">
                            Included
                          </p>
                          <p className="font-display text-sm font-bold text-white/70">
                            in your plan
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                            Total
                          </p>
                          <p className="font-display text-xl font-black text-white">
                            ₹{Number(b.final_price || 0).toLocaleString()}
                          </p>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {tab === "upcoming" && b.status !== "cancelled" && !isSubscription ? (
                        <button
                          type="button"
                          onClick={() => setCancelTarget(b)}
                          className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-bold text-white/70 transition-colors hover:bg-white/[0.06]"
                        >
                          Cancel
                        </button>
                      ) : null}
                      {isSubscription ? (
                        <Link
                          href="/profile"
                          className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-bold text-white/70 transition-colors hover:bg-white/[0.06]"
                        >
                          Manage plan
                        </Link>
                      ) : null}
                      {(() => {
                        const turfMeta = turfMap.get(b.turf_id);
                        return turfMeta ? (
                          <Link
                            href={`/turfs/${turfMeta.slug}?id=${b.turf_id}`}
                            className="rounded-full bg-[#b2f746] px-4 py-2 text-xs font-bold text-[#121f00] transition-transform hover:scale-[1.03]"
                          >
                            {tab === "upcoming" ? "Open" : "Book again"}
                          </Link>
                        ) : null;
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <PageFAQ items={FAQS} />
      <CTABanner
        eyebrow="Play more, save more"
        title="Switch to a Monthly plan."
        subtitle="Lock in a recurring weekly slot and save 25%+ on every booking. No lock-in, cancel anytime."
        buttonLabel="See plans"
        href="/plans"
      />

      {cancelTarget && (
        <CancelBookingModal
          booking={cancelTarget}
          turfName={turfMap.get(cancelTarget.turf_id)?.name ?? "Signal Shift Arena"}
          onConfirm={handleCancel}
          onClose={() => setCancelTarget(null)}
        />
      )}
    </div>
  );
}

export default function BookingsPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
