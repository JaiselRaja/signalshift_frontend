"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, listTeams } from "@/lib/api";
import type { TeamRead } from "@/types";
import TeamCard from "@/components/teams/TeamCard";
import CreateTeamForm from "@/components/teams/CreateTeamForm";
import { PageLoader } from "@/components/ui/LoadingSpinner";

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
  }

  function handleCreated(team: TeamRead) {
    setTeams((prev) => [team, ...prev]);
    setShowCreate(false);
  }

  const sports = [...new Set(teams.map((t) => t.sport_type))].sort();

  const filtered = teams.filter((t) => {
    if (sportFilter && t.sport_type !== sportFilter) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#191c1d] md:text-3xl font-[family-name:var(--font-headline)]">
            Teams
          </h1>
          <p className="mt-1 text-sm text-[#707a6a]">
            {teams.length} team{teams.length !== 1 ? "s" : ""} playing at Signal Shift
          </p>
        </div>
        {!showCreate && (
          <button
            onClick={handleCreate}
            className="flex items-center gap-1.5 rounded-full bg-[#b2f746] px-5 py-2.5 text-sm font-bold text-[#121f00] shadow-lg shadow-[#004900]/10 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Team
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {showCreate && (
        <div className="mb-6">
          <CreateTeamForm onCreated={handleCreated} onCancel={() => setShowCreate(false)} />
        </div>
      )}

      {/* Filters */}
      {teams.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <input
            type="search"
            placeholder="Search teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] rounded-full border border-[#bfcab7]/40 bg-white px-4 py-2 text-sm text-[#191c1d] placeholder-[#707a6a] focus:outline-none focus:ring-2 focus:ring-[#004900]/10"
          />
          <button
            onClick={() => setSportFilter(null)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              !sportFilter
                ? "border-[#004900]/40 bg-[#004900]/10 text-[#004900]"
                : "border-[#bfcab7]/30 text-[#707a6a] hover:border-[#bfcab7]/60"
            }`}
          >
            All sports
          </button>
          {sports.map((sport) => (
            <button
              key={sport}
              onClick={() => setSportFilter(sport)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                sportFilter === sport
                  ? "border-[#004900]/40 bg-[#004900]/10 text-[#004900]"
                  : "border-[#bfcab7]/30 text-[#707a6a] hover:border-[#bfcab7]/60"
              }`}
            >
              {sport}
            </button>
          ))}
        </div>
      )}

      {/* Teams grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#bfcab7]/10">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-[#707a6a]">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <p className="text-sm text-[#707a6a]">
            {teams.length === 0 ? "No teams yet — be the first!" : "No teams match your filters."}
          </p>
          {teams.length === 0 && (
            <button
              onClick={handleCreate}
              className="mt-3 text-sm font-semibold text-[#004900] hover:text-[#006400]"
            >
              Create the first team →
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
          {filtered.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              onClick={() => router.push(`/teams/${team.slug}?id=${team.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TeamsPage() {
  return <TeamsContent />;
}
