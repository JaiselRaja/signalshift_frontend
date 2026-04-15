import type { TeamRead } from "@/types";
import SportTag from "@/components/ui/SportTag";

type Props = {
  team: TeamRead;
  onClick: () => void;
};

export default function TeamCard({ team, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="glass-card w-full p-4 text-left hover:border-indigo-500/30 transition-all group"
    >
      <div className="flex items-center gap-3">
        {/* Avatar / initials */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300 font-bold text-sm">
          {team.logo_url ? (
            <img src={team.logo_url} alt={team.name} className="h-full w-full rounded-xl object-cover" />
          ) : (
            team.name.slice(0, 2).toUpperCase()
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-[var(--text-primary)] group-hover:text-white transition-colors truncate">
            {team.name}
          </p>
          <div className="mt-0.5 flex items-center gap-2">
            <SportTag sport={team.sport_type} />
            {!team.is_active && (
              <span className="text-[10px] text-[var(--text-muted)]">Inactive</span>
            )}
          </div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="ml-auto shrink-0 text-[var(--text-muted)] group-hover:text-indigo-400 transition-colors">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </button>
  );
}
