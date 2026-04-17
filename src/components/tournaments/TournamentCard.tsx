import type { TournamentRead } from "@/types";
import { formatDate, formatCurrency } from "@/lib/utils";
import StatusBadge from "@/components/ui/StatusBadge";
import SportTag from "@/components/ui/SportTag";

type Props = {
  tournament: TournamentRead;
  onClick: () => void;
};

const FORMAT_LABELS: Record<string, string> = {
  league: "League",
  knockout: "Knockout",
  group_knockout: "Group + Knockout",
  round_robin: "Round Robin",
  swiss: "Swiss",
  custom: "Custom",
};

export default function TournamentCard({ tournament, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="glass-card w-full p-5 text-left hover:border-[#004900]/20 transition-all animate-fade-in group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-[#191c1d] group-hover:text-[#191c1d] transition-colors truncate">
              {tournament.name}
            </h3>
            <StatusBadge status={tournament.status} />
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <SportTag sport={tournament.sport_type} />
            <span className="text-xs text-[#707a6a]">
              {FORMAT_LABELS[tournament.format] ?? tournament.format}
            </span>
          </div>
        </div>
        {tournament.entry_fee != null && tournament.entry_fee > 0 && (
          <div className="shrink-0 text-right">
            <p className="text-xs text-[#707a6a]">Entry</p>
            <p className="text-sm font-bold text-[#004900]">{formatCurrency(tournament.entry_fee)}</p>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#404a3b]">
        <span>Starts {formatDate(tournament.tournament_starts)}</span>
        {tournament.tournament_ends && (
          <span>Ends {formatDate(tournament.tournament_ends)}</span>
        )}
        {tournament.max_teams != null && (
          <span>{tournament.max_teams} teams max</span>
        )}
      </div>

      {tournament.registration_ends && tournament.status === "registration_open" && (
        <p className="mt-2 text-[10px] text-amber-400">
          Registration closes {formatDate(tournament.registration_ends)}
        </p>
      )}
    </button>
  );
}
