"use client";

import type { MembershipRead, TeamMemberRole } from "@/types";

type Props = {
  members: MembershipRead[];
  canManage: boolean;
  onRemove?: (userId: string) => void;
};

const ROLE_STYLES: Record<TeamMemberRole, string> = {
  manager: "bg-[#b2f746]/15 text-[#b2f746] ring-1 ring-[#b2f746]/30",
  captain: "bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/30",
  player: "bg-white/[0.06] text-white/70 ring-1 ring-white/10",
};

function initials(name?: string | null, email?: string | null): string {
  if (name && name.trim()) {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "??";
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "??";
}

export default function MembersList({ members, canManage, onRemove }: Props) {
  if (!members.length) {
    return <p className="py-4 text-center text-sm text-white/50">No members yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {members.map((m) => {
        const displayName = m.user_name || (m.user_email?.split("@")[0] ?? "Player");
        const tagline = m.user_email ?? `#${m.user_id.slice(0, 8)}`;
        return (
          <div
            key={m.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="grain-overlay relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#b2f746] to-[#86df72] font-display text-xs font-black text-[#121f00]">
                {m.user_avatar_url ? (
                  <img src={m.user_avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span>{initials(m.user_name, m.user_email)}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{displayName}</p>
                <p className="mt-0.5 truncate text-[11px] text-white/50">{tagline}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${ROLE_STYLES[m.role]}`}>
                {m.role}
              </span>
              {canManage && onRemove && m.role !== "manager" && (
                <button
                  onClick={() => onRemove(m.user_id)}
                  className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
                  title="Remove member"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
