import Link from "next/link";
import type { TurfRead } from "@/types";

type Props = { turf: TurfRead; index?: number };

const SPORT_BG: Record<string, string> = {
  football: "sport-bg-football",
  cricket: "sport-bg-cricket",
  basketball: "sport-bg-basketball",
  tennis: "sport-bg-tennis",
  badminton: "sport-bg-badminton",
};

function pickSportBg(sports: string[]): string {
  for (const s of sports) {
    const key = s.toLowerCase().trim();
    if (SPORT_BG[key]) return SPORT_BG[key];
  }
  return "sport-bg-default";
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export default function TurfCard({ turf, index = 0 }: Props) {
  const href = `/turfs/${turf.slug}?id=${turf.id}`;
  const bgClass = pickSportBg(turf.sport_types);
  const inactive = !turf.is_active;

  const card = (
    <article
      style={{ ["--i" as string]: index }}
      className={`group relative flex flex-col overflow-hidden rounded-3xl bg-white/[0.03] ring-1 ring-white/[0.06] transition-all duration-300 hover:-translate-y-1 hover:ring-[#b2f746]/40 hover:shadow-[0_24px_60px_-24px_rgba(178,247,70,0.25)] ${inactive ? "opacity-60" : ""}`}
    >
      {/* Visual top half */}
      <div className={`relative aspect-[5/3] overflow-hidden ${bgClass} grain-overlay`}>
        {/* Oversized initials watermark */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-4 -top-2 select-none font-display text-[180px] font-black leading-none tracking-tighter text-white/10 transition-transform duration-500 group-hover:scale-110"
        >
          {initials(turf.name)}
        </span>

        {/* Status chip */}
        <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-black/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
          <span className={`h-1.5 w-1.5 rounded-full ${inactive ? "bg-rose-400" : "bg-[#b2f746] shadow-[0_0_8px_#b2f746]"}`} />
          {inactive ? "Closed" : "Open for booking"}
        </div>

        {/* Bottom gradient fade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Name + city over gradient */}
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h3 className="font-display text-2xl font-bold leading-tight text-white md:text-[1.65rem]">
            {turf.name}
          </h3>
          {turf.city && (
            <p className="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-white/80">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              {turf.city}
            </p>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        {turf.sport_types.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {turf.sport_types.map((s) => (
              <span
                key={s}
                className="rounded-full border border-[#b2f746]/30 bg-[#b2f746]/[0.08] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#b2f746]"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {turf.address && (
          <p className="text-xs leading-relaxed text-white/50 line-clamp-2">{turf.address}</p>
        )}

        {/* Arrow CTA — reveals on hover */}
        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white">
            {inactive ? "Not available" : "Book slot"}
          </span>
          <span
            aria-hidden
            className={`flex h-10 w-10 items-center justify-center rounded-full bg-[#b2f746] text-[#121f00] shadow-sm transition-transform duration-300 ${inactive ? "opacity-40" : "group-hover:translate-x-1 group-hover:rotate-[-6deg]"}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </article>
  );

  return inactive ? card : <Link href={href} className="block">{card}</Link>;
}
