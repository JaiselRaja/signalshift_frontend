"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe, updateMe, clearToken } from "@/lib/api";
import type { UserRead } from "@/types";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { PageLoader } from "@/components/ui/LoadingSpinner";

function ProfileContent() {
  const router = useRouter();
  const [user, setUser] = useState<UserRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    getMe()
      .then((u) => {
        setUser(u);
        setFullName(u.full_name ?? "");
        setPhone(u.phone ?? "");
      })
      .catch(() => setError("Failed to load profile."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const updated = await updateMe({ full_name: fullName.trim(), phone: phone.trim() || undefined });
      setUser(updated);
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    clearToken();
    router.push("/login");
  }

  if (loading) return <PageLoader />;
  if (!user) return <div className="p-8 text-red-400">{error ?? "Profile not found."}</div>;

  const ROLE_LABELS: Record<string, string> = {
    super_admin: "Super Admin",
    turf_admin: "Turf Admin",
    team_manager: "Team Manager",
    player: "Player",
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8 md:px-6">
      <h1 className="mb-6 text-xl font-bold text-[var(--text-primary)]">Profile</h1>

      {/* Avatar + summary */}
      <div className="glass-card mb-5 p-5 flex items-center gap-4 animate-fade-in">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-indigo-300 text-xl font-bold">
          {user.full_name?.slice(0, 2).toUpperCase() ?? "??"}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-[var(--text-primary)] truncate">{user.full_name}</p>
          <p className="text-sm text-[var(--text-muted)] truncate">{user.email}</p>
          <span className="mt-1 inline-block rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[10px] font-medium text-indigo-400">
            {ROLE_LABELS[user.role] ?? user.role}
          </span>
        </div>
      </div>

      {/* Edit form */}
      <div className="glass-card p-5 animate-fade-in">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Account Details</p>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-indigo-400 hover:text-indigo-300"
            >
              Edit
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="flex flex-col gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder-[var(--text-muted)] outline-none focus:border-indigo-500/40"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder-[var(--text-muted)] outline-none focus:border-indigo-500/40"
              />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => { setEditing(false); setFullName(user.full_name ?? ""); setPhone(user.phone ?? ""); }}
                disabled={saving}
                className="flex-1 rounded-xl border border-white/[0.08] py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-white/[0.04] disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 disabled:opacity-50 hover:opacity-90 transition-opacity"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    Saving...
                  </span>
                ) : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Email</span>
              <span className="text-[var(--text-primary)] truncate max-w-[200px]">{user.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Full Name</span>
              <span className="text-[var(--text-primary)]">{user.full_name || "—"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Phone</span>
              <span className="text-[var(--text-primary)]">{user.phone || "—"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Member since</span>
              <span className="text-[var(--text-primary)]">
                {new Date(user.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
            {success && (
              <p className="text-xs text-emerald-400 animate-fade-in">Profile updated successfully.</p>
            )}
          </div>
        )}
      </div>

      {/* Sign out */}
      <div className="mt-5">
        <button
          onClick={handleLogout}
          className="w-full rounded-xl border border-red-500/20 bg-red-500/5 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
