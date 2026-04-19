"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getToken, getTurf, getTurfAvailabilityRange, getTurfAvailability } from "@/lib/api";
import type { AvailableSlot, TurfRead } from "@/types";
import SportTag from "@/components/ui/SportTag";
import AmenitiesList from "@/components/turfs/AmenitiesList";
import SlotCalendar from "@/components/turfs/SlotCalendar";
import SlotGrid, { SlotGridSkeleton } from "@/components/turfs/SlotGrid";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { formatCurrency, toDateString, addDays, formatDate } from "@/lib/utils";
import { MAX_SLOTS_PER_BOOKING, summarize, toggleSlot } from "@/lib/slotSelection";

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function TurfDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const turfId = searchParams.get("id") ?? "";

  const [turf, setTurf] = useState<TurfRead | null>(null);
  const [availabilityRange, setAvailabilityRange] = useState<Record<string, AvailableSlot[]>>({});
  const [selectedDate, setSelectedDate] = useState(toDateString(new Date()));
  const [daySlots, setDaySlots] = useState<AvailableSlot[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<AvailableSlot[]>([]);
  const [maxWarning, setMaxWarning] = useState(false);
  const [loadingTurf, setLoadingTurf] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summary = summarize(selectedSlots);

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
    setSelectedSlots([]);
    setMaxWarning(false);

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

  function handleToggleSlot(slot: AvailableSlot) {
    const result = toggleSlot(selectedSlots, slot);
    setSelectedSlots(result.slots);
    if (result.reason === "max_reached") {
      setMaxWarning(true);
      setTimeout(() => setMaxWarning(false), 2500);
    } else {
      setMaxWarning(false);
    }
  }

  function handleBook() {
    if (!summary || !turfId) return;
    const params = new URLSearchParams({
      date: summary.date,
      start: summary.start_time,
      end: summary.end_time,
      price: String(summary.total_price),
    });
    const target = `/book/${turfId}?${params}`;
    if (!getToken()) {
      router.push(`/login?redirect=${encodeURIComponent(target)}`);
      return;
    }
    router.push(target);
  }

  if (!turfId) return <div className="p-8 text-[#707a6a]">Invalid turf link.</div>;
  if (loadingTurf) return <PageLoader />;
  if (error || !turf) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-red-700">{error ?? "Turf not found."}</p>
      </div>
    );
  }

  const hasOperatingHours = Object.keys(turf.operating_hours).length > 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      {/* Back link */}
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1.5 text-xs text-[#707a6a] hover:text-[#191c1d]"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
        Back to Turfs
      </button>

      {/* Turf header */}
      <div className="glass-card mb-6 p-5 md:p-6 animate-fade-in">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-[#191c1d] md:text-2xl">{turf.name}</h1>
              {!turf.is_active && (
                <span className="rounded-full bg-slate-500/10 px-2 py-0.5 text-[10px] font-medium text-slate-400">Unavailable</span>
              )}
            </div>
            {turf.city && (
              <p className="mt-1 text-sm text-[#707a6a]">
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
          <div className="mt-4 border-t border-[#bfcab7]/20 pt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[#707a6a]">Amenities</p>
            <AmenitiesList amenities={turf.amenities} />
          </div>
        )}

        {/* Operating hours */}
        {hasOperatingHours && (
          <div className="mt-4 border-t border-[#bfcab7]/20 pt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[#707a6a]">Operating Hours</p>
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              {DAY_NAMES.map((day, i) => {
                const key = Object.keys(turf.operating_hours).find(
                  (k) => k.toLowerCase().startsWith(day.toLowerCase().slice(0, 3))
                );
                const hours = key ? turf.operating_hours[key] : null;
                return (
                  <div key={day} className="flex items-center gap-2 text-xs">
                    <span className="w-8 text-[#707a6a]">{day.slice(0, 3)}</span>
                    <span className="text-[#404a3b]">
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
          <h2 className="mb-4 text-base font-semibold text-[#191c1d]">Check Availability</h2>

          {/* Date strip */}
          <SlotCalendar
            availabilityRange={availabilityRange}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
          />

          {/* Selected date label + helper */}
          <div className="my-4 flex items-center justify-between">
            <p className="text-sm font-medium text-[#404a3b]">
              {formatDate(selectedDate)}
            </p>
            <p className="text-xs text-[#707a6a]">
              {loadingSlots ? "Loading..." : `${daySlots.filter((s) => s.is_available).length} slot${daySlots.filter((s) => s.is_available).length !== 1 ? "s" : ""} available`}
            </p>
          </div>

          <p className="mb-3 text-xs text-[#707a6a]">
            Tap up to <span className="font-semibold text-[#191c1d]">{MAX_SLOTS_PER_BOOKING}</span> consecutive slots to extend your booking.
          </p>

          {/* Slot grid */}
          {loadingSlots ? (
            <SlotGridSkeleton />
          ) : (
            <SlotGrid
              slots={daySlots}
              selectedSlots={selectedSlots}
              onToggleSlot={handleToggleSlot}
            />
          )}

          {maxWarning && (
            <div className="mt-4 rounded-lg border border-amber-400/40 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
              Maximum {MAX_SLOTS_PER_BOOKING} slots per booking.
            </div>
          )}
        </div>
      )}

      {/* Sticky booking CTA (mobile) */}
      {summary && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#bfcab7]/20 bg-white/95 px-4 py-3 backdrop-blur-xl md:hidden animate-slide-up">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-[#707a6a]">
                {formatDate(summary.date)} · {summary.count} slot{summary.count > 1 ? "s" : ""}
              </p>
              <p className="text-sm font-semibold text-[#191c1d] font-mono">
                {summary.start_time.slice(0, 5)} – {summary.end_time.slice(0, 5)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-[#004900]">{formatCurrency(summary.total_price)}</p>
            </div>
            <button
              onClick={handleBook}
              className="shrink-0 bg-[#b2f746] text-[#121f00] rounded-full font-bold shadow-lg shadow-[#004900]/10 hover:scale-[1.02] active:scale-95 transition-all px-5 py-2.5 text-sm"
            >
              Book
            </button>
          </div>
        </div>
      )}

      {/* Desktop CTA */}
      {summary && (
        <div className="mt-4 hidden md:flex items-center justify-between rounded-xl border border-[#004900]/15 bg-[#004900]/5 px-5 py-4 animate-fade-in">
          <div>
            <p className="text-sm text-[#707a6a]">
              {formatDate(summary.date)} · {summary.count} slot{summary.count > 1 ? "s" : ""} · {summary.duration_mins} min
            </p>
            <p className="font-mono text-base font-semibold text-[#191c1d]">
              {summary.start_time.slice(0, 5)} – {summary.end_time.slice(0, 5)}
            </p>
          </div>
          <div className="text-right mr-4">
            <p className="text-2xl font-bold text-[#004900]">{formatCurrency(summary.total_price)}</p>
          </div>
          <button
            onClick={handleBook}
            className="bg-[#b2f746] text-[#121f00] rounded-full font-bold shadow-lg shadow-[#004900]/10 hover:scale-[1.02] active:scale-95 transition-all px-6 py-3"
          >
            Continue to Book →
          </button>
        </div>
      )}
    </div>
  );
}

export default function TurfDetailPage() {
  return <TurfDetailContent />;
}
