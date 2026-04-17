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
      className="glass-card w-full p-4 text-left hover:border-[#004900]/20 transition-all group"
    >
      <div className="flex items-center gap-3">
        {/* Avatar / initials */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#004900]/10 text-[#004900] font-bold text-sm">
          {team.logo_url ? (
            <img src={team.logo_url} alt={team.name} className="h-full w-full rounded-xl object-cover" />
          ) : (
            team.name.slice(0, 2).toUpperCase()
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-[#191c1d] group-hover:text-[#191c1d] transition-colors truncate">
            {team.name}
          </p>
          <div className="mt-0.5 flex items-center gap-2">
            <SportTag sport={team.sport_type} />
            {!team.is_active && (
              <span className="text-[10px] text-[#707a6a]">Inactive</span>
            )}
          </div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="ml-auto shrink-0 text-[#707a6a] group-hover:text-[#004900] transition-colors">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </button>
  );
}
