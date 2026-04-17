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
    <div className="mb-4 flex items-end justify-between gap-3">
      <div className="flex items-baseline gap-3">
        <h2 className="text-lg font-bold text-[#191c1d] font-[family-name:var(--font-headline)]">
          {title}
        </h2>
        {count !== undefined && (
          <span className="text-xs font-medium text-[#707a6a]">
            {count} {count === 1 ? "item" : "items"}
          </span>
        )}
      </div>
      {action}
    </div>
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

  const firstName = me?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      {/* Hero greeting */}
      <div className="mb-8">
        <p className="text-sm text-[#707a6a]">{greeting},</p>
        <h1 className="mt-1 text-3xl font-bold text-[#191c1d] md:text-4xl font-[family-name:var(--font-headline)]">
          {firstName}
        </h1>
        <p className="mt-2 text-sm text-[#707a6a]">
          {upcoming.length > 0
            ? `You have ${upcoming.length} upcoming booking${upcoming.length === 1 ? "" : "s"}.`
            : "Ready to book your next match?"}
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Quick actions */}
      <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Link
          href="/turfs"
          className="group flex flex-col gap-2 rounded-2xl bg-[#004900] p-5 text-white transition-all hover:scale-[1.02]"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" className="text-[#b2f746]">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className="text-sm font-semibold">Book a slot</span>
        </Link>
        <Link
          href="/tournaments"
          className="group flex flex-col gap-2 rounded-2xl bg-white p-5 shadow-sm shadow-[#004900]/5 transition-all hover:scale-[1.02]"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" className="text-[#004900]">
            <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4" />
            <path d="M19 7V4H8" />
          </svg>
          <span className="text-sm font-semibold text-[#191c1d]">Tournaments</span>
        </Link>
        <Link
          href="/teams"
          className="group flex flex-col gap-2 rounded-2xl bg-white p-5 shadow-sm shadow-[#004900]/5 transition-all hover:scale-[1.02]"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" className="text-[#004900]">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          </svg>
          <span className="text-sm font-semibold text-[#191c1d]">Teams</span>
        </Link>
        <Link
          href="/profile"
          className="group flex flex-col gap-2 rounded-2xl bg-white p-5 shadow-sm shadow-[#004900]/5 transition-all hover:scale-[1.02]"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" className="text-[#004900]">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span className="text-sm font-semibold text-[#191c1d]">Profile</span>
        </Link>
      </div>

      {/* Upcoming bookings */}
      <section className="mb-12">
        <SectionHeader
          title="Upcoming bookings"
          count={upcoming.length}
          action={
            <Link
              href="/turfs"
              className="rounded-full bg-[#b2f746] px-4 py-2 text-xs font-bold text-[#121f00] shadow-sm shadow-[#004900]/10 hover:scale-[1.02] transition-all"
            >
              + New booking
            </Link>
          }
        />
        {upcoming.length === 0 ? (
          <div className="glass-card flex flex-col items-center gap-3 p-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#bfcab7]/15 text-[#707a6a]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <p className="text-sm text-[#707a6a]">No upcoming bookings.</p>
            <Link
              href="/turfs"
              className="text-sm font-semibold text-[#004900] hover:text-[#006400]"
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
              className="text-xs font-semibold text-[#004900] hover:text-[#006400]"
            >
              Browse all teams →
            </Link>
          }
        />
        {teams.length === 0 ? (
          <div className="glass-card flex flex-col items-center gap-3 p-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#bfcab7]/15 text-[#707a6a]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
            <p className="text-sm text-[#707a6a]">You haven&apos;t joined any teams yet.</p>
            <Link
              href="/teams"
              className="text-sm font-semibold text-[#004900] hover:text-[#006400]"
            >
              Find or create a team →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
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
                className="text-xs font-semibold text-[#004900] hover:text-[#006400]"
              >
                View all →
              </Link>
            }
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((turf) => (
              <TurfCard key={turf.id} turf={turf} />
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
            <div className="flex items-baseline gap-3">
              <h2 className="text-lg font-bold text-[#191c1d] font-[family-name:var(--font-headline)]">
                Past bookings
              </h2>
              <span className="text-xs font-medium text-[#707a6a]">
                {past.length} {past.length === 1 ? "booking" : "bookings"}
              </span>
            </div>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className={`text-[#707a6a] transition-transform ${showPast ? "rotate-180" : ""}`}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
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
