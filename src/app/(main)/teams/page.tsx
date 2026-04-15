"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyTeams } from "@/lib/api";
import type { TeamRead } from "@/types";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import TeamCard from "@/components/teams/TeamCard";
import CreateTeamForm from "@/components/teams/CreateTeamForm";
import { PageLoader } from "@/components/ui/LoadingSpinner";

function TeamsContent() {
  const router = useRouter();
  const [myTeams, setMyTeams] = useState<TeamRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    getMyTeams()
      .then(setMyTeams)
      .catch(() => setError("Failed to load teams."))
      .finally(() => setLoading(false));
  }, []);

  function handleCreated(team: TeamRead) {
    setMyTeams((prev) => [team, ...prev]);
    setShowCreate(false);
  }

  if (loading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">My Teams</h1>
        {!showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 text-sm font-medium text-indigo-400 hover:bg-indigo-500/20 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Team
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      {showCreate && (
        <div className="mb-5">
          <CreateTeamForm onCreated={handleCreated} onCancel={() => setShowCreate(false)} />
        </div>
      )}

      {myTeams.length === 0 && !showCreate ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-[var(--text-muted)]">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <p className="text-sm text-[var(--text-muted)]">You haven't joined any teams yet.</p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-3 text-sm text-indigo-400 hover:text-indigo-300"
          >
            Create your first team →
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {myTeams.map((team) => (
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
  return (
    <ProtectedRoute>
      <TeamsContent />
    </ProtectedRoute>
  );
}
