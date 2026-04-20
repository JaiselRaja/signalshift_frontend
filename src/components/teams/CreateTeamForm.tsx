"use client";

import { useState } from "react";
import { createTeam } from "@/lib/api";
import type { TeamRead } from "@/types";

const SPORT_OPTIONS = [
  "football", "cricket", "basketball", "volleyball", "badminton",
  "tennis", "hockey", "kabaddi", "other",
];

type Props = {
  onCreated: (team: TeamRead) => void;
  onCancel: () => void;
};

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function CreateTeamForm({ onCreated, onCancel }: Props) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [sportType, setSportType] = useState("football");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleNameChange(val: string) {
    setName(val);
    if (!slugManual) setSlug(toSlug(val));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const team = await createTeam({ name: name.trim(), slug: slug.trim(), sport_type: sportType });
      onCreated(team);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create team.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-5 animate-fade-in">
      <h3 className="mb-4 text-sm font-semibold text-white">New Team</h3>

      <div className="flex flex-col gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">Team Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. FC Warriors"
            required
            className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-white/40 outline-none focus:border-[#b2f746]/50 focus:ring-2 focus:ring-[#b2f746]/15"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">Slug (URL)</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => { setSlugManual(true); setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")); }}
            placeholder="fc-warriors"
            required
            className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm font-mono text-white placeholder-white/40 outline-none focus:border-[#b2f746]/50 focus:ring-2 focus:ring-[#b2f746]/15"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">Sport</label>
          <select
            value={sportType}
            onChange={(e) => setSportType(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none focus:border-[#b2f746]/50 focus:ring-2 focus:ring-[#b2f746]/15"
          >
            {SPORT_OPTIONS.map((s) => (
              <option key={s} value={s} className="bg-[#0a0b0c] capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] py-2.5 text-sm font-medium text-white/70 hover:bg-white/[0.06] hover:text-white disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!name.trim() || !slug.trim() || submitting}
          className="flex-1 rounded-xl bg-[#b2f746] py-2.5 text-sm font-bold text-[#121f00] shadow-lg shadow-[#b2f746]/20 transition-all hover:bg-white disabled:opacity-50"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              Creating...
            </span>
          ) : (
            "Create Team"
          )}
        </button>
      </div>
    </form>
  );
}
