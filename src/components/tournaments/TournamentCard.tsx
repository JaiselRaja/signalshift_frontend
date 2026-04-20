import type { TournamentRead } from "@/types";
import { formatCurrency } from "@/lib/utils";

type Props = {
  tournament: TournamentRead;
  onClick: () => void;
  index?: number;
};

const FORMAT_LABELS: Record<string, string> = {
  league: "League",
  knockout: "Knockout",
  group_knockout: "Group + KO",
  round_robin: "Round Robin",
  swiss: "Swiss",
  custom: "Custom",
};

const STATUS_PALETTE: Record<
  string,
  { bar: string; chip: string; label: string; live?: boolean }
> = {
  in_progress: { bar: "bg-[#b2f746]", chip: "bg-[#b2f746] text-[#121f00]", label: "Live", live: true },
  registration_open: { bar: "bg-amber-400", chip: "bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/40", label: "Registration Open" },
  registration_closed: { bar: "bg-sky-400", chip: "bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30", label: "Upcoming" },
  draft: { bar: "bg-slate-500", chip: "bg-slate-500/15 text-slate-300 ring-1 ring-slate-500/30", label: "Draft" },
  completed: { bar: "bg-slate-600", chip: "bg-white/5 text-white/40 ring-1 ring-white/10", label: "Completed" },
  cancelled: { bar: "bg-rose-500", chip: "bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/30", label: "Cancelled" },
};

function formatRange(start: string, end: string | null): string {
  const s = new Date(start);
  const e = end ? new Date(end) : null;
  const sMonth = s.toLocaleDateString("en-IN", { month: "short" });
  const sDay = s.getDate();
  if (!e) return `${sMonth} ${sDay}`;
  const eMonth = e.toLocaleDateString("en-IN", { month: "short" });
  const eDay = e.getDate();
  if (sMonth === eMonth) return `${sMonth} ${sDay}–${eDay}`;
  return `${sMonth} ${sDay} – ${eMonth} ${eDay}`;
}

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return 0;
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export default function TournamentCard({ tournament, onClick, index = 0 }: Props) {
  const palette = STATUS_PALETTE[tournament.status] ?? STATUS_PALETTE.draft;
  const dateRange = formatRange(tournament.tournament_starts, tournament.tournament_ends);
  const regDays = tournament.status === "registration_open"
    ? daysUntil(tournament.registration_ends)
    : null;

  return (
    <button
      onClick={onClick}
      style={{ ["--i" as string]: index }}
      className="group relative flex w-full overflow-hidden rounded-3xl bg-white/[0.03] text-left ring-1 ring-white/[0.06] transition-all duration-300 hover:-translate-y-0.5 hover:ring-[#b2f746]/40 hover:shadow-[0_20px_50px_-20px_rgba(178,247,70,0.2)]"
    >
      {/* Status bar */}
      <span className={`w-1.5 shrink-0 ${palette.bar}`} aria-hidden />

      <div className="flex flex-1 flex-col gap-4 p-6 md:flex-row md:items-stretch">
        {/* LEFT — identity + meta */}
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          {/* Status chip */}
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ${palette.chip}`}>
              {palette.live && (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-70" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-current" />
                </span>
              )}
              {palette.label}
            </span>
            <span className="text-[10px] font-mono font-medium uppercase tracking-[0.14em] text-white/40">
              #{tournament.id.slice(0, 6)}
            </span>
          </div>

          {/* Name */}
          <h3 className="font-display text-2xl font-black leading-[1.05] tracking-tight text-white md:text-[1.75rem]">
            {tournament.name}
          </h3>

          {/* Metadata row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-white/60">
            <span className="flex items-center gap-1.5 font-medium text-white">
              <Dot /> {tournament.sport_type}
            </span>
            <span className="flex items-center gap-1.5 text-white/50">
              <Dot muted /> {FORMAT_LABELS[tournament.format] ?? tournament.format}
            </span>
            <span className="flex items-center gap-1.5 font-medium text-white">
              <Dot muted /> {dateRange}
            </span>
            {tournament.max_teams != null && (
              <span className="flex items-center gap-1.5 text-white/50">
                <Dot muted /> Max {tournament.max_teams} teams
              </span>
            )}
          </div>

          {/* Registration countdown */}
          {regDays != null && (
            <div className="inline-flex items-center gap-2 self-start rounded-full bg-amber-400/10 px-3 py-1.5 text-[11px] font-semibold text-amber-300 ring-1 ring-amber-400/30">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              {regDays === 0 ? "Registration closes today" : `Registration closes in ${regDays} day${regDays === 1 ? "" : "s"}`}
            </div>
          )}
        </div>

        {/* RIGHT — numeric rail */}
        <div className="flex shrink-0 items-stretch gap-4 md:ml-4 md:border-l md:border-white/10 md:pl-6">
          {/* Entry fee */}
          <div className="flex flex-col justify-between min-w-[96px]">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">Entry</span>
            <span className="font-display text-2xl font-black leading-none text-white md:text-3xl">
              {tournament.entry_fee != null && tournament.entry_fee > 0
                ? formatCurrency(tournament.entry_fee)
                : <span className="text-[#b2f746]">Free</span>}
            </span>
          </div>

          {/* Prize pool (if present) */}
          {tournament.prize_pool &&
            Object.keys(tournament.prize_pool).length > 0 && (
            <PrizePoolRail prizePool={tournament.prize_pool} />
          )}

          {/* Arrow indicator */}
          <span
            aria-hidden
            className="flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-full bg-[#b2f746] text-[#121f00] transition-transform duration-300 group-hover:translate-x-1 group-hover:rotate-[-6deg]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </button>
  );
}

function Dot({ muted = false }: { muted?: boolean }) {
  return (
    <span className={`h-1 w-1 rounded-full ${muted ? "bg-white/30" : "bg-[#b2f746]"}`} />
  );
}

function PrizePoolRail({ prizePool }: { prizePool: Record<string, unknown> }) {
  const values = Object.values(prizePool).filter((v): v is number => typeof v === "number");
  const total = values.reduce((a, b) => a + b, 0);
  if (total === 0) return null;
  return (
    <div className="flex flex-col justify-between">
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">Prize Pool</span>
      <span className="font-display text-2xl font-black leading-none text-[#b2f746] md:text-3xl">
        {formatCurrency(total)}
      </span>
    </div>
  );
}
