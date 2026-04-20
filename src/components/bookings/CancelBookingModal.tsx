"use client";

import { useState } from "react";
import type { BookingRead } from "@/types";
import { formatDate, formatTime } from "@/lib/utils";

type Props = {
  booking: BookingRead;
  turfName: string;
  onConfirm: (reason: string) => Promise<void>;
  onClose: () => void;
};

export default function CancelBookingModal({ booking, turfName, onConfirm, onClose }: Props) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (!reason.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(reason.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cancellation failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md animate-fade-in rounded-3xl border border-white/[0.06] bg-[#111213] p-6 shadow-2xl sm:rounded-3xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-white">Cancel booking</h2>
            <p className="mt-1 text-sm text-white/60">
              {turfName} · {formatDate(booking.booking_date)} · {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-white/60 hover:bg-white/[0.06] hover:text-white transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="mb-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2.5 text-xs text-amber-200">
          Cancellation may be subject to the venue&rsquo;s refund policy.
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">
            Reason for cancellation <span className="text-rose-400">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please provide a reason..."
            rows={3}
            className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-white/40 outline-none transition-colors focus:border-[#b2f746]/50 focus:ring-2 focus:ring-[#b2f746]/15"
          />
        </div>

        {error && (
          <p className="mt-2 text-xs text-rose-300">{error}</p>
        )}

        <div className="mt-4 flex gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
          >
            Keep booking
          </button>
          <button
            onClick={handleConfirm}
            disabled={!reason.trim() || submitting}
            className="flex-1 rounded-xl border border-rose-500/30 bg-rose-500/10 py-2.5 text-sm font-semibold text-rose-300 transition-colors hover:bg-rose-500/20 disabled:opacity-40"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-rose-400/20 border-t-rose-400 animate-spin" />
                Cancelling…
              </span>
            ) : (
              "Confirm cancellation"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
