"use client";

import type { MembershipRead, TeamMemberRole } from "@/types";

type Props = {
  members: MembershipRead[];
  canManage: boolean;
  onRemove?: (userId: string) => void;
};

const ROLE_STYLES: Record<TeamMemberRole, string> = {
  manager: "bg-[#004900]/10 text-[#004900] border-[#004900]/15",
  captain: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  player: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export default function MembersList({ members, canManage, onRemove }: Props) {
  if (!members.length) {
    return <p className="py-4 text-center text-sm text-[#707a6a]">No members yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {members.map((m) => (
        <div
          key={m.id}
          className="flex items-center justify-between gap-3 rounded-xl border border-[#bfcab7]/20 bg-white px-4 py-3"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#004900]/10 text-[#004900] text-xs font-bold">
              {m.user_id.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#191c1d] truncate font-mono text-xs">
                {m.user_id}
              </p>
              <p className="text-[10px] text-[#707a6a]">
                Joined {new Date(m.joined_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${ROLE_STYLES[m.role]}`}>
              {m.role}
            </span>
            {canManage && onRemove && m.role !== "manager" && (
              <button
                onClick={() => onRemove(m.user_id)}
                className="rounded-lg p-1 text-[#707a6a] hover:bg-red-500/10 hover:text-red-400 transition-colors"
                title="Remove member"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
