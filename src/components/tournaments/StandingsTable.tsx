import type { TeamStanding } from "@/types";

type Props = {
  standings: TeamStanding[];
};

export default function StandingsTable({ standings }: Props) {
  if (!standings.length) {
    return <p className="text-sm text-[#707a6a] py-4 text-center">No standings available yet.</p>;
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
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#707a6a]">{group}</p>
          )}
          <div className="overflow-x-auto rounded-xl border border-[#bfcab7]/20">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[#bfcab7]/20 bg-[#f3f4f5]">
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-[#707a6a] w-6">#</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-[#707a6a]">Team</th>
                  <th className="px-3 py-2.5 text-center text-xs font-medium text-[#707a6a]">P</th>
                  <th className="px-3 py-2.5 text-center text-xs font-medium text-[#707a6a]">W</th>
                  <th className="px-3 py-2.5 text-center text-xs font-medium text-[#707a6a]">D</th>
                  <th className="px-3 py-2.5 text-center text-xs font-medium text-[#707a6a]">L</th>
                  <th className="px-3 py-2.5 text-center text-xs font-medium text-[#707a6a]">GD</th>
                  <th className="px-3 py-2.5 text-center text-xs font-medium text-[#707a6a] font-bold">Pts</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s, i) => (
                  <tr
                    key={s.team_id}
                    className={`border-b border-[#bfcab7]/10 last:border-0 ${s.is_qualified ? "bg-emerald-500/5" : ""}`}
                  >
                    <td className="px-3 py-2.5 text-xs text-[#707a6a]">
                      {s.rank ?? i + 1}
                      {s.is_qualified && <span className="ml-1 text-emerald-400">✓</span>}
                    </td>
                    <td className="px-3 py-2.5 font-medium text-[#191c1d] max-w-[140px] truncate">
                      {s.team_name}
                    </td>
                    <td className="px-3 py-2.5 text-center text-[#404a3b]">{s.played}</td>
                    <td className="px-3 py-2.5 text-center text-emerald-400">{s.wins}</td>
                    <td className="px-3 py-2.5 text-center text-[#404a3b]">{s.draws}</td>
                    <td className="px-3 py-2.5 text-center text-red-400">{s.losses}</td>
                    <td className="px-3 py-2.5 text-center text-[#404a3b]">
                      {s.goal_difference > 0 ? `+${s.goal_difference}` : s.goal_difference}
                    </td>
                    <td className="px-3 py-2.5 text-center font-bold text-[#191c1d]">{s.points}</td>
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
