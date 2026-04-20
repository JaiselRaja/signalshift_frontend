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

  if (!turfId) return <div className="p-8 text-white/60">Invalid turf link.</div>;
  if (loadingTurf) return <PageLoader />;
  if (error || !turf) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-rose-400">{error ?? "Turf not found."}</p>
      </div>
    );
  }

  const hasOperatingHours = Object.keys(turf.operating_hours).length > 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-6 md:py-10">
      {/* Back link */}
      <button
        onClick={() => router.back()}
        className="mb-5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/50 hover:text-white"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
        Back to Turfs
      </button>

      {/* Turf header */}
      <div className="mb-6 rounded-3xl border border-white/[0.06] bg-white/[0.03] p-5 animate-fade-in md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-2xl font-black leading-tight text-white md:text-3xl">{turf.name}</h1>
              {!turf.is_active && (
                <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-medium text-rose-300 ring-1 ring-rose-500/30">Unavailable</span>
              )}
            </div>
            {turf.city && (
              <p className="mt-2 text-sm text-white/60">
                <span className="inline-flex items-start gap-1.5">
                  <svg className="mt-0.5 shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  {[turf.city, turf.address].filter(Boolean).join(" · ")}
                </span>
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {turf.sport_types.map((s) => (
                <span key={s} className="rounded-full border border-[#b2f746]/30 bg-[#b2f746]/[0.08] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#b2f746]">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Amenities */}
        {turf.amenities.length > 0 && (
          <div className="mt-4 border-t border-white/[0.06] pt-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">Amenities</p>
            <AmenitiesList amenities={turf.amenities} />
          </div>
        )}

        {/* Operating hours */}
        {hasOperatingHours && (
          <div className="mt-4 border-t border-white/[0.06] pt-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">Operating Hours</p>
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              {DAY_NAMES.map((day, i) => {
                const key = Object.keys(turf.operating_hours).find(
                  (k) => k.toLowerCase().startsWith(day.toLowerCase().slice(0, 3))
                );
                const hours = key ? turf.operating_hours[key] : null;
                return (
                  <div key={day} className="flex items-center gap-2 text-xs">
                    <span className="w-8 text-white/50">{day.slice(0, 3)}</span>
                    <span className="text-white/80">
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
        <div className="rounded-3xl border border-white/[0.06] bg-white/[0.03] p-5 animate-fade-in md:p-6">
          <h2 className="mb-4 font-display text-xl font-black text-white md:text-2xl">Check availability</h2>

          {/* Date strip */}
          <SlotCalendar
            availabilityRange={availabilityRange}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
          />

          {/* Selected date label + helper */}
          <div className="my-4 flex items-center justify-between">
            <p className="font-display text-sm font-bold text-white md:text-base">
              {formatDate(selectedDate)}
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
              {loadingSlots ? "Loading…" : `${daySlots.filter((s) => s.is_available).length} slot${daySlots.filter((s) => s.is_available).length !== 1 ? "s" : ""} available`}
            </p>
          </div>

          <p className="mb-3 text-xs text-white/60">
            Tap up to <span className="font-semibold text-[#b2f746]">{MAX_SLOTS_PER_BOOKING}</span> consecutive slots to extend your booking.
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
            <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs font-medium text-amber-300">
              Maximum {MAX_SLOTS_PER_BOOKING} slots per booking.
            </div>
          )}
        </div>
      )}

      {/* Sticky booking CTA (mobile) */}
      {summary && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/[0.06] bg-[#0a0b0c]/95 px-4 py-3 backdrop-blur-xl md:hidden animate-slide-up">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
                {formatDate(summary.date)} · {summary.count} slot{summary.count > 1 ? "s" : ""}
              </p>
              <p className="font-mono text-sm font-bold text-white">
                {summary.start_time.slice(0, 5)} – {summary.end_time.slice(0, 5)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-display text-lg font-black text-[#b2f746]">{formatCurrency(summary.total_price)}</p>
            </div>
            <button
              onClick={handleBook}
              className="shrink-0 rounded-full bg-[#b2f746] px-5 py-2.5 text-sm font-bold text-[#121f00] shadow-lg shadow-[#b2f746]/20 transition-all active:scale-95"
            >
              Book
            </button>
          </div>
        </div>
      )}

      {/* Desktop CTA */}
      {summary && (
        <div className="mt-4 hidden items-center justify-between rounded-2xl border border-[#b2f746]/30 bg-[#b2f746]/[0.06] px-5 py-4 animate-fade-in md:flex">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
              {formatDate(summary.date)} · {summary.count} slot{summary.count > 1 ? "s" : ""} · {summary.duration_mins} min
            </p>
            <p className="mt-0.5 font-mono text-base font-bold text-white">
              {summary.start_time.slice(0, 5)} – {summary.end_time.slice(0, 5)}
            </p>
          </div>
          <div className="mr-4 text-right">
            <p className="font-display text-2xl font-black text-[#b2f746]">{formatCurrency(summary.total_price)}</p>
          </div>
          <button
            onClick={handleBook}
            className="rounded-full bg-[#b2f746] px-6 py-3 font-bold text-[#121f00] shadow-lg shadow-[#b2f746]/20 transition-transform hover:scale-[1.03]"
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
