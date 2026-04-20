"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { listTournaments } from "@/lib/api";
import type { TournamentRead, TournamentStatus } from "@/types";
import TournamentCard from "@/components/tournaments/TournamentCard";

type FilterTab = "all" | TournamentStatus;

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "in_progress", label: "Live" },
  { value: "registration_open", label: "Open" },
  { value: "registration_closed", label: "Upcoming" },
  { value: "completed", label: "Completed" },
];

function Skeleton() {
  return (
    <div className="rounded-3xl bg-white ring-1 ring-black/[0.04]">
      <div className="flex gap-5 p-6">
        <div className="skeleton h-20 w-1.5 rounded-full" />
        <div className="flex-1 space-y-3">
          <div className="skeleton h-4 w-28 rounded-full" />
          <div className="skeleton h-6 w-2/3" />
          <div className="skeleton h-3 w-1/2" />
        </div>
        <div className="skeleton h-12 w-24 rounded-lg" />
      </div>
    </div>
  );
}

function TournamentsContent() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState<TournamentRead[]>([]);
  const [allCache, setAllCache] = useState<TournamentRead[] | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listTournaments()
      .then((data) => {
        setAllCache(data);
        setTournaments(data);
      })
      .catch(() => setError("Failed to load tournaments."))
      .finally(() => setLoading(false));
  }, []);

  function handleTabChange(tab: FilterTab) {
    setActiveTab(tab);
    if (!allCache) return;
    if (tab === "all") setTournaments(allCache);
    else setTournaments(allCache.filter((t) => t.status === tab));
  }

  function handleOpen(t: TournamentRead) {
    router.push(`/tournaments/${t.slug}?id=${t.id}`);
  }

  const stats = useMemo(() => {
    if (!allCache) return { live: 0, open: 0, upcoming: 0, totalPrize: 0 };
    let live = 0, open = 0, upcoming = 0, totalPrize = 0;
    for (const t of allCache) {
      if (t.status === "in_progress") live++;
      if (t.status === "registration_open") open++;
      if (t.status === "registration_closed") upcoming++;
      const values = Object.values(t.prize_pool ?? {}).filter(
        (v): v is number => typeof v === "number"
      );
      totalPrize += values.reduce((a, b) => a + b, 0);
    }
    return { live, open, upcoming, totalPrize };
  }, [allCache]);

  return (
    <div>
      {/* ─── Hero ─────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-white/[0.06] bg-[#111211]">
        <div className="grain-overlay pointer-events-none absolute inset-0" />

        {/* Decorative diagonal accent */}
        <div
          aria-hidden
          className="absolute -right-20 top-12 hidden h-72 w-[60%] rotate-[-8deg] bg-gradient-to-r from-transparent via-[#b2f746]/10 to-[#b2f746]/20 blur-2xl md:block"
        />

        <div className="relative mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
          <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.3em] text-[#b2f746]">
            · The Bracket · Play to Win ·
          </p>
          <h1 className="font-display text-5xl font-black leading-[0.95] tracking-tight text-white md:text-7xl">
            The <span className="italic text-[#b2f746]">season</span>
            <br />
            is always on.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-white/70 md:text-base">
            Leagues, knockouts, friendlies. Register your team, climb the table,
            and take the trophy. Fixtures get live.
          </p>

          {/* Stat strip */}
          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatTile label="Live now" value={stats.live} accent={stats.live > 0} />
            <StatTile label="Open to register" value={stats.open} />
            <StatTile label="Upcoming" value={stats.upcoming} />
            <StatTile
              label="Prize pool"
              value={stats.totalPrize > 0 ? `₹${Math.round(stats.totalPrize / 1000)}k` : "—"}
              isString
            />
          </div>
        </div>
      </section>

      {/* ─── Filter tabs ─────────────────────────── */}
      <section className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0a0b0c]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="-mx-4 flex gap-1 overflow-x-auto px-4 py-4 no-scrollbar md:mx-0 md:px-0">
            {FILTER_TABS.map((tab) => {
              const count = allCache
                ? tab.value === "all"
                  ? allCache.length
                  : allCache.filter((t) => t.status === tab.value).length
                : null;
              return (
                <button
                  key={tab.value}
                  onClick={() => handleTabChange(tab.value)}
                  className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-[12px] font-semibold uppercase tracking-wider transition-all ${
                    activeTab === tab.value
                      ? "border-[#b2f746] bg-[#b2f746] text-[#121f00]"
                      : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {tab.label}
                  {count != null && count > 0 && (
                    <span className={`ml-1.5 ${activeTab === tab.value ? "text-[#121f00]/60" : "text-white/40"}`}>
                      · {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── List ─────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : tournaments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] py-20 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#b2f746]/10 text-[#b2f746]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
            </div>
            <h3 className="font-display text-xl font-bold text-white">
              No tournaments {activeTab === "all" ? "yet" : `in "${FILTER_TABS.find((t) => t.value === activeTab)?.label}"`}
            </h3>
            <p className="mt-1 max-w-xs text-sm text-white/60">
              {activeTab === "all"
                ? "The first fixture drops soon — stay tuned."
                : "Try a different status filter."}
            </p>
          </div>
        ) : (
          <div className="stagger flex flex-col gap-4">
            {tournaments.map((t, i) => (
              <TournamentCard key={t.id} tournament={t} index={i} onClick={() => handleOpen(t)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatTile({
  label,
  value,
  accent = false,
  isString = false,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
  isString?: boolean;
}) {
  return (
    <div className={`rounded-2xl border px-4 py-4 transition-colors ${accent ? "border-[#b2f746]/50 bg-[#b2f746]/10" : "border-white/10 bg-white/[0.03]"}`}>
      <p className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${accent ? "text-[#b2f746]" : "text-white/50"}`}>
        {label}
      </p>
      <p className={`mt-1 font-display text-3xl font-black leading-none tracking-tight md:text-4xl ${accent ? "text-[#b2f746]" : "text-white"}`}>
        {isString ? value : value}
        {!isString && accent && (
          <span className="ml-1 inline-block animate-pulse text-xs">●</span>
        )}
      </p>
    </div>
  );
}

export default function TournamentsPage() {
  return <TournamentsContent />;
}
