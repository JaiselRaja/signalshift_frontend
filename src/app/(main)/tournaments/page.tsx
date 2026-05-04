"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { listTournaments } from "@/lib/api";
import type { TournamentRead, TournamentStatus } from "@/types";
import PageHero from "@/components/v1/PageHero";
import PageStats from "@/components/v1/PageStats";
import PageFAQ from "@/components/v1/PageFAQ";
import CTABanner from "@/components/v1/CTABanner";

type FilterTab = "all" | TournamentStatus;

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "in_progress", label: "Live" },
  { value: "registration_open", label: "Open" },
  { value: "registration_closed", label: "Upcoming" },
  { value: "completed", label: "Completed" },
];

const FAQS = [
  {
    q: "How do I register my team?",
    a: 'Open any tournament with "Open" status, click Register, pick your team, and pay the entry fee. Roster locks 48 hours before kickoff.',
  },
  {
    q: "What if my team has fewer players than required?",
    a: "You can add temporary players (mercenaries) up to the registration deadline.",
  },
  {
    q: "Are there refunds if a tournament is cancelled?",
    a: "Full refunds processed within 5 business days, plus a 10% credit toward your next entry.",
  },
];

function statusLabel(status: TournamentStatus): string {
  if (status === "in_progress") return "Live";
  if (status === "registration_open") return "Open";
  if (status === "registration_closed") return "Upcoming";
  if (status === "completed") return "Completed";
  if (status === "cancelled") return "Cancelled";
  return "Draft";
}

function statusPillClasses(status: TournamentStatus): string {
  if (status === "in_progress")
    return "bg-rose-500/15 text-rose-400";
  if (status === "registration_open")
    return "bg-[#b2f746]/15 text-[#b2f746]";
  return "bg-white/10 text-white/60";
}

function statusBarClasses(status: TournamentStatus): string {
  if (status === "in_progress") return "bg-rose-500";
  if (status === "registration_open") return "bg-[#b2f746]";
  return "bg-white/20";
}

function totalPrize(t: TournamentRead): number {
  return Object.values(t.prize_pool ?? {})
    .filter((v): v is number => typeof v === "number")
    .reduce((a, b) => a + b, 0);
}

function formatDateRange(t: TournamentRead): string {
  const start = new Date(t.tournament_starts);
  const startStr = start.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  if (!t.tournament_ends) return startStr;
  const end = new Date(t.tournament_ends);
  const endStr = end.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  return `${startStr} – ${endStr}`;
}

export default function TournamentsPage() {
  const router = useRouter();
  const [allCache, setAllCache] = useState<TournamentRead[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listTournaments()
      .then(setAllCache)
      .catch(() => setError("Failed to load tournaments."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => (activeTab === "all" ? allCache : allCache.filter((t) => t.status === activeTab)),
    [allCache, activeTab],
  );

  const stats = useMemo(() => {
    let live = 0;
    let open = 0;
    let teams = 0;
    let prize = 0;
    for (const t of allCache) {
      if (t.status === "in_progress") live++;
      if (t.status === "registration_open") open++;
      teams += t.max_teams ?? t.min_teams ?? 0;
      prize += totalPrize(t);
    }
    return { live, open, teams, prize };
  }, [allCache]);

  return (
    <div>
      <PageHero
        eyebrow="The Bracket"
        head1="The season is"
        italicWord="always"
        head2="on."
        subtitle="Leagues, knockouts, friendlies. Register your team, climb the table, take the trophy."
      />

      <div className="px-6 pb-8">
        <div className="mx-auto max-w-6xl">
          <PageStats
            stats={[
              { value: String(stats.live), label: "Live now" },
              { value: String(stats.open), label: "Open to register" },
              { value: String(stats.teams || 0), label: "Teams competing" },
              {
                value: stats.prize > 0 ? `₹${(stats.prize / 100000).toFixed(2)}L` : "—",
                label: "Total prize pool",
              },
            ]}
          />
        </div>
      </div>

      {/* Sticky filter bar */}
      <div className="sticky top-[72px] z-10 border-y border-white/[0.06] bg-[#0a0b0c]/90 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl gap-1.5 overflow-x-auto">
          {FILTER_TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setActiveTab(t.value)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === t.value
                  ? "border-[#b2f746] bg-[#b2f746] text-[#121f00]"
                  : "border-white/10 bg-white/[0.03] text-white/60 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <section className="px-6 py-10 md:py-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6">
            <h2 className="font-display text-2xl font-black text-white">Fixtures</h2>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
              {filtered.length} tournament{filtered.length === 1 ? "" : "s"}
            </p>
          </div>

          {error && (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 px-5 py-4 text-sm text-rose-300">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-28 animate-pulse rounded-3xl border border-white/[0.06] bg-white/[0.03]"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] py-20 text-center">
              <h3 className="font-display text-xl font-bold text-white">No tournaments</h3>
              <p className="mt-1 max-w-xs text-sm text-white/60">
                The first fixture drops soon — stay tuned.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filtered.map((t) => {
                const prize = totalPrize(t);
                return (
                  <div
                    key={t.id}
                    className="group flex flex-col gap-5 rounded-3xl border border-white/[0.06] bg-white/[0.03] p-6 transition-all hover:-translate-y-0.5 hover:border-[#b2f746]/30 sm:flex-row sm:items-center"
                  >
                    <div
                      className={`h-1 w-full rounded-full sm:h-20 sm:w-1.5 ${statusBarClasses(t.status)}`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${statusPillClasses(t.status)}`}
                        >
                          {t.status === "in_progress" && (
                            <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" />
                          )}
                          {statusLabel(t.status)}
                        </span>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                          {t.sport_type}
                        </span>
                      </div>
                      <h3 className="mt-2 font-display text-lg font-black text-white md:text-xl">
                        {t.name}
                      </h3>
                      <p className="mt-1 text-xs text-white/50">
                        {formatDateRange(t)} · {t.max_teams ?? t.min_teams} teams
                      </p>
                    </div>
                    {prize > 0 && (
                      <div className="text-right">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                          Prize pool
                        </p>
                        <p className="font-display text-xl font-black text-[#b2f746]">
                          ₹{(prize / 1000).toFixed(0)}k
                        </p>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => router.push(`/tournaments/${t.slug}?id=${t.id}`)}
                      className="rounded-full bg-[#b2f746] px-5 py-2.5 text-xs font-bold text-[#121f00] transition-transform hover:scale-[1.03]"
                    >
                      {t.status === "registration_open" ? "Register" : "View"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <PageFAQ items={FAQS} />
      <CTABanner
        eyebrow="Want your own?"
        title="Host a tournament."
        subtitle="Build a bracket, invite teams, and let Signal Shift handle the rest — fixtures, standings, payments."
        buttonLabel="Get in touch"
        href="/profile"
      />
    </div>
  );
}
