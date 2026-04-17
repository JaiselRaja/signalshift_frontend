"use client";

import type { AvailableSlot } from "@/types";
import { formatTime, formatCurrency, isSlotPast } from "@/lib/utils";

type Props = {
  slots: AvailableSlot[];
  selectedSlot: AvailableSlot | null;
  onSelectSlot: (slot: AvailableSlot) => void;
};

const SLOT_TYPE_STYLES: Record<string, string> = {
  peak: "text-amber-400 bg-amber-500/10",
  offpeak: "text-emerald-400 bg-emerald-500/10",
  regular: "text-slate-400 bg-slate-500/10",
};

function SlotSkeleton() {
  return (
    <div className="skeleton h-[88px] rounded-xl" />
  );
}

export function SlotGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => <SlotSkeleton key={i} />)}
    </div>
  );
}

export default function SlotGrid({ slots, selectedSlot, onSelectSlot }: Props) {
  if (slots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <p className="text-sm text-[#707a6a]">No slots configured for this day.</p>
      </div>
    );
  }

  // Show all slots (available, unavailable, past) for full picture
  const displayDate = slots[0]?.date ?? "";

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
      {slots.map((slot, i) => {
        const past = isSlotPast(displayDate, slot.start_time);
        const unavailable = !slot.is_available;
        const isSelected =
          selectedSlot?.start_time === slot.start_time &&
          selectedSlot?.end_time === slot.end_time;

        const disabled = past || unavailable;

        return (
          <button
            key={i}
            disabled={disabled}
            onClick={() => !disabled && onSelectSlot(slot)}
            className={`flex flex-col gap-1 rounded-xl border p-3 text-left transition-all ${
              disabled
                ? "cursor-not-allowed border-[#bfcab7]/10 bg-[#f3f4f5] opacity-40"
                : isSelected
                ? "border-[#004900] bg-[#004900]/10 shadow-lg shadow-[#004900]/10"
                : "border-[#bfcab7]/20 bg-white hover:border-[#004900]/30 hover:bg-[#004900]/5"
            }`}
          >
            {/* Time range */}
            <span className={`font-mono text-xs font-semibold leading-tight ${disabled ? "text-[#707a6a] line-through" : isSelected ? "text-[#191c1d]" : "text-[#191c1d]"}`}>
              {formatTime(slot.start_time)}
            </span>
            <span className={`font-mono text-[10px] ${disabled ? "text-[#707a6a]" : "text-[#404a3b]"}`}>
              → {formatTime(slot.end_time)}
            </span>

            {/* Duration + type */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-[#707a6a]">{slot.duration_mins}m</span>
              {slot.slot_type !== "regular" && (
                <span className={`rounded px-1 py-0.5 text-[9px] font-medium capitalize ${SLOT_TYPE_STYLES[slot.slot_type] ?? "text-slate-400 bg-slate-500/10"}`}>
                  {slot.slot_type}
                </span>
              )}
            </div>

            {/* Price */}
            <span className={`text-xs font-bold mt-0.5 ${disabled ? "text-[#707a6a]" : isSelected ? "text-[#004900]" : "text-[#191c1d]"}`}>
              {formatCurrency(slot.computed_price || slot.base_price)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
