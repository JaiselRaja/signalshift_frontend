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
      <div className="glass-card w-full max-w-md p-6 animate-fade-in bottom-sheet sm:rounded-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">Cancel Booking</h2>
            <p className="mt-0.5 text-sm text-[var(--text-muted)]">
              {turfName} · {formatDate(booking.booking_date)} · {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-white/[0.06] hover:text-white transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="mb-1.5 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-xs text-amber-300">
          Cancellation may be subject to the venue's refund policy.
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
            Reason for cancellation <span className="text-red-400">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please provide a reason..."
            rows={3}
            className="w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder-[var(--text-muted)] outline-none focus:border-indigo-500/40"
          />
        </div>

        {error && (
          <p className="mt-2 text-xs text-red-400">{error}</p>
        )}

        <div className="mt-4 flex gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 rounded-xl border border-white/[0.08] py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-white/[0.04] disabled:opacity-50 transition-colors"
          >
            Keep Booking
          </button>
          <button
            onClick={handleConfirm}
            disabled={!reason.trim() || submitting}
            className="flex-1 rounded-xl bg-red-500/10 border border-red-500/20 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/20 disabled:opacity-40 transition-colors"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-red-400/20 border-t-red-400 animate-spin" />
                Cancelling...
              </span>
            ) : (
              "Confirm Cancellation"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
