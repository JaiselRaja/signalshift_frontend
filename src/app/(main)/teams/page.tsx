"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, listTeams } from "@/lib/api";
import type { TeamRead } from "@/types";
import CreateTeamForm from "@/components/teams/CreateTeamForm";
import PageHero from "@/components/v1/PageHero";
import PageStats from "@/components/v1/PageStats";
import PageFAQ from "@/components/v1/PageFAQ";
import CTABanner from "@/components/v1/CTABanner";

const FAQS = [
  {
    q: "How many teams can I be part of?",
    a: "No limit — join as many teams as you can keep up with. Each team has its own captain and roster.",
  },
  {
    q: "Can I be captain of multiple teams?",
    a: "Yes. You'll see a separate captain dashboard for each one.",
  },
  {
    q: "How do I add players to my team?",
    a: "Go to your team page, click Add Member, and search by name or email.",
  },
];

function teamInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "??"
  );
}

export default function TeamsPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<TeamRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [sport, setSport] = useState("All");

  useEffect(() => {
    listTeams()
      .then(setTeams)
      .catch(() => setError("Failed to load teams."))
      .finally(() => setLoading(false));
  }, []);

  const sports = useMemo(() => {
    const set = new Set<string>(["All"]);
    teams.forEach((t) => {
      if (t.sport_type) set.add(t.sport_type);
    });
    return [...set];
  }, [teams]);

  const filtered = useMemo(
    () => (sport === "All" ? teams : teams.filter((t) => t.sport_type === sport)),
    [teams, sport],
  );

  const stats = useMemo(() => {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const sportSet = new Set(teams.map((t) => t.sport_type).filter(Boolean));
    const newThisWeek = teams.filter(
      (t) => new Date(t.created_at).getTime() > oneWeekAgo,
    ).length;
    return {
      total: teams.length,
      sports: sportSet.size,
      newThisWeek,
    };
  }, [teams]);

  function handleCreate() {
    if (!getToken()) {
      router.push(`/login?redirect=${encodeURIComponent("/teams")}`);
      return;
    }
    setShowCreate(true);
    setTimeout(
      () =>
        document
          .getElementById("create-team-anchor")
          ?.scrollIntoView({ behavior: "smooth", block: "start" }),
      100,
    );
  }

  function handleCreated(team: TeamRead) {
    setTeams((prev) => [team, ...prev]);
    setShowCreate(false);
  }

  return (
    <div>
      <PageHero
        eyebrow="The Squads"
        head1="Roll with"
        italicWord="your"
        head2="crew."
        subtitle="Make a team, pick a captain, bring the chaos. Win together, lose together — book faster with your squad saved."
      />

      <div className="px-6 pb-8">
        <div className="mx-auto max-w-6xl">
          <PageStats
            stats={[
              { value: String(stats.total), label: "Active teams" },
              { value: `${(stats.total * 8 || 0).toLocaleString()}`, label: "Players across teams" },
              { value: String(stats.sports || 0), label: "Sports played" },
              { value: String(stats.newThisWeek), label: "New this week" },
            ]}
          />
        </div>
      </div>

      {/* Sticky filter bar */}
      <div className="sticky top-[72px] z-10 border-y border-white/[0.06] bg-[#0a0b0c]/90 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleCreate}
            className="rounded-full bg-[#b2f746] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#121f00] transition-transform hover:scale-[1.03]"
          >
            + Start a team
          </button>
          <div className="flex gap-1.5 overflow-x-auto">
            {sports.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSport(s)}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                  sport === s
                    ? "border-[#b2f746] bg-[#b2f746] text-[#121f00]"
                    : "border-white/10 bg-white/[0.03] text-white/60 hover:text-white"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="px-6 py-10 md:py-12">
        <div className="mx-auto max-w-6xl">
          {showCreate && (
            <div id="create-team-anchor" className="mb-8">
              <CreateTeamForm onCreated={handleCreated} onCancel={() => setShowCreate(false)} />
            </div>
          )}

          <div className="mb-6">
            <h2 className="font-display text-2xl font-black text-white">Directory</h2>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
              {loading ? "…" : `${filtered.length} of ${teams.length} teams`}
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/5 px-5 py-4 text-sm text-rose-300">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-44 animate-pulse rounded-3xl border border-white/[0.06] bg-white/[0.03]"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] py-20 text-center">
              <h3 className="font-display text-xl font-bold text-white">
                {teams.length === 0 ? "Be the first crew" : "No matches"}
              </h3>
              <p className="mt-1 max-w-xs text-sm text-white/60">
                {teams.length === 0
                  ? "No teams yet — start one and others will follow."
                  : "Try a different sport filter."}
              </p>
              {teams.length === 0 && (
                <button
                  type="button"
                  onClick={handleCreate}
                  className="mt-5 rounded-full bg-[#b2f746] px-5 py-2 text-xs font-bold uppercase tracking-wider text-[#121f00] hover:bg-white"
                >
                  Start a team
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => router.push(`/teams/${t.slug}?id=${t.id}`)}
                  className="group flex flex-col gap-4 rounded-3xl border border-white/[0.06] bg-white/[0.03] p-5 text-left transition-all hover:-translate-y-1 hover:border-[#b2f746]/30"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#b2f746] font-display text-base font-black text-[#121f00]">
                      {t.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.logo_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        teamInitials(t.name)
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-display text-base font-black text-white">
                        {t.name}
                      </h3>
                      <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-white/50">
                        {t.sport_type}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl bg-white/[0.06]">
                    <div className="flex flex-col items-center bg-[#0a0b0c] p-3">
                      <span className="font-display text-base font-black text-white">—</span>
                      <span className="text-[10px] text-white/50">Players</span>
                    </div>
                    <div className="flex flex-col items-center bg-[#0a0b0c] p-3">
                      <span className="font-display text-base font-black text-white">
                        {t.is_active ? "Live" : "—"}
                      </span>
                      <span className="text-[10px] text-white/50">Status</span>
                    </div>
                    <div className="flex flex-col items-center bg-[#0a0b0c] p-3">
                      <span className="font-display text-base font-black text-[#b2f746]">
                        {teamInitials(t.name)}
                      </span>
                      <span className="text-[10px] text-white/50">Captain</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] py-2 text-xs font-bold text-white/70 transition-colors group-hover:bg-white/[0.06]">
                    View team
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <PageFAQ items={FAQS} />
      <CTABanner
        eyebrow="No team yet?"
        title="Start one in 30 seconds."
        subtitle="Name your crew, pick a sport, and invite players by email. We'll handle the rest."
        buttonLabel="Start a team"
        href="/teams"
      />
    </div>
  );
}
