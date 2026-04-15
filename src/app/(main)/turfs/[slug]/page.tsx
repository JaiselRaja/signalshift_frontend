"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getTurf, getTurfAvailabilityRange, getTurfAvailability } from "@/lib/api";
import type { AvailableSlot, TurfRead } from "@/types";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import SportTag from "@/components/ui/SportTag";
import AmenitiesList from "@/components/turfs/AmenitiesList";
import SlotCalendar from "@/components/turfs/SlotCalendar";
import SlotGrid, { SlotGridSkeleton } from "@/components/turfs/SlotGrid";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { formatCurrency, toDateString, addDays, formatDate } from "@/lib/utils";

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function TurfDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const turfId = searchParams.get("id") ?? "";

  const [turf, setTurf] = useState<TurfRead | null>(null);
  const [availabilityRange, setAvailabilityRange] = useState<Record<string, AvailableSlot[]>>({});
  const [selectedDate, setSelectedDate] = useState(toDateString(new Date()));
  const [daySlots, setDaySlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [loadingTurf, setLoadingTurf] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load turf + 14-day availability range
  useEffect(() => {
    if (!turfId) return;
    const startDate = toDateString(new Date());
    const endDate = toDateString(addDays(new Date(), 13));

    Promise.all([
      getTurf(turfId),
      getTurfAvailabilityRange(turfId, startDate, endDate),
    ])
      .then(([t, range]) => {
        setTurf(t);
        setAvailabilityRange(range);
        // Load today's slots
        setDaySlots(range[selectedDate] ?? []);
      })
      .catch(() => setError("Failed to load turf details."))
      .finally(() => setLoadingTurf(false));
  }, [turfId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSelectDate(date: string) {
    setSelectedDate(date);
    setSelectedSlot(null);

    if (availabilityRange[date] !== undefined) {
      setDaySlots(availabilityRange[date]);
      return;
    }
    // Fetch if not in cache
    setLoadingSlots(true);
    try {
      const slots = await getTurfAvailability(turfId, date);
      setAvailabilityRange((prev) => ({ ...prev, [date]: slots }));
      setDaySlots(slots);
    } catch {
      setDaySlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  function handleBook() {
    if (!selectedSlot || !turfId) return;
    const params = new URLSearchParams({
      date: selectedSlot.date,
      start: selectedSlot.start_time,
      end: selectedSlot.end_time,
      price: String(selectedSlot.computed_price || selectedSlot.base_price),
    });
    router.push(`/book/${turfId}?${params}`);
  }

  if (!turfId) return <div className="p-8 text-[var(--text-muted)]">Invalid turf link.</div>;
  if (loadingTurf) return <PageLoader />;
  if (error || !turf) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-red-400">{error ?? "Turf not found."}</p>
      </div>
    );
  }

  const hasOperatingHours = Object.keys(turf.operating_hours).length > 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      {/* Back link */}
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-white"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
        Back to Turfs
      </button>

      {/* Turf header */}
      <div className="glass-card mb-6 p-5 md:p-6 animate-fade-in">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-[var(--text-primary)] md:text-2xl">{turf.name}</h1>
              {!turf.is_active && (
                <span className="rounded-full bg-slate-500/10 px-2 py-0.5 text-[10px] font-medium text-slate-400">Unavailable</span>
              )}
            </div>
            {turf.city && (
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                <span className="inline-flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  {[turf.city, turf.address].filter(Boolean).join(" · ")}
                </span>
              </p>
            )}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {turf.sport_types.map((s) => <SportTag key={s} sport={s} />)}
            </div>
          </div>
        </div>

        {/* Amenities */}
        {turf.amenities.length > 0 && (
          <div className="mt-4 border-t border-white/[0.06] pt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Amenities</p>
            <AmenitiesList amenities={turf.amenities} />
          </div>
        )}

        {/* Operating hours */}
        {hasOperatingHours && (
          <div className="mt-4 border-t border-white/[0.06] pt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Operating Hours</p>
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              {DAY_NAMES.map((day, i) => {
                const key = Object.keys(turf.operating_hours).find(
                  (k) => k.toLowerCase().startsWith(day.toLowerCase().slice(0, 3))
                );
                const hours = key ? turf.operating_hours[key] : null;
                return (
                  <div key={day} className="flex items-center gap-2 text-xs">
                    <span className="w-8 text-[var(--text-muted)]">{day.slice(0, 3)}</span>
                    <span className="text-[var(--text-secondary)]">
                      {hours ? `${hours.open} – ${hours.close}` : "Closed"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Availability section */}
      {turf.is_active && (
        <div className="glass-card p-5 md:p-6 animate-fade-in">
          <h2 className="mb-4 text-base font-semibold text-[var(--text-primary)]">Check Availability</h2>

          {/* Date strip */}
          <SlotCalendar
            availabilityRange={availabilityRange}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
          />

          {/* Selected date label */}
          <div className="my-4 flex items-center justify-between">
            <p className="text-sm font-medium text-[var(--text-secondary)]">
              {formatDate(selectedDate)}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {loadingSlots ? "Loading..." : `${daySlots.filter((s) => s.is_available).length} slot${daySlots.filter((s) => s.is_available).length !== 1 ? "s" : ""} available`}
            </p>
          </div>

          {/* Slot grid */}
          {loadingSlots ? (
            <SlotGridSkeleton />
          ) : (
            <SlotGrid
              slots={daySlots}
              selectedSlot={selectedSlot}
              onSelectSlot={setSelectedSlot}
            />
          )}
        </div>
      )}

      {/* Sticky booking CTA (mobile) */}
      {selectedSlot && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/[0.06] bg-[#0d0e14]/95 px-4 py-3 backdrop-blur-xl md:hidden animate-slide-up">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-[var(--text-muted)]">{formatDate(selectedSlot.date)}</p>
              <p className="text-sm font-semibold text-white font-mono">
                {selectedSlot.start_time.slice(0,5)} – {selectedSlot.end_time.slice(0,5)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-indigo-300">{formatCurrency(selectedSlot.computed_price || selectedSlot.base_price)}</p>
            </div>
            <button
              onClick={handleBook}
              className="shrink-0 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20"
            >
              Book
            </button>
          </div>
        </div>
      )}

      {/* Desktop CTA */}
      {selectedSlot && (
        <div className="mt-4 hidden md:flex items-center justify-between rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-5 py-4 animate-fade-in">
          <div>
            <p className="text-sm text-[var(--text-muted)]">{formatDate(selectedSlot.date)} · {selectedSlot.duration_mins} min</p>
            <p className="font-mono text-base font-semibold text-white">
              {selectedSlot.start_time.slice(0,5)} – {selectedSlot.end_time.slice(0,5)}
            </p>
          </div>
          <div className="text-right mr-4">
            <p className="text-2xl font-bold text-indigo-300">{formatCurrency(selectedSlot.computed_price || selectedSlot.base_price)}</p>
          </div>
          <button
            onClick={handleBook}
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/20 hover:opacity-90"
          >
            Continue to Book →
          </button>
        </div>
      )}
    </div>
  );
}

export default function TurfDetailPage() {
  return (
    <ProtectedRoute>
      <TurfDetailContent />
    </ProtectedRoute>
  );
}
