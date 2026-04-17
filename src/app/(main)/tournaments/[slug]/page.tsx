"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  getToken, getTournament, getTournamentStandings, getTournamentMatches,
  getMyTeams, registerTeam,
} from "@/lib/api";
import type { MatchRead, TeamRead, TeamStanding, TournamentRead } from "@/types";
import StatusBadge from "@/components/ui/StatusBadge";
import SportTag from "@/components/ui/SportTag";
import StandingsTable from "@/components/tournaments/StandingsTable";
import MatchCard from "@/components/tournaments/MatchCard";
import RegisterTeamModal from "@/components/tournaments/RegisterTeamModal";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { formatDate, formatCurrency } from "@/lib/utils";

type Tab = "info" | "matches" | "standings";

const STANDINGS_FORMATS = new Set(["league", "round_robin", "group_knockout"]);

function TournamentDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tournamentId = searchParams.get("id") ?? "";

  const [tournament, setTournament] = useState<TournamentRead | null>(null);
  const [standings, setStandings] = useState<TeamStanding[] | null>(null);
  const [matches, setMatches] = useState<MatchRead[] | null>(null);
  const [myTeams, setMyTeams] = useState<TeamRead[]>([]);
  const [teamNames, setTeamNames] = useState<Map<string, string>>(new Map());
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  useEffect(() => {
    if (!tournamentId) return;
    const teamsPromise = getToken()
      ? getMyTeams().catch(() => [] as TeamRead[])
      : Promise.resolve([] as TeamRead[]);
    Promise.all([getTournament(tournamentId), teamsPromise])
      .then(([t, teams]) => {
        setTournament(t);
        setMyTeams(teams);
      })
      .catch(() => setError("Failed to load tournament."))
      .finally(() => setLoading(false));
  }, [tournamentId]);

  async function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    if (tab === "standings" && standings === null) {
      setTabLoading(true);
      try {
        const data = await getTournamentStandings(tournamentId);
        setStandings(data);
      } catch {
        setStandings([]);
      } finally {
        setTabLoading(false);
      }
    }
    if (tab === "matches" && matches === null) {
      setTabLoading(true);
      try {
        const data = await getTournamentMatches(tournamentId);
        setMatches(data);
        // Build team name map from match data + tournament registrations
        const map = new Map<string, string>();
        // We'll populate from standings or just leave IDs if no other source
        setTeamNames(map);
      } catch {
        setMatches([]);
      } finally {
        setTabLoading(false);
      }
    }
  }

  // Build teamNames map from standings when available
  useEffect(() => {
    if (!standings) return;
    const map = new Map<string, string>();
    standings.forEach((s) => map.set(s.team_id, s.team_name));
    setTeamNames(map);
  }, [standings]);

  async function handleRegister(teamId: string) {
    await registerTeam(tournamentId, teamId);
    setRegisterSuccess(true);
    setShowRegister(false);
  }

  if (!tournamentId) return <div className="p-8 text-[#707a6a]">Invalid tournament link.</div>;
  if (loading) return <PageLoader />;
  if (!tournament) return <div className="p-8 text-red-700">{error ?? "Tournament not found."}</div>;

  const canRegister = tournament.status === "registration_open";
  const showStandingsTab = STANDINGS_FORMATS.has(tournament.format);

  const tabs: { value: Tab; label: string }[] = [
    { value: "info", label: "Info" },
    { value: "matches", label: "Matches" },
    ...(showStandingsTab ? [{ value: "standings" as Tab, label: "Standings" }] : []),
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1.5 text-xs text-[#707a6a] hover:text-[#191c1d]"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
        Back
      </button>

      {/* Header */}
      <div className="glass-card mb-5 p-5 md:p-6 animate-fade-in">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-[#191c1d]">{tournament.name}</h1>
              <StatusBadge status={tournament.status} size="md" />
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <SportTag sport={tournament.sport_type} />
              <span className="text-xs text-[#707a6a] capitalize">{tournament.format.replace(/_/g, " ")}</span>
            </div>
          </div>
          {canRegister && !registerSuccess && (
            <button
              onClick={() => {
                if (!getToken()) {
                  router.push(`/login?redirect=${encodeURIComponent(`/tournaments/${tournament.slug}?id=${tournament.id}`)}`);
                  return;
                }
                setShowRegister(true);
              }}
              className="shrink-0 bg-[#b2f746] text-[#121f00] rounded-full font-bold shadow-lg shadow-[#004900]/10 hover:scale-[1.02] active:scale-95 transition-all px-5 py-2.5 text-sm"
            >
              Register Team
            </button>
          )}
          {registerSuccess && (
            <span className="shrink-0 rounded-xl bg-emerald-50 border border-emerald-500/20 px-4 py-2.5 text-sm font-medium text-emerald-700">
              Registered ✓
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-xl border border-[#bfcab7]/20 bg-[#f3f4f5] p-1">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? "bg-[#004900]/10 text-[#004900] border border-[#004900]/20"
                : "text-[#707a6a] hover:text-[#404a3b]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabLoading ? (
        <div className="flex justify-center py-12">
          <span className="h-7 w-7 rounded-full border-2 border-[#bfcab7]/20 border-t-[#004900] animate-spin" />
        </div>
      ) : (
        <>
          {/* Info tab */}
          {activeTab === "info" && (
            <div className="glass-card p-5 flex flex-col gap-3 animate-fade-in">
              <div className="flex justify-between text-sm">
                <span className="text-[#404a3b]">Starts</span>
                <span className="text-[#191c1d]">{formatDate(tournament.tournament_starts)}</span>
              </div>
              {tournament.tournament_ends && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#404a3b]">Ends</span>
                  <span className="text-[#191c1d]">{formatDate(tournament.tournament_ends)}</span>
                </div>
              )}
              {tournament.registration_starts && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#404a3b]">Registration opens</span>
                  <span className="text-[#191c1d]">{formatDate(tournament.registration_starts)}</span>
                </div>
              )}
              {tournament.registration_ends && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#404a3b]">Registration closes</span>
                  <span className="text-[#191c1d]">{formatDate(tournament.registration_ends)}</span>
                </div>
              )}
              {tournament.max_teams != null && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#404a3b]">Max teams</span>
                  <span className="text-[#191c1d]">{tournament.max_teams}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-[#404a3b]">Min teams</span>
                <span className="text-[#191c1d]">{tournament.min_teams}</span>
              </div>
              {tournament.entry_fee != null && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#404a3b]">Entry fee</span>
                  <span className="text-[#004900] font-semibold">
                    {tournament.entry_fee === 0 ? "Free" : formatCurrency(tournament.entry_fee)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Matches tab */}
          {activeTab === "matches" && (
            <div className="animate-fade-in">
              {!matches || matches.length === 0 ? (
                <p className="py-8 text-center text-sm text-[#707a6a]">No matches scheduled yet.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {matches.map((m) => (
                    <MatchCard key={m.id} match={m} teamNames={teamNames} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Standings tab */}
          {activeTab === "standings" && (
            <div className="animate-fade-in">
              <StandingsTable standings={standings ?? []} />
            </div>
          )}
        </>
      )}

      {showRegister && (
        <RegisterTeamModal
          tournament={tournament}
          myTeams={myTeams}
          onConfirm={handleRegister}
          onClose={() => setShowRegister(false)}
        />
      )}
    </div>
  );
}

export default function TournamentDetailPage() {
  return <TournamentDetailContent />;
}
