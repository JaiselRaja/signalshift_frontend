"use client";

import { useEffect, useMemo, useState } from "react";
import { getMyBookings, listTurfs, cancelBooking } from "@/lib/api";
import type { BookingRead, TurfRead } from "@/types";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import BookingCard from "@/components/bookings/BookingCard";
import CancelBookingModal from "@/components/bookings/CancelBookingModal";
import { PageLoader } from "@/components/ui/LoadingSpinner";

type Tab = "upcoming" | "past";

const UPCOMING_STATUSES = new Set(["pending", "confirmed"]);

function isUpcoming(booking: BookingRead): boolean {
  const today = new Date().toISOString().slice(0, 10);
  if (booking.booking_date > today) return UPCOMING_STATUSES.has(booking.status);
  if (booking.booking_date === today) return UPCOMING_STATUSES.has(booking.status);
  return false;
}

function BookingsContent() {
  const [bookings, setBookings] = useState<BookingRead[]>([]);
  const [turfMap, setTurfMap] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");
  const [cancelTarget, setCancelTarget] = useState<BookingRead | null>(null);

  useEffect(() => {
    Promise.all([getMyBookings(), listTurfs()])
      .then(([bList, tList]) => {
        setBookings(bList);
        const map = new Map<string, string>();
        (tList as TurfRead[]).forEach((t) => map.set(t.id, t.name));
        setTurfMap(map);
      })
      .catch(() => setError("Failed to load bookings."))
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

  const displayed = activeTab === "upcoming" ? upcoming : past;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-6">
      <h1 className="mb-6 text-xl font-bold text-[var(--text-primary)]">My Bookings</h1>

      {error && (
        <div className="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
        {(["upcoming", "past"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors capitalize ${
              activeTab === tab
                ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            {tab}
            {tab === "upcoming" && upcoming.length > 0 && (
              <span className="ml-1.5 rounded-full bg-indigo-500/20 px-1.5 py-0.5 text-[10px] text-indigo-400">
                {upcoming.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Booking list */}
      {displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-[var(--text-muted)]">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <p className="text-sm text-[var(--text-muted)]">
            {activeTab === "upcoming" ? "No upcoming bookings." : "No past bookings."}
          </p>
          {activeTab === "upcoming" && (
            <a href="/turfs" className="mt-3 text-sm text-indigo-400 hover:text-indigo-300">
              Browse turfs →
            </a>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {displayed.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              turfName={turfMap.get(booking.turf_id) ?? "Unknown Turf"}
              onCancel={setCancelTarget}
            />
          ))}
        </div>
      )}

      {/* Cancel modal */}
      {cancelTarget && (
        <CancelBookingModal
          booking={cancelTarget}
          turfName={turfMap.get(cancelTarget.turf_id) ?? "Unknown Turf"}
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
      <BookingsContent />
    </ProtectedRoute>
  );
}
