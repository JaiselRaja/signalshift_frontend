"use client";

import { useEffect, useRef, useState } from "react";
import { searchUsers, type UserSummary } from "@/lib/api";

type Role = "player" | "captain";

type Props = {
  /** Already-members' user IDs — to grey them out in results. */
  existingMemberIds: Set<string>;
  /** Called when admin picks a user and submits. */
  onAdd: (userId: string, role: Role) => Promise<void>;
  /** URL to deep-link invitees to (usually the team page). */
  inviteTargetUrl: string;
  /** Team label used in the mailto body. */
  teamName: string;
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

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export default function AddMemberSearch({
  existingMemberIds,
  onAdd,
  inviteTargetUrl,
  teamName,
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<UserSummary | null>(null);
  const [role, setRole] = useState<Role>("player");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search
  useEffect(() => {
    if (selected) return; // don't re-search once a user is chosen
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const matches = await searchUsers(q);
        if (!cancelled) setResults(matches);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, selected]);

  async function handleSubmit() {
    if (!selected) return;
    setAdding(true);
    setError(null);
    try {
      await onAdd(selected.id, role);
      setSelected(null);
      setQuery("");
      setResults([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't add member.");
    } finally {
      setAdding(false);
    }
  }

  const queryLooksLikeEmail = isValidEmail(query.trim());
  const noResults = !loading && query.trim().length >= 2 && results.length === 0 && !selected;

  return (
    <div className="flex flex-col gap-3">
      {/* Search input + role + add */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          {selected ? (
            <div className="flex h-full items-center gap-3 rounded-xl border border-[#b2f746]/30 bg-[#b2f746]/[0.08] px-3 py-2">
              <UserTile user={selected} />
              <button
                type="button"
                onClick={() => {
                  setSelected(null);
                  setQuery("");
                  setError(null);
                }}
                className="ml-auto rounded-md p-1 text-white/50 hover:bg-white/[0.06] hover:text-white"
                title="Clear selection"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ) : (
            <>
              <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setError(null); }}
                placeholder="Search by name or email…"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-10 py-2.5 text-sm text-white placeholder-white/40 outline-none transition-colors focus:border-[#b2f746]/50 focus:ring-2 focus:ring-[#b2f746]/15"
              />
            </>
          )}
        </div>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#b2f746]/50 focus:ring-2 focus:ring-[#b2f746]/15"
        >
          <option value="player" className="bg-[#0a0b0c]">Player</option>
          <option value="captain" className="bg-[#0a0b0c]">Captain</option>
        </select>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selected || adding}
          className="shrink-0 rounded-xl bg-[#b2f746] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#121f00] transition-all hover:bg-white disabled:opacity-40"
        >
          {adding ? "Adding…" : "Add"}
        </button>
      </div>

      {/* Results dropdown */}
      {!selected && query.trim().length >= 2 && (
        <div className="flex flex-col gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
          {loading && (
            <div className="px-3 py-3 text-xs text-white/50">Searching…</div>
          )}
          {!loading && results.map((u) => {
            const already = existingMemberIds.has(u.id);
            return (
              <button
                key={u.id}
                type="button"
                disabled={already}
                onClick={() => { setSelected(u); setResults([]); }}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                  already
                    ? "cursor-not-allowed opacity-40"
                    : "hover:bg-[#b2f746]/10"
                }`}
              >
                <UserTile user={u} />
                {already && (
                  <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-white/50">
                    Already a member
                  </span>
                )}
              </button>
            );
          })}
          {noResults && <NoResults query={query} inviteTargetUrl={inviteTargetUrl} teamName={teamName} queryLooksLikeEmail={queryLooksLikeEmail} />}
        </div>
      )}

      {error && <p className="text-xs text-rose-300">{error}</p>}

      <p className="text-[11px] leading-relaxed text-white/40">
        Type part of a name or email to find existing players. If they aren&rsquo;t on Signal Shift yet, we&rsquo;ll open your email app with a pre-filled invite.
      </p>
    </div>
  );
}

function UserTile({ user }: { user: UserSummary }) {
  const displayName = user.full_name || user.email.split("@")[0];
  return (
    <>
      <div className="grain-overlay relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#b2f746] to-[#86df72] font-display text-xs font-black text-[#121f00]">
        {user.avatar_url ? (
          <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <span>{initials(user.full_name, user.email)}</span>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">{displayName}</p>
        <p className="truncate text-[11px] text-white/50">{user.email}</p>
      </div>
    </>
  );
}

function NoResults({
  query,
  inviteTargetUrl,
  teamName,
  queryLooksLikeEmail,
}: {
  query: string;
  inviteTargetUrl: string;
  teamName: string;
  queryLooksLikeEmail: boolean;
}) {
  const trimmed = query.trim();
  const subject = `Join ${teamName} on Signal Shift`;
  const fullUrl =
    typeof window !== "undefined" && inviteTargetUrl.startsWith("/")
      ? `${window.location.origin}${inviteTargetUrl}`
      : inviteTargetUrl;
  const body = [
    `Hey,`,
    ``,
    `I just added you to ${teamName} on Signal Shift — the turf-booking app we use.`,
    ``,
    `Sign up with this email (${queryLooksLikeEmail ? trimmed : "your email"}) to get started, then I'll add you to the team.`,
    ``,
    `${fullUrl}`,
    ``,
    `— sent from Signal Shift`,
  ].join("\n");
  const to = queryLooksLikeEmail ? trimmed : "";
  const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <div className="flex flex-col gap-2 px-3 py-3">
      <p className="text-xs text-white/60">
        No users match <span className="font-semibold text-white">&ldquo;{trimmed}&rdquo;</span> on Signal Shift yet.
      </p>
      <a
        href={mailto}
        className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#b2f746] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#121f00] hover:bg-white"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
        {queryLooksLikeEmail ? `Invite ${trimmed}` : "Invite by email"}
      </a>
      <p className="text-[11px] text-white/40">
        Opens your email app. Once they sign up, come back and add them.
      </p>
    </div>
  );
}
