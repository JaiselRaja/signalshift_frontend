"use client";

import { useEffect, useMemo, useState } from "react";
import { listTurfs } from "@/lib/api";
import type { TurfRead } from "@/types";
import TurfCard from "@/components/turfs/TurfCard";
import TurfFilters from "@/components/turfs/TurfFilters";
import EmptyState from "@/components/ui/EmptyState";

function TurfSkeleton() {
  return (
    <div className="glass-card overflow-hidden">
      <div className="h-1 w-full bg-[#bfcab7]/10" />
      <div className="p-4 flex flex-col gap-3">
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
        <div className="flex gap-1.5">
          <div className="skeleton h-5 w-16 rounded-full" />
          <div className="skeleton h-5 w-16 rounded-full" />
        </div>
        <div className="skeleton h-8 w-full rounded-lg mt-1" />
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

  const filtered = useMemo(() => {
    return turfs.filter((t) => {
      if (cityFilter && t.city !== cityFilter) return false;
      if (sportFilter && !t.sport_types.map((s) => s.toLowerCase()).includes(sportFilter)) return false;
      if (searchQuery && !t.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [turfs, cityFilter, sportFilter, searchQuery]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#191c1d] md:text-3xl">Browse Turfs</h1>
        <p className="mt-1 text-sm text-[#707a6a]">
          {loading ? "Loading available turfs..." : `${turfs.length} turf${turfs.length !== 1 ? "s" : ""} available`}
        </p>
      </div>

      {/* Filters */}
      {!loading && turfs.length > 0 && (
        <div className="mb-6">
          <TurfFilters
            cities={cities}
            cityFilter={cityFilter}
            sportFilter={sportFilter}
            searchQuery={searchQuery}
            onCity={setCityFilter}
            onSport={setSportFilter}
            onSearch={setSearchQuery}
          />
        </div>
      )}

      {/* Offline banner */}
      {error === "offline" && (
        <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-4">
          <p className="text-sm font-semibold text-amber-400">Backend is not running</p>
          <p className="mt-1 text-xs text-[#404a3b]">
            Start the API server to see turfs added in the admin console.
          </p>
          <code className="mt-2 block rounded-lg bg-[#bfcab7]/10 px-3 py-2 text-xs font-mono text-[#404a3b]">
            cd signal-shift-api &amp;&amp; uvicorn app.main:app --reload
          </code>
        </div>
      )}

      {/* Generic error */}
      {error === "error" && (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load turfs. Please try again.
        </div>
      )}

      {/* Turf grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <TurfSkeleton key={i} />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
          {filtered.map((turf) => (
            <TurfCard key={turf.id} turf={turf} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
          }
          title={turfs.length === 0 ? "No turfs available" : "No turfs match your filters"}
          description={turfs.length === 0 ? "Check back soon — turfs are being added." : "Try adjusting your filters or search query."}
          action={
            (cityFilter || sportFilter || searchQuery) ? (
              <button
                onClick={() => { setCityFilter(null); setSportFilter(null); setSearchQuery(""); }}
                className="rounded-lg bg-[#004900]/10 px-4 py-2 text-sm font-medium text-[#004900] hover:bg-[#004900]/15"
              >
                Clear filters
              </button>
            ) : undefined
          }
        />
      )}
    </div>
  );
}

export default function TurfsPage() {
  return <TurfsContent />;
}
