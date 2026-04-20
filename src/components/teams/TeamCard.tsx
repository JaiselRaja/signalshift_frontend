import type { TeamRead } from "@/types";

type Props = {
  team: TeamRead;
  onClick: () => void;
  index?: number;
};

const SPORT_COLOR: Record<string, { from: string; to: string; text: string }> = {
  football: { from: "#0d7b3a", to: "#0a5d2c", text: "#ffffff" },
  cricket: { from: "#b45a1b", to: "#8a4312", text: "#ffffff" },
  basketball: { from: "#e8691c", to: "#b54e14", text: "#ffffff" },
  tennis: { from: "#2d5f8a", to: "#1e4263", text: "#ffffff" },
  badminton: { from: "#8b4a9c", to: "#653576", text: "#ffffff" },
};

function sportColor(sport: string) {
  return SPORT_COLOR[sport.toLowerCase()] ?? { from: "#004900", to: "#002200", text: "#b2f746" };
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "??";
}

export default function TeamCard({ team, onClick, index = 0 }: Props) {
  const color = sportColor(team.sport_type);

  return (
    <button
      onClick={onClick}
      style={{ ["--i" as string]: index }}
      className="group relative flex w-full flex-col gap-4 overflow-hidden rounded-3xl bg-white/[0.03] p-5 text-left ring-1 ring-white/[0.06] transition-all duration-300 hover:-translate-y-1 hover:ring-[#b2f746]/40 hover:shadow-[0_20px_50px_-20px_rgba(178,247,70,0.2)]"
    >
      {/* Decorative corner slash in sport color */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rotate-[30deg] opacity-[0.08] blur-2xl transition-opacity duration-300 group-hover:opacity-[0.18]"
        style={{ background: `linear-gradient(135deg, ${color.from}, ${color.to})` }}
      />

      <div className="flex items-start gap-4">
        {/* Crest */}
        <div
          className="grain-overlay relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl font-display text-xl font-black tracking-tight transition-transform duration-300 group-hover:scale-[1.04]"
          style={{
            background: `linear-gradient(135deg, ${color.from} 0%, ${color.to} 100%)`,
            color: color.text,
          }}
        >
          {team.logo_url ? (
            <img src={team.logo_url} alt={team.name} className="h-full w-full object-cover" />
          ) : (
            <span>{initials(team.name)}</span>
          )}
          {/* Chevron notch */}
          <span
            aria-hidden
            className="absolute bottom-0 left-0 right-0 h-2"
            style={{ background: color.to, clipPath: "polygon(0 100%, 50% 0, 100% 100%)" }}
          />
        </div>

        {/* Identity */}
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-bold leading-tight text-white">
            {team.name}
          </h3>
          <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">
            {team.sport_type}
            {!team.is_active && <span className="ml-2 text-rose-400">· Inactive</span>}
          </p>
        </div>
      </div>

      {/* Footer — captain badge + arrow */}
      <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
        <span className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.1em] text-white/50">
          {team.captain_id ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
              Captain set
            </>
          ) : (
            <>No captain yet</>
          )}
        </span>
        <span
          aria-hidden
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#b2f746] text-[#121f00] transition-transform duration-300 group-hover:translate-x-1 group-hover:rotate-[-6deg]"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </button>
  );
}
