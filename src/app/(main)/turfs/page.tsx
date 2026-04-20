"use client";

import { useEffect, useMemo, useState } from "react";
import { listTurfs } from "@/lib/api";
import type { TurfRead } from "@/types";
import TurfCard from "@/components/turfs/TurfCard";

function TurfSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-black/[0.04]">
      <div className="skeleton aspect-[5/3]" />
      <div className="flex flex-col gap-3 p-5">
        <div className="flex gap-1.5">
          <div className="skeleton h-5 w-16 rounded-full" />
          <div className="skeleton h-5 w-16 rounded-full" />
        </div>
        <div className="skeleton h-3 w-2/3" />
        <div className="flex items-center justify-between pt-1">
          <div className="skeleton h-3 w-20" />
          <div className="skeleton h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function TurfsContent() {
  const [turfs, setTurfs] = useState<TurfRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cityFilter, setCityFilter] = useState<string | null>(null);
  const [sportFilter, setSportFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    listTurfs()
      .then(setTurfs)
      .catch((err: unknown) => {
        const isOffline =
          err instanceof TypeError ||
          (err instanceof Error && err.message.toLowerCase().includes("fetch"));
        setError(isOffline ? "offline" : "error");
      })
      .finally(() => setLoading(false));
  }, []);

  const cities = useMemo(
    () => [...new Set(turfs.map((t) => t.city).filter(Boolean) as string[])].sort(),
    [turfs]
  );

  const sports = useMemo(() => {
    const set = new Set<string>();
    turfs.forEach((t) => t.sport_types.forEach((s) => set.add(s.toLowerCase())));
    return [...set].sort();
  }, [turfs]);

  const filtered = useMemo(() => {
    return turfs.filter((t) => {
      if (cityFilter && t.city !== cityFilter) return false;
      if (sportFilter && !t.sport_types.map((s) => s.toLowerCase()).includes(sportFilter)) return false;
      if (searchQuery && !t.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [turfs, cityFilter, sportFilter, searchQuery]);

  const hasFilters = cityFilter || sportFilter || searchQuery;

  return (
    <div>
      {/* ─── Editorial hero strip ───────────────────────── */}
      <section className="relative overflow-hidden border-b border-white/[0.06] bg-[#111211]">
        <div className="grain-overlay pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-20">
          <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-[#b2f746] md:mb-3 md:text-[11px]">
            · The Arena · Live &amp; Ready ·
          </p>
          <h1 className="font-display text-4xl font-black leading-[0.95] tracking-tight text-white md:text-7xl">
            Find your
            <br />
            <span className="italic text-[#b2f746]">ground.</span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70 md:mt-5 md:text-base">
            Premium turfs across the city — pick a slot, grab your crew, show up
            and play.
          </p>

          {/* Live stat line */}
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12px] text-white/80 md:mt-8 md:gap-x-8 md:text-[13px]">
            <span className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-[#b2f746]/60" />
                <span className="relative h-2 w-2 rounded-full bg-[#b2f746]" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-wider md:text-xs">
                {loading ? "Syncing" : `${turfs.filter((t) => t.is_active).length} live`}
              </span>
            </span>
            {cities.length > 0 && (
              <span className="font-mono text-[11px] uppercase tracking-wider md:text-xs">
                <span className="text-white/50">Across</span> {cities.length} {cities.length === 1 ? "city" : "cities"}
              </span>
            )}
            {sports.length > 0 && (
              <span className="font-mono text-[11px] uppercase tracking-wider md:text-xs">
                <span className="text-white/50">{sports.length}</span> sports
              </span>
            )}
          </div>
        </div>

        {/* Ticker tape — desktop only; avoids the mid-word cutoff on phones */}
        {!loading && turfs.length > 0 && (
          <div className="relative hidden overflow-hidden border-t border-white/10 bg-black/40 py-3 md:block">
            <div className="ticker">
              {[...Array(2)].flatMap((_, i) =>
                turfs.slice(0, 8).map((t, j) => (
                  <span key={`${i}-${j}`} className="flex items-center gap-3 whitespace-nowrap font-display text-sm font-bold uppercase tracking-wider text-white/50">
                    <span className="text-[#b2f746]">◆</span>
                    {t.name}
                    {t.city && <span className="text-white/30">/ {t.city}</span>}
                  </span>
                ))
              )}
            </div>
          </div>
        )}
      </section>

      {/* ─── Filters bar ───────────────────────── */}
      <section className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0a0b0c]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-3 md:px-6 md:py-4">
          {/* Search + city dropdown (one row on all sizes) */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search turfs…"
                className="w-full rounded-full border border-white/10 bg-white/[0.03] px-10 py-2.5 text-sm text-white placeholder-white/40 outline-none transition-colors focus:border-[#b2f746]/50 focus:ring-2 focus:ring-[#b2f746]/15"
              />
            </div>

            {cities.length > 0 && (
              <div className="relative">
                <select
                  value={cityFilter ?? ""}
                  onChange={(e) => setCityFilter(e.target.value || null)}
                  className="appearance-none rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 pr-8 text-xs font-semibold uppercase tracking-wider text-white outline-none transition-colors focus:border-[#b2f746]/50 focus:ring-2 focus:ring-[#b2f746]/15"
                >
                  <option value="" className="bg-[#0a0b0c]">All cities</option>
                  {cities.map((c) => (
                    <option key={c} value={c} className="bg-[#0a0b0c]">{c}</option>
                  ))}
                </select>
                <svg className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            )}
          </div>

          {/* Sport pills — horizontal scroll */}
          {sports.length > 0 && (
            <div className="-mx-4 mt-3 flex gap-1.5 overflow-x-auto px-4 no-scrollbar md:mx-0 md:px-0">
              <FilterPill
                active={!sportFilter}
                onClick={() => setSportFilter(null)}
                label="All sports"
              />
              {sports.map((s) => (
                <FilterPill
                  key={s}
                  active={sportFilter === s}
                  onClick={() => setSportFilter(sportFilter === s ? null : s)}
                  label={s}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── Grid ───────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
        {/* Result count + clear */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-white md:text-3xl">
              {hasFilters ? "Filtered results" : "Featured grounds"}
            </h2>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-white/50">
              {loading ? "…" : `${filtered.length} showing`}
              {hasFilters && ` of ${turfs.length}`}
            </p>
          </div>
          {hasFilters && (
            <button
              onClick={() => { setCityFilter(null); setSportFilter(null); setSearchQuery(""); }}
              className="text-xs font-semibold uppercase tracking-wider text-[#b2f746] underline-offset-4 hover:underline"
            >
              Reset →
            </button>
          )}
        </div>

        {/* Error */}
        {error === "offline" && (
          <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-50 px-5 py-4">
            <p className="font-display text-base font-bold text-amber-900">Backend offline</p>
            <p className="mt-1 text-xs text-amber-800">
              Start the API to see live turfs.
            </p>
          </div>
        )}
        {error === "error" && (
          <div className="mb-6 rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700">
            Couldn&rsquo;t load turfs. Try again.
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <TurfSkeleton key={i} />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="stagger grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((turf, i) => (
              <TurfCard key={turf.id} turf={turf} index={i} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] py-20 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#b2f746]/10 text-[#b2f746]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
            <h3 className="font-display text-xl font-bold text-white">
              {turfs.length === 0 ? "No turfs yet" : "No matches"}
            </h3>
            <p className="mt-1 max-w-xs text-sm text-white/60">
              {turfs.length === 0 ? "Turfs are being added — check back soon." : "Try a different search or clear your filters."}
            </p>
            {hasFilters && (
              <button
                onClick={() => { setCityFilter(null); setSportFilter(null); setSearchQuery(""); }}
                className="mt-5 rounded-full bg-[#b2f746] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-[#121f00] hover:bg-white"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
  small = false,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-full border font-semibold uppercase tracking-wider transition-all ${
        small ? "px-3 py-1 text-[11px]" : "px-4 py-1.5 text-[12px]"
      } ${
        active
          ? "border-[#b2f746] bg-[#b2f746] text-[#121f00] shadow-sm"
          : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

export default function TurfsPage() {
  return <TurfsContent />;
}
