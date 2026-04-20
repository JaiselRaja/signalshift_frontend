"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  cancelBooking,
  getMe,
  getMyBookings,
  getMyTeams,
  listTurfs,
} from "@/lib/api";
import type { BookingRead, TeamRead, TurfRead, UserRead } from "@/types";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import BookingCard from "@/components/bookings/BookingCard";
import CancelBookingModal from "@/components/bookings/CancelBookingModal";
import TeamCard from "@/components/teams/TeamCard";
import TurfCard from "@/components/turfs/TurfCard";
import { PageLoader } from "@/components/ui/LoadingSpinner";

const UPCOMING_STATUSES = new Set(["pending", "confirmed"]);

function isUpcoming(booking: BookingRead): boolean {
  const today = new Date().toISOString().slice(0, 10);
  if (booking.booking_date > today) return UPCOMING_STATUSES.has(booking.status);
  if (booking.booking_date === today) return UPCOMING_STATUSES.has(booking.status);
  return false;
}

function SectionHeader({
  title,
  count,
  action,
}: {
  title: string;
  count?: number;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-xl font-black tracking-tight text-white md:text-2xl">
          {title}
        </h2>
        {count !== undefined && (
          <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">
            {count} {count === 1 ? "item" : "items"}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

function QuickAction({
  href,
  label,
  icon,
  highlight = false,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex flex-col gap-3 rounded-3xl p-5 transition-all hover:-translate-y-0.5 ${
        highlight
          ? "bg-[#b2f746] text-[#121f00] shadow-lg shadow-[#b2f746]/10"
          : "border border-white/[0.06] bg-white/[0.03] text-white hover:border-[#b2f746]/40"
      }`}
    >
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          highlight ? "bg-[#121f00]/10 text-[#121f00]" : "bg-[#b2f746]/15 text-[#b2f746]"
        }`}
      >
        {icon}
      </span>
      <span className="font-display text-base font-bold leading-tight">{label}</span>
      <span
        aria-hidden
        className={`absolute right-4 top-4 transition-transform group-hover:translate-x-1 ${
          highlight ? "text-[#121f00]/40" : "text-white/30"
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      </span>
    </Link>
  );
}

function DashboardContent() {
  const router = useRouter();
  const [me, setMe] = useState<UserRead | null>(null);
  const [bookings, setBookings] = useState<BookingRead[]>([]);
  const [teams, setTeams] = useState<TeamRead[]>([]);
  const [suggestions, setSuggestions] = useState<TurfRead[]>([]);
  const [turfMap, setTurfMap] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<BookingRead | null>(null);
  const [showPast, setShowPast] = useState(false);

  useEffect(() => {
    Promise.all([
      getMe().catch(() => null),
      getMyBookings().catch(() => [] as BookingRead[]),
      getMyTeams().catch(() => [] as TeamRead[]),
      listTurfs().catch(() => [] as TurfRead[]),
    ])
      .then(([user, bList, tList, turfList]) => {
        setMe(user);
        setBookings(bList);
        setTeams(tList);
        const map = new Map<string, string>();
        turfList.forEach((t) => map.set(t.id, t.name));
        setTurfMap(map);
        setSuggestions(turfList.filter((t) => t.is_active).slice(0, 3));
      })
      .catch(() => setError("Failed to load dashboard."))
      .finally(() => setLoading(false));
  }, []);

  const { upcoming, past } = useMemo(() => {
    const sorted = [...bookings].sort((a, b) => {
      const da = a.booking_date + a.start_time;
      const db = b.booking_date + b.start_time;
      return da < db ? -1 : 1;
    });
    return {
      upcoming: sorted.filter(isUpcoming),
      past: sorted.filter((b) => !isUpcoming(b)).reverse(),
    };
  }, [bookings]);

  async function handleCancel(reason: string) {
    if (!cancelTarget) return;
    const updated = await cancelBooking(cancelTarget.id, reason);
    setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    setCancelTarget(null);
  }

  if (loading) return <PageLoader />;

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  })();

  const firstName = me?.full_name?.split(" ")[0] ?? me?.email?.split("@")[0] ?? "there";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
      {/* Hero greeting */}
      <div className="mb-8">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.3em] text-[#b2f746]">
          · {greeting} ·
        </p>
        <h1 className="mt-2 font-display text-4xl font-black leading-[0.95] tracking-tight text-white md:text-5xl">
          {firstName}
        </h1>
        <p className="mt-3 text-sm text-white/60 md:text-base">
          {upcoming.length > 0
            ? `You have ${upcoming.length} upcoming booking${upcoming.length === 1 ? "" : "s"}.`
            : "Ready to book your next match?"}
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      {/* Quick actions */}
      <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
        <QuickAction
          href="/turfs"
          label="Book a slot"
          highlight
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          }
        />
        <QuickAction
          href="/tournaments"
          label="Tournaments"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4" />
              <path d="M19 7V4H8" />
            </svg>
          }
        />
        <QuickAction
          href="/teams"
          label="Teams"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            </svg>
          }
        />
        <QuickAction
          href="/profile"
          label="Profile"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          }
        />
      </div>

      {/* Upcoming bookings */}
      <section className="mb-12">
        <SectionHeader
          title="Upcoming bookings"
          count={upcoming.length}
          action={
            <Link
              href="/turfs"
              className="rounded-full bg-[#b2f746] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#121f00] shadow-sm transition-transform hover:scale-[1.03]"
            >
              + New booking
            </Link>
          }
        />
        {upcoming.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#b2f746]/10 text-[#b2f746]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <p className="text-sm text-white/60">No upcoming bookings.</p>
            <Link
              href="/turfs"
              className="text-xs font-semibold uppercase tracking-wider text-[#b2f746] underline-offset-4 hover:underline"
            >
              Browse turfs →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {upcoming.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                turfName={turfMap.get(booking.turf_id) ?? "Signal Shift Arena"}
                onCancel={setCancelTarget}
              />
            ))}
          </div>
        )}
      </section>

      {/* My Teams */}
      <section className="mb-12">
        <SectionHeader
          title="My teams"
          count={teams.length}
          action={
            <Link
              href="/teams"
              className="text-xs font-semibold uppercase tracking-wider text-[#b2f746] underline-offset-4 hover:underline"
            >
              Browse all teams →
            </Link>
          }
        />
        {teams.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#b2f746]/10 text-[#b2f746]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
            <p className="text-sm text-white/60">You haven&apos;t joined any teams yet.</p>
            <Link
              href="/teams"
              className="text-xs font-semibold uppercase tracking-wider text-[#b2f746] underline-offset-4 hover:underline"
            >
              Find or create a team →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((team, i) => (
              <TeamCard
                key={team.id}
                team={team}
                index={i}
                onClick={() => router.push(`/teams/${team.slug}?id=${team.id}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Suggested turfs */}
      {suggestions.length > 0 && (
        <section className="mb-12">
          <SectionHeader
            title="Suggested for you"
            action={
              <Link
                href="/turfs"
                className="text-xs font-semibold uppercase tracking-wider text-[#b2f746] underline-offset-4 hover:underline"
              >
                View all →
              </Link>
            }
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((turf, i) => (
              <TurfCard key={turf.id} turf={turf} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Past bookings (collapsible) */}
      {past.length > 0 && (
        <section className="mb-12">
          <button
            onClick={() => setShowPast(!showPast)}
            className="mb-4 flex w-full items-center justify-between text-left"
          >
            <div>
              <h2 className="font-display text-xl font-black tracking-tight text-white md:text-2xl">
                Past bookings
              </h2>
              <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">
                {past.length} {past.length === 1 ? "booking" : "bookings"}
              </p>
            </div>
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/60 transition-transform ${showPast ? "rotate-180" : ""}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
          </button>
          {showPast && (
            <div className="flex flex-col gap-3 animate-fade-in">
              {past.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  turfName={turfMap.get(booking.turf_id) ?? "Signal Shift Arena"}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Cancel modal */}
      {cancelTarget && (
        <CancelBookingModal
          booking={cancelTarget}
          turfName={turfMap.get(cancelTarget.turf_id) ?? "Signal Shift Arena"}
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
