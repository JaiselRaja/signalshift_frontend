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
    <div className="glass-card p-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between animate-fade-in">
      {/* Left: turf + date/time info */}
      <div className="flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-[#191c1d] truncate">{turfName}</p>
          <StatusBadge status={booking.status} />
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span className="text-[#404a3b]">{formatDate(booking.booking_date)}</span>
          <span className="font-mono text-[#404a3b]">
            {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
          </span>
          <span className="text-[#707a6a] text-xs self-center">{booking.duration_mins} min</span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-[#707a6a] capitalize">{booking.booking_type}</span>
          {booking.notes && (
            <span className="text-xs text-[#707a6a] italic truncate max-w-[200px]" title={booking.notes}>
              {booking.notes}
            </span>
          )}
        </div>
      </div>

      {/* Right: price + cancel */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 shrink-0">
        <p className="text-base font-bold text-[#004900]">{formatCurrency(booking.final_price)}</p>
        {canCancel && onCancel && (
          <button
            onClick={() => onCancel(booking)}
            className="text-xs text-red-400 hover:text-red-300 border border-red-500/20 rounded-lg px-3 py-1.5 hover:bg-red-500/10 transition-colors"
          >
            Cancel
          </button>
        )}
        {booking.status === "cancelled" && booking.cancel_reason && (
          <p className="text-[10px] text-[#707a6a] max-w-[140px] text-right line-clamp-2">
            {booking.cancel_reason}
          </p>
        )}
        {booking.refund_amount != null && booking.refund_amount > 0 && (
          <p className="text-[10px] text-teal-400">
            Refund: {formatCurrency(booking.refund_amount)}
          </p>
        )}
      </div>
    </div>
  );
}
