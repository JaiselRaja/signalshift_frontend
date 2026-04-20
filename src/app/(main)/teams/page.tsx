"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, listTeams } from "@/lib/api";
import type { TeamRead } from "@/types";
import TeamCard from "@/components/teams/TeamCard";
import CreateTeamForm from "@/components/teams/CreateTeamForm";

function TeamSkeleton() {
  return (
    <div className="flex gap-4 rounded-3xl bg-white p-5 ring-1 ring-black/[0.04]">
      <div className="skeleton h-16 w-16 shrink-0 rounded-2xl" />
      <div className="flex flex-1 flex-col gap-3">
        <div className="skeleton h-4 w-1/2" />
        <div className="skeleton h-3 w-1/3" />
        <div className="skeleton mt-auto h-6 w-full" />
      </div>
    </div>
  );
}

function TeamsContent() {
  const router = useRouter();
  const [teams, setTeams] = useState<TeamRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [sportFilter, setSportFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    listTeams()
      .then(setTeams)
      .catch(() => setError("Failed to load teams."))
      .finally(() => setLoading(false));
  }, []);

  function handleCreate() {
    if (!getToken()) {
      router.push(`/login?redirect=${encodeURIComponent("/teams")}`);
      return;
    }
    setShowCreate(true);
    setTimeout(() => {
      document.getElementById("create-team-anchor")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  function handleCreated(team: TeamRead) {
    setTeams((prev) => [team, ...prev]);
    setShowCreate(false);
  }

  const sports = useMemo(
    () => [...new Set(teams.map((t) => t.sport_type.toLowerCase()))].sort(),
    [teams]
  );

  const filtered = useMemo(() => {
    return teams.filter((t) => {
      if (sportFilter && t.sport_type.toLowerCase() !== sportFilter) return false;
      if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [teams, sportFilter, search]);

  const sportBreakdown = useMemo(() => {
    const m = new Map<string, number>();
    teams.forEach((t) => {
      const k = t.sport_type;
      m.set(k, (m.get(k) ?? 0) + 1);
    });
    return [...m.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [teams]);

  return (
    <div>
      {/* ─── Hero ─────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-white/[0.06] bg-[#111211]">
        <div className="grain-overlay pointer-events-none absolute inset-0" />

        {/* Decorative lime cluster */}
        <div
          aria-hidden
          className="absolute -left-20 top-1/2 hidden h-56 w-56 -translate-y-1/2 rounded-full bg-[#b2f746]/20 blur-3xl md:block"
        />

        <div className="relative mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
          <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.3em] text-[#b2f746]">
            · The Squads · Built for Battle ·
          </p>
          <h1 className="font-display text-5xl font-black leading-[0.95] tracking-tight text-white md:text-7xl">
            Roll with your
            <br />
            <span className="italic text-[#b2f746]">crew.</span>
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-white/70 md:text-base">
            Make a team, pick a captain, bring the chaos. Win together, lose
            together — and book slots faster with your squad saved.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={handleCreate}
              className="shine relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-[#b2f746] px-5 py-2.5 text-sm font-bold text-[#121f00] shadow-lg shadow-[#b2f746]/20 transition-transform hover:scale-[1.03]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Start a team
            </button>

            {/* Mini sport breakdown tags */}
            {sportBreakdown.length > 0 && (
              <div className="flex items-center gap-2 text-[11px] text-white/60">
                <span className="font-mono uppercase tracking-[0.14em]">·</span>
                {sportBreakdown.map(([sport, count], i) => (
                  <span key={sport} className="flex items-center gap-1">
                    <span className="font-bold text-white">{count}</span>
                    <span className="font-mono uppercase tracking-wider">{sport}</span>
                    {i < sportBreakdown.length - 1 && <span className="text-white/20">·</span>}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Filters ─────────────────────────────── */}
      <section className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0a0b0c]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="flex flex-col gap-3 py-4 md:flex-row md:items-center">
            <div className="relative flex-1 md:max-w-sm">
              <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search teams…"
                className="w-full rounded-full border border-white/10 bg-white/[0.03] px-10 py-2.5 text-sm text-white placeholder-white/40 outline-none transition-colors focus:border-[#b2f746]/50 focus:ring-2 focus:ring-[#b2f746]/15"
              />
            </div>
            <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 no-scrollbar md:mx-0 md:px-0">
              <FilterPill active={!sportFilter} onClick={() => setSportFilter(null)} label="All" />
              {sports.map((s) => (
                <FilterPill
                  key={s}
                  active={sportFilter === s}
                  onClick={() => setSportFilter(sportFilter === s ? null : s)}
                  label={s}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Content ─────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>
        )}

        {/* Create-team form (in-page) */}
        {showCreate && (
          <div id="create-team-anchor" className="mb-8">
            <CreateTeamForm onCreated={handleCreated} onCancel={() => setShowCreate(false)} />
          </div>
        )}

        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-white md:text-3xl">
              Directory
            </h2>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-white/50">
              {loading ? "…" : `${filtered.length} of ${teams.length} teams`}
            </p>
          </div>
          {(search || sportFilter) && (
            <button
              onClick={() => { setSearch(""); setSportFilter(null); }}
              className="text-xs font-semibold uppercase tracking-wider text-[#b2f746] underline-offset-4 hover:underline"
            >
              Reset →
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <TeamSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] py-20 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#b2f746]/10 text-[#b2f746]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3 className="font-display text-xl font-bold text-white">
              {teams.length === 0 ? "Be the first crew" : "No matches"}
            </h3>
            <p className="mt-1 max-w-xs text-sm text-white/60">
              {teams.length === 0
                ? "No teams yet — start one and others will follow."
                : "Try a different search or clear your filters."}
            </p>
            {teams.length === 0 && (
              <button
                onClick={handleCreate}
                className="mt-5 rounded-full bg-[#b2f746] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-[#121f00] hover:bg-white"
              >
                Start a team
              </button>
            )}
          </div>
        ) : (
          <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t, i) => (
              <TeamCard
                key={t.id}
                team={t}
                index={i}
                onClick={() => router.push(`/teams/${t.slug}?id=${t.id}`)}
              />
            ))}
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
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-[12px] font-semibold uppercase tracking-wider transition-all ${
        active
          ? "border-[#b2f746] bg-[#b2f746] text-[#121f00]"
          : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

export default function TeamsPage() {
  return <TeamsContent />;
}
