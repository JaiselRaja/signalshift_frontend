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
            className={`flex shrink-0 flex-col items-center gap-1 rounded-xl border px-3 py-2.5 transition-all ${
              isSelected
                ? "border-[#004900]/40 bg-[#004900]/10 text-[#191c1d]"
                : "border-[#bfcab7]/20 bg-white text-[#404a3b] hover:border-[#bfcab7]/40 hover:bg-[#f3f4f5]"
            }`}
          >
            <span className={`text-[10px] font-medium uppercase tracking-wider ${isSelected ? "text-[#004900]" : "text-[#707a6a]"}`}>
              {isToday ? "Today" : DAY_LABELS[d.getDay()]}
            </span>
            <span className="text-lg font-bold leading-none">{d.getDate()}</span>
            <span className={`text-[9px] ${isSelected ? "text-[#004900]" : "text-[#707a6a]"}`}>
              {MONTH_LABELS[d.getMonth()]}
            </span>
            {/* Availability dot */}
            <div className={`h-1.5 w-1.5 rounded-full ${
              slots.length === 0
                ? "bg-transparent"
                : hasAvailable
                ? "bg-emerald-400"
                : "bg-red-400/60"
            }`} />
          </button>
        );
      })}
    </div>
  );
}
