"use client";

type Props = {
  status: string;
  size?: "sm" | "md";
};

const STATUS_STYLES: Record<string, string> = {
  // Booking statuses
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  completed: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  no_show: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  refund_pending: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  refunded: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  // Tournament statuses
  draft: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  registration_open: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  registration_closed: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  in_progress: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  // Match statuses
  scheduled: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  live: "bg-red-500/10 text-red-400 border-red-500/20",
  postponed: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  walkover: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

const STATUS_LABELS: Record<string, string> = {
  registration_open: "Open",
  registration_closed: "Closed",
  in_progress: "In Progress",
  refund_pending: "Refund Pending",
  no_show: "No Show",
};

export default function StatusBadge({ status, size = "sm" }: Props) {
  const style = STATUS_STYLES[status] ?? "bg-slate-500/10 text-slate-400 border-slate-500/20";
  const label = STATUS_LABELS[status] ?? status.replace(/_/g, " ");
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 font-medium capitalize ${textSize} ${style}`}
    >
      {label}
    </span>
  );
}
