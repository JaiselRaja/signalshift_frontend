"use client";

import { useEffect, useRef } from "react";
import type { AvailableSlot } from "@/types";
import { addDays, toDateString } from "@/lib/utils";

type Props = {
  availabilityRange: Record<string, AvailableSlot[]>;
  selectedDate: string;
  onSelectDate: (date: string) => void;
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function SlotCalendar({ availabilityRange, selectedDate, onSelectDate }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const today = new Date();

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = addDays(today, i);
    return { dateStr: toDateString(d), d };
  });

  // Scroll today into view on mount
  useEffect(() => {
    scrollRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  }, []);

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto py-1 scrollbar-hide"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {days.map(({ dateStr, d }) => {
        const slots = availabilityRange[dateStr] ?? [];
        const hasAvailable = slots.some((s) => s.is_available);
        const isSelected = dateStr === selectedDate;
        const isToday = dateStr === toDateString(today);

        return (
          <button
            key={dateStr}
            onClick={() => onSelectDate(dateStr)}
            className={`flex shrink-0 flex-col items-center gap-1 rounded-2xl border px-3.5 py-3 transition-all ${
              isSelected
                ? "border-[#b2f746] bg-[#b2f746] text-[#121f00] shadow-md shadow-[#b2f746]/20"
                : "border-white/10 bg-white/[0.03] text-white hover:border-white/20 hover:bg-white/[0.06]"
            }`}
          >
            <span className={`text-[10px] font-semibold uppercase tracking-wider ${isSelected ? "text-[#121f00]/80" : "text-white/50"}`}>
              {isToday ? "Today" : DAY_LABELS[d.getDay()]}
            </span>
            <span className={`font-display text-xl font-black leading-none ${isSelected ? "text-[#121f00]" : "text-white"}`}>
              {d.getDate()}
            </span>
            <span className={`text-[9px] uppercase tracking-wider ${isSelected ? "text-[#121f00]/70" : "text-white/50"}`}>
              {MONTH_LABELS[d.getMonth()]}
            </span>
            {/* Availability dot */}
            <div className={`h-1.5 w-1.5 rounded-full ${
              slots.length === 0
                ? isSelected ? "bg-[#121f00]/30" : "bg-white/15"
                : hasAvailable
                ? isSelected ? "bg-[#121f00]" : "bg-[#b2f746]"
                : isSelected ? "bg-rose-700" : "bg-rose-400"
            }`} />
          </button>
        );
      })}
    </div>
  );
}
