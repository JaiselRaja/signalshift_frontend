import Link from "next/link";
import type { TurfRead } from "@/types";
import SportTag from "@/components/ui/SportTag";

type Props = { turf: TurfRead };

function LocationIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export default function TurfCard({ turf }: Props) {
  const href = `/turfs/${turf.slug}?id=${turf.id}`;

  return (
    <div className={`glass-card flex flex-col overflow-hidden transition-all duration-200 hover:border-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/5 ${!turf.is_active ? "opacity-60" : ""}`}>
      {/* Top color bar */}
      <div className={`h-1 w-full ${turf.is_active ? "bg-gradient-to-r from-indigo-500 to-violet-500" : "bg-slate-700"}`} />

      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] leading-tight">{turf.name}</h3>
            {turf.city && (
              <div className="mt-0.5 flex items-center gap-1 text-xs text-[var(--text-muted)]">
                <LocationIcon />
                {turf.city}
              </div>
            )}
          </div>
          {!turf.is_active && (
            <span className="shrink-0 rounded-full bg-slate-500/10 px-2 py-0.5 text-[10px] font-medium text-slate-400">
              Unavailable
            </span>
          )}
        </div>

        {/* Sport tags */}
        {turf.sport_types.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {turf.sport_types.map((s) => (
              <SportTag key={s} sport={s} size="xs" />
            ))}
          </div>
        )}

        {/* Address */}
        {turf.address && (
          <p className="text-xs text-[var(--text-muted)] line-clamp-1">{turf.address}</p>
        )}

        {/* CTA */}
        <div className="mt-auto pt-1">
          {turf.is_active ? (
            <Link
              href={href}
              className="block w-full rounded-lg bg-indigo-500/10 py-2 text-center text-xs font-semibold text-indigo-400 transition-colors hover:bg-indigo-500/20"
            >
              See Availability →
            </Link>
          ) : (
            <span className="block w-full rounded-lg bg-white/[0.03] py-2 text-center text-xs font-medium text-[var(--text-muted)]">
              Not Available
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
