"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getToken, getTeam, getTeamMembers, addTeamMember, removeTeamMember, getMe } from "@/lib/api";
import type { MembershipRead, TeamRead, UserRead } from "@/types";
import MembersList from "@/components/teams/MembersList";
import SportTag from "@/components/ui/SportTag";
import { PageLoader } from "@/components/ui/LoadingSpinner";

function TeamDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const teamId = searchParams.get("id") ?? "";

  const [team, setTeam] = useState<TeamRead | null>(null);
  const [members, setMembers] = useState<MembershipRead[]>([]);
  const [me, setMe] = useState<UserRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addUserId, setAddUserId] = useState("");
  const [addRole, setAddRole] = useState<"player" | "captain">("player");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

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

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    if (!addUserId.trim()) return;
    setAdding(true);
    setAddError(null);
    try {
      const membership = await addTeamMember(teamId, addUserId.trim(), addRole);
      setMembers((prev) => [...prev, membership]);
      setAddUserId("");
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Failed to add member.");
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(userId: string) {
    try {
      await removeTeamMember(teamId, userId);
      setMembers((prev) => prev.filter((m) => m.user_id !== userId));
    } catch {
      // silently ignore — member list unchanged
    }
  }

  if (!teamId) return <div className="p-8 text-[#707a6a]">Invalid team link.</div>;
  if (loading) return <PageLoader />;
  if (!team) return <div className="p-8 text-red-700">{error ?? "Team not found."}</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-6">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1.5 text-xs text-[#707a6a] hover:text-[#191c1d]"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
        Back to Teams
      </button>

      {/* Team header */}
      <div className="glass-card mb-5 p-5 animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#004900]/10 text-[#004900] text-xl font-bold">
            {team.logo_url ? (
              <img src={team.logo_url} alt={team.name} className="h-full w-full rounded-2xl object-cover" />
            ) : (
              team.name.slice(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#191c1d]">{team.name}</h1>
            <div className="mt-1 flex items-center gap-2">
              <SportTag sport={team.sport_type} />
              <span className="text-xs text-[#707a6a]">{members.length} member{members.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Members section */}
      <div className="glass-card p-5 animate-fade-in">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#707a6a]">Members</p>
        <MembersList members={members} canManage={canManage} onRemove={handleRemove} />

        {/* Add member form */}
        {canManage && (
          <form onSubmit={handleAddMember} className="mt-4 border-t border-[#bfcab7]/20 pt-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[#707a6a]">Add Member</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="User ID"
                value={addUserId}
                onChange={(e) => setAddUserId(e.target.value)}
                className="flex-1 rounded-lg border border-[#bfcab7]/30 bg-white px-3 py-2.5 text-sm font-mono text-[#191c1d] placeholder-[#707a6a] outline-none focus:border-[#004900]/40"
              />
              <select
                value={addRole}
                onChange={(e) => setAddRole(e.target.value as "player" | "captain")}
                className="rounded-lg border border-[#bfcab7]/30 bg-white px-3 py-2.5 text-sm text-[#191c1d] outline-none focus:border-[#004900]/40"
              >
                <option value="player">Player</option>
                <option value="captain">Captain</option>
              </select>
              <button
                type="submit"
                disabled={!addUserId.trim() || adding}
                className="shrink-0 rounded-lg bg-[#004900]/10 px-4 py-2.5 text-xs font-semibold text-[#004900] hover:bg-[#004900]/15 disabled:opacity-40 transition-colors"
              >
                {adding ? "..." : "Add"}
              </button>
            </div>
            {addError && <p className="mt-1.5 text-xs text-red-700">{addError}</p>}
          </form>
        )}
      </div>
    </div>
  );
}

export default function TeamDetailPage() {
  return <TeamDetailContent />;
}
