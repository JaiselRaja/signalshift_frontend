import type { BookingRead } from "@/types";
import { formatDate, formatTime, formatCurrency } from "@/lib/utils";
import StatusBadge from "@/components/ui/StatusBadge";

type Props = {
  booking: BookingRead;
  turfName: string;
  onCancel?: (booking: BookingRead) => void;
};

const CANCELLABLE_STATUSES = new Set(["pending", "confirmed"]);

export default function BookingCard({ booking, turfName, onCancel }: Props) {
  const canCancel = CANCELLABLE_STATUSES.has(booking.status);

  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-white/[0.06] bg-white/[0.03] p-5 animate-fade-in sm:flex-row sm:items-start sm:justify-between">
      {/* Left: turf + date/time info */}
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate font-display text-lg font-bold text-white">{turfName}</h3>
          <StatusBadge status={booking.status} />
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span className="text-white/70">{formatDate(booking.booking_date)}</span>
          <span className="font-mono text-white">
            {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
          </span>
          <span className="self-center text-xs text-white/50">{booking.duration_mins} min</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/70">
            {booking.booking_type}
          </span>
          {booking.notes && (
            <span className="truncate text-xs italic text-white/50 max-w-[200px]" title={booking.notes}>
              {booking.notes}
            </span>
          )}
        </div>
      </div>

      {/* Right: price + cancel */}
      <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-start">
        <p className="font-display text-xl font-black text-[#b2f746]">{formatCurrency(booking.final_price)}</p>
        {canCancel && onCancel && (
          <button
            onClick={() => onCancel(booking)}
            className="rounded-full border border-rose-500/30 px-3.5 py-1.5 text-xs font-semibold text-rose-300 transition-colors hover:bg-rose-500/10 hover:text-rose-200"
          >
            Cancel
          </button>
        )}
        {booking.status === "cancelled" && booking.cancel_reason && (
          <p className="max-w-[140px] text-right text-[10px] text-white/50 line-clamp-2">
            {booking.cancel_reason}
          </p>
        )}
        {booking.refund_amount != null && booking.refund_amount > 0 && (
          <p className="text-[10px] font-medium text-teal-300">
            Refund: {formatCurrency(booking.refund_amount)}
          </p>
        )}
      </div>
    </div>
  );
}
