import type { MatchRead } from "@/types";
import StatusBadge from "@/components/ui/StatusBadge";

type Props = {
  match: MatchRead;
  teamNames: Map<string, string>;
};

export default function MatchCard({ match, teamNames }: Props) {
  const homeName = match.home_team_id ? (teamNames.get(match.home_team_id) ?? "TBD") : "TBD";
  const awayName = match.away_team_id ? (teamNames.get(match.away_team_id) ?? "TBD") : "TBD";
  const hasScore = match.home_score != null && match.away_score != null;

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#707a6a]">
            {match.round_name}
            {match.group_name && ` · ${match.group_name}`}
            {match.match_number != null && ` #${match.match_number}`}
          </span>
        </div>
        <StatusBadge status={match.status} />
      </div>

      <div className="flex items-center gap-3">
        {/* Home team */}
        <div className="flex-1 min-w-0">
          <p className={`font-semibold truncate text-sm ${match.winner_team_id === match.home_team_id ? "text-emerald-400" : "text-[#191c1d]"}`}>
            {homeName}
          </p>
        </div>

        {/* Score / vs */}
        <div className="shrink-0 text-center">
          {hasScore ? (
            <p className="font-mono font-bold text-base text-[#191c1d]">
              {match.home_score} – {match.away_score}
            </p>
          ) : (
            <p className="text-xs text-[#707a6a] font-mono">
              {match.scheduled_at
                ? new Date(match.scheduled_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
                : "VS"}
            </p>
          )}
          {match.is_draw && hasScore && (
            <p className="text-[9px] text-amber-400">Draw</p>
          )}
        </div>

        {/* Away team */}
        <div className="flex-1 min-w-0 text-right">
          <p className={`font-semibold truncate text-sm ${match.winner_team_id === match.away_team_id ? "text-emerald-400" : "text-[#191c1d]"}`}>
            {awayName}
          </p>
        </div>
      </div>

      {match.scheduled_at && (
        <p className="mt-2 text-[10px] text-[#707a6a] text-center">
          {new Date(match.scheduled_at).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
        </p>
      )}
    </div>
  );
}
