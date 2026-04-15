import type { TeamStanding } from "@/types";

type Props = {
  standings: TeamStanding[];
};

export default function StandingsTable({ standings }: Props) {
  if (!standings.length) {
    return <p className="text-sm text-[var(--text-muted)] py-4 text-center">No standings available yet.</p>;
  }

  // Group by group_name if present
  const groups = new Map<string, TeamStanding[]>();
  standings.forEach((s) => {
    const key = s.group_name ?? "Standings";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(s);
  });

  return (
    <div className="flex flex-col gap-6">
      {Array.from(groups.entries()).map(([group, rows]) => (
        <div key={group}>
          {groups.size > 1 && (
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{group}</p>
          )}
          <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-[var(--text-muted)] w-6">#</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-[var(--text-muted)]">Team</th>
                  <th className="px-3 py-2.5 text-center text-xs font-medium text-[var(--text-muted)]">P</th>
                  <th className="px-3 py-2.5 text-center text-xs font-medium text-[var(--text-muted)]">W</th>
                  <th className="px-3 py-2.5 text-center text-xs font-medium text-[var(--text-muted)]">D</th>
                  <th className="px-3 py-2.5 text-center text-xs font-medium text-[var(--text-muted)]">L</th>
                  <th className="px-3 py-2.5 text-center text-xs font-medium text-[var(--text-muted)]">GD</th>
                  <th className="px-3 py-2.5 text-center text-xs font-medium text-[var(--text-muted)] font-bold">Pts</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s, i) => (
                  <tr
                    key={s.team_id}
                    className={`border-b border-white/[0.04] last:border-0 ${s.is_qualified ? "bg-emerald-500/5" : ""}`}
                  >
                    <td className="px-3 py-2.5 text-xs text-[var(--text-muted)]">
                      {s.rank ?? i + 1}
                      {s.is_qualified && <span className="ml-1 text-emerald-400">✓</span>}
                    </td>
                    <td className="px-3 py-2.5 font-medium text-[var(--text-primary)] max-w-[140px] truncate">
                      {s.team_name}
                    </td>
                    <td className="px-3 py-2.5 text-center text-[var(--text-secondary)]">{s.played}</td>
                    <td className="px-3 py-2.5 text-center text-emerald-400">{s.wins}</td>
                    <td className="px-3 py-2.5 text-center text-[var(--text-secondary)]">{s.draws}</td>
                    <td className="px-3 py-2.5 text-center text-red-400">{s.losses}</td>
                    <td className="px-3 py-2.5 text-center text-[var(--text-secondary)]">
                      {s.goal_difference > 0 ? `+${s.goal_difference}` : s.goal_difference}
                    </td>
                    <td className="px-3 py-2.5 text-center font-bold text-[var(--text-primary)]">{s.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
