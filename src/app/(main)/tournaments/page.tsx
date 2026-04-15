"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listTournaments } from "@/lib/api";
import type { TournamentRead, TournamentStatus } from "@/types";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import TournamentCard from "@/components/tournaments/TournamentCard";
import { PageLoader } from "@/components/ui/LoadingSpinner";

type FilterTab = "all" | TournamentStatus;

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "registration_open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "registration_closed", label: "Upcoming" },
  { value: "completed", label: "Completed" },
];

function TournamentsContent() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState<TournamentRead[]>([]);
  const [cache, setCache] = useState<Partial<Record<FilterTab, TournamentRead[]>>>({});
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchTab(tab: FilterTab) {
    if (cache[tab]) {
      setTournaments(cache[tab]!);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await listTournaments(tab === "all" ? undefined : tab);
      setCache((prev) => ({ ...prev, [tab]: data }));
      setTournaments(data);
    } catch {
      setError("Failed to load tournaments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTab("all");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleTabChange(tab: FilterTab) {
    setActiveTab(tab);
    fetchTab(tab);
  }

  function handleOpen(t: TournamentRead) {
    router.push(`/tournaments/${t.slug}?id=${t.id}`);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <h1 className="mb-6 text-xl font-bold text-[var(--text-primary)]">Tournaments</h1>

      {/* Filter tabs */}
      <div className="mb-5 flex gap-1 overflow-x-auto pb-1">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === tab.value
                ? "border-indigo-500/50 bg-indigo-500/15 text-indigo-300"
                : "border-white/[0.06] text-[var(--text-muted)] hover:border-white/20 hover:text-[var(--text-secondary)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      {loading ? (
        <PageLoader />
      ) : tournaments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-[var(--text-muted)]">
              <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4" />
              <path d="M19 7V4H8" />
            </svg>
          </div>
          <p className="text-sm text-[var(--text-muted)]">No tournaments found.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {tournaments.map((t) => (
            <TournamentCard key={t.id} tournament={t} onClick={() => handleOpen(t)} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TournamentsPage() {
  return (
    <ProtectedRoute>
      <TournamentsContent />
    </ProtectedRoute>
  );
}
