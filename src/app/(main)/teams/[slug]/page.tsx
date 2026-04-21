"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getToken, getTeam, getTeamMembers, addTeamMember, removeTeamMember, updateTeam, getMe } from "@/lib/api";
import type { MembershipRead, TeamRead, UserRead } from "@/types";
import MembersList from "@/components/teams/MembersList";
import AddMemberSearch from "@/components/teams/AddMemberSearch";
import AvatarUpload from "@/components/ui/AvatarUpload";
import { PageLoader } from "@/components/ui/LoadingSpinner";

const SPORT_COLOR: Record<string, { from: string; to: string; text: string }> = {
  football: { from: "#0d7b3a", to: "#0a5d2c", text: "#ffffff" },
  cricket: { from: "#b45a1b", to: "#8a4312", text: "#ffffff" },
  basketball: { from: "#e8691c", to: "#b54e14", text: "#ffffff" },
  tennis: { from: "#2d5f8a", to: "#1e4263", text: "#ffffff" },
  badminton: { from: "#8b4a9c", to: "#653576", text: "#ffffff" },
};

function sportColor(sport: string) {
  return SPORT_COLOR[sport.toLowerCase()] ?? { from: "#004900", to: "#002200", text: "#b2f746" };
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "??";
}

function TeamDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const teamId = searchParams.get("id") ?? "";

  const [team, setTeam] = useState<TeamRead | null>(null);
  const [members, setMembers] = useState<MembershipRead[]>([]);
  const [me, setMe] = useState<UserRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teamId) return;
    const mePromise = getToken() ? getMe().catch(() => null) : Promise.resolve(null);
    Promise.all([getTeam(teamId), getTeamMembers(teamId), mePromise])
      .then(([t, m, u]) => {
        setTeam(t);
        setMembers(m);
        setMe(u);
      })
      .catch(() => setError("Failed to load team details."))
      .finally(() => setLoading(false));
  }, [teamId]);

  const myMembership = me ? members.find((m) => m.user_id === me.id) : null;
  const canManage = myMembership?.role === "manager" || myMembership?.role === "captain";

  async function handleAdd(userId: string, role: "player" | "captain") {
    const membership = await addTeamMember(teamId, userId, role);
    setMembers((prev) => [...prev, membership]);
  }

  async function handleRemove(userId: string) {
    try {
      await removeTeamMember(teamId, userId);
      setMembers((prev) => prev.filter((m) => m.user_id !== userId));
    } catch {
      // silently ignore — member list unchanged
    }
  }

  if (!teamId) return <div className="p-8 text-white/60">Invalid team link.</div>;
  if (loading) return <PageLoader />;
  if (!team) return <div className="p-8 text-rose-400">{error ?? "Team not found."}</div>;

  const color = sportColor(team.sport_type);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-6 md:py-10">
      <button
        onClick={() => router.back()}
        className="mb-5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/50 hover:text-white"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
        Back to Teams
      </button>

      {/* Team header */}
      <div className="relative mb-5 overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.03] p-5 animate-fade-in md:p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rotate-[30deg] opacity-[0.15] blur-2xl"
          style={{ background: `linear-gradient(135deg, ${color.from}, ${color.to})` }}
        />
        <div className="relative flex items-center gap-4">
          {canManage ? (
            <AvatarUpload
              src={team.logo_url}
              fallback={initials(team.name)}
              accent={color}
              size="md"
              label="Change team logo"
              onChange={async (dataUrl) => {
                const updated = await updateTeam(team.id, { logo_url: dataUrl });
                setTeam(updated);
              }}
              onRemove={team.logo_url ? async () => {
                const updated = await updateTeam(team.id, { logo_url: null });
                setTeam(updated);
              } : undefined}
            />
          ) : (
            <div
              className="grain-overlay relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl font-display text-xl font-black tracking-tight"
              style={{ background: `linear-gradient(135deg, ${color.from} 0%, ${color.to} 100%)`, color: color.text }}
            >
              {team.logo_url ? (
                <img src={team.logo_url} alt={team.name} className="h-full w-full object-cover" />
              ) : (
                <span>{initials(team.name)}</span>
              )}
              <span
                aria-hidden
                className="absolute bottom-0 left-0 right-0 h-2"
                style={{ background: color.to, clipPath: "polygon(0 100%, 50% 0, 100% 100%)" }}
              />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-black leading-tight text-white md:text-3xl">{team.name}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#b2f746]/30 bg-[#b2f746]/[0.08] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#b2f746]">
                {team.sport_type}
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
                {members.length} member{members.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Members section */}
      <div className="rounded-3xl border border-white/[0.06] bg-white/[0.03] p-5 animate-fade-in md:p-6">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">Members</p>
        <MembersList members={members} canManage={canManage} onRemove={handleRemove} />

        {/* Add member — typeahead search */}
        {canManage && (
          <div className="mt-5 border-t border-white/[0.06] pt-5">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">Add member</p>
            <AddMemberSearch
              existingMemberIds={new Set(members.map((m) => m.user_id))}
              onAdd={handleAdd}
              inviteTargetUrl={`/teams/${team.slug}?id=${team.id}`}
              teamName={team.name}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function TeamDetailPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <TeamDetailContent />
    </Suspense>
  );
}
