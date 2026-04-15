"use client";

import { useState } from "react";
import type { TeamRead, TournamentRead } from "@/types";
import { formatCurrency } from "@/lib/utils";

type Props = {
  tournament: TournamentRead;
  myTeams: TeamRead[];
  onConfirm: (teamId: string) => Promise<void>;
  onClose: () => void;
};

export default function RegisterTeamModal({ tournament, myTeams, onConfirm, onClose }: Props) {
  const [selectedTeamId, setSelectedTeamId] = useState(myTeams[0]?.id ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (!selectedTeamId) return;
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(selectedTeamId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="glass-card w-full max-w-md p-6 animate-fade-in bottom-sheet sm:rounded-2xl">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">Register for Tournament</h2>
            <p className="mt-0.5 text-sm text-[var(--text-muted)]">{tournament.name}</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-white/[0.06] hover:text-white transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {tournament.entry_fee != null && tournament.entry_fee > 0 && (
          <div className="mb-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-3 py-2.5 flex justify-between items-center">
            <span className="text-sm text-[var(--text-secondary)]">Entry fee</span>
            <span className="text-sm font-bold text-indigo-300">{formatCurrency(tournament.entry_fee)}</span>
          </div>
        )}

        {myTeams.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-sm text-[var(--text-muted)]">You don't have any teams yet.</p>
            <a href="/teams" className="mt-2 inline-block text-sm text-indigo-400 hover:text-indigo-300">
              Create a team →
            </a>
          </div>
        ) : (
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
              Select your team
            </label>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500/40"
            >
              {myTeams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        )}

        {error && <p className="mb-3 text-xs text-red-400">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 rounded-xl border border-white/[0.08] py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-white/[0.04] disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          {myTeams.length > 0 && (
            <button
              onClick={handleConfirm}
              disabled={!selectedTeamId || submitting}
              className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-opacity hover:opacity-90"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  Registering...
                </span>
              ) : (
                "Register Team"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
